from fastapi import FastAPI, APIRouter, HTTPException, Header, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import json
import uuid
import logging
import stripe
import httpx
from pathlib import Path
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
from supabase import create_client

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Initialize Supabase
supabase_url = os.environ.get('SUPABASE_URL')
supabase_service_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
supabase = create_client(supabase_url, supabase_service_key)

# Initialize Stripe
stripe.api_key = os.environ.get('STRIPE_API_KEY')

# Emergent LLM key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ─── Pydantic Models ───
class UserCreate(BaseModel):
    full_name: str
    role: str
    department: str
    alumni_id: Optional[str] = None
    linkedin_url: Optional[str] = None
    bio: Optional[str] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    linkedin_url: Optional[str] = None
    avatar_url: Optional[str] = None

class ConnectionRequest(BaseModel):
    alumni_id: str

class ConnectionUpdate(BaseModel):
    status: str

class MessageSend(BaseModel):
    connection_id: str
    content: str

class BlogCreate(BaseModel):
    title: str
    content: str
    type: str

class VerifyAlumni(BaseModel):
    approve: bool

class StripeSessionRequest(BaseModel):
    mentor_id: str

# ─── Auth Dependency ───
async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(' ')[1]
    try:
        user_response = supabase.auth.get_user(token)
        return user_response.user
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_optional_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith('Bearer '):
        return None
    token = authorization.split(' ')[1]
    try:
        user_response = supabase.auth.get_user(token)
        return user_response.user
    except:
        return None

# ─── Health Check ───
@api_router.get("/")
async def root():
    return {"message": "InvertisConnect API", "status": "running"}

# ─── Setup ───
SETUP_SQL = """
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS TABLE
create table if not exists public.users (
  id uuid primary key,
  email text unique not null,
  full_name text not null,
  role text check (role in ('student', 'alumni', 'admin')) not null,
  department text check (department in ('CSE', 'ME', 'ECE', 'EE', 'CE', 'IT')) not null,
  alumni_id text unique,
  status text check (status in ('pending', 'active')) default 'pending',
  score integer default 0,
  avatar_url text,
  bio text,
  linkedin_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- CONNECTIONS TABLE
create table if not exists public.connections (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.users(id) on delete cascade not null,
  alumni_id uuid references public.users(id) on delete cascade not null,
  status text check (status in ('pending', 'accepted', 'rejected')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(student_id, alumni_id)
);

-- MESSAGES TABLE
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  connection_id uuid references public.connections(id) on delete cascade not null,
  sender_id uuid references public.users(id) on delete cascade not null,
  content text not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- BLOGS TABLE
create table if not exists public.blogs (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  content text not null,
  type text check (type in ('experience', 'referral', 'internship')) not null,
  status text check (status in ('published', 'rejected')) default 'published',
  rejection_reason text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- INDEXES
create index if not exists idx_users_department on public.users(department);
create index if not exists idx_users_role_status on public.users(role, status);
create index if not exists idx_connections_student on public.connections(student_id);
create index if not exists idx_connections_alumni on public.connections(alumni_id);
create index if not exists idx_messages_connection on public.messages(connection_id);
create index if not exists idx_blogs_author on public.blogs(author_id);
"""

@api_router.get("/setup/sql")
async def get_setup_sql():
    return {"sql": SETUP_SQL}

@api_router.get("/setup/check")
async def check_setup():
    try:
        result = supabase.table('users').select('id').limit(1).execute()
        return {"tables_exist": True}
    except Exception as e:
        return {"tables_exist": False, "error": str(e)}

