import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Send, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export default function BlogsPage() {
  const { getToken } = useAuth();
  const [formData, setFormData] = useState({ title: '', content: '', type: 'experience' });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.title.length < 5 || formData.content.length < 50) {
      setResult({ success: false, message: 'Title must be 5+ chars, content 50+ chars' });
      return;
    }
    setSubmitting(true);
    setResult(null);
    try {
      const token = getToken();
      const res = await fetch(`${API}/api/blogs/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setResult({ success: true, message: 'Blog published successfully! (+3 pts)' });
        setFormData({ title: '', content: '', type: 'experience' });
      } else {
        setResult({ success: false, message: data.reason || 'Blog was rejected by AI moderation' });
      }
    } catch (err) {
      setResult({ success: false, message: 'Failed to create blog post' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-8" data-testid="blogs-page">
        <div>
          <h1 className="font-heading text-3xl font-light">Share <span className="font-semibold">Knowledge</span></h1>
          <p className="text-white/40 mt-1 text-sm">Write about career experiences, referrals, or opportunities</p>
        </div>
        {result && (
          <div className={`glass-panel p-4 flex items-center gap-3 ${result.success ? 'border-green-500/20' : 'border-red-500/20'}`} data-testid="blog-result">
            {result.success ? <CheckCircle className="w-5 h-5 text-green-400 shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
            <p className={`text-sm ${result.success ? 'text-green-400' : 'text-red-400'}`}>{result.message}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="glass-panel p-6 space-y-5">
          <div>
            <label className="block text-xs text-white/30 uppercase tracking-wider mb-2">Post Type</label>
            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="input-noir w-full" data-testid="blog-type-select">
              <option value="experience">Career Experience</option>
              <option value="referral">Job Referral</option>
              <option value="internship">Internship Opportunity</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-white/30 uppercase tracking-wider mb-2">Title</label>
            <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., My journey from CSE to Google" className="input-noir w-full" data-testid="blog-title-input" />
          </div>
          <div>
            <label className="block text-xs text-white/30 uppercase tracking-wider mb-2">Content</label>
            <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={8} placeholder="Share your insights, advice, or opportunity details..." className="input-noir w-full resize-none" data-testid="blog-content-input" />
          </div>
          <div className="text-xs text-white/20 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            Posts are reviewed by AI for relevance. Off-topic or inappropriate content will be automatically rejected.
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2" data-testid="blog-submit-btn">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {submitting ? 'Publishing...' : 'Publish Post'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
