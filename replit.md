# Testifaith

## Overview
Testifaith is a faith-based community platform designed for Christians and believers to share testimonies, find inspiration, and strengthen their faith. It provides a safe, uplifting environment for sharing experiences of God's goodness across categories like Healing, Marriage, Fruitfulness, Finance, Breakthrough, and Deliverance. Key features include a daily "Testimony of the Day," daily faith declarations, category-based browsing, user profiles with settings, new user onboarding, and social interaction tools (Amen and Encourage buttons) to foster community engagement.

## User Preferences
- Preferred communication style: Simple, everyday language
- Design aesthetic: Peaceful, uplifting, reverent with light/dark mode support and red (#EF4444) accents
- No technical jargon - translate technical concepts into everyday terms
- Space Grotesk font for all major headings site-wide
- Plus Jakarta Sans as the body/UI font (modern, clean)
- Crimson Pro for testimony quotes and serif contexts

## System Architecture

### UI/UX Decisions
The app is a **mobile-first PWA** with a bottom tab bar (Home, Community, FAB, Bible, Profile) and no traditional header/footer for authenticated users. The design defaults to **dark mode** with a theme toggle. It uses League Spartan for headings, red (#EF4444) accents, and a YouVersion Bible aesthetic. Features: transparent MobileHeader with logo + bell + theme toggle; expandable FAB action sheet (Journal Faith, Get Encouraged, Ask Question); private faith journal section on Home (filters user's `privacy=private` testimonies).

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Vite for bundling, Wouter for routing, and TanStack Query for server state management. UI components are built with shadcn/ui (Radix UI primitives) and styled using Tailwind CSS and CSS Variables for theming. Form handling uses React Hook Form with Zod for validation.
- **Backend**: Express.js with TypeScript on Node.js. It features a RESTful API, authentication via Google OAuth 2.0 using passport-google-oauth20 and Express Session, and a data access layer using a repository pattern.
- **Database**: Drizzle ORM for type-safe queries with Neon Serverless PostgreSQL. The schema includes `users`, `testimonies`, `testimony_interactions`, `encouragement_verses`, `faith_declarations`, `admins`, `comments`, and `sessions` tables. The `testimonies` table has a `privacy` field (`public` | `private`) — private entries are only visible to the author (personal faith journal) and are excluded from all public feeds.

### Feature Specifications
- **Core Features**: User authentication (Google OAuth), browsing/posting testimonies, 7 dedicated category pages, testimony detail view, Amen/Encourage interactions, personal testimony dashboard, daily "Stone of the Day" (featured testimony), daily faith declarations, daily encouragement verses, journal streak counter, and "On This Day" memory feature.
- **Bible Reader**: Full Bible reader powered by bible-api.com (no API key). Supports KJV, WEB, ASV, YLT, DARBY, BBE versions with multi-version picker. Features: book browser (OT/NT tabs), chapter grid, verse-by-verse reading with prev/next navigation, scripture search by reference, quick access to popular passages.
- **Video Testimonies**: In-app video recording (up to 3 minutes) and file upload (up to 100MB) using Replit App Storage. Videos require admin moderation before publication. VideoRecorder component with cross-browser support, VideoPlayer component with playback controls.
- **User Profiles**: Complete profile pages with bio, avatar, location, website, faith interests display, and stats (testimonies count, amens received, encouragements received).
- **Settings**: Profile editing (name, bio, location, website), notification preferences (amen, encourage, comment, daily verse), privacy settings (public/private profile).
- **Onboarding**: 3-step new user onboarding flow (name, bio, faith interests selection) to personalize the experience.
- **Admin System**: Login at /admin with admin/testifaith2024. Features: horizontally scrollable tab bar (10 tabs), analytics dashboard, user management (search by name/email, suspend/unsuspend), testimony moderation (search + category filter, feature/delete), comments moderation (separate tab), video moderation queue (approve/reject), faith declaration management, encouragement verse management, upload testimony (with video), featured testimony selector, admin account management, change password, and audit logging.
- **Welcome Emails**: Professional HTML welcome emails sent automatically to new users via Resend, triggered for both Google OAuth and email/password registrations.
- **Technical Features**: Real-time data updates via TanStack Query, unauthorized error handling with redirects, loading states, Zod form validation, and session-based authentication with a 7-day TTL.

### Key Routes
- `/` - Landing page (unauthenticated) or Home (authenticated)
- `/home` - Authenticated user home
- `/profile` - Current user's profile
- `/profile/:userId` - View another user's profile
- `/edit-profile` - Dedicated profile editing (name, bio, location, website)
- `/settings` - App preferences (notifications, privacy, security, help)
- `/onboarding` - New user onboarding flow
- `/post` - Create new testimony
- `/testimonies` - Browse all testimonies
- `/categories` - View all categories
- `/category/:category` - View testimonies by category
- `/testimony/:id` - Testimony detail view
- `/search` - Search testimonies
- `/my-testimonies` - User's own testimonies
- `/admin` - Admin panel

## External Dependencies

- **Authentication**: Google OAuth 2.0 (passport-google-oauth20)
- **Database**: Neon Serverless PostgreSQL
- **Fonts**: Google Fonts (Inter, Crimson Pro, League Spartan)
- **UI Libraries**: Radix UI, shadcn/ui
- **Styling**: Tailwind CSS
- **Data Management**: TanStack Query, Drizzle ORM
- **Validation**: Zod, drizzle-zod
- **Date Utilities**: date-fns
- **Development Tools**: TSX, esbuild, Replit Vite Plugins

## External Dependencies (continued)
- **Object Storage**: S3-compatible storage for video file hosting with presigned URL uploads. Uses Replit Object Storage in dev (when S3 env vars not set), and any S3-compatible provider (Cloudflare R2, AWS S3, etc.) in production via `server/s3Storage.ts`. Required env vars: `S3_BUCKET_NAME`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, and optionally `S3_ENDPOINT` for non-AWS providers.
- **Email Service**: Resend for transactional emails (welcome emails for new users)
- **Push Notifications**: web-push (VAPID) for PWA push notifications; `push_subscriptions` table in DB; service worker at `client/public/sw.js`

## PWA Features
- **Service Worker**: Registered in App.tsx for push notification support (`/sw.js`)
- **Push Notifications**: Bell icon in MobileHeader subscribes/unsubscribes; triggers on Amen and Encourage actions; `usePushNotifications.ts` hook; VAPID keys in env vars
- **Pull-to-Refresh**: Touch gesture on Community page using `usePullToRefresh.ts` hook with visual spinner indicator
- **Amen Animation**: CSS `amen-burst` keyframe animation on heart icon when tapped
- **Skeleton Loading**: App-level `AppSkeleton` replaces spinner; Community uses `CommunitySkeleton`; new `skeleton-shimmer` CSS utility
- **Empty States**: `EmptyState.tsx` SVG illustrated components (community, journal, search, video types)
- **Video Thumbnails**: Category-gradient thumbnails with play button overlay when no thumbnail URL available

## UX Enhancements (April 2026)
- **Declare it! button** — Daily faith declaration card now has a "Declare it!" pill button. Taps flip it to "Declared today" (persisted in localStorage per day, resets at midnight).
- **Stone of the Day relative time** — Featured testimony timestamp now shows relative time (e.g. "6 months ago") with full date in tooltip.
- **Trending This Week** — Community page shows a horizontal scroll of the most-encouraged testimonies (sorted by encourageCount, hidden when all have 0 encouragements or during search/category filter).
- **Comment count on testimony cards** — TestimonyCard now shows a MessageCircle icon + count, linked to the testimony detail page.
- **Faith interests → category links** — Profile page faith interest badges now navigate to their respective category page on tap.
- **Onboarding welcome screen** — After completing 3-step onboarding, users see a "You're all set!" celebration screen with CTA to post or explore.
- **Post testimony success screen** — After sharing a testimony, instead of a silent redirect, users see a dedicated success screen with scripture and navigation options.
- **Admin Support tab badge** — Support tab in admin dashboard shows a live count of open (unread) messages; auto-refreshes every 60 seconds.
- **Push notification tooltip** — Bell icon tooltip now describes what you'll receive: "Turn on notifications to hear when someone Amens or Encourages your testimony".

## Future Features (Roadmap)
- **Phase 3**: Faith expectations tracking with milestones and scripture linking
- **Phase 4**: Faith circles for group prayer requests and community connection