@api_router.post("/setup/seed")
async def seed_database():
    """Create test users for demo/testing purposes"""
    results = []
    test_accounts = [
        {"email": "admin@invertis.edu", "password": "Admin123456!", "role": "admin", "full_name": "Admin User", "department": "CSE", "status": "active", "score": 0},
        {"email": "student@invertis.edu", "password": "Student123456!", "role": "student", "full_name": "Rahul Sharma", "department": "CSE", "status": "active", "score": 0},
        {"email": "alumni1@invertis.edu", "password": "Alumni123456!", "role": "alumni", "full_name": "Priya Patel", "department": "CSE", "status": "active", "score": 25, "alumni_id": "ALU2020CSE001", "bio": "Software Engineer at Google. Passionate about mentoring the next generation.", "linkedin_url": "https://linkedin.com/in/priyapatel"},
        {"email": "alumni2@invertis.edu", "password": "Alumni123456!", "role": "alumni", "full_name": "Arjun Verma", "department": "CSE", "status": "active", "score": 15, "alumni_id": "ALU2019CSE002", "bio": "Data Scientist at Microsoft. Love helping students break into tech."},
        {"email": "alumni3@invertis.edu", "password": "Alumni123456!", "role": "alumni", "full_name": "Sneha Gupta", "department": "ECE", "status": "pending", "score": 0, "alumni_id": "ALU2021ECE001", "bio": "Embedded Systems Engineer at Intel."},
    ]
    for account in test_accounts:
        try:
            auth_result = supabase.auth.admin.create_user({
                "email": account["email"],
                "password": account["password"],
                "email_confirm": True,
            })
            user_id = auth_result.user.id
            profile = {
                "id": str(user_id),
                "email": account["email"],
                "full_name": account["full_name"],
                "role": account["role"],
                "department": account["department"],
                "status": account["status"],
                "score": account.get("score", 0),
                "alumni_id": account.get("alumni_id"),
                "bio": account.get("bio"),
                "linkedin_url": account.get("linkedin_url"),
            }
            supabase.table('users').insert(profile).execute()
            results.append({"email": account["email"], "success": True})
        except Exception as e:
            results.append({"email": account["email"], "success": False, "error": str(e)})
    return {"results": results}

# ─── User Endpoints ───
@api_router.get("/users/me")
async def get_my_profile(authorization: str = Header(None)):
    user = await get_current_user(authorization)
    try:
        result = supabase.table('users').select('*').eq('id', str(user.id)).single().execute()
        return result.data
    except Exception as e:
        return None

