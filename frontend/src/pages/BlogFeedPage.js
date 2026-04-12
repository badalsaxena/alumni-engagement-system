import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Heart, MessageCircle, Share2, Briefcase, GraduationCap, BookOpen, Zap, Loader2, Clock } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;
const typeIcons = { experience: Briefcase, referral: GraduationCap, internship: BookOpen };
const typeLabels = { experience: 'Career Experience', referral: 'Job Referral', internship: 'Internship Opportunity' };

export default function BlogFeedPage() {
  const { getToken, profile } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchBlogs();
  }, [filter]);

  const fetchBlogs = async () => {
    try {
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API}/api/blogs-feed${filter ? `?type=${filter}` : ''}`, { headers });
      const data = await res.json();
      setBlogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (blogId) => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/blogs/${blogId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBlogs(prev => prev.map(b =>
        b.id === blogId ? { ...b, user_liked: data.liked, likes_count: b.likes_count + (data.liked ? 1 : -1) } : b
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = (blog) => {
    const url = `${window.location.origin}/blog/${blog.id}`;
    if (navigator.share) {
      navigator.share({ title: blog.title, text: blog.content?.substring(0, 100), url });
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6" data-testid="blog-feed-page">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-heading text-3xl font-light">Community <span className="font-semibold">Feed</span></h1>
            <p className="text-white/40 mt-1 text-sm">Career insights, referrals, and opportunities from alumni</p>
          </div>
          {profile?.role === 'alumni' && profile?.status === 'active' && (
            <Link to="/alumni/blogs" className="btn-primary text-sm" data-testid="write-post-btn">Write a Post</Link>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {[
            { value: '', label: 'All Posts' },
            { value: 'experience', label: 'Experiences' },
            { value: 'referral', label: 'Referrals' },
            { value: 'internship', label: 'Internships' },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => { setFilter(f.value); setLoading(true); }}
              className={`text-sm px-4 py-2 rounded-md transition-colors ${filter === f.value ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/10'}`}
              data-testid={`filter-${f.value || 'all'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Posts */}
        {loading ? (
          <div className="text-center py-16"><Loader2 className="w-6 h-6 animate-spin mx-auto text-white/40" /></div>
        ) : blogs.length === 0 ? (
          <div className="glass-panel p-16 text-center">
            <p className="text-white/30">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {blogs.map((blog) => {
              const Icon = typeIcons[blog.type] || BookOpen;
              const isPremium = (blog.author?.score || 0) > 20;
              return (
                <article key={blog.id} className="glass-panel overflow-hidden" data-testid={`feed-post-${blog.id}`}>
                  {/* Author Header */}
                  <div className="p-5 pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium shrink-0">
                        {blog.author?.full_name?.[0] || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{blog.author?.full_name}</span>
                          {isPremium && (
                            <span className="flex items-center gap-0.5 text-[10px] bg-white text-black px-1.5 py-0.5 rounded-sm font-medium">
                              <Zap className="w-2.5 h-2.5" /> PRO
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/30">
                          <span>{blog.author?.department}</span>
                          <span>&middot;</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(blog.created_at)}</span>
                        </div>
                      </div>
                      <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-white/5 text-white/40">
                        <Icon className="w-3.5 h-3.5" />
                        {typeLabels[blog.type] || blog.type}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <Link to={`/blog/${blog.id}`} className="block p-5" data-testid={`post-link-${blog.id}`}>
                    <h2 className="font-heading text-lg font-medium mb-2 hover:text-white/80 transition-colors">{blog.title}</h2>
                    <p className="text-sm text-white/40 leading-relaxed line-clamp-4">{blog.content}</p>
                  </Link>

                  {/* Actions */}
                  <div className="px-5 pb-4 flex items-center gap-6 border-t border-white/5 pt-3">
                    <button
                      onClick={() => handleLike(blog.id)}
                      className={`flex items-center gap-1.5 text-sm transition-colors ${blog.user_liked ? 'text-red-400' : 'text-white/30 hover:text-white/60'}`}
                      data-testid={`like-btn-${blog.id}`}
                    >
                      <Heart className={`w-4 h-4 ${blog.user_liked ? 'fill-current' : ''}`} />
                      <span>{blog.likes_count || 0}</span>
                    </button>
                    <Link
                      to={`/blog/${blog.id}`}
                      className="flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition-colors"
                      data-testid={`comment-link-${blog.id}`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{blog.comments_count || 0}</span>
                    </Link>
                    <button
                      onClick={() => handleShare(blog)}
                      className="flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition-colors"
                      data-testid={`share-btn-${blog.id}`}
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
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
