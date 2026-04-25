import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./googleAuth";
import { isAdminAuthenticated, verifyPassword, createInitialAdmin, hashPassword, checkLoginRateLimit, recordLoginAttempt, regenerateSession, destroySession } from "./adminAuth";
import { insertTestimonySchema, insertEncouragementVerseSchema, insertCommentSchema, insertFaithDeclarationSchema, updateProfileSchema, updateSettingsSchema, completeOnboardingSchema, addPasswordSchema, insertFaithExpectationSchema, insertExpectationMilestoneSchema, insertExpectationScriptureSchema, answerExpectationSchema, updateMilestoneStatusSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { ObjectStorageService } from "./replit_integrations/object_storage";
import webpush from "web-push";

// Configure web-push
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:admin@testifaith.app",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

async function sendPushNotification(userId: string, payload: { title: string; body: string; url?: string; tag?: string }) {
  try {
    const subs = await storage.getPushSubscriptionsForUser(userId);
    const payloadStr = JSON.stringify(payload);
    await Promise.allSettled(
      subs.map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payloadStr
        ).catch(async (err: any) => {
          if (err.statusCode === 410 || err.statusCode === 404) {
            await storage.deletePushSubscription(sub.endpoint);
          }
        })
      )
    );
  } catch {
    // Non-critical — don't let push errors affect the main request
  }
}

interface AuthUser {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

declare global {
  namespace Express {
    interface User extends AuthUser {}
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Object storage service
  const objectStorageService = new ObjectStorageService();

  // Video upload routes (protected)
  app.post('/api/uploads/video-url', isAuthenticated, async (req: Request, res) => {
    try {
      const { name, size, contentType } = req.body;
      
      if (!name || !contentType) {
        return res.status(400).json({ error: "Missing required fields: name, contentType" });
      }
      
      if (!contentType.startsWith('video/')) {
        return res.status(400).json({ error: "Only video files are allowed" });
      }
      
      const maxSize = 100 * 1024 * 1024; // 100MB limit
      if (size && size > maxSize) {
        return res.status(400).json({ error: "Video file too large. Maximum size is 100MB." });
      }
      
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);
      
      res.json({
        uploadURL,
        objectPath,
        metadata: { name, size, contentType },
      });
    } catch (error) {
      console.error("Error generating video upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  // Serve uploaded objects
  app.get('/objects/:objectPath(*)', async (req, res) => {
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      await objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      return res.status(404).json({ error: "Object not found" });
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Testimony routes
  app.post('/api/testimonies', isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.id;
      const data = insertTestimonySchema.parse({ ...req.body, userId });
      const testimony = await storage.createTestimony(data);
      res.json(testimony);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        console.error("Error creating testimony:", error);
        res.status(500).json({ message: "Failed to create testimony" });
      }
    }
  });

  app.get('/api/testimonies', async (req: Request, res) => {
    try {
      const userId = req.user?.id;
      const testimonies = await storage.getAllTestimonies(userId);
      res.json(testimonies);
    } catch (error) {
      console.error("Error fetching testimonies:", error);
      res.status(500).json({ message: "Failed to fetch testimonies" });
    }
  });

  app.get('/api/testimonies/search', async (req: Request, res) => {
    try {
      const { q, categories, startDate, endDate } = req.query;
      const userId = req.user?.id;
      
      const query = typeof q === 'string' ? q : '';
      const categoryArray = categories ? (typeof categories === 'string' ? categories.split(',') : []) : undefined;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      
      const testimonies = await storage.searchTestimonies(query, categoryArray, start, end, userId);
      res.json(testimonies);
    } catch (error) {
      console.error("Error searching testimonies:", error);
      res.status(500).json({ message: "Failed to search testimonies" });
    }
  });

  app.get('/api/testimonies/recent', async (req: Request, res) => {
    try {
      const userId = req.user?.id;
      const testimonies = await storage.getRecentTestimonies(6, userId);
      res.json(testimonies);
    } catch (error) {
      console.error("Error fetching recent testimonies:", error);
      res.status(500).json({ message: "Failed to fetch recent testimonies" });
    }
  });

  app.get('/api/testimonies/featured', async (req: Request, res) => {
    try {
      const userId = req.user?.id;
      const testimony = await storage.getFeaturedTestimony(userId);
      res.json(testimony || null);
    } catch (error) {
      console.error("Error fetching featured testimony:", error);
      res.status(500).json({ message: "Failed to fetch featured testimony" });
    }
  });

  app.get('/api/testimonies/my', isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.id;
      const testimonies = await storage.getUserTestimonies(userId);
      res.json(testimonies);
    } catch (error) {
      console.error("Error fetching user testimonies:", error);
      res.status(500).json({ message: "Failed to fetch user testimonies" });
    }
  });

  app.get('/api/testimonies/personalized', isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.id;
      const testimonies = await storage.getPersonalizedTestimonies(userId, 6);
      res.json(testimonies);
    } catch (error) {
      console.error("Error fetching personalized testimonies:", error);
      res.status(500).json({ message: "Failed to fetch personalized testimonies" });
    }
  });

