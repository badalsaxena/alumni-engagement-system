import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Users, UserCheck, FileText, Trophy, Zap, ArrowRight } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export default function AlumniDashboard() {
  const { profile, getToken } = useAuth();
  const [connections, setConnections] = useState({ as_alumni: [] });
  const isPremium = (profile?.score || 0) > 20;

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${API}/api/connections/my`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setConnections(d)).catch(() => {});
  }, [getToken]);

  const accepted = connections.as_alumni?.filter(c => c.status === 'accepted') || [];
  const pending = connections.as_alumni?.filter(c => c.status === 'pending') || [];

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="alumni-dashboard">
        <div>
          <h1 className="font-heading text-3xl sm:text-4xl font-light">
            Welcome, <span className="font-semibold">{profile?.full_name}</span>
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-white/40 text-sm">{profile?.department}</span>
            {isPremium && (
              <span className="flex items-center gap-1 text-xs bg-white text-black px-2 py-0.5 rounded-sm font-medium">
                <Zap className="w-3 h-3" /> Premium Mentor
              </span>
            )}
          </div>
        </div>
        {/* Score Card */}
        <div className="glass-panel p-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/30 uppercase tracking-wider">Mentor Score</p>
            <p className="text-4xl font-heading font-semibold mt-1">{profile?.score || 0}</p>
            <p className="text-xs text-white/20 mt-1">
              {isPremium ? 'Premium tier unlocked' : `${21 - (profile?.score || 0)} pts to Premium`}
            </p>
          </div>
          <div className="w-20 h-20 rounded-full border-2 border-white/10 flex items-center justify-center">
            <Trophy className={`w-8 h-8 ${isPremium ? 'text-white' : 'text-white/20'}`} />
          </div>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Active Mentees', value: accepted.length, icon: Users },
            { label: 'Pending Requests', value: pending.length, icon: UserCheck },
            { label: 'Score', value: profile?.score || 0, icon: Trophy },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="glass-panel p-6" data-testid={`stat-${s.label.toLowerCase().replace(/\s/g, '-')}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/30 uppercase tracking-wider">{s.label}</p>
                    <p className="text-3xl font-heading font-semibold mt-1">{s.value}</p>
                  </div>
                  <Icon className="w-8 h-8 text-white/10" />
                </div>
              </div>
            );
          })}
        </div>
        {/* Quick Actions */}
        {pending.length > 0 && (
          <div className="glass-panel p-5 border-yellow-500/20 flex items-center justify-between">
            <div>
              <h3 className="font-heading font-medium">Action Required</h3>
              <p className="text-sm text-white/40">{pending.length} student{pending.length > 1 ? 's' : ''} waiting for your response</p>
            </div>
            <Link to="/alumni/requests" className="btn-primary text-sm" data-testid="view-requests-link">Review</Link>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/alumni/blogs" className="glass-panel-hover p-6 flex items-center justify-between group" data-testid="write-blog-link">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                <FileText className="w-5 h-5 text-white/60" />
              </div>
              <div><h3 className="font-heading font-medium">Write a Blog</h3><p className="text-sm text-white/30">Share career experiences</p></div>
            </div>
            <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-white/60 transition-colors" />
          </Link>
          <Link to="/alumni/leaderboard" className="glass-panel-hover p-6 flex items-center justify-between group" data-testid="view-leaderboard-link">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                <Trophy className="w-5 h-5 text-white/60" />
              </div>
              <div><h3 className="font-heading font-medium">Leaderboard</h3><p className="text-sm text-white/30">See top mentors</p></div>
            </div>
            <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-white/60 transition-colors" />
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
