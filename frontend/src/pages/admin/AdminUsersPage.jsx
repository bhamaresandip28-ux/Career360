import { useState, useEffect } from 'react';
import analyticsService from '../../services/analytics.service';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

export default function AdminUsersPage() {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [roleFilter, setRoleFilter]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [togglingId, setTogglingId]     = useState(null);
  const [feedback, setFeedback]         = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const list = await analyticsService.getUsers();
      setUsers(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setTogglingId(user.id);
    setFeedback(null);
    try {
      await analyticsService.updateUserStatus(user.id, newStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
      );
      setFeedback({ type: 'success', text: `User ${user.name} is now ${newStatus}.` });
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || err.message || 'Failed to update user status.' });
    } finally {
      setTogglingId(null);
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    const matchesStatus = !statusFilter || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display font-bold text-2xl text-white">Platform User Administration</h2>
        <p className="text-slate-400 text-sm">Manage user accounts, roles, access permissions, and account activation states.</p>
      </div>

      {feedback && (
        <div className={`p-3 rounded-xl text-xs flex items-center justify-between ${
          feedback.type === 'success'
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            : 'bg-danger-500/10 border border-danger-500/20 text-danger-400'
        }`}>
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Filter bar */}
      <div className="glass p-4 rounded-xl border border-white/5 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="w-64">
            <Input
              placeholder="Search user name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="bg-surface-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary-500"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="STUDENT">STUDENT</option>
            <option value="FACULTY">FACULTY</option>
            <option value="PLACEMENT_COORDINATOR">PLACEMENT_COORDINATOR</option>
            <option value="ADMIN">ADMIN</option>
          </select>

          <select
            className="bg-surface-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Account Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>

        <span className="text-xs text-slate-400">
          Showing <strong className="text-white">{filtered.length}</strong> of {users.length} accounts
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center p-12"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-12">
            <span className="text-4xl">👥</span>
            <p className="text-white font-medium mt-3">No user accounts found</p>
            <p className="text-slate-400 text-sm mt-1">Adjust search or filters to locate specific system users.</p>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Body className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-white/5 text-slate-400 border-b border-white/10">
                <tr>
                  <th className="px-5 py-3">Account Details</th>
                  <th className="px-4 py-3">Assigned Role</th>
                  <th className="px-4 py-3">Profile Info</th>
                  <th className="px-4 py-3">Registered On</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Access Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          u.role === 'ADMIN' ? 'bg-danger-500/20 text-danger-400' :
                          u.role === 'PLACEMENT_COORDINATOR' ? 'bg-warning-500/20 text-warning-400' :
                          u.role === 'FACULTY' ? 'bg-success-500/20 text-success-400' :
                          'bg-primary-500/20 text-primary-400'
                        }`}>
                          {u.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge
                        variant={
                          u.role === 'ADMIN' ? 'danger' :
                          u.role === 'PLACEMENT_COORDINATOR' ? 'warning' :
                          u.role === 'FACULTY' ? 'success' : 'primary'
                        }
                        size="sm"
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-400">
                      {u.studentProfile ? (
                        <span>
                          Roll: <strong className="text-slate-200">{u.studentProfile.rollNumber || 'N/A'}</strong> ({u.studentProfile.department?.code || 'N/A'})
                        </span>
                      ) : (
                        <span>Institutional Staff</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={u.status === 'ACTIVE' ? 'success' : 'slate'} size="sm" dot>
                        {u.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        variant={u.status === 'ACTIVE' ? 'ghost' : 'secondary'}
                        size="sm"
                        disabled={togglingId === u.id}
                        onClick={() => handleToggleStatus(u)}
                        className={u.status === 'ACTIVE' ? 'text-danger-400 hover:bg-danger-500/10' : 'text-emerald-400'}
                      >
                        {togglingId === u.id
                          ? 'Updating...'
                          : u.status === 'ACTIVE'
                          ? 'Deactivate'
                          : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
