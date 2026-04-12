import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Clock, LogOut } from 'lucide-react';

export default function PendingApprovalPage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="glass-panel p-8 sm:p-10 max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto animate-float">
          <Clock className="w-10 h-10 text-white/40" />
        </div>
        <h1 className="font-heading text-2xl font-semibold" data-testid="pending-title">Pending Verification</h1>
        <p className="text-white/40 text-sm leading-relaxed">
          Your alumni account is under review. An administrator will verify your identity and approve your account shortly.
        </p>
        <div className="glass-panel p-4 text-left">
          <p className="text-xs text-white/20 uppercase tracking-wider mb-2">What happens next?</p>
          <ul className="space-y-2 text-sm text-white/40">
            <li className="flex items-start gap-2"><span className="text-white/20 mt-0.5">1.</span> Admin reviews your alumni credentials</li>
            <li className="flex items-start gap-2"><span className="text-white/20 mt-0.5">2.</span> Your account gets activated</li>
            <li className="flex items-start gap-2"><span className="text-white/20 mt-0.5">3.</span> You can start mentoring students</li>
          </ul>
        </div>
        <button onClick={handleSignOut} className="btn-secondary inline-flex items-center gap-2 text-sm" data-testid="signout-btn">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}
