import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Heart, MessageCircle, Share2, ArrowLeft, Send, Zap, Clock, Briefcase, GraduationCap, BookOpen, Loader2 } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;
const typeLabels = { experience: 'Career Experience', referral: 'Job Referral', internship: 'Internship Opportunity' };
const typeIcons = { experience: Briefcase, referral: GraduationCap, internship: BookOpen };

export default function BlogDetailPage() {
  const { blogId } = useParams();
  const { getToken, user, profile } = useAuth();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBlog();
  }, [blogId]);

  const fetchBlog = async () => {
    try {
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API}/api/blogs/${blogId}`, { headers });
      if (res.ok) setBlog(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/blogs/${blogId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBlog(prev => ({ ...prev, user_liked: data.liked, likes_count: prev.likes_count + (data.liked ? 1 : -1) }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const token = getToken();
      await fetch(`${API}/api/blogs/${blogId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: comment.trim() }),
      });
      setComment('');
      await fetchBlog();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: blog?.title, url });
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

  if (loading) {
    return <DashboardLayout><div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-white/40" /></div></DashboardLayout>;
  }

  if (!blog) {
    return <DashboardLayout><div className="glass-panel p-12 text-center text-white/30">Blog post not found</div></DashboardLayout>;
  }

  const Icon = typeIcons[blog.type] || BookOpen;
  const isPremium = (blog.author?.score || 0) > 20;

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6" data-testid="blog-detail-page">
        <Link to={`/${profile?.role === 'admin' ? 'admin' : profile?.role}/feed`} className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors" data-testid="back-to-feed">
          <ArrowLeft className="w-4 h-4" /> Back to Feed
        </Link>

        {/* Post */}
        <article className="glass-panel">
          {/* Author */}
          <div className="p-6 pb-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-lg font-medium">
                {blog.author?.full_name?.[0] || '?'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-medium">{blog.author?.full_name}</span>
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
                {blog.author?.bio && <p className="text-xs text-white/20 mt-1">{blog.author.bio}</p>}
              </div>
              <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-white/5 text-white/40">
                <Icon className="w-3.5 h-3.5" /> {typeLabels[blog.type]}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h1 className="font-heading text-2xl font-semibold mb-4">{blog.title}</h1>
            <div className="text-white/60 leading-relaxed whitespace-pre-wrap text-sm">{blog.content}</div>
          </div>

          {/* Actions */}
          <div className="px-6 pb-4 flex items-center gap-6 border-t border-white/5 pt-4">
            <button onClick={handleLike} className={`flex items-center gap-2 text-sm transition-colors ${blog.user_liked ? 'text-red-400' : 'text-white/30 hover:text-white/60'}`} data-testid="detail-like-btn">
              <Heart className={`w-5 h-5 ${blog.user_liked ? 'fill-current' : ''}`} />
              <span>{blog.likes_count || 0} {blog.likes_count === 1 ? 'like' : 'likes'}</span>
            </button>
            <span className="flex items-center gap-2 text-sm text-white/30">
              <MessageCircle className="w-5 h-5" />
              <span>{blog.comments_count || 0} comments</span>
            </span>
            <button onClick={handleShare} className="flex items-center gap-2 text-sm text-white/30 hover:text-white/60 transition-colors" data-testid="detail-share-btn">
              <Share2 className="w-5 h-5" /> Share
            </button>
          </div>
        </article>

        {/* Comment Form */}
        {user && (
          <form onSubmit={handleComment} className="glass-panel p-4 flex gap-3" data-testid="comment-form">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium shrink-0">
              {profile?.full_name?.[0] || '?'}
            </div>
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="input-noir flex-1 text-sm"
              data-testid="comment-input"
            />
            <button type="submit" disabled={!comment.trim() || submitting} className="btn-primary px-3 py-1.5 text-sm disabled:opacity-50" data-testid="comment-submit-btn">
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Comments */}
        <div className="space-y-3">
          <h3 className="font-heading text-lg font-medium">Comments ({blog.comments?.length || 0})</h3>
          {(blog.comments || []).length === 0 ? (
            <div className="glass-panel p-8 text-center text-white/30 text-sm">No comments yet. Be the first!</div>
          ) : (
            blog.comments.map((c) => (
              <div key={c.id} className="glass-panel p-4" data-testid={`comment-${c.id}`}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium shrink-0">
                    {c.user?.full_name?.[0] || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{c.user?.full_name}</span>
                      <span className="text-xs text-white/20">{c.user?.department}</span>
                      <span className="text-xs text-white/15">&middot; {timeAgo(c.created_at)}</span>
                    </div>
                    <p className="text-sm text-white/50">{c.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
