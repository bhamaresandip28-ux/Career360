import { useState, useEffect } from 'react';
import {
  Shield,
  Search,
  Filter,
  Activity,
  UserCheck,
  Calendar,
  Code,
  X,
  RefreshCw,
  Clock,
  Layers,
} from 'lucide-react';
import auditService from '../../services/audit.service';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [page, selectedAction, selectedRole]);

  const fetchStats = async () => {
    try {
      const s = await auditService.getAuditStats();
      setStats(s);
    } catch (err) {
      console.error('Failed to load audit stats', err);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (selectedAction) params.action = selectedAction;
      if (selectedRole) params.role = selectedRole;

      const data = await auditService.getAuditLogs(params);
      setLogs(data?.logs || []);
      setTotalPages(data?.totalPages || 1);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeVariant = (action) => {
    if (action.includes('LOGIN')) return 'primary';
    if (action.includes('OVERRIDE') || action.includes('WARNING')) return 'warning';
    if (action.includes('OFFER') || action.includes('SUCCESS')) return 'success';
    if (action.includes('DELETE') || action.includes('FAIL')) return 'danger';
    return 'slate';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-surface-900 to-surface-850 p-6 rounded-2xl border border-white/10 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-danger-500" />
            Security & Operational Audit Trail
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Immutable system event log for security auditing, compliance, and user action tracking.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            fetchStats();
            fetchLogs();
          }}
          className="flex items-center gap-2 self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Stream
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 bg-gradient-to-br from-surface-900 to-surface-850 border-white/10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-400 font-medium">Total Logged Events</p>
                <h3 className="text-3xl font-extrabold text-white mt-1 font-mono">
                  {stats.totalEvents}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-400">
                <Activity className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-surface-900 to-surface-850 border-white/10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-400 font-medium">Unique Tracked Actors</p>
                <h3 className="text-3xl font-extrabold text-white mt-1 font-mono">
                  {stats.uniqueUsers}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-surface-900 to-surface-850 border-white/10">
            <div>
              <p className="text-xs text-slate-400 font-medium mb-1.5">Top Event Categories</p>
              <div className="flex flex-wrap gap-1.5">
                {stats.topActions?.slice(0, 3).map((act, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-surface-800 text-slate-300 border border-white/10"
                  >
                    {act.action}: {act._count.id}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filter Controls */}
      <Card className="p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase">Filters:</span>
        </div>

        <select
          value={selectedAction}
          onChange={(e) => {
            setSelectedAction(e.target.value);
            setPage(1);
          }}
          className="bg-surface-800 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="">All Action Types</option>
          <option value="AUTH_LOGIN">AUTH_LOGIN</option>
          <option value="ELIGIBILITY_OVERRIDE">ELIGIBILITY_OVERRIDE</option>
          <option value="OFFER_EXTENDED">OFFER_EXTENDED</option>
          <option value="ROUND_RESULT_PUBLISHED">ROUND_RESULT_PUBLISHED</option>
          <option value="NOTIFICATION_DISPATCH">NOTIFICATION_DISPATCH</option>
        </select>

        <select
          value={selectedRole}
          onChange={(e) => {
            setSelectedRole(e.target.value);
            setPage(1);
          }}
          className="bg-surface-800 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="">All Actor Roles</option>
          <option value="STUDENT">STUDENT</option>
          <option value="FACULTY">FACULTY</option>
          <option value="PLACEMENT_COORDINATOR">PLACEMENT_COORDINATOR</option>
          <option value="ADMIN">ADMIN</option>
        </select>

        {(selectedAction || selectedRole) && (
          <button
            onClick={() => {
              setSelectedAction('');
              setSelectedRole('');
              setPage(1);
            }}
            className="text-xs text-slate-400 hover:text-white underline ml-auto"
          >
            Reset Filters
          </button>
        )}
      </Card>

      {/* Audit Log Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-surface-850 border-b border-white/10 text-slate-400 uppercase font-semibold">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4 text-right">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    Loading audit stream...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={getActionBadgeVariant(log.action)} size="sm">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {log.user ? (
                        <div>
                          <p className="font-semibold text-white">{log.user.name}</p>
                          <p className="text-[10px] text-slate-400">{log.user.email} • {log.user.role}</p>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">System Process</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {log.entity ? (
                        <span>
                          {log.entity}
                          {log.entityId && <span className="text-slate-500 text-[10px] block">#{log.entityId.slice(0, 10)}</span>}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {log.details ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                          className="text-xs p-1 text-primary-400 hover:text-primary-300"
                        >
                          <Code className="w-3.5 h-3.5" />
                        </Button>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t border-white/10 bg-surface-850">
            <span className="text-xs text-slate-400">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Payload Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-900 border border-white/15 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Badge variant={getActionBadgeVariant(selectedLog.action)} size="sm">
                  {selectedLog.action}
                </Badge>
                <span className="text-xs font-mono text-slate-400">
                  {new Date(selectedLog.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto font-mono text-xs text-emerald-400 bg-surface-950 flex-1">
              <pre className="whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
            </div>

            <div className="p-3 border-t border-white/10 bg-surface-850 flex justify-between items-center text-xs text-slate-400">
              <span>Actor ID: {selectedLog.userId || 'N/A'}</span>
              <Button variant="secondary" size="sm" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
