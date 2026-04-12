import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { MessageSquare, Clock, Check, X, Loader2 } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export default function StudentConnectionsPage() {
  const { getToken } = useAuth();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${API}/api/connections/my`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setConnections(d.as_student || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [getToken]);

  const statusIcon = (s) => {
    if (s === 'accepted') return <Check className="w-4 h-4 text-green-400" />;
    if (s === 'rejected') return <X className="w-4 h-4 text-red-400" />;
    return <Clock className="w-4 h-4 text-yellow-400" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="student-connections-page">
        <div>
          <h1 className="font-heading text-3xl font-light">Your <span className="font-semibold">Connections</span></h1>
          <p className="text-white/40 mt-1 text-sm">Manage your mentor connections</p>
        </div>
        {loading ? (
          <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-white/40" /></div>
        ) : connections.length === 0 ? (
          <div className="glass-panel p-12 text-center">
            <p className="text-white/30">No connections yet</p>
            <Link to="/student/mentors" className="btn-primary text-sm mt-4 inline-block" data-testid="find-mentors-btn">Find Mentors</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {connections.map((conn) => (
              <div key={conn.id} className="glass-panel p-5 flex items-center justify-between" data-testid={`connection-${conn.id}`}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-medium">
                    {conn.alumni?.full_name?.[0] || '?'}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{conn.alumni?.full_name || 'Alumni'}</h3>
                    <p className="text-xs text-white/30">{conn.alumni?.department} &middot; {conn.alumni?.score || 0} pts</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-xs capitalize">
                    {statusIcon(conn.status)} {conn.status}
                  </span>
                  {conn.status === 'accepted' && (
                    <Link to={`/student/chat/${conn.id}`} className="btn-secondary text-xs flex items-center gap-1.5" data-testid={`chat-btn-${conn.id}`}>
                      <MessageSquare className="w-3.5 h-3.5" /> Chat
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
