// Referenced from javascript_log_in_with_replit and javascript_database blueprints
import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  passwordHash: varchar("password_hash", { length: 255 }),
  googleId: varchar("google_id", { length: 255 }).unique(),
  authProvider: varchar("auth_provider", { length: 20 }).default("email"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  bio: text("bio"),
  location: varchar("location", { length: 100 }),
  website: varchar("website", { length: 255 }),
  faithInterests: text("faith_interests").array(),
  hasCompletedOnboarding: boolean("has_completed_onboarding").default(false),
  notifyOnAmen: boolean("notify_on_amen").default(true),
  notifyOnEncourage: boolean("notify_on_encourage").default(true),
  notifyOnComment: boolean("notify_on_comment").default(true),
  notifyDailyVerse: boolean("notify_daily_verse").default(true),
  profileVisibility: varchar("profile_visibility", { length: 20 }).default("public"),
  isSuspended: boolean("is_suspended").default(false),
  suspendedAt: timestamp("suspended_at"),
  suspensionReason: text("suspension_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Authentication schemas
export const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  firstName: z.string().min(1, "First name is required").max(50, "First name is too long"),
  lastName: z.string().max(50, "Last name is too long").optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type SignUp = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type SignIn = z.infer<typeof signInSchema>;

// Allowed faith interests for validation
export const ALLOWED_FAITH_INTERESTS = [
  "Healing", "Marriage", "Fruitfulness", "Finance", "Breakthrough", 
  "Deliverance", "Career", "Spiritual Growth", "Others"
] as const;

// User profile update schema
export const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name is too long").optional(),
  lastName: z.string().max(50, "Last name is too long").optional(),
  bio: z.string().max(500, "Bio must be 500 characters or less").optional(),
  location: z.string().max(100, "Location is too long").optional(),
  website: z.string().url("Please enter a valid URL").max(255, "URL is too long").optional().or(z.literal("")),
  profileImageUrl: z.string().url("Please enter a valid image URL").optional(),
  faithInterests: z.array(z.enum(ALLOWED_FAITH_INTERESTS)).optional(),
});

export type UpdateProfile = z.infer<typeof updateProfileSchema>;

// User settings update schema
export const updateSettingsSchema = z.object({
  notifyOnAmen: z.boolean().optional(),
  notifyOnEncourage: z.boolean().optional(),
  notifyOnComment: z.boolean().optional(),
  notifyDailyVerse: z.boolean().optional(),
  profileVisibility: z.enum(["public", "private"]).optional(),
});

export type UpdateSettings = z.infer<typeof updateSettingsSchema>;

// Add password schema (for Google users adding email sign-in)
export const addPasswordSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type AddPassword = z.infer<typeof addPasswordSchema>;

// Onboarding completion schema
export const completeOnboardingSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name is too long"),
  lastName: z.string().max(50, "Last name is too long").optional(),
  bio: z.string().max(500, "Bio must be 500 characters or less").optional(),
  faithInterests: z.array(z.enum(ALLOWED_FAITH_INTERESTS)).min(1, "Please select at least one area of interest"),
});

export type CompleteOnboarding = z.infer<typeof completeOnboardingSchema>;

