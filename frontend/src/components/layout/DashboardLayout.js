import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Users, MessageSquare, BookOpen, Trophy, FileText, LogOut, UserCheck, Zap, Rss, BarChart3 } from 'lucide-react';

const studentLinks = [
  { to: '/student', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/student/mentors', label: 'Find Mentors', icon: Users },
  { to: '/student/connections', label: 'Connections', icon: MessageSquare },
  { to: '/student/feed', label: 'Community Feed', icon: Rss },
  { to: '/student/knowledge-hub', label: 'Knowledge Hub', icon: BookOpen },
];

const alumniLinks = [
  { to: '/alumni', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/alumni/requests', label: 'Requests', icon: UserCheck },
  { to: '/alumni/connections', label: 'Connections', icon: MessageSquare },
  { to: '/alumni/feed', label: 'Community Feed', icon: Rss },
  { to: '/alumni/blogs', label: 'Write Blog', icon: FileText },
  { to: '/alumni/leaderboard', label: 'Leaderboard', icon: Trophy },
];

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/verify', label: 'Verify Alumni', icon: UserCheck },
  { to: '/admin/users', label: 'Manage Users', icon: Users },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/feed', label: 'Community Feed', icon: Rss },
];

export default function DashboardLayout({ children }) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const links = profile?.role === 'admin' ? adminLinks : profile?.role === 'alumni' ? alumniLinks : studentLinks;
  const isPremium = profile?.role === 'alumni' && (profile?.score || 0) > 20;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 flex flex-col fixed h-screen" data-testid="sidebar">
        <div className="p-6 border-b border-white/5">
          <Link to="/" className="font-heading text-lg font-semibold tracking-tight">
            Invertis<span className="text-white/50">Connect</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  isActive ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                }`}
                data-testid={`nav-${link.label.toLowerCase().replace(/\s/g, '-')}`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/5 space-y-3">
          {profile && (
            <div className="glass-panel p-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium">
                  {profile.full_name?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{profile.full_name}</p>
                  <p className="text-xs text-white/30 flex items-center gap-1">
                    {profile.role}
                    {isPremium && <Zap className="w-3 h-3 text-white" />}
                    {profile.role === 'alumni' && <span className="ml-1">/ {profile.score || 0} pts</span>}
                  </p>
                </div>
              </div>
            </div>
          )}
          <button onClick={handleSignOut} className="flex items-center gap-2 text-sm text-white/30 hover:text-white/60 transition-colors w-full px-3 py-2" data-testid="sidebar-signout-btn">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        <div className="p-8 lg:p-12 max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}
