import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Users, FileText, TrendingUp, BarChart3, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const API = process.env.REACT_APP_BACKEND_URL;
const COLORS = ['#ffffff', '#a1a1aa', '#71717a', '#52525b', '#3f3f46', '#27272a'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 border border-white/10 rounded-md px-3 py-2 text-sm">
        <p className="text-white/60">{label}</p>
        <p className="text-white font-medium">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const { getToken, session } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = session?.access_token;
    if (!token) return;
    setLoading(true);
    Promise.all([
      fetch(`${API}/api/admin/analytics`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([a, s]) => {
      setAnalytics(a);
      setStats(s);
    }).catch(console.error).finally(() => setLoading(false));
  }, [session]);

  if (loading) {
    return <DashboardLayout><div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-white/40" /></div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="analytics-page">
        <div>
          <h1 className="font-heading text-3xl font-light">Platform <span className="font-semibold">Analytics</span></h1>
          <p className="text-white/40 mt-1 text-sm">Detailed insights into InvertisConnect usage</p>
        </div>

        {/* Summary Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: stats.total_users, icon: Users },
              { label: 'Active Alumni', value: stats.active_alumni, icon: Users },
              { label: 'Students', value: stats.total_students, icon: Users },
              { label: 'Active Connections', value: stats.active_connections, icon: TrendingUp },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="glass-panel p-5" data-testid={`analytics-stat-${s.label.toLowerCase().replace(/\s/g, '-')}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/30 uppercase tracking-wider">{s.label}</p>
                      <p className="text-2xl font-heading font-semibold mt-1">{s.value}</p>
                    </div>
                    <Icon className="w-6 h-6 text-white/10" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Distribution */}
            <div className="glass-panel p-6" data-testid="chart-department">
              <h3 className="font-heading font-medium mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-white/40" /> Users by Department
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={analytics.department_distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="rgba(255,255,255,0.8)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Role Distribution */}
            <div className="glass-panel p-6" data-testid="chart-roles">
              <h3 className="font-heading font-medium mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-white/40" /> User Roles
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={analytics.role_distribution} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {analytics.role_distribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(value) => <span className="text-white/50 text-xs capitalize">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Connection Stats */}
            <div className="glass-panel p-6" data-testid="chart-connections">
              <h3 className="font-heading font-medium mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-white/40" /> Connection Status
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={analytics.connection_stats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="rgba(255,255,255,0.6)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Blog Stats */}
            <div className="glass-panel p-6" data-testid="chart-blogs">
              <h3 className="font-heading font-medium mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-white/40" /> Blog Posts by Type
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={analytics.blog_stats} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {analytics.blog_stats.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(value) => <span className="text-white/50 text-xs capitalize">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Top Alumni */}
        {analytics?.top_alumni?.length > 0 && (
          <div className="glass-panel p-6" data-testid="top-alumni-table">
            <h3 className="font-heading font-medium mb-4">Top Performing Alumni</h3>
            <div className="space-y-2">
              {analytics.top_alumni.map((a, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-md bg-white/[0.02]">
                  <span className="text-lg font-heading font-bold text-white/20 w-6">{i + 1}</span>
                  <div className="flex-1">
                    <span className="text-sm font-medium">{a.full_name}</span>
                    <span className="text-xs text-white/30 ml-2">{a.department}</span>
                  </div>
                  <span className="text-sm font-heading font-semibold">{a.score} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
