import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Trash2, Search, Loader2 } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export default function UsersPage() {
  const { getToken } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchUsers = useCallback(async () => {
    const token = getToken();
    let url = `${API}/api/admin/users?`;
    if (roleFilter) url += `role=${roleFilter}&`;
    if (deptFilter) url += `department=${deptFilter}&`;
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, deptFilter, getToken]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    const token = getToken();
    try {
      await fetch(`${API}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = users.filter(u => {
    if (search && !u.full_name?.toLowerCase().includes(search.toLowerCase()) && !u.email?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="users-page">
        <div>
          <h1 className="font-heading text-3xl font-light">Manage <span className="font-semibold">Users</span></h1>
          <p className="text-white/40 mt-1 text-sm">View and manage all platform users</p>
        </div>
        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="input-noir w-full pl-10" data-testid="user-search" />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-noir" data-testid="user-role-filter">
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="alumni">Alumni</option>
            <option value="admin">Admins</option>
          </select>
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="input-noir" data-testid="user-dept-filter">
            <option value="">All Departments</option>
            {['CSE', 'ME', 'ECE', 'EE', 'CE', 'IT'].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        {/* Users Table */}
        {loading ? (
          <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-white/40" /></div>
        ) : (
          <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="users-table">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left p-4 text-xs text-white/30 uppercase tracking-wider font-medium">Name</th>
                    <th className="text-left p-4 text-xs text-white/30 uppercase tracking-wider font-medium">Email</th>
                    <th className="text-left p-4 text-xs text-white/30 uppercase tracking-wider font-medium">Role</th>
                    <th className="text-left p-4 text-xs text-white/30 uppercase tracking-wider font-medium">Dept</th>
                    <th className="text-left p-4 text-xs text-white/30 uppercase tracking-wider font-medium">Status</th>
                    <th className="text-left p-4 text-xs text-white/30 uppercase tracking-wider font-medium">Score</th>
                    <th className="text-right p-4 text-xs text-white/30 uppercase tracking-wider font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02]" data-testid={`user-row-${u.id}`}>
                      <td className="p-4 text-sm">{u.full_name}</td>
                      <td className="p-4 text-sm text-white/40">{u.email}</td>
                      <td className="p-4"><span className="text-xs px-2 py-0.5 rounded-sm bg-white/5 capitalize">{u.role}</span></td>
                      <td className="p-4 text-sm text-white/40">{u.department}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-0.5 rounded-sm ${u.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm">{u.score || 0}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDelete(u.id)} className="text-white/20 hover:text-red-400 transition-colors" data-testid={`delete-user-${u.id}`}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="p-12 text-center text-white/30 text-sm">No users found</div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
