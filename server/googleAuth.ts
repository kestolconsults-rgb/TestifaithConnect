import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler, Request, Response } from "express";
import connectPg from "connect-pg-simple";
import rateLimit from "express-rate-limit";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { signUpSchema, signInSchema, forgotPasswordSchema, resetPasswordSchema, resendVerificationSchema } from "@shared/schema";
import { z } from "zod";
import { sendWelcomeEmail, sendPasswordResetEmail, sendVerificationEmail } from "./emailService";

// Rate limiters for anti-bot / brute-force protection on auth endpoints
export const signupRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many accounts created from this location. Please try again later." },
});

export const signinRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many sign-in attempts. Please try again in a few minutes." },
});

export const forgotPasswordRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});

// Cloudflare's official "always passes" dummy secret key, paired with the dummy
// site key (1x00000000000000000000AA) served outside production. See:
// https://developers.cloudflare.com/turnstile/troubleshooting/testing/
const TURNSTILE_TEST_SECRET_KEY = "1x0000000000000000000000000000000AA";

async function verifyTurnstileToken(token: string, remoteIp?: string): Promise<boolean> {
  const secret = process.env.NODE_ENV === "production"
    ? process.env.TURNSTILE_SECRET_KEY
    : TURNSTILE_TEST_SECRET_KEY;
  if (!secret) {
    console.warn("TURNSTILE_SECRET_KEY not configured, skipping CAPTCHA verification");
    return true;
  }
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp) body.set("remoteip", remoteIp);

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return false;
  }
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: sessionTtl,
    },
  });
}

