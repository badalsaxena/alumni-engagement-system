import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) throw authError;
      if (data.user && !data.session) {
        setSuccess(true);
      } else {
        navigate('/onboarding');
      }
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="glass-panel p-8 sm:p-10 max-w-md w-full text-center space-y-6" data-testid="signup-success">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-white/60" />
          </div>
          <h2 className="font-heading text-2xl font-semibold">Check your email</h2>
          <p className="text-white/40 text-sm">We've sent a confirmation link to <span className="text-white">{email}</span>. Click the link to activate your account.</p>
          <Link to="/auth/login" className="btn-secondary inline-block text-sm" data-testid="goto-login-btn">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="relative z-10 glass-panel p-8 sm:p-10 max-w-md w-full space-y-8">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors mb-8" data-testid="back-link">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Create account</h1>
          <p className="text-white/40 mt-2 font-body text-sm">Join the AlumniConnect community</p>
        </div>
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-md px-4 py-3 text-red-400 text-sm" data-testid="signup-error">
            {error}
          </div>
        )}
        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="block text-xs text-white/30 uppercase tracking-wider mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@invertis.edu" required className="input-noir w-full pl-10" data-testid="signup-email-input" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/30 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required className="input-noir w-full pl-10 pr-10" data-testid="signup-password-input" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/30 uppercase tracking-wider mb-2">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat your password" required className="input-noir w-full pl-10" data-testid="signup-confirm-password-input" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50" data-testid="signup-submit-btn">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-sm text-white/30">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-white hover:text-white/80 transition-colors" data-testid="login-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
