import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { BookOpen, Briefcase, GraduationCap, Loader2 } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;
const typeIcons = { experience: Briefcase, referral: GraduationCap, internship: BookOpen };

export default function KnowledgeHubPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetch(`${API}/api/blogs${filter ? `?type=${filter}` : ''}`)
      .then(r => r.json())
      .then(d => setBlogs(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="knowledge-hub-page">
        <div>
          <h1 className="font-heading text-3xl font-light">Knowledge <span className="font-semibold">Hub</span></h1>
          <p className="text-white/40 mt-1 text-sm">Career insights, referrals, and opportunities from alumni</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[{ value: '', label: 'All' }, { value: 'experience', label: 'Experiences' }, { value: 'referral', label: 'Referrals' }, { value: 'internship', label: 'Internships' }].map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`text-sm px-4 py-2 rounded-md transition-colors ${filter === f.value ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:text-white/70'}`}
              data-testid={`filter-${f.value || 'all'}`}>
              {f.label}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-white/40" /></div>
        ) : blogs.length === 0 ? (
          <div className="glass-panel p-12 text-center text-white/30">No posts yet</div>
        ) : (
          <div className="space-y-4">
            {blogs.map((blog) => {
              const Icon = typeIcons[blog.type] || BookOpen;
              return (
                <article key={blog.id} className="glass-panel-hover p-6" data-testid={`blog-${blog.id}`}>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                      <Icon className="w-5 h-5 text-white/40" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs px-2 py-0.5 rounded-sm bg-white/5 text-white/40 capitalize">{blog.type}</span>
                      </div>
                      <h2 className="font-heading text-lg font-medium">{blog.title}</h2>
                      <p className="text-sm text-white/40 mt-2 leading-relaxed line-clamp-3">{blog.content}</p>
                      <div className="mt-3 flex items-center gap-2 text-xs text-white/20">
                        <span>{blog.author?.full_name}</span>
                        <span>&middot;</span>
                        <span>{blog.author?.department}</span>
                        <span>&middot;</span>
                        <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
