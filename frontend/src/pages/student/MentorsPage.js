import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Search, Zap, MessageSquare, Calendar, ExternalLink, Loader2 } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export default function MentorsPage() {
  const { profile, getToken } = useAuth();
  const [alumni, setAlumni] = useState([]);
  const [smartMatches, setSmartMatches] = useState([]);
  const [connections, setConnections] = useState({});
  const [loading, setLoading] = useState(true);
  const [matchLoading, setMatchLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');

  const fetchData = useCallback(async () => {
    const token = getToken();
    try {
      const [alumniRes, connRes] = await Promise.all([
        fetch(`${API}/api/users/alumni`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/connections/my`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const alumniData = await alumniRes.json();
      const connData = await connRes.json();
      setAlumni(Array.isArray(alumniData) ? alumniData : []);
      const connMap = {};
      (connData.as_student || []).forEach(c => { connMap[c.alumni_id || c.alumni?.id] = c.status; });
      setConnections(connMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSmartMatch = async () => {
    setMatchLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API}/api/ai/smart-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSmartMatches(data.mentors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setMatchLoading(false);
    }
  };

  const handleConnect = async (alumniId) => {
    const token = getToken();
    try {
      await fetch(`${API}/api/connections/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ alumni_id: alumniId }),
      });
      setConnections(prev => ({ ...prev, [alumniId]: 'pending' }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookSession = async (mentorId) => {
    const token = getToken();
    try {
      const res = await fetch(`${API}/api/stripe/create-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mentor_id: mentorId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = alumni.filter(a => {
    if (search && !a.full_name.toLowerCase().includes(search.toLowerCase())) return false;
    if (dept && a.department !== dept) return false;
    return true;
  });

  const MentorCard = ({ mentor, matchInfo }) => {
    const isPremium = (mentor.score || 0) > 20;
    const connStatus = connections[mentor.id];
    return (
      <div className={`glass-panel p-6 ${isPremium ? 'border-white/20' : ''}`} data-testid={`mentor-card-${mentor.id}`}>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-xl font-medium shrink-0">
            {mentor.full_name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-heading font-medium">{mentor.full_name}</h3>
              {isPremium && (
                <span className="flex items-center gap-1 text-xs bg-white text-black px-2 py-0.5 rounded-sm font-medium">
                  <Zap className="w-3 h-3" /> Premium
                </span>
              )}
            </div>
            <p className="text-sm text-white/30 mt-0.5">{mentor.department} &middot; {mentor.score || 0} pts</p>
            {mentor.bio && <p className="text-sm text-white/40 mt-2 line-clamp-2">{mentor.bio}</p>}
            {matchInfo && (
              <div className="mt-2 text-xs text-white/50 bg-white/5 rounded-md px-3 py-2">
                AI Match: {matchInfo.matchScore}% &middot; {matchInfo.matchReason}
              </div>
            )}
            {mentor.linkedin_url && (
              <a href={mentor.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-white/30 hover:text-white/60 mt-2">
                <ExternalLink className="w-3 h-3" /> LinkedIn
              </a>
            )}
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          {!connStatus && (
            <button onClick={() => handleConnect(mentor.id)} className="btn-secondary text-sm flex-1 flex items-center justify-center gap-2" data-testid={`connect-btn-${mentor.id}`}>
              <MessageSquare className="w-4 h-4" /> Request to Connect
            </button>
          )}
          {connStatus === 'pending' && <button disabled className="btn-secondary text-sm flex-1 opacity-50 cursor-not-allowed">Request Pending</button>}
          {connStatus === 'accepted' && (
            <button className="btn-secondary text-sm flex-1 flex items-center justify-center gap-2">
              <MessageSquare className="w-4 h-4" /> Open Chat
            </button>
          )}
          {isPremium && (
            <button onClick={() => handleBookSession(mentor.id)} className="btn-primary text-sm flex items-center gap-2" data-testid={`book-btn-${mentor.id}`}>
              <Calendar className="w-4 h-4" /> Book Session
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="mentors-page">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-heading text-3xl font-light">Find <span className="font-semibold">Mentors</span></h1>
            <p className="text-white/40 mt-1 text-sm">Browse verified alumni from your university</p>
          </div>
          <button onClick={handleSmartMatch} disabled={matchLoading} className="btn-primary text-sm flex items-center gap-2" data-testid="smart-match-btn">
            {matchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            AI Smart Match
          </button>
        </div>
        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name..." className="input-noir w-full pl-10" data-testid="mentor-search-input" />
          </div>
          <select value={dept} onChange={(e) => setDept(e.target.value)} className="input-noir" data-testid="mentor-dept-filter">
            <option value="">All Departments</option>
            {['CSE', 'ME', 'ECE', 'EE', 'CE', 'IT'].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        {/* Smart Matches */}
        {smartMatches.length > 0 && (
          <div>
            <h2 className="font-heading text-lg font-medium mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" /> AI Recommended
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {smartMatches.map(m => <MentorCard key={m.id} mentor={m} matchInfo={m} />)}
            </div>
          </div>
        )}
        {/* All Mentors */}
        <div>
          <h2 className="font-heading text-lg font-medium mb-4">
            {dept ? `${dept} Alumni` : 'All Alumni'} ({filtered.length})
          </h2>
          {loading ? (
            <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-white/40" /></div>
          ) : filtered.length === 0 ? (
            <div className="glass-panel p-12 text-center text-white/30">No alumni found</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filtered.map(a => <MentorCard key={a.id} mentor={a} />)}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
