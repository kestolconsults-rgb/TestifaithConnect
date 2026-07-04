// Referenced from javascript_database and javascript_log_in_with_replit blueprints
import {
  users,
  testimonies,
  testimonyInteractions,
  encouragementVerses,
  comments,
  admins,
  faithDeclarations,
  featuredSchedule,
  faithExpectations,
  expectationMilestones,
  expectationScriptures,
  adminAuditLogs,
  pushSubscriptions,
  passwordResetTokens,
  emailVerificationTokens,
  supportMessages,
  newsletters,
  appSettings,
  type SupportMessage,
  type InsertSupportMessage,
  type PasswordResetToken,
  type EmailVerificationToken,
  type PushSubscription,
  type InsertPushSubscription,
  type Newsletter,
  type InsertNewsletter,
  type AppSettings,
  type UpdateAppSettings,
  type User,
  type UpsertUser,
  type Testimony,
  type InsertTestimony,
  type TestimonyWithUser,
  type TestimonyInteraction,
  type InsertTestimonyInteraction,
  type EncouragementVerse,
  type InsertEncouragementVerse,
  type Comment,
  type InsertComment,
  type CommentWithUser,
  type Admin,
  type InsertAdmin,
  type FaithDeclaration,
  type InsertFaithDeclaration,
  type FeaturedScheduleEntry,
  type UpdateProfile,
  type UpdateSettings,
  type CompleteOnboarding,
  type FaithExpectation,
  type InsertFaithExpectation,
  type FaithExpectationWithDetails,
  type ExpectationMilestone,
  type InsertExpectationMilestone,
  type ExpectationScripture,
  type InsertExpectationScripture,
  type AuditLog,
  type InsertAuditLog,
  type AuditLogWithAdmin,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, sql, or, like, gte, lte, inArray, isNotNull } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUserWithPassword(email: string, passwordHash: string, firstName: string, lastName?: string): Promise<User>;
  linkGoogleAccount(userId: string, googleId: string, profileImageUrl?: string): Promise<User>;
  addPasswordToAccount(userId: string, passwordHash: string): Promise<User>;
  hasPassword(userId: string): Promise<boolean>;
  updateUserPassword(userId: string, passwordHash: string): Promise<void>;
  createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markPasswordResetTokenUsed(id: string): Promise<void>;
  createEmailVerificationToken(userId: string, token: string, expiresAt: Date): Promise<void>;
  getEmailVerificationToken(token: string): Promise<EmailVerificationToken | undefined>;
  markEmailVerificationTokenUsed(id: string): Promise<void>;
  markUserEmailVerified(userId: string): Promise<void>;

  // Testimony operations
  createTestimony(testimony: InsertTestimony): Promise<Testimony>;
  getTestimony(id: string, userId?: string): Promise<TestimonyWithUser | undefined>;
  getAllTestimonies(userId?: string, limit?: number, offset?: number): Promise<TestimonyWithUser[]>;
  getRecentTestimonies(limit: number, userId?: string): Promise<TestimonyWithUser[]>;
  getTestimoniesByCategory(category: string, userId?: string, limit?: number, offset?: number): Promise<TestimonyWithUser[]>;
  getUserTestimonies(userId: string): Promise<TestimonyWithUser[]>;
  getFeaturedTestimony(userId?: string, localDateStr?: string): Promise<TestimonyWithUser | undefined>;
  searchTestimonies(query: string, categories?: string[], startDate?: Date, endDate?: Date, userId?: string): Promise<TestimonyWithUser[]>;
  getPersonalizedTestimonies(userId: string, limit: number): Promise<TestimonyWithUser[]>;
  deleteTestimony(id: string, userId: string): Promise<boolean>;

  // Testimony interactions
  addTestimonyInteraction(interaction: InsertTestimonyInteraction): Promise<void>;
  removeTestimonyInteraction(testimonyId: string, userId: string, interactionType: string): Promise<void>;
  getUserInteraction(testimonyId: string, userId: string, interactionType: string): Promise<TestimonyInteraction | undefined>;

  // Encouragement verses
  createEncouragementVerse(verse: InsertEncouragementVerse): Promise<EncouragementVerse>;
  getDailyVerse(): Promise<EncouragementVerse | undefined>;
  getActiveVerses(): Promise<EncouragementVerse[]>;

  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getTestimonyComments(testimonyId: string): Promise<CommentWithUser[]>;
  getCommentById(id: string): Promise<Comment | undefined>;
  deleteComment(id: string, userId: string): Promise<boolean>;
  getCommentCount(testimonyId: string): Promise<number>;

  // Admin operations
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  updateAdminLastLogin(id: string): Promise<void>;

  // Faith declaration operations
  createFaithDeclaration(declaration: InsertFaithDeclaration): Promise<FaithDeclaration>;
  getFaithDeclarations(): Promise<FaithDeclaration[]>;
  getActiveFaithDeclaration(localDateStr?: string): Promise<FaithDeclaration | undefined>;
  setActiveFaithDeclaration(id: string): Promise<void>;
  deleteFaithDeclaration(id: string): Promise<boolean>;

  // Featured testimony management (admin)
  setFeaturedTestimony(testimonyId: string): Promise<void>;
  clearFeaturedTestimony(): Promise<void>;
  scheduleFeaturedTestimony(testimonyId: string, scheduledDate: string): Promise<FeaturedScheduleEntry>;
  getFeaturedSchedule(): Promise<(FeaturedScheduleEntry & { testimony?: TestimonyWithUser })[]>;
  deleteFeaturedSchedule(id: string): Promise<boolean>;
  getApprovedTestimonies(): Promise<TestimonyWithUser[]>;

  // Video moderation (admin)
  getPendingVideoTestimonies(): Promise<TestimonyWithUser[]>;
  updateTestimonyModerationStatus(testimonyId: string, status: string): Promise<void>;

  // User profile operations
  getUserProfile(userId: string): Promise<User | undefined>;
  updateUserProfile(userId: string, profile: UpdateProfile): Promise<User>;
  updateUserSettings(userId: string, settings: UpdateSettings): Promise<User>;
  completeUserOnboarding(userId: string, data: CompleteOnboarding): Promise<User>;
  getUserStats(userId: string): Promise<{ testimoniesCount: number; amenReceived: number; encourageReceived: number }>;

  // Faith Expectations operations
  createExpectation(expectation: InsertFaithExpectation): Promise<FaithExpectation>;
  getExpectation(id: string, userId?: string): Promise<FaithExpectationWithDetails | undefined>;
  getUserExpectations(userId: string, status?: string): Promise<FaithExpectationWithDetails[]>;
  getCommunityExpectations(currentUserId?: string): Promise<FaithExpectationWithDetails[]>;
  updateExpectation(id: string, userId: string, data: Partial<InsertFaithExpectation>): Promise<FaithExpectation>;
  deleteExpectation(id: string, userId: string): Promise<boolean>;
  markExpectationAnswered(id: string, userId: string, celebrationNote?: string): Promise<FaithExpectation>;
  archiveExpectation(id: string, userId: string): Promise<FaithExpectation>;

  // Expectation Milestones operations
  createMilestone(milestone: InsertExpectationMilestone): Promise<ExpectationMilestone>;
  getMilestones(expectationId: string): Promise<ExpectationMilestone[]>;
  getMilestoneWithOwner(id: string): Promise<{ milestone: ExpectationMilestone; ownerId: string } | undefined>;
  updateMilestone(id: string, data: Partial<InsertExpectationMilestone>): Promise<ExpectationMilestone>;
  deleteMilestone(id: string): Promise<boolean>;
  updateMilestoneStatus(id: string, status: string, notes?: string): Promise<ExpectationMilestone>;

  // Expectation Scriptures operations
  createScripture(scripture: InsertExpectationScripture): Promise<ExpectationScripture>;
  getScriptures(expectationId: string): Promise<ExpectationScripture[]>;
  getScriptureWithOwner(id: string): Promise<{ scripture: ExpectationScripture; ownerId: string } | undefined>;
  deleteScripture(id: string): Promise<boolean>;

  // Push subscriptions
  savePushSubscription(sub: InsertPushSubscription): Promise<PushSubscription>;
  deletePushSubscription(endpoint: string): Promise<void>;
  getPushSubscriptionsForUser(userId: string): Promise<PushSubscription[]>;

  // Newsletters
  createNewsletter(newsletter: InsertNewsletter): Promise<Newsletter>;
  getNewsletters(): Promise<Newsletter[]>;
  getNewsletter(id: string): Promise<Newsletter | undefined>;
  markNewsletterSent(id: string, recipientCount: number): Promise<Newsletter>;
  updateNewsletter(id: string, data: Partial<Pick<Newsletter, "subject" | "body" | "isRecurring">>): Promise<Newsletter | undefined>;
  deleteNewsletter(id: string): Promise<boolean>;
  getActiveRecurringNewsletters(): Promise<Newsletter[]>;

  // App settings (scheduler config)
  getAppSettings(): Promise<AppSettings>;
  updateAppSettings(data: UpdateAppSettings): Promise<AppSettings>;
  markDailyDeclarationSent(dateStr: string): Promise<void>;
  markNewsletterDigestSent(dateStr: string): Promise<void>;

  // Users opted into notification types (with email/push targets)
  getUsersOptedInto(field: "notifyNewsletter" | "notifyDailyDeclaration"): Promise<User[]>;

  // =====================================================
  // ADMIN DASHBOARD OPERATIONS
  // =====================================================

  // Analytics
  getAnalytics(): Promise<{
    totalUsers: number;
    totalTestimonies: number;
    totalComments: number;
    totalAmens: number;
    totalEncouragements: number;
    monthlyUsers: number;
    monthlyTestimonies: number;
    pendingVideos: number;
    suspendedUsers: number;
  }>;

  // User management (admin)
  getAllUsersAdmin(): Promise<User[]>;
  suspendUser(userId: string, reason: string): Promise<User>;
  unsuspendUser(userId: string): Promise<User>;

  // Admin user management
  getAllAdmins(): Promise<Admin[]>;
  getAdminById(id: string): Promise<Admin | undefined>;
  deleteAdmin(id: string): Promise<boolean>;
  updateAdminPassword(id: string, passwordHash: string): Promise<void>;

  // Encouragement verses (admin)
  getAllEncouragementVerses(): Promise<EncouragementVerse[]>;
  updateEncouragementVerse(id: string, data: Partial<InsertEncouragementVerse>): Promise<EncouragementVerse>;
  deleteEncouragementVerse(id: string): Promise<boolean>;
  setActiveEncouragementVerse(id: string): Promise<void>;

  // Testimony moderation (admin)
  adminDeleteTestimony(testimonyId: string): Promise<boolean>;

  // Comment moderation (admin)
  getAllCommentsAdmin(): Promise<CommentWithUser[]>;
  adminDeleteComment(commentId: string): Promise<boolean>;

  // Audit logging
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(limit?: number): Promise<AuditLogWithAdmin[]>;

  // Support messages
  createSupportMessage(msg: InsertSupportMessage): Promise<SupportMessage>;
  getSupportMessages(): Promise<(SupportMessage & { user: User | null })[]>;
  updateSupportMessage(id: string, update: Partial<Pick<SupportMessage, "status" | "adminNote" | "resolvedAt">>): Promise<SupportMessage | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Batches the "did this user Amen/Encourage these testimonies" lookup into a
  // single query instead of firing two queries per testimony (N+1).
  private async attachInteractionFlags<T extends { id: string }>(
    rows: T[],
    userId?: string
  ): Promise<(T & { userHasAmen: boolean; userHasEncourage: boolean })[]> {
    if (!userId || rows.length === 0) {
      return rows.map((r) => ({ ...r, userHasAmen: false, userHasEncourage: false }));
    }

    const ids = rows.map((r) => r.id);
    const interactions = await db
      .select()
      .from(testimonyInteractions)
      .where(and(
        eq(testimonyInteractions.userId, userId),
        inArray(testimonyInteractions.testimonyId, ids)
      ));

    const amenSet = new Set<string>();
    const encourageSet = new Set<string>();
    for (const interaction of interactions) {
      if (interaction.interactionType === 'amen') amenSet.add(interaction.testimonyId);
      else if (interaction.interactionType === 'encourage') encourageSet.add(interaction.testimonyId);
    }

    return rows.map((r) => ({
      ...r,
      userHasAmen: amenSet.has(r.id),
      userHasEncourage: encourageSet.has(r.id),
    }));
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createUserWithPassword(email: string, passwordHash: string, firstName: string, lastName?: string): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        firstName,
        lastName,
        authProvider: "email",
      })
      .returning();
    return user;
  }

  async linkGoogleAccount(userId: string, googleId: string, profileImageUrl?: string): Promise<User> {
    const updateData: Partial<User> = {
      googleId,
      authProvider: "both",
      updatedAt: new Date(),
    };
    if (profileImageUrl) {
      updateData.profileImageUrl = profileImageUrl;
    }
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async addPasswordToAccount(userId: string, passwordHash: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        passwordHash,
        authProvider: "both",
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async hasPassword(userId: string): Promise<boolean> {
    const user = await this.getUser(userId);
    return !!user?.passwordHash;
  }

  async updateUserPassword(userId: string, passwordHash: string): Promise<void> {
    await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
  }

  async createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    await db.insert(passwordResetTokens).values({ userId, token, expiresAt });
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const [row] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token))
      .limit(1);
    return row;
  }

  async markPasswordResetTokenUsed(id: string): Promise<void> {
    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, id));
  }

  async createEmailVerificationToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    await db.insert(emailVerificationTokens).values({ userId, token, expiresAt });
  }

  async getEmailVerificationToken(token: string): Promise<EmailVerificationToken | undefined> {
    const [row] = await db
      .select()
      .from(emailVerificationTokens)
      .where(eq(emailVerificationTokens.token, token))
      .limit(1);
    return row;
  }

  async markEmailVerificationTokenUsed(id: string): Promise<void> {
    await db
      .update(emailVerificationTokens)
      .set({ usedAt: new Date() })
      .where(eq(emailVerificationTokens.id, id));
  }

  async markUserEmailVerified(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ emailVerified: true, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  // Testimony operations
  async createTestimony(testimony: InsertTestimony): Promise<Testimony> {
    const [created] = await db
      .insert(testimonies)
      .values(testimony)
      .returning();
    return created;
  }

  async getTestimony(id: string, userId?: string): Promise<TestimonyWithUser | undefined> {
    const [testimony] = await db
      .select()
      .from(testimonies)
      .leftJoin(users, eq(testimonies.userId, users.id))
      .where(eq(testimonies.id, id));

    if (!testimony) return undefined;

    let userHasAmen = false;
    let userHasEncourage = false;

    if (userId) {
      const amenInteraction = await this.getUserInteraction(id, userId, 'amen');
      const encourageInteraction = await this.getUserInteraction(id, userId, 'encourage');
      userHasAmen = !!amenInteraction;
      userHasEncourage = !!encourageInteraction;
    }

    return {
      ...testimony.testimonies,
      user: testimony.users || undefined,
      userHasAmen,
      userHasEncourage,
    };
  }

  async getAllTestimonies(userId?: string, limit?: number, offset?: number): Promise<TestimonyWithUser[]> {
    let queryBuilder = db
      .select()
      .from(testimonies)
      .leftJoin(users, eq(testimonies.userId, users.id))
      .where(and(
        eq(testimonies.privacy, 'public'),
        or(
          sql`${testimonies.videoUrl} IS NULL`,
          eq(testimonies.moderationStatus, 'approved')
        )
      ))
      .orderBy(desc(testimonies.createdAt))
      .$dynamic();

    if (limit !== undefined) queryBuilder = queryBuilder.limit(limit);
    if (offset !== undefined) queryBuilder = queryBuilder.offset(offset);

    const results = await queryBuilder;

    const mapped = results.map((result) => ({
      ...result.testimonies,
      user: result.users || undefined,
    }));

    return this.attachInteractionFlags(mapped, userId);
  }

  async getRecentTestimonies(limit: number, userId?: string): Promise<TestimonyWithUser[]> {
    const results = await db
      .select()
      .from(testimonies)
      .leftJoin(users, eq(testimonies.userId, users.id))
      .where(and(
        eq(testimonies.privacy, 'public'),
        or(
          sql`${testimonies.videoUrl} IS NULL`,
          eq(testimonies.moderationStatus, 'approved')
        )
      ))
      .orderBy(desc(testimonies.createdAt))
      .limit(limit);

    const mapped = results.map((result) => ({
      ...result.testimonies,
      user: result.users || undefined,
    }));

    return this.attachInteractionFlags(mapped, userId);
  }

  async getTestimoniesByCategory(category: string, userId?: string, limit?: number, offset?: number): Promise<TestimonyWithUser[]> {
    let queryBuilder = db
      .select()
      .from(testimonies)
      .leftJoin(users, eq(testimonies.userId, users.id))
      .where(and(
        eq(testimonies.category, category),
        eq(testimonies.privacy, 'public'),
        or(
          sql`${testimonies.videoUrl} IS NULL`,
          eq(testimonies.moderationStatus, 'approved')
        )
      ))
      .orderBy(desc(testimonies.createdAt))
      .$dynamic();

    if (limit !== undefined) queryBuilder = queryBuilder.limit(limit);
    if (offset !== undefined) queryBuilder = queryBuilder.offset(offset);

    const results = await queryBuilder;

    const mapped = results.map((result) => ({
      ...result.testimonies,
      user: result.users || undefined,
    }));

    return this.attachInteractionFlags(mapped, userId);
  }

  async getUserTestimonies(userId: string): Promise<TestimonyWithUser[]> {
    const results = await db
      .select()
      .from(testimonies)
      .leftJoin(users, eq(testimonies.userId, users.id))
      .where(eq(testimonies.userId, userId))
      .orderBy(desc(testimonies.createdAt));

    return results.map((result) => ({
      ...result.testimonies,
      user: result.users || undefined,
      userHasAmen: false,
      userHasEncourage: false,
    }));
  }

  async searchTestimonies(
    query: string,
    categories?: string[],
    startDate?: Date,
    endDate?: Date,
    userId?: string
  ): Promise<TestimonyWithUser[]> {
    const conditions: any[] = [eq(testimonies.privacy, 'public')];

    // Keyword search across title and story
    if (query) {
      conditions.push(
        or(
          like(testimonies.title, `%${query}%`),
          like(testimonies.story, `%${query}%`)
        )
      );
    }

    // Category filtering
    if (categories && categories.length > 0) {
      conditions.push(inArray(testimonies.category, categories));
    }

    // Date range filtering
    if (startDate) {
      conditions.push(gte(testimonies.createdAt, startDate));
    }
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      conditions.push(lte(testimonies.createdAt, endOfDay));
    }

    const results = await db
      .select()
      .from(testimonies)
      .leftJoin(users, eq(testimonies.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(testimonies.createdAt));

    const mapped = results.map((result) => ({
      ...result.testimonies,
      user: result.users || undefined,
    }));

    return this.attachInteractionFlags(mapped, userId);
  }

  async getFeaturedTestimony(userId?: string, localDateStr?: string): Promise<TestimonyWithUser | undefined> {
    let result: any = null;

    // 1. Check for a scheduled Stone of the Day for today's local date
    if (localDateStr && /^\d{4}-\d{2}-\d{2}$/.test(localDateStr)) {
      const [scheduled] = await db
        .select()
        .from(featuredSchedule)
        .leftJoin(testimonies, eq(featuredSchedule.testimonyId, testimonies.id))
        .leftJoin(users, eq(testimonies.userId, users.id))
        .where(eq(featuredSchedule.scheduledDate, localDateStr))
        .limit(1);
      if (scheduled?.testimonies) {
        result = { testimonies: scheduled.testimonies, users: scheduled.users };
      }
    }

    // 2. Fallback: admin-selected featured testimony
    if (!result) {
      [result] = await db
        .select()
        .from(testimonies)
        .leftJoin(users, eq(testimonies.userId, users.id))
        .where(eq(testimonies.isFeatured, true))
        .orderBy(desc(testimonies.featuredDate))
        .limit(1);
    }

    // 3. Fallback: auto-select based on popularity (most amens + encourages)
    if (!result) {
      [result] = await db
        .select()
        .from(testimonies)
        .leftJoin(users, eq(testimonies.userId, users.id))
        .orderBy(
          desc(sql`${testimonies.amenCount} + ${testimonies.encourageCount}`),
          desc(testimonies.createdAt)
        )
        .limit(1);
    }

    if (!result) return undefined;

    let userHasAmen = false;
    let userHasEncourage = false;

    if (userId) {
      const amenInteraction = await this.getUserInteraction(result.testimonies.id, userId, 'amen');
      const encourageInteraction = await this.getUserInteraction(result.testimonies.id, userId, 'encourage');
      userHasAmen = !!amenInteraction;
      userHasEncourage = !!encourageInteraction;
    }

    return {
      ...result.testimonies,
      user: result.users || undefined,
      userHasAmen,
      userHasEncourage,
    };
  }

  async getPersonalizedTestimonies(userId: string, limit: number): Promise<TestimonyWithUser[]> {
    // Get user's faith interests
    const user = await this.getUser(userId);
    const interests = user?.faithInterests || [];
    
    if (interests.length === 0) {
      // Fall back to recent testimonies if no interests set
      return this.getRecentTestimonies(limit, userId);
    }

    // Get testimonies matching user's faith interests, ordered by recency and popularity
    const results = await db
      .select()
      .from(testimonies)
      .leftJoin(users, eq(testimonies.userId, users.id))
      .where(inArray(testimonies.category, interests))
      .orderBy(
        desc(sql`${testimonies.amenCount} + ${testimonies.encourageCount}`),
        desc(testimonies.createdAt)
      )
      .limit(limit);

    const mapped = results.map((result) => ({
      ...result.testimonies,
      user: result.users || undefined,
    }));

    return this.attachInteractionFlags(mapped, userId);
  }

  async deleteTestimony(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(testimonies)
      .where(and(eq(testimonies.id, id), eq(testimonies.userId, userId)))
      .returning();
    return result.length > 0;
  }

  // Testimony interactions
  async addTestimonyInteraction(interaction: InsertTestimonyInteraction): Promise<void> {
    const existing = await this.getUserInteraction(
      interaction.testimonyId,
      interaction.userId,
      interaction.interactionType
    );

    if (existing) return;

    await db.insert(testimonyInteractions).values(interaction);

    if (interaction.interactionType === 'amen') {
      await db
        .update(testimonies)
        .set({ amenCount: sql`${testimonies.amenCount} + 1` })
        .where(eq(testimonies.id, interaction.testimonyId));
    } else if (interaction.interactionType === 'encourage') {
      await db
        .update(testimonies)
        .set({ encourageCount: sql`${testimonies.encourageCount} + 1` })
        .where(eq(testimonies.id, interaction.testimonyId));
    }
  }

  async removeTestimonyInteraction(testimonyId: string, userId: string, interactionType: string): Promise<void> {
    const result = await db
      .delete(testimonyInteractions)
      .where(
        and(
          eq(testimonyInteractions.testimonyId, testimonyId),
          eq(testimonyInteractions.userId, userId),
          eq(testimonyInteractions.interactionType, interactionType)
        )
      )
      .returning();

    if (result.length === 0) return;

    if (interactionType === 'amen') {
      await db
        .update(testimonies)
        .set({ amenCount: sql`GREATEST(${testimonies.amenCount} - 1, 0)` })
        .where(eq(testimonies.id, testimonyId));
    } else if (interactionType === 'encourage') {
      await db
        .update(testimonies)
        .set({ encourageCount: sql`GREATEST(${testimonies.encourageCount} - 1, 0)` })
        .where(eq(testimonies.id, testimonyId));
    }
  }

  async getUserInteraction(testimonyId: string, userId: string, interactionType: string): Promise<TestimonyInteraction | undefined> {
    const [interaction] = await db
      .select()
      .from(testimonyInteractions)
      .where(
        and(
          eq(testimonyInteractions.testimonyId, testimonyId),
          eq(testimonyInteractions.userId, userId),
          eq(testimonyInteractions.interactionType, interactionType)
        )
      );
    return interaction;
  }

  // Encouragement verses
  async createEncouragementVerse(verse: InsertEncouragementVerse): Promise<EncouragementVerse> {
    const [created] = await db
      .insert(encouragementVerses)
      .values(verse)
      .returning();
    return created;
  }

  async getDailyVerse(): Promise<EncouragementVerse | undefined> {
    const [verse] = await db
      .select()
      .from(encouragementVerses)
      .where(eq(encouragementVerses.isActive, true))
      .orderBy(sql`RANDOM()`)
      .limit(1);
    return verse;
  }

  async getActiveVerses(): Promise<EncouragementVerse[]> {
    return await db
      .select()
      .from(encouragementVerses)
      .where(eq(encouragementVerses.isActive, true))
      .orderBy(desc(encouragementVerses.createdAt));
  }

  // Comment operations
  async createComment(comment: InsertComment): Promise<Comment> {
    const [created] = await db
      .insert(comments)
      .values(comment)
      .returning();
    return created;
  }

  async getTestimonyComments(testimonyId: string): Promise<CommentWithUser[]> {
    const allComments = await db
      .select()
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.testimonyId, testimonyId))
      .orderBy(comments.createdAt);

    // Build threaded structure
    const commentMap = new Map<string, CommentWithUser>();
    const topLevelComments: CommentWithUser[] = [];

    // First pass: create all comment objects
    for (const row of allComments) {
      const comment: CommentWithUser = {
        ...row.comments,
        user: row.users || undefined,
        replies: [],
      };
      commentMap.set(row.comments.id, comment);
    }

    // Second pass: build the tree structure
    for (const row of allComments) {
      const comment = commentMap.get(row.comments.id)!;
      if (row.comments.parentId) {
        const parent = commentMap.get(row.comments.parentId);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(comment);
        }
      } else {
        topLevelComments.push(comment);
      }
    }

    return topLevelComments;
  }

  async getCommentById(id: string): Promise<Comment | undefined> {
    const [comment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, id));
    return comment;
  }

  async deleteComment(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(comments)
      .where(and(eq(comments.id, id), eq(comments.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async getCommentCount(testimonyId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(comments)
      .where(eq(comments.testimonyId, testimonyId));
    return Number(result[0]?.count || 0);
  }

  // Admin operations
  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const [admin] = await db
      .select()
      .from(admins)
      .where(eq(admins.username, username));
    return admin;
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const [created] = await db
      .insert(admins)
      .values(admin)
      .returning();
    return created;
  }

  async updateAdminLastLogin(id: string): Promise<void> {
    await db
      .update(admins)
      .set({ lastLoginAt: new Date() })
      .where(eq(admins.id, id));
  }

  // Faith declaration operations
  async createFaithDeclaration(declaration: InsertFaithDeclaration): Promise<FaithDeclaration> {
    const [created] = await db
      .insert(faithDeclarations)
      .values(declaration)
      .returning();
    return created;
  }

  async getFaithDeclarations(): Promise<FaithDeclaration[]> {
    return await db
      .select()
      .from(faithDeclarations)
      .orderBy(desc(faithDeclarations.createdAt));
  }

  async getActiveFaithDeclaration(localDateStr?: string): Promise<FaithDeclaration | undefined> {
    // If a local date string (YYYY-MM-DD) was provided, look for a scheduled declaration first
    if (localDateStr && /^\d{4}-\d{2}-\d{2}$/.test(localDateStr)) {
      const [scheduled] = await db
        .select()
        .from(faithDeclarations)
        .where(eq(faithDeclarations.scheduledDate, localDateStr))
        .limit(1);
      if (scheduled) return scheduled;
    }

    // Fallback: return the most recently activated (isActive = true) declaration
    const [active] = await db
      .select()
      .from(faithDeclarations)
      .where(eq(faithDeclarations.isActive, true))
      .orderBy(desc(faithDeclarations.activeDate))
      .limit(1);
    return active;
  }

  async setActiveFaithDeclaration(id: string): Promise<void> {
    await db
      .update(faithDeclarations)
      .set({ isActive: false });
    
    await db
      .update(faithDeclarations)
      .set({ isActive: true, activeDate: new Date() })
      .where(eq(faithDeclarations.id, id));
  }

  async deleteFaithDeclaration(id: string): Promise<boolean> {
    const result = await db
      .delete(faithDeclarations)
      .where(eq(faithDeclarations.id, id))
      .returning();
    return result.length > 0;
  }

  // Featured testimony management (admin)
  async setFeaturedTestimony(testimonyId: string): Promise<void> {
    await db
      .update(testimonies)
      .set({ isFeatured: false, featuredDate: null });
    
    await db
      .update(testimonies)
      .set({ isFeatured: true, featuredDate: new Date() })
      .where(eq(testimonies.id, testimonyId));
  }

  async clearFeaturedTestimony(): Promise<void> {
    await db
      .update(testimonies)
      .set({ isFeatured: false, featuredDate: null });
  }

  async scheduleFeaturedTestimony(testimonyId: string, scheduledDate: string): Promise<FeaturedScheduleEntry> {
    // Upsert: if a schedule already exists for that date, replace it
    await db
      .delete(featuredSchedule)
      .where(eq(featuredSchedule.scheduledDate, scheduledDate));
    const [entry] = await db
      .insert(featuredSchedule)
      .values({ testimonyId, scheduledDate })
      .returning();
    return entry;
  }

  async getFeaturedSchedule(): Promise<(FeaturedScheduleEntry & { testimony?: TestimonyWithUser })[]> {
    const entries = await db
      .select()
      .from(featuredSchedule)
      .leftJoin(testimonies, eq(featuredSchedule.testimonyId, testimonies.id))
      .leftJoin(users, eq(testimonies.userId, users.id))
      .orderBy(asc(featuredSchedule.scheduledDate));

    return entries.map((e) => ({
      ...e.featured_schedule,
      testimony: e.testimonies
        ? { ...e.testimonies, user: e.users ?? undefined } as unknown as TestimonyWithUser
        : undefined,
    }));
  }

  async deleteFeaturedSchedule(id: string): Promise<boolean> {
    const result = await db
      .delete(featuredSchedule)
      .where(eq(featuredSchedule.id, id))
      .returning();
    return result.length > 0;
  }

  async getApprovedTestimonies(): Promise<TestimonyWithUser[]> {
    const results = await db
      .select()
      .from(testimonies)
      .leftJoin(users, eq(testimonies.userId, users.id))
      .where(eq(testimonies.moderationStatus, 'approved'))
      .orderBy(desc(testimonies.createdAt));

    return results.map((result) => ({
      ...result.testimonies,
      user: result.users || undefined,
      userHasAmen: false,
      userHasEncourage: false,
    }));
  }

  // Video moderation operations
  async getPendingVideoTestimonies(): Promise<TestimonyWithUser[]> {
    const results = await db
      .select()
      .from(testimonies)
      .leftJoin(users, eq(testimonies.userId, users.id))
      .where(and(
        isNotNull(testimonies.videoUrl),
        eq(testimonies.moderationStatus, 'pending')
      ))
      .orderBy(asc(testimonies.createdAt));

    return results.map((result) => ({
      ...result.testimonies,
      user: result.users || undefined,
      userHasAmen: false,
      userHasEncourage: false,
    }));
  }

  async updateTestimonyModerationStatus(testimonyId: string, status: string): Promise<void> {
    await db
      .update(testimonies)
      .set({ moderationStatus: status })
      .where(eq(testimonies.id, testimonyId));
  }

  // User profile operations
  async getUserProfile(userId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user;
  }

  async updateUserProfile(userId: string, profile: UpdateProfile): Promise<User> {
    const updateData: Partial<typeof users.$inferInsert> = {
      updatedAt: new Date(),
    };
    
    if (profile.firstName !== undefined) updateData.firstName = profile.firstName;
    if (profile.lastName !== undefined) updateData.lastName = profile.lastName;
    if (profile.bio !== undefined) updateData.bio = profile.bio;
    if (profile.location !== undefined) updateData.location = profile.location;
    if (profile.website !== undefined) updateData.website = profile.website || null;
    if (profile.profileImageUrl !== undefined) updateData.profileImageUrl = profile.profileImageUrl;
    if (profile.faithInterests !== undefined) updateData.faithInterests = profile.faithInterests;

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async updateUserSettings(userId: string, settings: UpdateSettings): Promise<User> {
    const updateData: Partial<typeof users.$inferInsert> = {
      updatedAt: new Date(),
    };
    
    if (settings.notifyOnAmen !== undefined) updateData.notifyOnAmen = settings.notifyOnAmen;
    if (settings.notifyOnEncourage !== undefined) updateData.notifyOnEncourage = settings.notifyOnEncourage;
    if (settings.notifyOnComment !== undefined) updateData.notifyOnComment = settings.notifyOnComment;
    if (settings.notifyDailyVerse !== undefined) updateData.notifyDailyVerse = settings.notifyDailyVerse;
    if (settings.notifyNewsletter !== undefined) updateData.notifyNewsletter = settings.notifyNewsletter;
    if (settings.notifyDailyDeclaration !== undefined) updateData.notifyDailyDeclaration = settings.notifyDailyDeclaration;
    if (settings.profileVisibility !== undefined) updateData.profileVisibility = settings.profileVisibility;

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async completeUserOnboarding(userId: string, data: CompleteOnboarding): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({
        firstName: data.firstName,
        lastName: data.lastName || null,
        bio: data.bio || null,
        faithInterests: data.faithInterests,
        hasCompletedOnboarding: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async getUserStats(userId: string): Promise<{ testimoniesCount: number; amenReceived: number; encourageReceived: number }> {
    const userTestimonies = await db
      .select()
      .from(testimonies)
      .where(eq(testimonies.userId, userId));
    
    const testimoniesCount = userTestimonies.length;
    const amenReceived = userTestimonies.reduce((sum, t) => sum + t.amenCount, 0);
    const encourageReceived = userTestimonies.reduce((sum, t) => sum + t.encourageCount, 0);
    
    return { testimoniesCount, amenReceived, encourageReceived };
  }

  // =====================================================
  // FAITH EXPECTATIONS OPERATIONS
  // =====================================================

  async createExpectation(expectation: InsertFaithExpectation): Promise<FaithExpectation> {
    const [created] = await db
      .insert(faithExpectations)
      .values({
        ...expectation,
        targetDate: expectation.targetDate ? new Date(expectation.targetDate) : null,
      })
      .returning();
    return created;
  }

  async getExpectation(id: string, userId?: string): Promise<FaithExpectationWithDetails | undefined> {
    const [expectation] = await db
      .select()
      .from(faithExpectations)
      .where(eq(faithExpectations.id, id));
    
    if (!expectation) return undefined;

    // Check privacy - only show if public, community, or owned by user
    if (expectation.privacy === 'private' && expectation.userId !== userId) {
      return undefined;
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, expectation.userId));

    const milestones = await db
      .select()
      .from(expectationMilestones)
      .where(eq(expectationMilestones.expectationId, id))
      .orderBy(asc(expectationMilestones.sortOrder));

    const scriptures = await db
      .select()
      .from(expectationScriptures)
      .where(eq(expectationScriptures.expectationId, id));

    const completedMilestones = milestones.filter(m => m.status === 'completed').length;

    return {
      ...expectation,
      user,
      milestones,
      scriptures,
      completedMilestones,
      totalMilestones: milestones.length,
    };
  }

  // Batches milestone/scripture lookups for a list of expectations into a
  // single query each instead of two queries per expectation (N+1).
  private async attachExpectationDetails(
    expectations: FaithExpectation[],
    options: { includeScriptures?: boolean; userById?: Map<string, User> } = {}
  ): Promise<FaithExpectationWithDetails[]> {
    if (expectations.length === 0) return [];

    const ids = expectations.map((e) => e.id);

    const [allMilestones, allScriptures] = await Promise.all([
      db
        .select()
        .from(expectationMilestones)
        .where(inArray(expectationMilestones.expectationId, ids))
        .orderBy(asc(expectationMilestones.sortOrder)),
      options.includeScriptures !== false
        ? db
            .select()
            .from(expectationScriptures)
            .where(inArray(expectationScriptures.expectationId, ids))
        : Promise.resolve([]),
    ]);

    const milestonesByExpectation = new Map<string, ExpectationMilestone[]>();
    for (const m of allMilestones) {
      const list = milestonesByExpectation.get(m.expectationId) || [];
      list.push(m);
      milestonesByExpectation.set(m.expectationId, list);
    }

    const scripturesByExpectation = new Map<string, ExpectationScripture[]>();
    for (const s of allScriptures) {
      const list = scripturesByExpectation.get(s.expectationId) || [];
      list.push(s);
      scripturesByExpectation.set(s.expectationId, list);
    }

    return expectations.map((exp) => {
      const milestones = milestonesByExpectation.get(exp.id) || [];
      const scriptures = scripturesByExpectation.get(exp.id) || [];
      return {
        ...exp,
        user: options.userById?.get(exp.userId),
        milestones,
        scriptures,
        completedMilestones: milestones.filter((m) => m.status === 'completed').length,
        totalMilestones: milestones.length,
      };
    });
  }

  async getUserExpectations(userId: string, status?: string): Promise<FaithExpectationWithDetails[]> {
    const expectations = await db
      .select()
      .from(faithExpectations)
      .where(
        status 
          ? and(eq(faithExpectations.userId, userId), eq(faithExpectations.status, status))
          : eq(faithExpectations.userId, userId)
      )
      .orderBy(desc(faithExpectations.createdAt));

    return this.attachExpectationDetails(expectations);
  }

  async getCommunityExpectations(currentUserId?: string): Promise<FaithExpectationWithDetails[]> {
    // Show community and public expectations from other users
    const expectations = await db
      .select()
      .from(faithExpectations)
      .where(
        or(
          eq(faithExpectations.privacy, 'public'),
          eq(faithExpectations.privacy, 'community')
        )
      )
      .orderBy(desc(faithExpectations.createdAt))
      .limit(50);

    if (expectations.length === 0) return [];

    const userIds = Array.from(new Set(expectations.map((e) => e.userId)));
    const userRows = await db.select().from(users).where(inArray(users.id, userIds));
    const userById = new Map(userRows.map((u) => [u.id, u]));

    return this.attachExpectationDetails(expectations, { includeScriptures: false, userById });
  }

  async updateExpectation(id: string, userId: string, data: Partial<InsertFaithExpectation>): Promise<FaithExpectation> {
    const updateData: Partial<typeof faithExpectations.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.privacy !== undefined) updateData.privacy = data.privacy;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.targetDate !== undefined) updateData.targetDate = data.targetDate ? new Date(data.targetDate) : null;

    const [updated] = await db
      .update(faithExpectations)
      .set(updateData)
      .where(and(eq(faithExpectations.id, id), eq(faithExpectations.userId, userId)))
      .returning();
    
    return updated;
  }

  async deleteExpectation(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(faithExpectations)
      .where(and(eq(faithExpectations.id, id), eq(faithExpectations.userId, userId)))
      .returning();
    
    return result.length > 0;
  }

  async markExpectationAnswered(id: string, userId: string, celebrationNote?: string): Promise<FaithExpectation> {
    const [updated] = await db
      .update(faithExpectations)
      .set({
        status: 'answered',
        answeredAt: new Date(),
        celebrationNote: celebrationNote || null,
        updatedAt: new Date(),
      })
      .where(and(eq(faithExpectations.id, id), eq(faithExpectations.userId, userId)))
      .returning();
    
    return updated;
  }

  async archiveExpectation(id: string, userId: string): Promise<FaithExpectation> {
    const [updated] = await db
      .update(faithExpectations)
      .set({
        status: 'archived',
        updatedAt: new Date(),
      })
      .where(and(eq(faithExpectations.id, id), eq(faithExpectations.userId, userId)))
      .returning();
    
    return updated;
  }

  // =====================================================
  // EXPECTATION MILESTONES OPERATIONS
  // =====================================================

  async createMilestone(milestone: InsertExpectationMilestone): Promise<ExpectationMilestone> {
    const [created] = await db
      .insert(expectationMilestones)
      .values(milestone)
      .returning();
    return created;
  }

  async getMilestones(expectationId: string): Promise<ExpectationMilestone[]> {
    return db
      .select()
      .from(expectationMilestones)
      .where(eq(expectationMilestones.expectationId, expectationId))
      .orderBy(asc(expectationMilestones.sortOrder));
  }

  async getMilestoneWithOwner(id: string): Promise<{ milestone: ExpectationMilestone; ownerId: string } | undefined> {
    const [milestone] = await db
      .select()
      .from(expectationMilestones)
      .where(eq(expectationMilestones.id, id));
    
    if (!milestone) return undefined;

    const [expectation] = await db
      .select({ userId: faithExpectations.userId })
      .from(faithExpectations)
      .where(eq(faithExpectations.id, milestone.expectationId));
    
    if (!expectation) return undefined;

    return { milestone, ownerId: expectation.userId };
  }

  async updateMilestone(id: string, data: Partial<InsertExpectationMilestone>): Promise<ExpectationMilestone> {
    const [updated] = await db
      .update(expectationMilestones)
      .set(data)
      .where(eq(expectationMilestones.id, id))
      .returning();
    return updated;
  }

  async deleteMilestone(id: string): Promise<boolean> {
    const result = await db
      .delete(expectationMilestones)
      .where(eq(expectationMilestones.id, id))
      .returning();
    return result.length > 0;
  }

  async updateMilestoneStatus(id: string, status: string, notes?: string): Promise<ExpectationMilestone> {
    const updateData: Partial<typeof expectationMilestones.$inferInsert> = {
      status,
    };

    if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const [updated] = await db
      .update(expectationMilestones)
      .set(updateData)
      .where(eq(expectationMilestones.id, id))
      .returning();
    
    return updated;
  }

  // =====================================================
  // EXPECTATION SCRIPTURES OPERATIONS
  // =====================================================

  async createScripture(scripture: InsertExpectationScripture): Promise<ExpectationScripture> {
    const [created] = await db
      .insert(expectationScriptures)
      .values(scripture)
      .returning();
    return created;
  }

  async getScriptures(expectationId: string): Promise<ExpectationScripture[]> {
    return db
      .select()
      .from(expectationScriptures)
      .where(eq(expectationScriptures.expectationId, expectationId));
  }

  async getScriptureWithOwner(id: string): Promise<{ scripture: ExpectationScripture; ownerId: string } | undefined> {
    const [scripture] = await db
      .select()
      .from(expectationScriptures)
      .where(eq(expectationScriptures.id, id));
    
    if (!scripture) return undefined;

    const [expectation] = await db
      .select({ userId: faithExpectations.userId })
      .from(faithExpectations)
      .where(eq(faithExpectations.id, scripture.expectationId));
    
    if (!expectation) return undefined;

    return { scripture, ownerId: expectation.userId };
  }

  async deleteScripture(id: string): Promise<boolean> {
    const result = await db
      .delete(expectationScriptures)
      .where(eq(expectationScriptures.id, id))
      .returning();
    return result.length > 0;
  }

  // =====================================================
  // PUSH SUBSCRIPTIONS
  // =====================================================

  async savePushSubscription(sub: InsertPushSubscription): Promise<PushSubscription> {
    const [result] = await db
      .insert(pushSubscriptions)
      .values(sub)
      .onConflictDoUpdate({ target: pushSubscriptions.endpoint, set: { userId: sub.userId, p256dh: sub.p256dh, auth: sub.auth } })
      .returning();
    return result;
  }

  async deletePushSubscription(endpoint: string): Promise<void> {
    await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
  }

  async getPushSubscriptionsForUser(userId: string): Promise<PushSubscription[]> {
    return db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
  }

  // Newsletters
  async createNewsletter(newsletter: InsertNewsletter): Promise<Newsletter> {
    const [created] = await db.insert(newsletters).values(newsletter).returning();
    return created;
  }

  async getNewsletters(): Promise<Newsletter[]> {
    return await db.select().from(newsletters).orderBy(desc(newsletters.createdAt));
  }

  async getNewsletter(id: string): Promise<Newsletter | undefined> {
    const [result] = await db.select().from(newsletters).where(eq(newsletters.id, id));
    return result;
  }

  async markNewsletterSent(id: string, recipientCount: number): Promise<Newsletter> {
    const [updated] = await db
      .update(newsletters)
      .set({ status: "sent", sentAt: new Date(), recipientCount })
      .where(eq(newsletters.id, id))
      .returning();
    return updated;
  }

  async updateNewsletter(id: string, data: Partial<Pick<Newsletter, "subject" | "body" | "isRecurring">>): Promise<Newsletter | undefined> {
    const [updated] = await db
      .update(newsletters)
      .set(data)
      .where(eq(newsletters.id, id))
      .returning();
    return updated;
  }

  async deleteNewsletter(id: string): Promise<boolean> {
    const result = await db.delete(newsletters).where(eq(newsletters.id, id)).returning();
    return result.length > 0;
  }

  async getActiveRecurringNewsletters(): Promise<Newsletter[]> {
    return await db
      .select()
      .from(newsletters)
      .where(eq(newsletters.isRecurring, true))
      .orderBy(desc(newsletters.createdAt));
  }

  // App settings (scheduler config) - singleton row keyed "default"
  async getAppSettings(): Promise<AppSettings> {
    const [existing] = await db.select().from(appSettings).where(eq(appSettings.id, "default"));
    if (existing) return existing;
    const [created] = await db.insert(appSettings).values({ id: "default" }).returning();
    return created;
  }

  async updateAppSettings(data: UpdateAppSettings): Promise<AppSettings> {
    await this.getAppSettings(); // ensure row exists
    const [updated] = await db
      .update(appSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(appSettings.id, "default"))
      .returning();
    return updated;
  }

  async markDailyDeclarationSent(dateStr: string): Promise<void> {
    await this.getAppSettings();
    await db
      .update(appSettings)
      .set({ lastDailyDeclarationSentDate: dateStr, updatedAt: new Date() })
      .where(eq(appSettings.id, "default"));
  }

  async markNewsletterDigestSent(dateStr: string): Promise<void> {
    await this.getAppSettings();
    await db
      .update(appSettings)
      .set({ lastNewsletterDigestSentDate: dateStr, updatedAt: new Date() })
      .where(eq(appSettings.id, "default"));
  }

  async getUsersOptedInto(field: "notifyNewsletter" | "notifyDailyDeclaration"): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(and(eq(users[field], true), eq(users.isSuspended, false)));
  }

  // =====================================================
  // ADMIN DASHBOARD OPERATIONS
  // =====================================================

  async getAnalytics(): Promise<{
    totalUsers: number;
    totalTestimonies: number;
    totalComments: number;
    totalAmens: number;
    totalEncouragements: number;
    monthlyUsers: number;
    monthlyTestimonies: number;
    pendingVideos: number;
    suspendedUsers: number;
  }> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [testimonyCount] = await db.select({ count: sql<number>`count(*)` }).from(testimonies);
    const [commentCount] = await db.select({ count: sql<number>`count(*)` }).from(comments);
    
    const [amenCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(testimonyInteractions)
      .where(eq(testimonyInteractions.interactionType, 'amen'));
    
    const [encourageCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(testimonyInteractions)
      .where(eq(testimonyInteractions.interactionType, 'encourage'));
    
    const [pendingVideoCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(testimonies)
      .where(eq(testimonies.moderationStatus, 'pending'));
    
    const [suspendedUserCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.isSuspended, true));
    
    const [usersThisMonthCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(gte(users.createdAt, startOfMonth));
    
    const [testimoniesThisMonthCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(testimonies)
      .where(gte(testimonies.createdAt, startOfMonth));

    return {
      totalUsers: Number(userCount?.count ?? 0),
      totalTestimonies: Number(testimonyCount?.count ?? 0),
      totalComments: Number(commentCount?.count ?? 0),
      totalAmens: Number(amenCount?.count ?? 0),
      totalEncouragements: Number(encourageCount?.count ?? 0),
      monthlyUsers: Number(usersThisMonthCount?.count ?? 0),
      monthlyTestimonies: Number(testimoniesThisMonthCount?.count ?? 0),
      pendingVideos: Number(pendingVideoCount?.count ?? 0),
      suspendedUsers: Number(suspendedUserCount?.count ?? 0),
    };
  }

  async getAllUsersAdmin(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async suspendUser(userId: string, reason: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        isSuspended: true,
        suspendedAt: new Date(),
        suspensionReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async unsuspendUser(userId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        isSuspended: false,
        suspendedAt: null,
        suspensionReason: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getAllAdmins(): Promise<Admin[]> {
    return db.select().from(admins).orderBy(desc(admins.createdAt));
  }

  async getAdminById(id: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.id, id));
    return admin;
  }

  async deleteAdmin(id: string): Promise<boolean> {
    const result = await db.delete(admins).where(eq(admins.id, id)).returning();
    return result.length > 0;
  }

  async updateAdminPassword(id: string, passwordHash: string): Promise<void> {
    await db
      .update(admins)
      .set({ passwordHash })
      .where(eq(admins.id, id));
  }

  async getAllEncouragementVerses(): Promise<EncouragementVerse[]> {
    return db.select().from(encouragementVerses).orderBy(desc(encouragementVerses.createdAt));
  }

  async updateEncouragementVerse(id: string, data: Partial<InsertEncouragementVerse>): Promise<EncouragementVerse> {
    const [updated] = await db
      .update(encouragementVerses)
      .set(data)
      .where(eq(encouragementVerses.id, id))
      .returning();
    return updated;
  }

  async deleteEncouragementVerse(id: string): Promise<boolean> {
    const result = await db
      .delete(encouragementVerses)
      .where(eq(encouragementVerses.id, id))
      .returning();
    return result.length > 0;
  }

  async setActiveEncouragementVerse(id: string): Promise<void> {
    // Deactivate all verses first
    await db.update(encouragementVerses).set({ isActive: false });
    // Activate the selected one
    await db.update(encouragementVerses).set({ isActive: true }).where(eq(encouragementVerses.id, id));
  }

  async adminDeleteTestimony(testimonyId: string): Promise<boolean> {
    const result = await db
      .delete(testimonies)
      .where(eq(testimonies.id, testimonyId))
      .returning();
    return result.length > 0;
  }

  async getAllCommentsAdmin(): Promise<CommentWithUser[]> {
    const allComments = await db
      .select()
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .orderBy(desc(comments.createdAt));

    return allComments.map((row) => ({
      ...row.comments,
      user: row.users || undefined,
    }));
  }

  async adminDeleteComment(commentId: string): Promise<boolean> {
    const result = await db
      .delete(comments)
      .where(eq(comments.id, commentId))
      .returning();
    return result.length > 0;
  }

  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [created] = await db
      .insert(adminAuditLogs)
      .values(log)
      .returning();
    return created;
  }

  async getAuditLogs(limit: number = 100): Promise<AuditLogWithAdmin[]> {
    const logs = await db
      .select()
      .from(adminAuditLogs)
      .leftJoin(admins, eq(adminAuditLogs.adminId, admins.id))
      .orderBy(desc(adminAuditLogs.createdAt))
      .limit(limit);

    return logs.map((row) => ({
      ...row.admin_audit_logs,
      admin: row.admins || undefined,
    }));
  }

  async createSupportMessage(msg: InsertSupportMessage): Promise<SupportMessage> {
    const [created] = await db.insert(supportMessages).values(msg).returning();
    return created;
  }

  async getSupportMessages(): Promise<(SupportMessage & { user: User | null })[]> {
    const rows = await db
      .select()
      .from(supportMessages)
      .leftJoin(users, eq(supportMessages.userId, users.id))
      .orderBy(desc(supportMessages.createdAt));
    return rows.map((row) => ({ ...row.support_messages, user: row.users ?? null }));
  }

  async updateSupportMessage(id: string, update: Partial<Pick<SupportMessage, "status" | "adminNote" | "resolvedAt">>): Promise<SupportMessage | undefined> {
    const [updated] = await db
      .update(supportMessages)
      .set(update)
      .where(eq(supportMessages.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