async function handleGoogleUser(profile: Profile): Promise<{ id: string; email?: string; firstName?: string; lastName?: string; profileImageUrl?: string }> {
  const email = profile.emails?.[0]?.value;
  const firstName = profile.name?.givenName;
  const lastName = profile.name?.familyName;
  const profileImageUrl = profile.photos?.[0]?.value;
  const googleId = profile.id;

  // First, check if we already have a user with this Google ID
  const existingGoogleUser = await storage.getUserByGoogleId(googleId);
  if (existingGoogleUser) {
    return {
      id: existingGoogleUser.id,
      email: existingGoogleUser.email ?? undefined,
      firstName: existingGoogleUser.firstName ?? undefined,
      lastName: existingGoogleUser.lastName ?? undefined,
      profileImageUrl: existingGoogleUser.profileImageUrl ?? undefined,
    };
  }

  // Check if there's an existing user with this email (created via email/password)
  if (email) {
    const existingEmailUser = await storage.getUserByEmail(email);
    if (existingEmailUser) {
      // Link the Google account to the existing email account
      const linkedUser = await storage.linkGoogleAccount(existingEmailUser.id, googleId, profileImageUrl || undefined);
      return {
        id: linkedUser.id,
        email: linkedUser.email ?? undefined,
        firstName: linkedUser.firstName ?? undefined,
        lastName: linkedUser.lastName ?? undefined,
        profileImageUrl: linkedUser.profileImageUrl ?? undefined,
      };
    }
  }

  // No existing user found, create a new one
  // Google accounts are already email-verified by Google, so mark verified immediately
  const newUser = await storage.upsertUser({
    email: email || null,
    googleId,
    firstName: firstName || null,
    lastName: lastName || null,
    profileImageUrl: profileImageUrl || null,
    authProvider: "google",
    emailVerified: true,
  });

  // Send welcome email to new Google users (non-blocking)
  if (email) {
    sendWelcomeEmail(email, firstName || undefined).catch(err => 
      console.error('Failed to send welcome email:', err)
    );
  }

  return {
    id: newUser.id,
    email: newUser.email ?? undefined,
    firstName: newUser.firstName ?? undefined,
    lastName: newUser.lastName ?? undefined,
    profileImageUrl: newUser.profileImageUrl ?? undefined,
  };
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const callbackURL = process.env.NODE_ENV === "production"
    ? "https://testifaith.com/api/auth/google/callback"
    : `https://${process.env.REPLIT_DOMAINS?.split(",")[0] || "localhost"}/api/auth/google/callback`;

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL,
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await handleGoogleUser(profile);
          done(null, user);
        } catch (error) {
          done(error as Error);
        }
      }
    )
  );

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user) {
            return done(null, false, { message: "Invalid email or password" });
          }
          if (!user.passwordHash) {
            return done(null, false, { message: "This account uses Google sign-in. Please sign in with Google." });
          }
          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) {
            return done(null, false, { message: "Invalid email or password" });
          }
          return done(null, {
            id: user.id,
            email: user.email ?? undefined,
            firstName: user.firstName ?? undefined,
            lastName: user.lastName ?? undefined,
            profileImageUrl: user.profileImageUrl ?? undefined,
          });
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });

  app.get("/api/auth/google", passport.authenticate("google", { 
    scope: ["profile", "email"],
    prompt: "select_account"
  }));

  app.get("/api/auth/google/callback", 
    passport.authenticate("google", { 
      failureRedirect: "/signin?error=auth_failed",
    }),
    (req, res) => {
      res.redirect("/home");
    }
  );

  app.post("/api/auth/signin", signinRateLimit, (req: Request, res: Response, next) => {
    try {
      signInSchema.parse(req.body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      return res.status(400).json({ message: "Invalid input" });
    }

    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        console.error("Authentication error:", err);
        return res.status(500).json({ message: "An error occurred during sign in. Please try again." });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid email or password" });
      }
      
      // Regenerate session to prevent session fixation
      req.session.regenerate((regenerateErr) => {
        if (regenerateErr) {
          console.error("Session regeneration error:", regenerateErr);
          return res.status(500).json({ message: "An error occurred during sign in. Please try again." });
        }
        
        req.logIn(user, (loginErr) => {
          if (loginErr) {
            console.error("Login error:", loginErr);
            return res.status(500).json({ message: "An error occurred during sign in. Please try again." });
          }
          return res.json({ success: true, user });
        });
      });
    })(req, res, next);
  });

  app.post("/api/auth/signup", signupRateLimit, async (req: Request, res: Response) => {
    try {
      const data = signUpSchema.parse(req.body);

      const captchaOk = await verifyTurnstileToken(data.turnstileToken, req.ip);
      if (!captchaOk) {
        return res.status(400).json({ message: "Verification check failed. Please try again." });
      }

      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "An account with this email already exists" });
      }

      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(data.password, saltRounds);

      const user = await storage.createUserWithPassword(
        data.email,
        passwordHash,
        data.firstName,
        data.lastName
      );

      // Send welcome email (non-blocking)
      sendWelcomeEmail(data.email, data.firstName).catch(err => 
        console.error('Failed to send welcome email:', err)
      );

      // Create and send email verification link (non-blocking)
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      storage.createEmailVerificationToken(user.id, verificationToken, verificationExpiresAt)
        .then(() => sendVerificationEmail(data.email, data.firstName, verificationToken))
        .catch(err => console.error('Failed to send verification email:', err));

      // Regenerate session to prevent session fixation
      req.session.regenerate((regenerateErr) => {
        if (regenerateErr) {
          console.error("Session regeneration error:", regenerateErr);
          return res.status(500).json({ message: "Account created but an error occurred. Please sign in." });
        }

        req.logIn({
          id: user.id,
          email: user.email ?? undefined,
          firstName: user.firstName ?? undefined,
          lastName: user.lastName ?? undefined,
          profileImageUrl: user.profileImageUrl ?? undefined,
        }, (loginErr) => {
          if (loginErr) {
            console.error("Login error after signup:", loginErr);
            return res.status(500).json({ message: "Account created but login failed. Please sign in." });
          }
          return res.json({ success: true, user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
          }});
        });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Signup error:", error);
      // Check for specific database errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('duplicate key') || errorMessage.includes('unique constraint')) {
        return res.status(400).json({ message: "An account with this email already exists" });
      }
      return res.status(500).json({ message: "An error occurred while creating your account. Please try again." });
    }
  });

  app.get("/api/auth/verify-email", async (req: Request, res: Response) => {
    try {
      const token = typeof req.query.token === "string" ? req.query.token : "";
      if (!token) {
        return res.status(400).json({ message: "Missing verification token" });
      }

      const verificationToken = await storage.getEmailVerificationToken(token);
      if (!verificationToken) {
        return res.status(400).json({ message: "This verification link is invalid." });
      }
      if (verificationToken.usedAt) {
        return res.json({ success: true, message: "Your email is already verified." });
      }
      if (new Date() > verificationToken.expiresAt) {
        return res.status(400).json({ message: "This verification link has expired. Please request a new one." });
      }

      await storage.markUserEmailVerified(verificationToken.userId);
      await storage.markEmailVerificationTokenUsed(verificationToken.id);

      return res.json({ success: true });
    } catch (error) {
      console.error("Email verification error:", error);
      return res.status(500).json({ message: "An error occurred. Please try again." });
    }
  });

  app.post("/api/auth/resend-verification", forgotPasswordRateLimit, async (req: Request, res: Response) => {
    try {
      const { email } = resendVerificationSchema.parse(req.body);
      const user = await storage.getUserByEmail(email);

      // Always return success to prevent email enumeration
      if (!user || !user.email || user.emailVerified) {
        return res.json({ success: true });
      }

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await storage.createEmailVerificationToken(user.id, token, expiresAt);
      await sendVerificationEmail(user.email, user.firstName ?? undefined, token);

      return res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Resend verification error:", error);
      return res.status(500).json({ message: "An error occurred. Please try again." });
    }
  });

  app.post("/api/auth/forgot-password", forgotPasswordRateLimit, async (req: Request, res: Response) => {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      const user = await storage.getUserByEmail(email);

      // Always return success to prevent email enumeration
      if (!user || !user.email) {
        return res.json({ success: true });
      }

      // Only allow password reset for email/password accounts (or accounts with a password set)
      // Google-only accounts get a helpful hint
      if (!user.passwordHash) {
        return res.json({ success: true });
      }

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await storage.createPasswordResetToken(user.id, token, expiresAt);
      await sendPasswordResetEmail(user.email, user.firstName ?? undefined, token);

      return res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Forgot password error:", error);
      return res.status(500).json({ message: "An error occurred. Please try again." });
    }
  });

  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    try {
      const { token, password } = resetPasswordSchema.parse(req.body);

      const resetToken = await storage.getPasswordResetToken(token);
      if (!resetToken) {
        return res.status(400).json({ message: "This reset link is invalid or has already been used." });
      }
      if (resetToken.usedAt) {
        return res.status(400).json({ message: "This reset link has already been used. Please request a new one." });
      }
      if (new Date() > resetToken.expiresAt) {
        return res.status(400).json({ message: "This reset link has expired. Please request a new one." });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      await storage.updateUserPassword(resetToken.userId, passwordHash);
      await storage.markPasswordResetTokenUsed(resetToken.id);

      return res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Reset password error:", error);
      return res.status(500).json({ message: "An error occurred. Please try again." });
    }
  });

  app.get("/api/logout", async (req, res) => {
    try {
      await new Promise<void>((resolve, reject) => {
        req.logout((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      await new Promise<void>((resolve, reject) => {
        req.session.destroy((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      res.clearCookie('connect.sid');
      res.redirect("/");
    } catch (err) {
      console.error("Logout error:", err);
      res.redirect("/");
    }
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};
