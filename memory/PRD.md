# InvertisConnect - PRD

## Original Problem Statement
Build InvertisConnect, a production-ready mentorship platform connecting students with verified alumni at Invertis University. Features: AI moderation, real-time chat, leaderboard, Stripe payments, admin panel.

## Architecture
- **Frontend**: React (CRA) + Tailwind CSS + Shadcn UI + Framer Motion
- **Backend**: FastAPI (Python) on port 8001
- **Database**: Supabase (PostgreSQL) via REST API
- **Auth**: Supabase Auth (email/password)
- **AI**: Emergent LLM Key (GPT-4o) for blog moderation + smart matching
- **Payments**: Stripe (test key)
- **Design**: Architectural Noir - pure black/white monochrome with glassmorphism

## User Personas
1. **Student** - Browse alumni, request mentorship, chat, read blogs
2. **Alumni** - Accept/manage connections, write blogs, earn score, premium features
3. **Admin** - Verify alumni, manage users, view analytics

## Core Requirements
- Department-scoped visibility (students see alumni from their dept)
- Admin-gated alumni verification
- AI-first content moderation for blogs
- Score-based monetization (Premium at score > 20)
- Real-time chat via polling

## What's Been Implemented (Feb 2026)
### Phase 1 - Foundation ✅
- FastAPI backend with Supabase integration
- React frontend with Architectural Noir design
- Supabase Auth (signup/login/session)
- Role-based routing (student/alumni/admin)

### Phase 2 - Core Features ✅
- Landing page with hero, features, stats, CTA
- Login/Signup with Supabase Auth
- Onboarding flow (role selection + profile creation)
- Student Dashboard with stats and quick actions
- Alumni Dashboard with score card and actions
- Admin Dashboard with platform stats

### Phase 3 - Connections & Chat ✅
- Mentor browse with search/filter by department
- Connection request system (student → alumni)
- Accept/reject connections (alumni)
- Chat system (polling every 3s)

### Phase 4 - Content & AI ✅
- Blog creation with AI moderation (GPT-4o)
- Knowledge Hub (filter by type: experience, referral, internship)
- AI Smart Match (GPT-4o powered mentor recommendations)

### Phase 5 - Admin & Monetization ✅
- Admin verify page for pending alumni
- User management table with filters
- Leaderboard with score-based premium system
- Stripe checkout session for paid mentor sessions
- Score increment on connection accept (+5) and blog publish (+3)

### Phase 6 - Database & Seeding ✅
- SQL setup script for Supabase tables
- Seed endpoint with 5 test accounts
- Setup check and verification

## Test Accounts
- admin@invertis.edu / Admin123456!
- student@invertis.edu / Student123456!
- alumni1@invertis.edu / Alumni123456! (Premium, 25pts)
- alumni2@invertis.edu / Alumni123456! (15pts)
- alumni3@invertis.edu / Alumni123456! (Pending verification)

## Prioritized Backlog
### P0 (Critical) - All Done ✅
### P1 (Important)
- Supabase Realtime for instant chat (replace polling)
- Blog read/detail page
- Student Knowledge Hub blog expansion (full content view)
- Profile editing page
- Mobile responsive sidebar (currently desktop-only)

### P2 (Nice to Have)
- Email notifications on connection accept
- Alumni profile page (public view)
- Blog comments
- Analytics charts in admin panel
- Avatar upload
- Department analytics breakdown

## Next Tasks
1. Add Supabase Realtime for instant chat messages
2. Create profile editing page
3. Make sidebar responsive for mobile
4. Add blog detail/read page
5. Improve admin analytics with charts