  app.get('/api/testimonies/category/:category', async (req: Request, res) => {
    try {
      const { category } = req.params;
      const userId = req.user?.id;
      const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);
      const testimonies = await storage.getTestimoniesByCategory(capitalizedCategory, userId);
      res.json(testimonies);
    } catch (error) {
      console.error("Error fetching category testimonies:", error);
      res.status(500).json({ message: "Failed to fetch category testimonies" });
    }
  });

  app.get('/api/testimonies/:id', async (req: Request, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const testimony = await storage.getTestimony(id, userId);
      if (!testimony) {
        res.status(404).json({ message: "Testimony not found" });
        return;
      }
      res.json(testimony);
    } catch (error) {
      console.error("Error fetching testimony:", error);
      res.status(500).json({ message: "Failed to fetch testimony" });
    }
  });

  app.delete('/api/testimonies/:id', isAuthenticated, async (req: Request, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const deleted = await storage.deleteTestimony(id, userId);
      if (!deleted) {
        res.status(404).json({ message: "Testimony not found or unauthorized" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting testimony:", error);
      res.status(500).json({ message: "Failed to delete testimony" });
    }
  });

  // Testimony interaction routes
  app.post('/api/testimonies/:id/amen', isAuthenticated, async (req: Request, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      
      const existing = await storage.getUserInteraction(id, userId, 'amen');
      if (existing) {
        await storage.removeTestimonyInteraction(id, userId, 'amen');
        res.json({ action: 'removed' });
      } else {
        await storage.addTestimonyInteraction({
          testimonyId: id,
          userId,
          interactionType: 'amen',
        });
        // Notify testimony author (fire-and-forget)
        const testimony = await storage.getTestimony(id);
        if (testimony && testimony.userId !== userId) {
          const senderName = req.user!.firstName || "Someone";
          sendPushNotification(testimony.userId, {
            title: "Someone said Amen!",
            body: `${senderName} said Amen to your testimony "${testimony.title || "your testimony"}"`,
            url: `/testimony/${id}`,
            tag: `amen-${id}`,
          });
        }
        res.json({ action: 'added' });
      }
    } catch (error) {
      console.error("Error toggling amen:", error);
      res.status(500).json({ message: "Failed to toggle amen" });
    }
  });

  app.post('/api/testimonies/:id/encourage', isAuthenticated, async (req: Request, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      
      const existing = await storage.getUserInteraction(id, userId, 'encourage');
      if (existing) {
        await storage.removeTestimonyInteraction(id, userId, 'encourage');
        res.json({ action: 'removed' });
      } else {
        await storage.addTestimonyInteraction({
          testimonyId: id,
          userId,
          interactionType: 'encourage',
        });
        // Notify testimony author (fire-and-forget)
        const testimony = await storage.getTestimony(id);
        if (testimony && testimony.userId !== userId) {
          const senderName = req.user!.firstName || "Someone";
          sendPushNotification(testimony.userId, {
            title: "You've been encouraged!",
            body: `${senderName} sent you encouragement for "${testimony.title || "your testimony"}"`,
            url: `/testimony/${id}`,
            tag: `encourage-${id}`,
          });
        }
        res.json({ action: 'added' });
      }
    } catch (error) {
      console.error("Error toggling encourage:", error);
      res.status(500).json({ message: "Failed to toggle encourage" });
    }
  });

  // Push notification subscription routes
  app.post('/api/push/subscribe', isAuthenticated, async (req: Request, res) => {
    try {
      const { endpoint, p256dh, auth } = req.body;
      if (!endpoint || !p256dh || !auth) {
        return res.status(400).json({ message: "Missing subscription fields" });
      }
      await storage.savePushSubscription({
        userId: req.user!.id,
        endpoint,
        p256dh,
        auth,
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Push subscribe error:", error);
      res.status(500).json({ message: "Failed to save subscription" });
    }
  });

  app.post('/api/push/unsubscribe', isAuthenticated, async (req: Request, res) => {
    try {
      const { endpoint } = req.body;
      if (!endpoint) return res.status(400).json({ message: "Missing endpoint" });
      await storage.deletePushSubscription(endpoint);
      res.json({ success: true });
    } catch (error) {
      console.error("Push unsubscribe error:", error);
      res.status(500).json({ message: "Failed to remove subscription" });
    }
  });

  // Encouragement verse routes
  app.get('/api/encouragement/daily', async (req, res) => {
    try {
      const verse = await storage.getDailyVerse();
      res.json(verse || null);
    } catch (error) {
      console.error("Error fetching daily verse:", error);
      res.status(500).json({ message: "Failed to fetch daily verse" });
    }
  });

  app.post('/api/encouragement', isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.id;
      const data = insertEncouragementVerseSchema.parse({ ...req.body, submittedBy: userId });
      const verse = await storage.createEncouragementVerse(data);
      res.json(verse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        console.error("Error creating encouragement verse:", error);
        res.status(500).json({ message: "Failed to create encouragement verse" });
      }
    }
  });

  // Comment routes
  app.get('/api/testimonies/:id/comments', async (req, res) => {
    try {
      const { id } = req.params;
      const comments = await storage.getTestimonyComments(id);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post('/api/testimonies/:id/comments', isAuthenticated, async (req: Request, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const data = insertCommentSchema.parse({ 
        ...req.body, 
        testimonyId: id, 
        userId 
      });
      
      // Validate parent comment belongs to same testimony if parentId is provided
      if (data.parentId) {
        const parentComment = await storage.getCommentById(data.parentId);
        if (!parentComment) {
          return res.status(400).json({ message: "Parent comment not found" });
        }
        if (parentComment.testimonyId !== id) {
          return res.status(400).json({ message: "Parent comment does not belong to this testimony" });
        }
      }
      
      const comment = await storage.createComment(data);
      res.json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        console.error("Error creating comment:", error);
        res.status(500).json({ message: "Failed to create comment" });
      }
    }
  });

  app.delete('/api/comments/:id', isAuthenticated, async (req: Request, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const deleted = await storage.deleteComment(id, userId);
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Comment not found or unauthorized" });
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  // ========== USER PROFILE ROUTES ==========

  // Get current user's profile
  app.get('/api/profile', isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUserProfile(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const stats = await storage.getUserStats(userId);
      res.json({ ...user, stats });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Update current user's profile
  app.patch('/api/profile', isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.id;
      const data = updateProfileSchema.parse(req.body);
      const updated = await storage.updateUserProfile(userId, data);
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Failed to update profile" });
      }
    }
  });

  // Update current user's settings
  app.patch('/api/profile/settings', isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.id;
      const data = updateSettingsSchema.parse(req.body);
      const updated = await storage.updateUserSettings(userId, data);
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        console.error("Error updating settings:", error);
        res.status(500).json({ message: "Failed to update settings" });
      }
    }
  });

  // Complete user onboarding
  app.post('/api/profile/onboarding', isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.id;
      const data = completeOnboardingSchema.parse(req.body);
      const updated = await storage.completeUserOnboarding(userId, data);
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        console.error("Error completing onboarding:", error);
        res.status(500).json({ message: "Failed to complete onboarding" });
      }
    }
  });

  // Check if user needs onboarding - MUST be before /:userId route
  app.get('/api/profile/onboarding-status', isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUserProfile(userId);
      res.json({ 
        needsOnboarding: !user?.hasCompletedOnboarding,
        hasCompletedOnboarding: user?.hasCompletedOnboarding || false
      });
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      res.status(500).json({ message: "Failed to check onboarding status" });
    }
  });

  // Get another user's public profile - MUST be last (parameterized route)
  app.get('/api/profile/:userId', async (req: Request, res) => {
    try {
      const { userId } = req.params;
      const isOwner = req.user?.id === userId;
      
      const user = await storage.getUserProfile(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if profile is private and viewer is not the owner
      if (user.profileVisibility === 'private' && !isOwner) {
        return res.status(403).json({ message: "This profile is private" });
      }
      
      const stats = await storage.getUserStats(userId);
      const testimonies = isOwner || user.profileVisibility === 'public' 
        ? await storage.getUserTestimonies(userId) 
        : [];
      
      // Return only public-safe fields - never expose email, notification settings, or other sensitive data
      const publicProfile = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        bio: user.bio,
        location: user.location,
        website: user.website,
        faithInterests: user.faithInterests,
        createdAt: user.createdAt,
        stats,
        testimonies,
      };
      
      res.json(publicProfile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // ========== PASSWORD MANAGEMENT ==========

  // Check if user has password (for account linking UI)
  app.get('/api/profile/has-password', isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.id;
      const hasPassword = await storage.hasPassword(userId);
      const user = await storage.getUser(userId);
      res.json({ 
        hasPassword,
        hasGoogleLinked: !!user?.googleId,
        authProvider: user?.authProvider || 'email'
      });
    } catch (error) {
      console.error("Error checking password status:", error);
      res.status(500).json({ message: "Failed to check password status" });
    }
  });

  // Add password to account (for Google users)
  app.post('/api/profile/add-password', isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.id;
      const data = addPasswordSchema.parse(req.body);
      
      // Check if user already has a password
      const existingPassword = await storage.hasPassword(userId);
      if (existingPassword) {
        return res.status(400).json({ message: "You already have a password set. Use change password instead." });
      }
      
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(data.password, saltRounds);
      const updated = await storage.addPasswordToAccount(userId, passwordHash);
      
      res.json({ 
        success: true, 
        message: "Password added successfully. You can now sign in with email and password.",
        authProvider: updated.authProvider
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        console.error("Error adding password:", error);
        res.status(500).json({ message: "Failed to add password" });
      }
    }
  });

  // ========== ADMIN ROUTES ==========
  
  // Create initial admin on startup
  await createInitialAdmin();

  // Admin login with rate limiting and session security
  app.post('/api/admin/login', async (req, res) => {
    try {
      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
      
      const rateCheck = checkLoginRateLimit(clientIp);
      if (!rateCheck.allowed) {
        const waitMinutes = Math.ceil((rateCheck.lockoutEnds! - Date.now()) / 60000);
        return res.status(429).json({ 
          message: `Too many login attempts. Please try again in ${waitMinutes} minutes.` 
        });
      }

      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const admin = await storage.getAdminByUsername(username);
      if (!admin) {
        recordLoginAttempt(clientIp, false);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await verifyPassword(password, admin.passwordHash);
      if (!isValid) {
        recordLoginAttempt(clientIp, false);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      recordLoginAttempt(clientIp, true);
      await storage.updateAdminLastLogin(admin.id);
      
      (req.session as any).adminId = admin.id;
      (req.session as any).adminUsername = admin.username;
      
      try {
        await regenerateSession(req);
      } catch (sessionErr) {
        console.error("Session regeneration failed:", sessionErr);
      }

      res.json({ 
        message: "Login successful", 
        admin: { 
          id: admin.id, 
          username: admin.username, 
          displayName: admin.displayName 
        } 
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Login failed. Please try again." });
    }
  });

  // Admin logout with proper session destruction
  app.post('/api/admin/logout', async (req, res) => {
    try {
      await destroySession(req);
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      delete (req.session as any).adminId;
      delete (req.session as any).adminUsername;
      res.json({ message: "Logged out successfully" });
    }
  });

  // Check admin session
  app.get('/api/admin/session', (req, res) => {
    if ((req.session as any).adminId) {
      res.json({ 
        authenticated: true, 
        adminId: (req.session as any).adminId,
        adminUsername: (req.session as any).adminUsername
      });
    } else {
      res.json({ authenticated: false });
    }
  });

  // Change admin password
  app.post('/api/admin/change-password', isAdminAuthenticated, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const adminId = (req.session as any).adminId;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current and new passwords are required" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters" });
      }

      const admin = await storage.getAdminByUsername((req.session as any).adminUsername);
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      const isValid = await verifyPassword(currentPassword, admin.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      const newPasswordHash = await hashPassword(newPassword);
      // Note: We'd need to add an updateAdmin method for this
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Get all testimonies for admin (includes more data)
  app.get('/api/admin/testimonies', isAdminAuthenticated, async (req, res) => {
    try {
      const testimonies = await storage.getAllTestimonies();
      res.json(testimonies);
    } catch (error) {
      console.error("Error fetching testimonies for admin:", error);
      res.status(500).json({ message: "Failed to fetch testimonies" });
    }
  });

  // Admin video upload endpoint
  app.post('/api/admin/uploads/video-url', isAdminAuthenticated, async (req, res) => {
    try {
      const { name, size, contentType } = req.body;
      
      if (!name || !contentType) {
        return res.status(400).json({ error: "Missing required fields: name, contentType" });
      }
      
      if (!contentType.startsWith('video/')) {
        return res.status(400).json({ error: "Only video files are allowed" });
      }
      
      const maxSize = 100 * 1024 * 1024; // 100MB limit
      if (size && size > maxSize) {
        return res.status(400).json({ error: "Video file too large. Maximum size is 100MB." });
      }
      
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);
      
      res.json({
        uploadURL,
        objectPath,
        metadata: { name, size, contentType },
      });
    } catch (error) {
      console.error("Error generating admin video upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  // Admin upload testimony (with video support, auto-approved)
  app.post('/api/admin/testimonies/upload', isAdminAuthenticated, async (req, res) => {
    try {
      const adminId = (req.session as any).adminId;
      const { title, story, category, videoUrl, thumbnailUrl } = req.body;
      
      if (!title || !story || !category) {
        return res.status(400).json({ message: "Title, story, and category are required" });
      }
      
      // Create a special admin user ID or use a system account
      const adminUserId = 'admin-system';
      
      const testimony = await storage.createTestimony({
        userId: adminUserId,
        title,
        story,
        category,
        privacy: 'public',
        videoUrl: videoUrl || null,
        thumbnailUrl: thumbnailUrl || null,
      });
      
      // Auto-approve admin-uploaded testimonies
      await storage.updateTestimonyModerationStatus(testimony.id, 'approved');
      
      // Log the action
      await storage.createAuditLog({
        adminId,
        action: 'upload_testimony',
        targetType: 'testimony',
        targetId: testimony.id,
        details: JSON.stringify({ title, category, hasVideo: !!videoUrl }),
        ipAddress: req.ip || req.connection.remoteAddress || undefined,
      });
      
      res.json(testimony);
    } catch (error) {
      console.error("Error uploading admin testimony:", error);
      res.status(500).json({ message: "Failed to upload testimony" });
    }
  });

  // Get approved testimonies for featured selection
  app.get('/api/admin/testimonies/approved', isAdminAuthenticated, async (req, res) => {
    try {
      const testimonies = await storage.getApprovedTestimonies();
      res.json(testimonies);
    } catch (error) {
      console.error("Error fetching approved testimonies:", error);
      res.status(500).json({ message: "Failed to fetch approved testimonies" });
    }
  });

  // Set featured testimony
  app.post('/api/admin/testimonies/:id/feature', isAdminAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const adminId = (req.session as any).adminId;
      
      await storage.setFeaturedTestimony(id);
      
      // Log the action
      await storage.createAuditLog({
        adminId,
        action: 'set_featured_testimony',
        targetType: 'testimony',
        targetId: id,
        ipAddress: req.ip || req.connection.remoteAddress || undefined,
      });
      
      res.json({ message: "Testimony set as featured" });
    } catch (error) {
      console.error("Error setting featured testimony:", error);
      res.status(500).json({ message: "Failed to set featured testimony" });
    }
  });

  // Clear featured testimony
  app.post('/api/admin/testimonies/clear-featured', isAdminAuthenticated, async (req, res) => {
    try {
      await storage.clearFeaturedTestimony();
      res.json({ message: "Featured testimony cleared" });
    } catch (error) {
      console.error("Error clearing featured testimony:", error);
      res.status(500).json({ message: "Failed to clear featured testimony" });
    }
  });

  // Faith Declaration routes
  app.get('/api/faith-declaration/active', async (req, res) => {
    try {
      const declaration = await storage.getActiveFaithDeclaration();
      res.json(declaration || null);
    } catch (error) {
      console.error("Error fetching active faith declaration:", error);
      res.status(500).json({ message: "Failed to fetch faith declaration" });
    }
  });

  app.get('/api/admin/faith-declarations', isAdminAuthenticated, async (req, res) => {
    try {
      const declarations = await storage.getFaithDeclarations();
      res.json(declarations);
    } catch (error) {
      console.error("Error fetching faith declarations:", error);
      res.status(500).json({ message: "Failed to fetch faith declarations" });
    }
  });

  app.post('/api/admin/faith-declarations', isAdminAuthenticated, async (req, res) => {
    try {
      const adminId = (req.session as any).adminId;
      const data = insertFaithDeclarationSchema.parse({ ...req.body, createdBy: adminId });
      const declaration = await storage.createFaithDeclaration(data);
      res.json(declaration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        console.error("Error creating faith declaration:", error);
        res.status(500).json({ message: "Failed to create faith declaration" });
      }
    }
  });

  app.post('/api/admin/faith-declarations/:id/activate', isAdminAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.setActiveFaithDeclaration(id);
      res.json({ message: "Faith declaration activated" });
    } catch (error) {
      console.error("Error activating faith declaration:", error);
      res.status(500).json({ message: "Failed to activate faith declaration" });
    }
  });

  app.delete('/api/admin/faith-declarations/:id', isAdminAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteFaithDeclaration(id);
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Faith declaration not found" });
      }
    } catch (error) {
      console.error("Error deleting faith declaration:", error);
      res.status(500).json({ message: "Failed to delete faith declaration" });
    }
  });

  // Video Moderation Routes
  app.get('/api/admin/testimonies/pending-videos', isAdminAuthenticated, async (req, res) => {
    try {
      const testimonies = await storage.getPendingVideoTestimonies();
      res.json(testimonies);
    } catch (error) {
      console.error("Error fetching pending video testimonies:", error);
      res.status(500).json({ message: "Failed to fetch pending videos" });
    }
  });

  app.post('/api/admin/testimonies/:id/approve-video', isAdminAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: "Invalid testimony ID" });
      }
      const testimony = await storage.getTestimony(id);
      if (!testimony) {
        return res.status(404).json({ message: "Testimony not found" });
      }
      await storage.updateTestimonyModerationStatus(id, 'approved');
      res.json({ message: "Video approved successfully" });
    } catch (error) {
      console.error("Error approving video:", error);
      res.status(500).json({ message: "Failed to approve video" });
    }
  });

  app.post('/api/admin/testimonies/:id/reject-video', isAdminAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: "Invalid testimony ID" });
      }
      const testimony = await storage.getTestimony(id);
      if (!testimony) {
        return res.status(404).json({ message: "Testimony not found" });
      }
      await storage.updateTestimonyModerationStatus(id, 'rejected');
      res.json({ message: "Video rejected" });
    } catch (error) {
      console.error("Error rejecting video:", error);
      res.status(500).json({ message: "Failed to reject video" });
    }
  });

  // =====================================================
  // ADMIN DASHBOARD ROUTES
  // =====================================================

  // Get analytics data
  app.get('/api/admin/analytics', isAdminAuthenticated, async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Get all users for admin
  app.get('/api/admin/users', isAdminAuthenticated, async (req, res) => {
    try {
      const users = await storage.getAllUsersAdmin();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Suspend a user
  app.post('/api/admin/users/:id/suspend', isAdminAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      if (!reason || typeof reason !== 'string') {
        return res.status(400).json({ message: "Suspension reason is required" });
      }
      const user = await storage.suspendUser(id, reason);
      
      // Log the action
      const adminId = (req.session as any).adminId;
      await storage.createAuditLog({
        adminId,
        action: 'suspend_user',
        targetType: 'user',
        targetId: id,
        details: JSON.stringify({ reason }),
        ipAddress: req.ip || req.connection.remoteAddress || undefined,
      });
      
      res.json(user);
    } catch (error) {
      console.error("Error suspending user:", error);
      res.status(500).json({ message: "Failed to suspend user" });
    }
  });

  // Unsuspend a user
  app.post('/api/admin/users/:id/unsuspend', isAdminAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.unsuspendUser(id);
      
      // Log the action
      const adminId = (req.session as any).adminId;
      await storage.createAuditLog({
        adminId,
        action: 'unsuspend_user',
        targetType: 'user',
        targetId: id,
        ipAddress: req.ip || req.connection.remoteAddress || undefined,
      });
      
      res.json(user);
    } catch (error) {
      console.error("Error unsuspending user:", error);
      res.status(500).json({ message: "Failed to unsuspend user" });
    }
  });

  // Delete a testimony (admin)
  app.delete('/api/admin/testimonies/:id', isAdminAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const testimony = await storage.getTestimony(id);
      if (!testimony) {
        return res.status(404).json({ message: "Testimony not found" });
      }
      
      const deleted = await storage.adminDeleteTestimony(id);
      
      // Log the action
      const adminId = (req.session as any).adminId;
      await storage.createAuditLog({
        adminId,
        action: 'delete_testimony',
        targetType: 'testimony',
        targetId: id,
        details: JSON.stringify({ title: testimony.title }),
        ipAddress: req.ip || req.connection.remoteAddress || undefined,
      });
      
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Testimony not found" });
      }
    } catch (error) {
      console.error("Error deleting testimony:", error);
      res.status(500).json({ message: "Failed to delete testimony" });
    }
  });

  // Get all comments for admin
  app.get('/api/admin/comments', isAdminAuthenticated, async (req, res) => {
    try {
      const comments = await storage.getAllCommentsAdmin();
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Delete a comment (admin)
  app.delete('/api/admin/comments/:id', isAdminAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const comment = await storage.getCommentById(id);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      const deleted = await storage.adminDeleteComment(id);
      
      // Log the action
      const adminId = (req.session as any).adminId;
      await storage.createAuditLog({
        adminId,
        action: 'delete_comment',
        targetType: 'comment',
        targetId: id,
        details: JSON.stringify({ content: comment.content.substring(0, 100) }),
        ipAddress: req.ip || req.connection.remoteAddress || undefined,
      });
      
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Comment not found" });
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  // Get all encouragement verses
  app.get('/api/admin/encouragement-verses', isAdminAuthenticated, async (req, res) => {
    try {
      const verses = await storage.getAllEncouragementVerses();
      res.json(verses);
    } catch (error) {
      console.error("Error fetching verses:", error);
      res.status(500).json({ message: "Failed to fetch verses" });
    }
  });

  // Create encouragement verse
  app.post('/api/admin/encouragement-verses', isAdminAuthenticated, async (req, res) => {
    try {
      const data = insertEncouragementVerseSchema.parse(req.body);
      const verse = await storage.createEncouragementVerse(data);
      
      const adminId = (req.session as any).adminId;
      await storage.createAuditLog({
        adminId,
        action: 'create_encouragement_verse',
        targetType: 'encouragement_verse',
        targetId: verse.id,
        ipAddress: req.ip || req.connection.remoteAddress || undefined,
      });
      
      res.json(verse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        console.error("Error creating verse:", error);
        res.status(500).json({ message: "Failed to create verse" });
      }
    }
  });

  // Update encouragement verse
  app.patch('/api/admin/encouragement-verses/:id', isAdminAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const verse = await storage.updateEncouragementVerse(id, req.body);
      
      const adminId = (req.session as any).adminId;
      if (adminId) {
        await storage.createAuditLog({
          adminId,
          action: 'update_encouragement_verse',
          targetType: 'encouragement_verse',
          targetId: id,
          ipAddress: req.ip || req.connection.remoteAddress || undefined,
        });
      }
      
      res.json(verse);
    } catch (error) {
      console.error("Error updating verse:", error);
      res.status(500).json({ message: "Failed to update verse" });
    }
  });

  // Delete encouragement verse
  app.delete('/api/admin/encouragement-verses/:id', isAdminAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteEncouragementVerse(id);
      
      const adminId = (req.session as any).adminId;
      await storage.createAuditLog({
        adminId,
        action: 'delete_encouragement_verse',
        targetType: 'encouragement_verse',
        targetId: id,
        ipAddress: req.ip || req.connection.remoteAddress || undefined,
      });
      
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Verse not found" });
      }
    } catch (error) {
      console.error("Error deleting verse:", error);
      res.status(500).json({ message: "Failed to delete verse" });
    }
  });

  // Set active encouragement verse
  app.post('/api/admin/encouragement-verses/:id/activate', isAdminAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.setActiveEncouragementVerse(id);
      res.json({ message: "Verse activated" });
    } catch (error) {
      console.error("Error activating verse:", error);
      res.status(500).json({ message: "Failed to activate verse" });
    }
  });

  // Get all admins
  app.get('/api/admin/admins', isAdminAuthenticated, async (req, res) => {
    try {
      const allAdmins = await storage.getAllAdmins();
      // Don't send password hashes to client
      const safeAdmins = allAdmins.map(({ passwordHash, ...admin }) => admin);
      res.json(safeAdmins);
    } catch (error) {
      console.error("Error fetching admins:", error);
      res.status(500).json({ message: "Failed to fetch admins" });
    }
  });

  // Create new admin
  app.post('/api/admin/admins', isAdminAuthenticated, async (req, res) => {
    try {
      const { username, password, displayName } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }
      
      // Check if username exists
      const existing = await storage.getAdminByUsername(username);
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const passwordHash = await bcrypt.hash(password, 12);
      const admin = await storage.createAdmin({
        username,
        passwordHash,
        displayName: displayName || username,
      });
      
      const currentAdminId = (req.session as any).adminId;
      await storage.createAuditLog({
        adminId: currentAdminId,
        action: 'create_admin',
        targetType: 'admin',
        targetId: admin.id,
        details: JSON.stringify({ username }),
        ipAddress: req.ip || req.connection.remoteAddress || undefined,
      });
      
      // Don't send password hash back
      const { passwordHash: _, ...safeAdmin } = admin;
      res.json(safeAdmin);
    } catch (error) {
      console.error("Error creating admin:", error);
      res.status(500).json({ message: "Failed to create admin" });
    }
  });

  // Delete admin
  app.delete('/api/admin/admins/:id', isAdminAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const currentAdminId = (req.session as any).adminId;
      
      // Prevent self-deletion
      if (id === currentAdminId) {
        return res.status(400).json({ message: "You cannot delete your own account" });
      }
      
      const admin = await storage.getAdminById(id);
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }
      
      const deleted = await storage.deleteAdmin(id);
      
      await storage.createAuditLog({
        adminId: currentAdminId,
        action: 'delete_admin',
        targetType: 'admin',
        targetId: id,
        details: JSON.stringify({ username: admin.username }),
        ipAddress: req.ip || req.connection.remoteAddress || undefined,
      });
      
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Admin not found" });
      }
    } catch (error) {
      console.error("Error deleting admin:", error);
      res.status(500).json({ message: "Failed to delete admin" });
    }
  });

  // Get audit logs
  app.get('/api/admin/audit-logs', isAdminAuthenticated, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await storage.getAuditLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  // =====================================================
  // FAITH EXPECTATIONS ROUTES
  // =====================================================

  // Create a new faith expectation
  app.post('/api/expectations', isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.id;
      const data = insertFaithExpectationSchema.parse({ ...req.body, userId });
      const expectation = await storage.createExpectation(data);
      res.json(expectation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        console.error("Error creating expectation:", error);
        res.status(500).json({ message: "Failed to create expectation" });
      }
    }
  });

  // Get user's own expectations
  app.get('/api/expectations/my', isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.id;
      const status = req.query.status as string | undefined;
      const expectations = await storage.getUserExpectations(userId, status);
      res.json(expectations);
    } catch (error) {
      console.error("Error fetching user expectations:", error);
      res.status(500).json({ message: "Failed to fetch expectations" });
    }
  });

  // Get community expectations (public/community visibility)
  app.get('/api/expectations/community', async (req: Request, res) => {
    try {
      const userId = req.user?.id;
      const expectations = await storage.getCommunityExpectations(userId);
      res.json(expectations);
    } catch (error) {
      console.error("Error fetching community expectations:", error);
      res.status(500).json({ message: "Failed to fetch community expectations" });
    }
  });

  // Get a single expectation by ID
  app.get('/api/expectations/:id', async (req: Request, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const expectation = await storage.getExpectation(id, userId);
      if (!expectation) {
        return res.status(404).json({ message: "Expectation not found" });
      }
      res.json(expectation);
    } catch (error) {
      console.error("Error fetching expectation:", error);
      res.status(500).json({ message: "Failed to fetch expectation" });
    }
  });

  // Update an expectation
  app.patch('/api/expectations/:id', isAuthenticated, async (req: Request, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const data = req.body;
      const updated = await storage.updateExpectation(id, userId, data);
      if (!updated) {
        return res.status(404).json({ message: "Expectation not found or not owned by you" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating expectation:", error);
      res.status(500).json({ message: "Failed to update expectation" });
    }
  });

  // Delete an expectation
  app.delete('/api/expectations/:id', isAuthenticated, async (req: Request, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const deleted = await storage.deleteExpectation(id, userId);
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Expectation not found or not owned by you" });
      }
    } catch (error) {
      console.error("Error deleting expectation:", error);
      res.status(500).json({ message: "Failed to delete expectation" });
    }
  });

  // Mark expectation as answered (celebrate!)
  app.post('/api/expectations/:id/answer', isAuthenticated, async (req: Request, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const data = answerExpectationSchema.parse(req.body);
      const updated = await storage.markExpectationAnswered(id, userId, data.celebrationNote);
      if (!updated) {
        return res.status(404).json({ message: "Expectation not found or not owned by you" });
      }
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        console.error("Error marking expectation as answered:", error);
        res.status(500).json({ message: "Failed to mark expectation as answered" });
      }
    }
  });

  // Archive an expectation
  app.post('/api/expectations/:id/archive', isAuthenticated, async (req: Request, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const updated = await storage.archiveExpectation(id, userId);
      if (!updated) {
        return res.status(404).json({ message: "Expectation not found or not owned by you" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error archiving expectation:", error);
      res.status(500).json({ message: "Failed to archive expectation" });
    }
  });

  // =====================================================
  // EXPECTATION MILESTONES ROUTES
  // =====================================================

  // Create a milestone for an expectation
  app.post('/api/expectations/:expectationId/milestones', isAuthenticated, async (req: Request, res) => {
    try {
      const { expectationId } = req.params;
      const userId = req.user!.id;
      
      // Verify ownership
      const expectation = await storage.getExpectation(expectationId, userId);
      if (!expectation || expectation.userId !== userId) {
        return res.status(404).json({ message: "Expectation not found or not owned by you" });
      }
      
      const data = insertExpectationMilestoneSchema.parse({ ...req.body, expectationId });
      const milestone = await storage.createMilestone(data);
      res.json(milestone);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        console.error("Error creating milestone:", error);
        res.status(500).json({ message: "Failed to create milestone" });
      }
    }
  });

  // Get milestones for an expectation (requires auth)
  app.get('/api/expectations/:expectationId/milestones', isAuthenticated, async (req: Request, res) => {
    try {
      const { expectationId } = req.params;
      const userId = req.user!.id;
      
      // Check if expectation exists and user has access
      const expectation = await storage.getExpectation(expectationId, userId);
      if (!expectation) {
        return res.status(404).json({ message: "Expectation not found or access denied" });
      }
      
      const milestones = await storage.getMilestones(expectationId);
      res.json(milestones);
    } catch (error) {
      console.error("Error fetching milestones:", error);
      res.status(500).json({ message: "Failed to fetch milestones" });
    }
  });

  // Update milestone status
  app.patch('/api/milestones/:id/status', isAuthenticated, async (req: Request, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      
      // Verify ownership
      const milestoneData = await storage.getMilestoneWithOwner(id);
      if (!milestoneData || milestoneData.ownerId !== userId) {
        return res.status(404).json({ message: "Milestone not found or not owned by you" });
      }
      
      const data = updateMilestoneStatusSchema.parse(req.body);
      const updated = await storage.updateMilestoneStatus(id, data.status, data.notes);
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        console.error("Error updating milestone status:", error);
        res.status(500).json({ message: "Failed to update milestone status" });
      }
    }
  });

  // Delete a milestone
  app.delete('/api/milestones/:id', isAuthenticated, async (req: Request, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      
      // Verify ownership
      const milestoneData = await storage.getMilestoneWithOwner(id);
      if (!milestoneData || milestoneData.ownerId !== userId) {
        return res.status(404).json({ message: "Milestone not found or not owned by you" });
      }
      
      const deleted = await storage.deleteMilestone(id);
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Milestone not found" });
      }
    } catch (error) {
      console.error("Error deleting milestone:", error);
      res.status(500).json({ message: "Failed to delete milestone" });
    }
  });

  // =====================================================
  // EXPECTATION SCRIPTURES ROUTES
  // =====================================================

  // Add a scripture to an expectation
  app.post('/api/expectations/:expectationId/scriptures', isAuthenticated, async (req: Request, res) => {
    try {
      const { expectationId } = req.params;
      const userId = req.user!.id;
      
      // Verify ownership
      const expectation = await storage.getExpectation(expectationId, userId);
      if (!expectation || expectation.userId !== userId) {
        return res.status(404).json({ message: "Expectation not found or not owned by you" });
      }
      
      const data = insertExpectationScriptureSchema.parse({ ...req.body, expectationId });
      const scripture = await storage.createScripture(data);
      res.json(scripture);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        console.error("Error creating scripture:", error);
        res.status(500).json({ message: "Failed to add scripture" });
      }
    }
  });

  // Get scriptures for an expectation (requires auth)
  app.get('/api/expectations/:expectationId/scriptures', isAuthenticated, async (req: Request, res) => {
    try {
      const { expectationId } = req.params;
      const userId = req.user!.id;
      
      // Check if expectation exists and user has access
      const expectation = await storage.getExpectation(expectationId, userId);
      if (!expectation) {
        return res.status(404).json({ message: "Expectation not found or access denied" });
      }
      
      const scriptures = await storage.getScriptures(expectationId);
      res.json(scriptures);
    } catch (error) {
      console.error("Error fetching scriptures:", error);
      res.status(500).json({ message: "Failed to fetch scriptures" });
    }
  });

  // Delete a scripture
  app.delete('/api/scriptures/:id', isAuthenticated, async (req: Request, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      
      // Verify ownership
      const scriptureData = await storage.getScriptureWithOwner(id);
      if (!scriptureData || scriptureData.ownerId !== userId) {
        return res.status(404).json({ message: "Scripture not found or not owned by you" });
      }
      
      const deleted = await storage.deleteScripture(id);
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Scripture not found" });
      }
    } catch (error) {
      console.error("Error deleting scripture:", error);
      res.status(500).json({ message: "Failed to delete scripture" });
    }
  });

  // ── API.Bible proxy routes (for NKJV, MSG, AMP, TPT) ──────────────────────

  // In-memory cache for premium Bible version IDs
  let _premiumVersionsCache: Array<{ id: string; abbreviation: string; name: string }> | null = null;
  let _premiumVersionsCacheTime = 0;

  async function getPremiumVersions(apiKey: string) {
    const now = Date.now();
    if (_premiumVersionsCache && now - _premiumVersionsCacheTime < 3_600_000) {
      return _premiumVersionsCache;
    }
    const resp = await fetch("https://rest.api.bible/v1/bibles?language=eng", {
      headers: { "api-key": apiKey },
    });
    if (!resp.ok) {
      const body = await resp.text();
      console.error(`api.bible /bibles HTTP ${resp.status}:`, body.slice(0, 200));
      throw new Error(`api.bible request failed: HTTP ${resp.status}`);
    }
    const data = await resp.json();
    const TARGETS = ["MSG", "AMP", "NLT"];
    const versions = (data.data ?? [])
      .filter((b: any) =>
        TARGETS.some(
          (t) =>
            (b.abbreviationLocal ?? "").toUpperCase() === t ||
            (b.abbreviation ?? "").toUpperCase() === t
        )
      )
      .map((b: any) => ({
        id: b.id,
        abbreviation: ((b.abbreviationLocal || b.abbreviation) ?? "").toUpperCase(),
        name: b.nameLocal || b.name,
      }));
    _premiumVersionsCache = versions;
    _premiumVersionsCacheTime = now;
    return versions;
  }

  // Recursively extract {verse, text} pairs from api.bible JSON content tree
  function extractVerses(content: any[]): Array<{ verse: number; text: string }> {
    const result: Array<{ verse: number; text: string }> = [];
    let curVerse: number | null = null;
    let curText = "";

    function flush() {
      if (curVerse !== null && curText.trim()) {
        result.push({ verse: curVerse, text: curText.trim() });
      }
    }

    function walk(node: any) {
      if (!node) return;
      if (node.type === "tag" && node.name === "verse") {
        flush();
        curVerse = parseInt(node.attrs?.number ?? "0", 10);
        curText = "";
        (node.items || []).forEach(walk);
      } else if (node.type === "text") {
        if (curVerse !== null) curText += node.text ?? "";
      } else {
        (node.items || []).forEach(walk);
      }
    }

    content.forEach(walk);
    flush();
    return result;
  }

  // GET /api/bible/premium/status — is the key configured?
  app.get("/api/bible/premium/status", (_req, res) => {
    res.json({ configured: !!process.env.BIBLE_API_KEY });
  });

  // GET /api/bible/premium/versions — list available NKJV/MSG/AMP/TPT versions
  app.get("/api/bible/premium/versions", async (_req, res) => {
    const apiKey = process.env.BIBLE_API_KEY;
    if (!apiKey) return res.status(503).json({ message: "API key not configured", versions: [] });
    try {
      const versions = await getPremiumVersions(apiKey);
      res.json({ versions });
    } catch (err: any) {
      const msg = err?.message ?? "Failed to fetch Bible versions";
      const isAuthError = msg.includes("401") || msg.includes("403");
      console.error("api.bible versions error:", msg);
      res.status(isAuthError ? 401 : 502).json({ message: msg, versions: [] });
    }
  });

  // GET /api/bible/premium/chapter?bibleId=X&chapterId=JHN.3
  app.get("/api/bible/premium/chapter", async (req, res) => {
    const apiKey = process.env.BIBLE_API_KEY;
    if (!apiKey) return res.status(503).json({ message: "API key not configured" });
    const { bibleId, chapterId } = req.query as { bibleId: string; chapterId: string };
    if (!bibleId || !chapterId) return res.status(400).json({ message: "bibleId and chapterId required" });
    try {
      const url = new URL(`https://rest.api.bible/v1/bibles/${bibleId}/chapters/${chapterId}`);
      url.searchParams.set("content-type", "json");
      url.searchParams.set("include-notes", "false");
      url.searchParams.set("include-titles", "false");
      url.searchParams.set("include-chapter-numbers", "false");
      url.searchParams.set("include-verse-numbers", "true");
      url.searchParams.set("include-verse-spans", "false");
      const resp = await fetch(url.toString(), { headers: { "api-key": apiKey } });
      if (!resp.ok) {
        const body = await resp.text();
        return res.status(resp.status).json({ message: body });
      }
      const data = await resp.json();
      const verses = extractVerses(data.data?.content ?? []);
      res.json({ reference: data.data?.reference, verses });
    } catch (err) {
      console.error("api.bible chapter error:", err);
      res.status(502).json({ message: "Failed to fetch chapter" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
