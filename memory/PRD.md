# InvertisConnect - PRD

## Original Problem Statement
Build InvertisConnect, a production-ready mentorship platform connecting students with verified alumni at Invertis University. Features: AI moderation, real-time chat, leaderboard, Stripe payments, admin panel.

## Architecture
- **Frontend**: React (CRA) + Tailwind CSS + Shadcn UI + Framer Motion + Recharts
- **Backend**: FastAPI (Python) on port 8001
- **Database**: Supabase (PostgreSQL) via REST API
- **Auth**: Supabase Auth (email/password)
- **AI**: Bug Off LLM Key (GPT-4o) for blog moderation + smart matching
- **Payments**: Stripe (test key)
- **Design**: Architectural Noir - pure black/white monochrome with glassmorphism

## What's Been Implemented (Feb 2026)

### Phase 1 - Foundation
- FastAPI backend with Supabase integration
- React frontend with Architectural Noir design
- Supabase Auth, role-based routing, onboarding flow

### Phase 2 - Core Features
- Landing page, Login/Signup, Onboarding
- Student/Alumni/Admin Dashboards
- Mentor browse with search/filter, AI Smart Match
- Connection request system, chat (polling)

### Phase 3 - Content & AI
- Blog creation with AI moderation (GPT-4o)
- Knowledge Hub, Leaderboard, Stripe checkout

### Phase 4 - Social Features (Iteration 2)
- LinkedIn/Reddit-style Community Feed with likes, comments, shares
- Blog detail page with full content + comment section
- Admin Analytics with charts (recharts: department, roles, connections, blogs)
- Auto-generated Alumni IDs
- Feed accessible from all dashboards

## Test Accounts
- admin@invertis.edu / Admin123456!
- student@invertis.edu / Student123456!
- alumni1@invertis.edu / Alumni123456! (Premium, 25pts)
- alumni2@invertis.edu / Alumni123456! (15pts)
- alumni3@invertis.edu / Alumni123456! (Pending verification)

## Database Tables
- users, connections, messages, blogs, blog_likes, blog_comments

## Next Tasks
1. Mobile responsive sidebar
2. Profile editing page
3. Supabase Realtime for instant chat
4. Email notifications
5. Avatar upload
