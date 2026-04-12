import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Check, X, Loader2 } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export default function RequestsPage() {
  const { getToken } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${API}/api/connections/my`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setRequests((d.as_alumni || []).filter(c => c.status === 'pending')))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [getToken]);

  const handleUpdate = async (connId, status) => {
    setProcessing(connId);
    const token = getToken();
    try {
      await fetch(`${API}/api/connections/${connId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      setRequests(prev => prev.filter(r => r.id !== connId));
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="requests-page">
        <div>
          <h1 className="font-heading text-3xl font-light">Connection <span className="font-semibold">Requests</span></h1>
          <p className="text-white/40 mt-1 text-sm">Review and respond to student mentorship requests</p>
        </div>
        {loading ? (
          <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-white/40" /></div>
        ) : requests.length === 0 ? (
          <div className="glass-panel p-12 text-center text-white/30" data-testid="no-requests">No pending requests</div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div key={req.id} className="glass-panel p-5 flex items-center justify-between" data-testid={`request-${req.id}`}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-medium">
                    {req.student?.full_name?.[0] || '?'}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{req.student?.full_name || 'Student'}</h3>
                    <p className="text-xs text-white/30">{req.student?.department} &middot; {new Date(req.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdate(req.id, 'accepted')}
                    disabled={processing === req.id}
                    className="btn-primary text-sm flex items-center gap-1.5"
                    data-testid={`accept-btn-${req.id}`}
                  >
                    <Check className="w-4 h-4" /> Accept
                  </button>
                  <button
                    onClick={() => handleUpdate(req.id, 'rejected')}
                    disabled={processing === req.id}
                    className="btn-secondary text-sm flex items-center gap-1.5 text-red-400 border-red-500/20 hover:bg-red-500/10"
                    data-testid={`reject-btn-${req.id}`}
                  >
                    <X className="w-4 h-4" /> Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