// Testimonies table
export const testimonies = pgTable("testimonies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  story: text("story").notNull(),
  isAnonymous: boolean("is_anonymous").default(false).notNull(),
  amenCount: integer("amen_count").default(0).notNull(),
  encourageCount: integer("encourage_count").default(0).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  featuredDate: timestamp("featured_date"),
  videoUrl: varchar("video_url", { length: 500 }),
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  videoDuration: integer("video_duration"),
  moderationStatus: varchar("moderation_status", { length: 20 }).default("approved"),
  privacy: varchar("privacy", { length: 20 }).default("public").notNull(), // public, private
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTestimonySchema = createInsertSchema(testimonies).omit({
  id: true,
  amenCount: true,
  encourageCount: true,
  isFeatured: true,
  featuredDate: true,
  moderationStatus: true,
  createdAt: true,
}).extend({
  title: z.string().min(5, "Title must be at least 5 characters").max(200, "Title is too long"),
  category: z.enum(['Healing', 'Marriage', 'Fruitfulness', 'Finance', 'Breakthrough', 'Deliverance', 'General', 'Others']),
  story: z.string().min(10, "Story must be at least 10 characters").max(10000, "Story is too long"),
  privacy: z.enum(['public', 'private']).default('public'),
  videoUrl: z.string().max(500).optional().nullable(),
  thumbnailUrl: z.string().max(500).optional().nullable(),
  videoDuration: z.number().int().positive().optional().nullable(),
});

export type InsertTestimony = z.infer<typeof insertTestimonySchema>;
export type Testimony = typeof testimonies.$inferSelect;

// Testimony interactions table (tracks who gave Amen/Encourage)
export const testimonyInteractions = pgTable("testimony_interactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  testimonyId: varchar("testimony_id").references(() => testimonies.id, { onDelete: 'cascade' }).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  interactionType: varchar("interaction_type", { length: 20 }).notNull(), // 'amen' or 'encourage'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTestimonyInteractionSchema = createInsertSchema(testimonyInteractions).omit({
  id: true,
  createdAt: true,
});

export type InsertTestimonyInteraction = z.infer<typeof insertTestimonyInteractionSchema>;
export type TestimonyInteraction = typeof testimonyInteractions.$inferSelect;

// Comments table for threaded discussions on testimonies
export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  testimonyId: varchar("testimony_id").references(() => testimonies.id, { onDelete: 'cascade' }).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  parentId: varchar("parent_id").references((): any => comments.id, { onDelete: 'cascade' }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
}).extend({
  content: z.string().min(1, "Comment cannot be empty").max(2000, "Comment is too long"),
});

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

// Encouragement verses table
export const encouragementVerses = pgTable("encouragement_verses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  verse: text("verse").notNull(),
  reference: varchar("reference", { length: 100 }).notNull(),
  submittedBy: varchar("submitted_by").references(() => users.id),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEncouragementVerseSchema = createInsertSchema(encouragementVerses).omit({
  id: true,
  isActive: true,
  createdAt: true,
}).extend({
  verse: z.string().min(10, "Verse must be at least 10 characters").max(1000, "Verse is too long"),
  reference: z.string().min(3, "Reference is required").max(100, "Reference is too long"),
});

export type InsertEncouragementVerse = z.infer<typeof insertEncouragementVerseSchema>;
export type EncouragementVerse = typeof encouragementVerses.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  testimonies: many(testimonies),
  interactions: many(testimonyInteractions),
  encouragementVerses: many(encouragementVerses),
}));

export const testimoniesRelations = relations(testimonies, ({ one, many }) => ({
  user: one(users, {
    fields: [testimonies.userId],
    references: [users.id],
  }),
  interactions: many(testimonyInteractions),
  comments: many(comments),
}));