@api_router.post("/users/create")
async def create_user_profile(data: UserCreate, authorization: str = Header(None)):
    user = await get_current_user(authorization)
    profile = {
        "id": str(user.id),
        "email": user.email,
        "full_name": data.full_name,
        "role": data.role,
        "department": data.department,
        "alumni_id": data.alumni_id if data.role == 'alumni' else None,
        "linkedin_url": data.linkedin_url,
        "bio": data.bio,
        "status": "pending" if data.role == 'alumni' else "active",
        "score": 0,
    }
    try:
        result = supabase.table('users').insert(profile).execute()
        return result.data[0] if result.data else profile
    except Exception as e:
        logger.error(f"Create user error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@api_router.put("/users/me")
async def update_my_profile(data: UserUpdate, authorization: str = Header(None)):
    user = await get_current_user(authorization)
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    try:
        result = supabase.table('users').update(update_data).eq('id', str(user.id)).execute()
        return result.data[0] if result.data else {}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/users/alumni")
async def get_alumni_list(
    department: Optional[str] = None,
    authorization: str = Header(None)
):
    await get_current_user(authorization)
    query = supabase.table('users').select('*').eq('role', 'alumni').eq('status', 'active')
    if department:
        query = query.eq('department', department)
    query = query.order('score', desc=True)
    result = query.execute()
    return result.data

@api_router.get("/users/leaderboard")
async def get_leaderboard():
    result = supabase.table('users').select('id, full_name, department, score, avatar_url, bio').eq('role', 'alumni').eq('status', 'active').order('score', desc=True).limit(10).execute()
    return result.data

# ─── Connection Endpoints ───
@api_router.post("/connections/request")
async def request_connection(data: ConnectionRequest, authorization: str = Header(None)):
    user = await get_current_user(authorization)
    profile = supabase.table('users').select('role').eq('id', str(user.id)).single().execute()
    if not profile.data or profile.data['role'] != 'student':
        raise HTTPException(status_code=403, detail="Only students can request connections")
    existing = supabase.table('connections').select('id').eq('student_id', str(user.id)).eq('alumni_id', data.alumni_id).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Connection already exists")
    connection = {
        "student_id": str(user.id),
        "alumni_id": data.alumni_id,
        "status": "pending",
    }
    result = supabase.table('connections').insert(connection).execute()
    return result.data[0] if result.data else connection

@api_router.get("/connections/my")
async def get_my_connections(authorization: str = Header(None)):
    user = await get_current_user(authorization)
    uid = str(user.id)
    as_student = supabase.table('connections').select('*, alumni:alumni_id(id, full_name, department, score, avatar_url, bio)').eq('student_id', uid).execute()
    as_alumni = supabase.table('connections').select('*, student:student_id(id, full_name, department, avatar_url)').eq('alumni_id', uid).execute()
    return {
        "as_student": as_student.data,
        "as_alumni": as_alumni.data,
    }

@api_router.put("/connections/{connection_id}")
async def update_connection(connection_id: str, data: ConnectionUpdate, authorization: str = Header(None)):
    user = await get_current_user(authorization)
    conn = supabase.table('connections').select('*').eq('id', connection_id).single().execute()
    if not conn.data:
        raise HTTPException(status_code=404, detail="Connection not found")
    if conn.data['alumni_id'] != str(user.id):
        raise HTTPException(status_code=403, detail="Only alumni can update connection status")
    result = supabase.table('connections').update({"status": data.status}).eq('id', connection_id).execute()
    if data.status == 'accepted':
        try:
            alumni = supabase.table('users').select('score').eq('id', str(user.id)).single().execute()
            new_score = (alumni.data.get('score', 0) or 0) + 5
            supabase.table('users').update({"score": new_score}).eq('id', str(user.id)).execute()
        except Exception as e:
            logger.error(f"Score update error: {e}")
    return result.data[0] if result.data else {}

# ─── Message Endpoints ───
@api_router.get("/messages/{connection_id}")
async def get_messages(connection_id: str, authorization: str = Header(None)):
    user = await get_current_user(authorization)
    conn = supabase.table('connections').select('*').eq('id', connection_id).single().execute()
    if not conn.data:
        raise HTTPException(status_code=404, detail="Connection not found")
    uid = str(user.id)
    if conn.data['student_id'] != uid and conn.data['alumni_id'] != uid:
        raise HTTPException(status_code=403, detail="Not a participant")
    if conn.data['status'] != 'accepted':
        raise HTTPException(status_code=403, detail="Connection not accepted")
    result = supabase.table('messages').select('*').eq('connection_id', connection_id).order('created_at').execute()
    return result.data

@api_router.post("/messages/send")
async def send_message(data: MessageSend, authorization: str = Header(None)):
    user = await get_current_user(authorization)
    conn = supabase.table('connections').select('*').eq('id', data.connection_id).single().execute()
    if not conn.data:
        raise HTTPException(status_code=404, detail="Connection not found")
    uid = str(user.id)
    if conn.data['student_id'] != uid and conn.data['alumni_id'] != uid:
        raise HTTPException(status_code=403, detail="Not a participant")
    if conn.data['status'] != 'accepted':
        raise HTTPException(status_code=403, detail="Connection not accepted")
    message = {
        "connection_id": data.connection_id,
        "sender_id": uid,
        "content": data.content,
        "read": False,
    }
    result = supabase.table('messages').insert(message).execute()
    return result.data[0] if result.data else message

# ─── Blog Endpoints ───
@api_router.get("/blogs")
async def get_blogs(type: Optional[str] = None):
    query = supabase.table('blogs').select('*, author:author_id(id, full_name, department, avatar_url)').eq('status', 'published')
    if type:
        query = query.eq('type', type)
    result = query.order('created_at', desc=True).execute()
    return result.data

@api_router.post("/blogs/create")
async def create_blog(data: BlogCreate, authorization: str = Header(None)):
    user = await get_current_user(authorization)
    profile = supabase.table('users').select('role, status').eq('id', str(user.id)).single().execute()
    if not profile.data or profile.data['role'] != 'alumni' or profile.data['status'] != 'active':
        raise HTTPException(status_code=403, detail="Only active alumni can create blogs")
    blog = {
        "author_id": str(user.id),
        "title": data.title,
        "content": data.content,
        "type": data.type,
        "status": "published",
    }
    result = supabase.table('blogs').insert(blog).execute()
    blog_data = result.data[0] if result.data else blog
    # AI Moderation
    try:
        moderation = await moderate_blog_content(data.title, data.content, data.type)
        if not moderation.get('approved', True):
            supabase.table('blogs').update({"status": "rejected", "rejection_reason": moderation.get('reason', '')}).eq('id', blog_data['id']).execute()
            return {"success": False, "status": "rejected", "reason": moderation.get('reason', 'Content did not meet guidelines')}
        # Increment author score
        author = supabase.table('users').select('score').eq('id', str(user.id)).single().execute()
        new_score = (author.data.get('score', 0) or 0) + 3
        supabase.table('users').update({"score": new_score}).eq('id', str(user.id)).execute()
    except Exception as e:
        logger.error(f"Moderation error: {e}")
    return {"success": True, "status": "published", "blog": blog_data}

@api_router.delete("/blogs/{blog_id}")
async def delete_blog(blog_id: str, authorization: str = Header(None)):
    user = await get_current_user(authorization)
    blog = supabase.table('blogs').select('author_id').eq('id', blog_id).single().execute()
    if not blog.data or blog.data['author_id'] != str(user.id):
        raise HTTPException(status_code=403, detail="Not authorized")
    supabase.table('blogs').delete().eq('id', blog_id).execute()
    return {"success": True}

# ─── AI Moderation ───
async def moderate_blog_content(title: str, content: str, content_type: str):
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"mod-{uuid.uuid4()}",
            system_message="""You are a content moderator for InvertisConnect, a professional mentorship platform.
Evaluate blog posts for relevance and appropriateness.
ACCEPTABLE: Career experiences, job referrals, internship opportunities, industry insights, educational resources.
REJECT: Spam, offensive content, personal attacks, misinformation, off-topic content.
Respond with JSON only: {"approved": boolean, "reason": "explanation if rejected"}"""
        )
        chat.with_model("openai", "gpt-4o")
        response = await chat.send_message(UserMessage(
            text=f"Evaluate this blog:\nTitle: {title}\nType: {content_type}\nContent: {content}"
        ))
        return json.loads(response)
    except Exception as e:
        logger.error(f"AI moderation error: {e}")
        return {"approved": True, "reason": "Moderation unavailable"}

