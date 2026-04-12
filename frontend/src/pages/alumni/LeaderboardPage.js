import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Crown, Star, Zap, Loader2 } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/users/leaderboard`)
      .then(r => r.json())
      .then(d => setLeaders(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="leaderboard-page">
        <div>
          <h1 className="font-heading text-3xl font-light flex items-center gap-3">
            <Crown className="w-8 h-8 text-white/60" />
            <span>Top <span className="font-semibold">Mentors</span></span>
          </h1>
          <p className="text-white/40 mt-1 text-sm">Alumni ranked by mentorship engagement</p>
        </div>
        {loading ? (
          <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-white/40" /></div>
        ) : leaders.length === 0 ? (
          <div className="glass-panel p-12 text-center text-white/30">No alumni on the leaderboard yet</div>
        ) : (
          <div className="space-y-3">
            {leaders.map((user, i) => {
              const isPremium = (user.score || 0) > 20;
              return (
                <div
                  key={user.id}
                  className={`glass-panel p-5 flex items-center gap-4 transition-all ${isPremium ? 'border-white/20 bg-white/[0.05]' : ''}`}
                  data-testid={`leaderboard-${i}`}
                >
                  <span className={`text-2xl font-heading font-bold w-8 text-center ${i < 3 ? 'text-white' : 'text-white/20'}`}>
                    {i + 1}
                  </span>
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-lg font-medium shrink-0">
                    {user.full_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-heading font-medium truncate">{user.full_name}</span>
                      {isPremium && (
                        <span className="flex items-center gap-1 text-xs bg-white text-black px-2 py-0.5 rounded-sm font-medium">
                          <Zap className="w-3 h-3" /> Premium
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-white/30">{user.department}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white">
                    <Star className="w-4 h-4 text-white/60" />
                    <span className="font-heading font-semibold text-lg">{user.score || 0}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="glass-panel p-6">
          <h3 className="font-heading font-medium mb-3">How to earn points</h3>
          <div className="space-y-2 text-sm text-white/40">
            <p>Accept a connection request: <span className="text-white">+5 pts</span></p>
            <p>Publish a blog post: <span className="text-white">+3 pts</span></p>
            <p>Score above 20 unlocks <span className="text-white font-medium">Premium Mentor</span> status with paid session feature</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
