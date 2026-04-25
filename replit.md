# Testifaith

## Overview
Testifaith is a faith-based community platform designed for Christians and believers to share testimonies, find inspiration, and strengthen their faith. It provides a safe, uplifting environment for sharing experiences of God's goodness across categories like Healing, Marriage, Fruitfulness, Finance, Breakthrough, and Deliverance. Key features include a daily "Testimony of the Day," daily faith declarations, category-based browsing, user profiles with settings, new user onboarding, and social interaction tools (Amen and Encourage buttons) to foster community engagement.

## User Preferences
- Preferred communication style: Simple, everyday language
- Design aesthetic: Peaceful, uplifting, reverent with light/dark mode support and red (#EF4444) accents
- No technical jargon - translate technical concepts into everyday terms
- League Spartan font for all major headings site-wide

## System Architecture

### UI/UX Decisions
The app is a **mobile-first PWA** with a bottom tab bar (Home, Community, FAB, Bible, Profile) and no traditional header/footer for authenticated users. The design defaults to **dark mode** with a theme toggle. It uses League Spartan for headings, red (#EF4444) accents, and a YouVersion Bible aesthetic. Features: transparent MobileHeader with logo + bell + theme toggle; expandable FAB action sheet (Journal Faith, Get Encouraged, Ask Question); private faith journal section on Home (filters user's `privacy=private` testimonies).

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Vite for bundling, Wouter for routing, and TanStack Query for server state management. UI components are built with shadcn/ui (Radix UI primitives) and styled using Tailwind CSS and CSS Variables for theming. Form handling uses React Hook Form with Zod for validation.
- **Backend**: Express.js with TypeScript on Node.js. It features a RESTful API, authentication via Google OAuth 2.0 using passport-google-oauth20 and Express Session, and a data access layer using a repository pattern.
- **Database**: Drizzle ORM for type-safe queries with Neon Serverless PostgreSQL. The schema includes `users`, `testimonies`, `testimony_interactions`, `encouragement_verses`, `faith_declarations`, `admins`, `comments`, and `sessions` tables. The `testimonies` table has a `privacy` field (`public` | `private`) — private entries are only visible to the author (personal faith journal) and are excluded from all public feeds.

### Feature Specifications
- **Core Features**: User authentication (Google OAuth), browsing/posting testimonies, 7 dedicated category pages, testimony detail view, Amen/Encourage interactions, personal testimony dashboard, daily "Testimony of the Day," daily faith declarations, and daily encouragement verses.
- **Video Testimonies**: In-app video recording (up to 3 minutes) and file upload (up to 100MB) using Replit App Storage. Videos require admin moderation before publication. VideoRecorder component with cross-browser support, VideoPlayer component with playback controls.
- **User Profiles**: Complete profile pages with bio, avatar, location, website, faith interests display, and stats (testimonies count, amens received, encouragements received).
- **Settings**: Profile editing (name, bio, location, website), notification preferences (amen, encourage, comment, daily verse), privacy settings (public/private profile).
- **Onboarding**: 3-step new user onboarding flow (name, bio, faith interests selection) to personalize the experience.
- **Admin System**: Login at /admin with admin/testifaith2024, featured testimony selection, faith declaration management, video moderation queue (approve/reject pending video testimonies), comprehensive analytics, user management with suspend/unsuspend, content moderation, admin account management, and audit logging.
- **Welcome Emails**: Professional HTML welcome emails sent automatically to new users via Resend, triggered for both Google OAuth and email/password registrations.
- **Technical Features**: Real-time data updates via TanStack Query, unauthorized error handling with redirects, loading states, Zod form validation, and session-based authentication with a 7-day TTL.

### Key Routes
- `/` - Landing page (unauthenticated) or Home (authenticated)
- `/home` - Authenticated user home
- `/profile` - Current user's profile
- `/profile/:userId` - View another user's profile
- `/settings` - Profile and notification settings
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
- **Object Storage**: Replit App Storage for video file hosting with presigned URL uploads
- **Email Service**: Resend for transactional emails (welcome emails for new users)

## Future Features (Roadmap)
- **Phase 3**: Faith expectations tracking with milestones and scripture linking
- **Phase 4**: Faith circles for group prayer requests and community connection