# ─── AI Smart Match ───
@api_router.post("/ai/smart-match")
async def smart_match(authorization: str = Header(None)):
    user = await get_current_user(authorization)
    uid = str(user.id)
    student = supabase.table('users').select('*').eq('id', uid).single().execute()
    if not student.data or student.data['role'] != 'student':
        raise HTTPException(status_code=403, detail="Only students can use smart match")
    alumni = supabase.table('users').select('*').eq('role', 'alumni').eq('status', 'active').eq('department', student.data['department']).order('score', desc=True).limit(10).execute()
    if not alumni.data:
        return {"mentors": []}
    existing = supabase.table('connections').select('alumni_id').eq('student_id', uid).execute()
    connected_ids = {c['alumni_id'] for c in (existing.data or [])}
    available = [a for a in alumni.data if a['id'] not in connected_ids]
    if not available:
        return {"mentors": []}
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"match-{uuid.uuid4()}",
            system_message="""You are a mentor matching system. Given a student and available alumni, rank the top 3 most suitable mentors.
Consider: experience, score, bio relevance, profile completeness.
Return JSON only: {"rankings": [{"id": "alumni-uuid", "matchScore": 85, "reason": "brief explanation"}]}"""
        )
        chat.with_model("openai", "gpt-4o")
        alumni_info = "\n".join([f"ID: {a['id']}, Name: {a['full_name']}, Dept: {a['department']}, Score: {a['score']}, Bio: {a.get('bio', 'No bio')}" for a in available])
        response = await chat.send_message(UserMessage(
            text=f"Student: {student.data['full_name']}, Dept: {student.data['department']}\nAvailable Alumni:\n{alumni_info}"
        ))
        rankings = json.loads(response)
        ranked_mentors = []
        for r in rankings.get('rankings', [])[:3]:
            mentor = next((a for a in available if a['id'] == r['id']), None)
            if mentor:
                ranked_mentors.append({**mentor, "matchScore": r.get('matchScore', 0), "matchReason": r.get('reason', '')})
        return {"mentors": ranked_mentors}
    except Exception as e:
        logger.error(f"Smart match error: {e}")
        return {"mentors": available[:3]}

