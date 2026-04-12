import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Users, MessageSquare, BookOpen, Zap, ArrowRight } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export default function StudentDashboard() {
  const { profile, getToken } = useAuth();
  const [connections, setConnections] = useState({ as_student: [] });
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${API}/api/connections/my`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setConnections(d)).catch(() => {});
    fetch(`${API}/api/blogs`).then(r => r.json()).then(d => setBlogs(d)).catch(() => {});
  }, [getToken]);

  const accepted = connections.as_student?.filter(c => c.status === 'accepted') || [];
  const pending = connections.as_student?.filter(c => c.status === 'pending') || [];

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="student-dashboard">
        <div>
          <h1 className="font-heading text-3xl sm:text-4xl font-light">
            Welcome, <span className="font-semibold">{profile?.full_name}</span>
          </h1>
          <p className="text-white/40 mt-2 text-sm">{profile?.department} Department</p>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Active Mentors', value: accepted.length, icon: Users, color: 'text-white' },
            { label: 'Pending Requests', value: pending.length, icon: MessageSquare, color: 'text-white/60' },
            { label: 'Blog Posts', value: blogs.length, icon: BookOpen, color: 'text-white/60' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="glass-panel p-6" data-testid={`stat-${s.label.toLowerCase().replace(/\s/g, '-')}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/30 uppercase tracking-wider">{s.label}</p>
                    <p className="text-3xl font-heading font-semibold mt-1">{s.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${s.color} opacity-30`} />
                </div>
              </div>
            );
          })}
        </div>
        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/student/mentors" className="glass-panel-hover p-6 flex items-center justify-between group" data-testid="find-mentors-link">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                <Zap className="w-5 h-5 text-white/60" />
              </div>
              <div>
                <h3 className="font-heading font-medium">Find Mentors</h3>
                <p className="text-sm text-white/30">Browse alumni from your department</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-white/60 transition-colors" />
          </Link>
          <Link to="/student/knowledge-hub" className="glass-panel-hover p-6 flex items-center justify-between group" data-testid="knowledge-hub-link">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                <BookOpen className="w-5 h-5 text-white/60" />
              </div>
              <div>
                <h3 className="font-heading font-medium">Knowledge Hub</h3>
                <p className="text-sm text-white/30">Read career insights from alumni</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-white/60 transition-colors" />
          </Link>
        </div>
        {/* Recent Blogs */}
        {blogs.length > 0 && (
          <div>
            <h2 className="font-heading text-lg font-medium mb-4">Recent Posts</h2>
            <div className="space-y-3">
              {blogs.slice(0, 3).map((blog) => (
                <div key={blog.id} className="glass-panel p-4 flex items-center justify-between" data-testid={`blog-${blog.id}`}>
                  <div>
                    <h3 className="font-medium text-sm">{blog.title}</h3>
                    <p className="text-xs text-white/30 mt-1">{blog.author?.full_name} &middot; {blog.type} &middot; {new Date(blog.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-white/5 text-white/40 capitalize">{blog.type}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
