import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { GraduationCap, Briefcase, ArrowLeft, ArrowRight } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;
const departments = ['CSE', 'ME', 'ECE', 'EE', 'CE', 'IT'];

export default function OnboardingPage() {
  const { user, profile, loading, getToken, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [formData, setFormData] = useState({ full_name: '', department: '', alumni_id: '', linkedin_url: '', bio: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate('/auth/login');
    if (!loading && profile) navigate(`/${profile.role}`);
  }, [loading, user, profile, navigate]);

  if (loading || !user || profile) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" /></div>;
  }

  const handleSubmit = async () => {
    if (!formData.full_name.trim() || !formData.department) {
      setError('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const token = getToken();
      const res = await fetch(`${API}/api/users/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...formData, role }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to create profile');
      }
      await refreshProfile();
      navigate(role === 'alumni' ? '/pending-approval' : '/student');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="glass-panel p-8 sm:p-10 max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="font-heading text-3xl font-semibold tracking-tight">Welcome</h1>
            <p className="text-white/40 mt-2 text-sm">How will you use InvertisConnect?</p>
          </div>
          <div className="space-y-4">
            <button
              onClick={() => { setRole('student'); setStep(2); }}
              className="w-full glass-panel-hover p-6 text-left group"
              data-testid="role-student-btn"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                  <GraduationCap className="w-6 h-6 text-white/60" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-medium">I'm a Student</h3>
                  <p className="text-white/30 text-sm mt-0.5">Connect with alumni mentors from your department</p>
                </div>
              </div>
            </button>
            <button
              onClick={() => { setRole('alumni'); setStep(2); }}
              className="w-full glass-panel-hover p-6 text-left group"
              data-testid="role-alumni-btn"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                  <Briefcase className="w-6 h-6 text-white/60" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-medium">I'm an Alumni</h3>
                  <p className="text-white/30 text-sm mt-0.5">Guide students and build your mentorship profile</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="glass-panel p-8 sm:p-10 max-w-md w-full space-y-6">
        <div>
          <button onClick={() => setStep(1)} className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors mb-6" data-testid="back-to-role-btn">
            <ArrowLeft className="w-4 h-4" /> Change role
          </button>
          <h1 className="font-heading text-2xl font-semibold">
            {role === 'student' ? 'Student' : 'Alumni'} Profile
          </h1>
          <p className="text-white/40 mt-1 text-sm">Complete your profile to continue</p>
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/20 rounded-md px-4 py-3 text-red-400 text-sm" data-testid="onboarding-error">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-white/30 uppercase tracking-wider mb-2">Full Name *</label>
            <input value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} placeholder="Your full name" className="input-noir w-full" data-testid="onboarding-name-input" />
          </div>
          <div>
            <label className="block text-xs text-white/30 uppercase tracking-wider mb-2">Department *</label>
            <select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="input-noir w-full" data-testid="onboarding-department-select">
              <option value="">Select department</option>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          {role === 'alumni' && (
            <>
              <div className="glass-panel p-3 text-xs text-white/30">
                Your Alumni ID will be auto-generated upon registration.
              </div>
              <div>
                <label className="block text-xs text-white/30 uppercase tracking-wider mb-2">LinkedIn (optional)</label>
                <input value={formData.linkedin_url} onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })} placeholder="https://linkedin.com/in/you" className="input-noir w-full" data-testid="onboarding-linkedin-input" />
              </div>
              <div>
                <label className="block text-xs text-white/30 uppercase tracking-wider mb-2">Bio (optional)</label>
                <textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows={3} placeholder="Brief introduction..." className="input-noir w-full resize-none" data-testid="onboarding-bio-input" />
              </div>
            </>
          )}
        </div>
        <button onClick={handleSubmit} disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50" data-testid="onboarding-submit-btn">
          {submitting ? 'Creating Profile...' : 'Complete Setup'}
          {!submitting && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