export const testimonyInteractionsRelations = relations(testimonyInteractions, ({ one }) => ({
  testimony: one(testimonies, {
    fields: [testimonyInteractions.testimonyId],
    references: [testimonies.id],
  }),
  user: one(users, {
    fields: [testimonyInteractions.userId],
    references: [users.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  testimony: one(testimonies, {
    fields: [comments.testimonyId],
    references: [testimonies.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "replies",
  }),
  replies: many(comments, {
    relationName: "replies",
  }),
}));

export const encouragementVersesRelations = relations(encouragementVerses, ({ one }) => ({
  user: one(users, {
    fields: [encouragementVerses.submittedBy],
    references: [users.id],
  }),
}));

// Extended testimony type with user info
export type TestimonyWithUser = Testimony & {
  user?: User;
  userHasAmen?: boolean;
  userHasEncourage?: boolean;
  commentCount?: number;
};

// Extended comment type with user info and replies
export type CommentWithUser = Comment & {
  user?: User;
  replies?: CommentWithUser[];
};

// Admin users table (separate from regular users)
export const admins = pgTable("admins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 50 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  displayName: varchar("display_name", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
});

export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
  createdAt: true,
  lastLoginAt: true,
}).extend({
  username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username is too long"),
  passwordHash: z.string(),
  displayName: z.string().max(100, "Display name is too long").optional(),
});

export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof admins.$inferSelect;

// Faith declarations table (managed by admin)
export const faithDeclarations = pgTable("faith_declarations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  declaration: text("declaration").notNull(),
  bibleVerse: text("bible_verse").notNull(),
  bibleReference: varchar("bible_reference", { length: 100 }).notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  activeDate: timestamp("active_date"),
  createdBy: varchar("created_by").references(() => admins.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFaithDeclarationSchema = createInsertSchema(faithDeclarations).omit({
  id: true,
  isActive: true,
  activeDate: true,
  createdAt: true,
}).extend({
  declaration: z.string().min(10, "Declaration must be at least 10 characters").max(500, "Declaration is too long"),
  bibleVerse: z.string().min(10, "Bible verse must be at least 10 characters").max(1000, "Bible verse is too long"),
  bibleReference: z.string().min(3, "Reference is required").max(100, "Reference is too long"),
});

export type InsertFaithDeclaration = z.infer<typeof insertFaithDeclarationSchema>;
export type FaithDeclaration = typeof faithDeclarations.$inferSelect;

// Relations for admin tables
export const adminsRelations = relations(admins, ({ many }) => ({
  faithDeclarations: many(faithDeclarations),
}));

export const faithDeclarationsRelations = relations(faithDeclarations, ({ one }) => ({
  admin: one(admins, {
    fields: [faithDeclarations.createdBy],
    references: [admins.id],
  }),
}));

// =====================================================
// FAITH EXPECTATIONS FEATURE
// =====================================================

// Faith Expectations - what users are believing God for
export const faithExpectations = pgTable("faith_expectations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).default("active").notNull(), // active, answered, archived
  privacy: varchar("privacy", { length: 20 }).default("private").notNull(), // private, community, public
  targetDate: timestamp("target_date"),
  answeredAt: timestamp("answered_at"),
  celebrationNote: text("celebration_note"), // optional note when marking as answered
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFaithExpectationSchema = createInsertSchema(faithExpectations).omit({
  id: true,
  answeredAt: true,
  celebrationNote: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  title: z.string().min(5, "Title must be at least 5 characters").max(200, "Title is too long"),
  description: z.string().max(2000, "Description is too long").optional(),
  category: z.enum(['Healing', 'Marriage', 'Fruitfulness', 'Finance', 'Breakthrough', 'Deliverance', 'Career', 'Spiritual Growth', 'General', 'Others']),
  status: z.enum(['active', 'answered', 'archived']).default('active'),
  privacy: z.enum(['private', 'community', 'public']),
  targetDate: z.string().datetime().optional().nullable(),
});

export type InsertFaithExpectation = z.infer<typeof insertFaithExpectationSchema>;
export type FaithExpectation = typeof faithExpectations.$inferSelect;

// Expectation Milestones - progress tracking
export const expectationMilestones = pgTable("expectation_milestones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  expectationId: varchar("expectation_id").references(() => faithExpectations.id, { onDelete: 'cascade' }).notNull(),
  title: text("title").notNull(),
  notes: text("notes"),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, in_progress, completed
  completedAt: timestamp("completed_at"),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertExpectationMilestoneSchema = createInsertSchema(expectationMilestones).omit({
  id: true,
  completedAt: true,
  createdAt: true,
}).extend({
  title: z.string().min(2, "Milestone title is required").max(200, "Title is too long"),
  notes: z.string().max(1000, "Notes are too long").optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
  sortOrder: z.number().int().default(0),
});

export type InsertExpectationMilestone = z.infer<typeof insertExpectationMilestoneSchema>;
export type ExpectationMilestone = typeof expectationMilestones.$inferSelect;

// Expectation Scriptures - linked Bible verses
export const expectationScriptures = pgTable("expectation_scriptures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  expectationId: varchar("expectation_id").references(() => faithExpectations.id, { onDelete: 'cascade' }).notNull(),
  reference: varchar("reference", { length: 100 }).notNull(), // e.g., "Jeremiah 29:11"
  passageText: text("passage_text"), // The actual verse text
  translation: varchar("translation", { length: 20 }).default("NIV"), // NIV, KJV, ESV, etc.
  isPrimary: boolean("is_primary").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertExpectationScriptureSchema = createInsertSchema(expectationScriptures).omit({
  id: true,
  createdAt: true,
}).extend({
  reference: z.string().min(3, "Scripture reference is required").max(100, "Reference is too long"),
  passageText: z.string().max(2000, "Passage text is too long").optional(),
  translation: z.string().max(20).default("NIV"),
  isPrimary: z.boolean().default(false),
});

export type InsertExpectationScripture = z.infer<typeof insertExpectationScriptureSchema>;
export type ExpectationScripture = typeof expectationScriptures.$inferSelect;

// Relations for Faith Expectations
export const faithExpectationsRelations = relations(faithExpectations, ({ one, many }) => ({
  user: one(users, {
    fields: [faithExpectations.userId],
    references: [users.id],
  }),
  milestones: many(expectationMilestones),
  scriptures: many(expectationScriptures),
}));

export const expectationMilestonesRelations = relations(expectationMilestones, ({ one }) => ({
  expectation: one(faithExpectations, {
    fields: [expectationMilestones.expectationId],
    references: [faithExpectations.id],
  }),
}));

export const expectationScripturesRelations = relations(expectationScriptures, ({ one }) => ({
  expectation: one(faithExpectations, {
    fields: [expectationScriptures.expectationId],
    references: [faithExpectations.id],
  }),
}));

// Extended types with relations
export type FaithExpectationWithDetails = FaithExpectation & {
  user?: User;
  milestones?: ExpectationMilestone[];
  scriptures?: ExpectationScripture[];
  completedMilestones?: number;
  totalMilestones?: number;
};

// Schema for marking expectation as answered
export const answerExpectationSchema = z.object({
  celebrationNote: z.string().max(2000, "Celebration note is too long").optional(),
});

export type AnswerExpectation = z.infer<typeof answerExpectationSchema>;

// Schema for updating milestone status
export const updateMilestoneStatusSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed']),
  notes: z.string().max(1000, "Notes are too long").optional(),
});

export type UpdateMilestoneStatus = z.infer<typeof updateMilestoneStatusSchema>;

// =====================================================
// PUSH NOTIFICATION SUBSCRIPTIONS
// =====================================================

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;

// =====================================================
// ADMIN AUDIT LOGS
// =====================================================

// Admin audit logs - tracks all admin actions
export const adminAuditLogs = pgTable("admin_audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").references(() => admins.id).notNull(),
  action: varchar("action", { length: 100 }).notNull(), // e.g., "delete_testimony", "suspend_user", "approve_video"
  targetType: varchar("target_type", { length: 50 }).notNull(), // "user", "testimony", "comment", etc.
  targetId: varchar("target_id", { length: 255 }), // ID of the affected entity
  details: text("details"), // JSON string with additional details
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAuditLogSchema = createInsertSchema(adminAuditLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof adminAuditLogs.$inferSelect;

// Extended type with admin info
export type AuditLogWithAdmin = AuditLog & {
  admin?: Admin;
};

// Password reset tokens table
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

// Forgot/reset password schemas
export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type ForgotPassword = z.infer<typeof forgotPasswordSchema>;
export type ResetPassword = z.infer<typeof resetPasswordSchema>;
