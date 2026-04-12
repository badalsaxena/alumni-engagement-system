import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { MessageSquare, Check, Clock, Loader2 } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export default function AlumniConnectionsPage() {
  const { getToken } = useAuth();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${API}/api/connections/my`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setConnections((d.as_alumni || []).filter(c => c.status === 'accepted')))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [getToken]);

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="alumni-connections-page">
        <div>
          <h1 className="font-heading text-3xl font-light">Your <span className="font-semibold">Mentees</span></h1>
          <p className="text-white/40 mt-1 text-sm">Manage your mentorship connections</p>
        </div>
        {loading ? (
          <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-white/40" /></div>
        ) : connections.length === 0 ? (
          <div className="glass-panel p-12 text-center text-white/30">No active mentees yet</div>
        ) : (
          <div className="space-y-3">
            {connections.map((conn) => (
              <div key={conn.id} className="glass-panel p-5 flex items-center justify-between" data-testid={`connection-${conn.id}`}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-medium">
                    {conn.student?.full_name?.[0] || '?'}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{conn.student?.full_name || 'Student'}</h3>
                    <p className="text-xs text-white/30">{conn.student?.department}</p>
                  </div>
                </div>
                <Link to={`/alumni/chat/${conn.id}`} className="btn-secondary text-xs flex items-center gap-1.5" data-testid={`chat-btn-${conn.id}`}>
                  <MessageSquare className="w-3.5 h-3.5" /> Chat
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
