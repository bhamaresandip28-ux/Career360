import { useState, useEffect } from 'react';
import { getAllApplications, updateApplicationStatus, scheduleRound, getDrives } from '../../services/placement.service';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

export default function CoordinatorApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [drives, setDrives]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [selectedDrive, setSelectedDrive] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals state
  const [statusModal, setStatusModal] = useState({ open: false, app: null, status: '', notes: '' });
  const [roundModal, setRoundModal]   = useState({
    open: false,
    app: null,
    roundNumber: 1,
    roundName: 'Technical Interview',
    scheduledAt: '',
    venueOrLink: '',
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const [appsRes, drivesRes] = await Promise.all([
        getAllApplications({
          driveId: selectedDrive || undefined,
          status: selectedStatus || undefined,
        }),
        getDrives(),
      ]);
      setApplications(appsRes.data?.data?.applications || []);
      setDrives(drivesRes.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [selectedDrive, selectedStatus]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    try {
      await updateApplicationStatus(statusModal.app.id, statusModal.status, statusModal.notes);
      setStatusModal({ open: false, app: null, status: '', notes: '' });
      fetchApps();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to update status.');
    } finally {
      setSaving(false);
    }
  };

  const handleScheduleRound = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    try {
      await scheduleRound({
        driveId: roundModal.app.driveId,
        applicationId: roundModal.app.id,
        studentId: roundModal.app.studentId,
        roundNumber: Number(roundModal.roundNumber),
        roundName: roundModal.roundName,
        scheduledAt: roundModal.scheduledAt,
        venueOrLink: roundModal.venueOrLink,
        status: 'SCHEDULED',
      });
      // Also advance application status to INTERVIEW_SCHEDULED if not already
      if (roundModal.app.status !== 'INTERVIEW_SCHEDULED') {
        await updateApplicationStatus(roundModal.app.id, 'INTERVIEW_SCHEDULED');
      }
      setRoundModal({ open: false, app: null, roundNumber: 1, roundName: '', scheduledAt: '', venueOrLink: '' });
      fetchApps();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to schedule round.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = applications.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.student?.name?.toLowerCase().includes(q) ||
      a.student?.email?.toLowerCase().includes(q) ||
      a.student?.studentProfile?.rollNumber?.toLowerCase().includes(q) ||
      a.drive?.company?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display font-bold text-2xl text-white">Application Pipeline & Rounds</h2>
        <p className="text-slate-400 text-sm">Monitor student applications, evaluate eligibility, shortlist candidates, and schedule interview rounds.</p>
      </div>

      {/* Filters Bar */}
      <div className="glass p-4 rounded-xl border border-white/5 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="w-64">
            <Input
              placeholder="Search candidate or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="bg-surface-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary-500"
            value={selectedDrive}
            onChange={(e) => setSelectedDrive(e.target.value)}
          >
            <option value="">All Drives ({drives.length})</option>
            {drives.map((d) => (
              <option key={d.id} value={d.id}>{d.title} ({d.company?.name})</option>
            ))}
          </select>

          <select
            className="bg-surface-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary-500"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="APPLIED">APPLIED</option>
            <option value="SHORTLISTED">SHORTLISTED</option>
            <option value="INTERVIEW_SCHEDULED">INTERVIEW_SCHEDULED</option>
            <option value="OFFERED">OFFERED</option>
            <option value="ACCEPTED">ACCEPTED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>

        <span className="text-xs text-slate-400">
          Showing <strong className="text-white">{filtered.length}</strong> candidate applications
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center p-12"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-12">
            <span className="text-4xl">📝</span>
            <p className="text-white font-medium mt-3">No applications found</p>
            <p className="text-slate-400 text-sm mt-1">Adjust search or filters to see candidates.</p>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Body className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-white/5 text-slate-400 border-b border-white/10">
                <tr>
                  <th className="px-5 py-3">Candidate</th>
                  <th className="px-4 py-3">Dept / Roll</th>
                  <th className="px-4 py-3">Academic Standing</th>
                  <th className="px-4 py-3">Placement Drive</th>
                  <th className="px-4 py-3">Rounds</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((app) => {
                  const prof = app.student?.studentProfile;
                  return (
                    <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold text-xs">
                            {app.student?.name?.[0] || 'S'}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{app.student?.name}</p>
                            <p className="text-xs text-slate-400">{app.student?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-white text-xs font-medium">{prof?.rollNumber || '—'}</p>
                        <p className="text-[11px] text-slate-400">{prof?.department?.code || 'N/A'}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-white text-xs">
                          {prof?.cgpa ? `${prof.cgpa.toFixed(2)} CGPA` : '—'}
                        </span>
                        <span className={`block text-[11px] ${prof?.activeBacklogs > 0 ? 'text-danger-400 font-semibold' : 'text-slate-500'}`}>
                          {prof?.activeBacklogs || 0} active backlogs
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-white font-medium text-xs">{app.drive?.company?.name}</p>
                        <p className="text-[11px] text-slate-400">{app.drive?.job?.title}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        {app.selectionRounds?.length > 0 ? (
                          <span className="text-xs font-semibold text-primary-400">
                            Round {app.selectionRounds[app.selectionRounds.length - 1].roundNumber}: {app.selectionRounds[app.selectionRounds.length - 1].roundName}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">None scheduled</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge
                          variant={
                            app.status === 'OFFERED' || app.status === 'ACCEPTED' ? 'success' :
                            app.status === 'INTERVIEW_SCHEDULED' ? 'warning' :
                            app.status === 'SHORTLISTED' ? 'primary' :
                            app.status === 'REJECTED' ? 'danger' : 'slate'
                          }
                          size="sm"
                        >
                          {app.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => setStatusModal({
                            open: true,
                            app,
                            status: app.status,
                            notes: app.notes || '',
                          })}
                          className="px-2.5 py-1 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-white font-medium border border-white/10"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => setRoundModal({
                            open: true,
                            app,
                            roundNumber: (app.selectionRounds?.length || 0) + 1,
                            roundName: (app.selectionRounds?.length || 0) === 0 ? 'Technical Round 1' : 'Managerial & HR Round',
                            scheduledAt: '',
                            venueOrLink: '',
                          })}
                          className="px-2.5 py-1 rounded-lg text-xs bg-primary-600/20 hover:bg-primary-600/30 text-primary-400 font-medium border border-primary-500/30"
                        >
                          + Round
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card.Body>
        </Card>
      )}

      {/* ── Update Status Modal ───────────────────────────────────────────── */}
      <Modal
        isOpen={statusModal.open}
        onClose={() => setStatusModal({ open: false, app: null, status: '', notes: '' })}
        title={`Update Status: ${statusModal.app?.student?.name}`}
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-danger-500/10 border border-danger-500/20 text-danger-400 text-xs">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Application Pipeline Stage *</label>
            <select
              className="w-full bg-surface-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
              value={statusModal.status}
              onChange={(e) => setStatusModal({ ...statusModal, status: e.target.value })}
            >
              <option value="APPLIED">APPLIED</option>
              <option value="SHORTLISTED">SHORTLISTED</option>
              <option value="INTERVIEW_SCHEDULED">INTERVIEW_SCHEDULED</option>
              <option value="OFFERED">OFFERED</option>
              <option value="ACCEPTED">ACCEPTED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Coordinator Notes</label>
            <textarea
              className="w-full bg-surface-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500 resize-none h-20"
              placeholder="Candidate feedback, assessment score, or internal comments..."
              value={statusModal.notes}
              onChange={(e) => setStatusModal({ ...statusModal, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="ghost" type="button" onClick={() => setStatusModal({ open: false, app: null, status: '', notes: '' })}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={saving}>
              Save Status
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Schedule Round Modal ─────────────────────────────────────────── */}
      <Modal
        isOpen={roundModal.open}
        onClose={() => setRoundModal({ open: false, app: null, roundNumber: 1, roundName: '', scheduledAt: '', venueOrLink: '' })}
        title={`Schedule Round for ${roundModal.app?.student?.name}`}
      >
        <form onSubmit={handleScheduleRound} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-danger-500/10 border border-danger-500/20 text-danger-400 text-xs">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Round Number"
              type="number"
              min="1"
              required
              value={roundModal.roundNumber}
              onChange={(e) => setRoundModal({ ...roundModal, roundNumber: e.target.value })}
            />
            <Input
              label="Round Title"
              placeholder="e.g. Technical Interview 1"
              required
              value={roundModal.roundName}
              onChange={(e) => setRoundModal({ ...roundModal, roundName: e.target.value })}
            />
          </div>

          <Input
            label="Scheduled Date & Time"
            type="datetime-local"
            value={roundModal.scheduledAt}
            onChange={(e) => setRoundModal({ ...roundModal, scheduledAt: e.target.value })}
          />

          <Input
            label="Meeting Link / Campus Venue"
            placeholder="e.g. https://meet.google.com/xyz or Placement Hall B"
            value={roundModal.venueOrLink}
            onChange={(e) => setRoundModal({ ...roundModal, venueOrLink: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="ghost" type="button" onClick={() => setRoundModal({ open: false, app: null, roundNumber: 1, roundName: '', scheduledAt: '', venueOrLink: '' })}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={saving}>
              Schedule Interview Round
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
