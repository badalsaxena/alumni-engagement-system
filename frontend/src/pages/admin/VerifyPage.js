import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Check, X, ExternalLink, Loader2 } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export default function VerifyPage() {
  const { getToken } = useAuth();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    const token = getToken();
    try {
      const res = await fetch(`${API}/api/admin/pending-alumni`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setPending(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId, approve) => {
    setProcessing(userId);
    const token = getToken();
    try {
      await fetch(`${API}/api/admin/verify/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ approve }),
      });
      setPending(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="verify-page">
        <div>
          <h1 className="font-heading text-3xl font-light">Verify <span className="font-semibold">Alumni</span></h1>
          <p className="text-white/40 mt-1 text-sm">Review and approve pending alumni registrations</p>
        </div>
        {loading ? (
          <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-white/40" /></div>
        ) : pending.length === 0 ? (
          <div className="glass-panel p-12 text-center" data-testid="no-pending">
            <p className="text-white/30">No pending verifications</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((alumni) => (
              <div key={alumni.id} className="glass-panel p-6" data-testid={`alumni-${alumni.id}`}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-heading text-lg font-medium">{alumni.full_name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-sm bg-white/5 text-white/40">{alumni.department}</span>
                    </div>
                    <p className="text-sm text-white/30 mt-1">{alumni.email}</p>
                    <p className="text-sm text-white/30 mt-2">
                      Alumni ID: <span className="text-white font-mono text-xs">{alumni.alumni_id}</span>
                    </p>
                    {alumni.linkedin_url && (
                      <a href={alumni.linkedin_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-white/30 hover:text-white/60 mt-2">
                        <ExternalLink className="w-3.5 h-3.5" /> LinkedIn
                      </a>
                    )}
                    {alumni.bio && <p className="text-sm text-white/40 mt-2">{alumni.bio}</p>}
                    <p className="text-xs text-white/15 mt-3">Applied {new Date(alumni.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleVerify(alumni.id, true)}
                      disabled={processing === alumni.id}
                      className="btn-primary text-sm flex items-center gap-1.5"
                      data-testid={`approve-btn-${alumni.id}`}
                    >
                      <Check className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => handleVerify(alumni.id, false)}
                      disabled={processing === alumni.id}
                      className="btn-secondary text-sm flex items-center gap-1.5 text-red-400 border-red-500/20 hover:bg-red-500/10"
                      data-testid={`reject-btn-${alumni.id}`}
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