# ─── Stripe ───
@api_router.post("/stripe/create-session")
async def create_stripe_session(data: StripeSessionRequest, authorization: str = Header(None)):
    user = await get_current_user(authorization)
    mentor = supabase.table('users').select('full_name, score').eq('id', data.mentor_id).single().execute()
    if not mentor.data or (mentor.data.get('score', 0) or 0) <= 20:
        raise HTTPException(status_code=400, detail="Mentor not eligible for paid sessions")
    try:
        app_url = os.environ.get('APP_URL', 'http://localhost:3000')
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'inr',
                    'product_data': {
                        'name': f"1-on-1 Session with {mentor.data['full_name']}",
                        'description': '45-minute video call mentorship session',
                    },
                    'unit_amount': 99900,
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=f"{app_url}/student/booking-success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{app_url}/student/mentors",
            metadata={'mentorId': data.mentor_id, 'studentId': str(user.id)},
        )
        return {"url": session.url}
    except Exception as e:
        logger.error(f"Stripe error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create session")

# ─── Admin Endpoints ───
async def require_admin(authorization: str = Header(None)):
    user = await get_current_user(authorization)
    profile = supabase.table('users').select('role').eq('id', str(user.id)).single().execute()
    if not profile.data or profile.data['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

@api_router.get("/admin/stats")
async def get_admin_stats(authorization: str = Header(None)):
    await require_admin(authorization)
    users = supabase.table('users').select('*', count='exact').execute()
    pending = supabase.table('users').select('*', count='exact').eq('role', 'alumni').eq('status', 'pending').execute()
    blogs = supabase.table('blogs').select('*', count='exact').eq('status', 'published').execute()
    connections = supabase.table('connections').select('*', count='exact').eq('status', 'accepted').execute()
    students = supabase.table('users').select('*', count='exact').eq('role', 'student').execute()
    alumni_active = supabase.table('users').select('*', count='exact').eq('role', 'alumni').eq('status', 'active').execute()
    return {
        "total_users": users.count or 0,
        "pending_alumni": pending.count or 0,
        "published_blogs": blogs.count or 0,
        "active_connections": connections.count or 0,
        "total_students": students.count or 0,
        "active_alumni": alumni_active.count or 0,
    }

@api_router.get("/admin/pending-alumni")
async def get_pending_alumni(authorization: str = Header(None)):
    await require_admin(authorization)
    result = supabase.table('users').select('*').eq('role', 'alumni').eq('status', 'pending').order('created_at').execute()
    return result.data

@api_router.put("/admin/verify/{user_id}")
async def verify_alumni(user_id: str, data: VerifyAlumni, authorization: str = Header(None)):
    await require_admin(authorization)
    if data.approve:
        supabase.table('users').update({"status": "active"}).eq('id', user_id).execute()
        return {"success": True, "action": "approved"}
    else:
        supabase.table('users').delete().eq('id', user_id).execute()
        return {"success": True, "action": "rejected"}

@api_router.get("/admin/users")
async def get_all_users(
    role: Optional[str] = None,
    department: Optional[str] = None,
    authorization: str = Header(None)
):
    await require_admin(authorization)
    query = supabase.table('users').select('*')
    if role:
        query = query.eq('role', role)
    if department:
        query = query.eq('department', department)
    result = query.order('created_at', desc=True).execute()
    return result.data

@api_router.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, authorization: str = Header(None)):
    await require_admin(authorization)
    supabase.table('users').delete().eq('id', user_id).execute()
    return {"success": True}

# ─── Include router and middleware ───
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
