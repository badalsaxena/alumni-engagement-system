import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Users, Clock, FileText, TrendingUp, ArrowRight, Loader2 } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export default function AdminDashboard() {
  const { profile, getToken } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${API}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [getToken]);

  const statCards = stats ? [
    { label: 'Total Users', value: stats.total_users, icon: Users },
    { label: 'Pending Approvals', value: stats.pending_alumni, icon: Clock, href: '/admin/verify' },
    { label: 'Published Blogs', value: stats.published_blogs, icon: FileText },
    { label: 'Active Connections', value: stats.active_connections, icon: TrendingUp },
    { label: 'Students', value: stats.total_students, icon: Users },
    { label: 'Active Alumni', value: stats.active_alumni, icon: Users },
  ] : [];

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="admin-dashboard">
        <div>
          <h1 className="font-heading text-3xl sm:text-4xl font-light">Admin <span className="font-semibold">Dashboard</span></h1>
          <p className="text-white/40 mt-2 text-sm">Overview of InvertisConnect platform</p>
        </div>
        {loading ? (
          <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-white/40" /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {statCards.map((stat) => {
                const Icon = stat.icon;
                const content = (
                  <div className="glass-panel-hover p-6" data-testid={`stat-${stat.label.toLowerCase().replace(/\s/g, '-')}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-white/30 uppercase tracking-wider">{stat.label}</p>
                        <p className="text-3xl font-heading font-semibold mt-1">{stat.value}</p>
                      </div>
                      <Icon className="w-8 h-8 text-white/10" />
                    </div>
                  </div>
                );
                return stat.href ? (
                  <Link key={stat.label} to={stat.href}>{content}</Link>
                ) : (
                  <div key={stat.label}>{content}</div>
                );
              })}
            </div>
            {stats?.pending_alumni > 0 && (
              <div className="glass-panel p-6 border-yellow-500/20 flex items-center justify-between" data-testid="pending-alert">
                <div>
                  <h3 className="font-heading font-medium">Action Required</h3>
                  <p className="text-sm text-white/40">{stats.pending_alumni} alumni waiting for verification</p>
                </div>
                <Link to="/admin/verify" className="btn-primary text-sm flex items-center gap-2" data-testid="review-now-btn">
                  Review Now <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
