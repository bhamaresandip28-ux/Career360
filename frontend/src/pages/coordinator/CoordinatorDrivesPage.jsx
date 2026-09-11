import { useState, useEffect } from 'react';
import { getDrives, getCompanies, getJobs, createDrive } from '../../services/placement.service';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

export default function CoordinatorDrivesPage() {
  const [drives, setDrives]       = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState(null);

  const [form, setForm] = useState({
    companyId: '',
    jobId: '',
    title: '',
    openDate: '',
    deadline: '',
    selectionProcess: 'Online Assessment -> Technical Interview -> HR Round',
    eligibility: {
      minCgpa: 6.5,
      maxActiveBacklogs: 0,
      departments: ['CS', 'IT'],
      allowedGraduationYears: [2025, 2026],
    },
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [drivesRes, compRes] = await Promise.all([getDrives(), getCompanies()]);
      setDrives(drivesRes.data?.data || []);
      setCompanies(compRes.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCompanyChange = async (companyId) => {
    setForm((prev) => ({ ...prev, companyId, jobId: '' }));
    if (companyId) {
      try {
        const res = await getJobs(companyId);
        setJobs(res.data?.data || []);
      } catch (err) {
        console.error(err);
      }
    } else {
      setJobs([]);
    }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await createDrive({
        ...form,
        eligibility: {
          ...form.eligibility,
          minCgpa: Number(form.eligibility.minCgpa),
          maxActiveBacklogs: Number(form.eligibility.maxActiveBacklogs),
        },
      });
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to schedule drive.');
    } finally {
      setSaving(false);
    }
  };

  const filteredDrives = drives.filter((d) => {
    if (tab === 'ALL') return true;
    return d.status === tab;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display font-bold text-2xl text-white">Campus Placement Drives</h2>
          <p className="text-slate-400 text-sm">Schedule and manage on-campus recruitment pipelines and eligibility filters.</p>
        </div>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          + Schedule New Drive
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        {['ALL', 'ACTIVE', 'UPCOMING', 'COMPLETED'].map((status) => (
          <button
            key={status}
            onClick={() => setTab(status)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              tab === status
                ? 'bg-primary-600/30 text-primary-400 border border-primary-500/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {status} DRIVES ({status === 'ALL' ? drives.length : drives.filter(d => d.status === status).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Spinner size="lg" /></div>
      ) : filteredDrives.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-12">
            <span className="text-4xl">🚀</span>
            <p className="text-white font-medium mt-3">No {tab !== 'ALL' ? tab.toLowerCase() : ''} drives found</p>
            <p className="text-slate-400 text-sm mt-1">Schedule your next hiring drive with company selection criteria.</p>
            <Button variant="primary" size="sm" className="mt-4" onClick={() => setModalOpen(true)}>
              Schedule Drive
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredDrives.map((drive) => {
            const isDeadlinePassed = new Date() > new Date(drive.deadline);
            return (
              <Card key={drive.id} className="hover:border-primary-500/30 transition-all flex flex-col justify-between">
                <Card.Body>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold text-base">
                        {drive.company?.name?.[0] || 'C'}
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-base text-white">{drive.title}</h3>
                        <p className="text-xs text-slate-400">{drive.company?.name} • {drive.company?.industry}</p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        drive.status === 'ACTIVE' ? 'success' :
                        drive.status === 'UPCOMING' ? 'warning' : 'slate'
                      }
                      size="sm"
                    >
                      {drive.status}
                    </Badge>
                  </div>

                  {/* Role & Compensation */}
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 my-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-medium">Position</span>
                      <p className="text-sm font-semibold text-white">{drive.job?.title || 'Graduate Engineer'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase block font-medium">CTC Package</span>
                      <p className="text-sm font-bold text-emerald-400">
                        {drive.job?.packageMin && drive.job?.packageMax
                          ? `${drive.job.packageMin} - ${drive.job.packageMax} LPA`
                          : `${drive.job?.packageMin || 6} LPA`}
                      </p>
                    </div>
                  </div>

                  {/* Schedule & Applicants */}
                  <div className="grid grid-cols-2 gap-2 text-xs py-2 text-slate-300">
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase">Open Date</span>
                      <span>{new Date(drive.openDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase">Application Deadline</span>
                      <span className={isDeadlinePassed ? 'text-danger-400 font-medium' : 'text-slate-200'}>
                        {new Date(drive.deadline).toLocaleDateString()} {isDeadlinePassed && '(Closed)'}
                      </span>
                    </div>
                  </div>

                  {/* Eligibility Rules */}
                  {drive.eligibilityRule && (
                    <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Eligibility Criteria</p>
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10">
                          Min CGPA: <strong className="text-white">{drive.eligibilityRule.minCgpa}</strong>
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10">
                          Max Backlogs: <strong className="text-white">{drive.eligibilityRule.maxActiveBacklogs}</strong>
                        </span>
                        {drive.eligibilityRule.departments?.length > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10">
                            Depts: <strong className="text-white">{drive.eligibilityRule.departments.join(', ')}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Footer stats */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs text-primary-400 font-semibold">
                      👥 {drive._count?.applications || 0} Registered Applicants
                    </span>
                    <span className="text-xs text-slate-400">
                      Process: <strong className="text-slate-200">{drive.selectionProcess?.split('->')[0]?.trim() || 'Standard'}</strong>
                    </span>
                  </div>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Schedule Drive Modal ───────────────────────────────────────────── */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Schedule Placement Drive">
        <form onSubmit={handleSchedule} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-danger-500/10 border border-danger-500/20 text-danger-400 text-xs">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Recruiting Company *</label>
            <select
              className="w-full bg-surface-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
              required
              value={form.companyId}
              onChange={(e) => handleCompanyChange(e.target.value)}
            >
              <option value="">Select hiring partner...</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.industry})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Job Opening Role *</label>
            <select
              className="w-full bg-surface-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
              required
              value={form.jobId}
              onChange={(e) => setForm({ ...form, jobId: e.target.value })}
              disabled={!form.companyId}
            >
              <option value="">{form.companyId ? 'Select job position...' : 'Select company first'}</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>{j.title} ({j.packageMin}-{j.packageMax} LPA)</option>
              ))}
            </select>
          </div>

          <Input
            label="Drive Campaign Title *"
            placeholder="e.g. Google India Campus Hiring 2025"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Drive Open Date *"
              type="date"
              required
              value={form.openDate}
              onChange={(e) => setForm({ ...form, openDate: e.target.value })}
            />
            <Input
              label="Application Deadline *"
              type="date"
              required
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </div>

          {/* Eligibility Rules */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
            <p className="text-xs font-bold text-white uppercase tracking-wider">Candidate Eligibility Rules</p>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Minimum CGPA"
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={form.eligibility.minCgpa}
                onChange={(e) => setForm({
                  ...form,
                  eligibility: { ...form.eligibility, minCgpa: e.target.value },
                })}
              />
              <Input
                label="Max Active Backlogs"
                type="number"
                min="0"
                value={form.eligibility.maxActiveBacklogs}
                onChange={(e) => setForm({
                  ...form,
                  eligibility: { ...form.eligibility, maxActiveBacklogs: e.target.value },
                })}
              />
            </div>
          </div>

          <Input
            label="Selection Process Description"
            placeholder="e.g. Coding Assessment -> Technical Round 1 -> Technical Round 2 -> HR"
            value={form.selectionProcess}
            onChange={(e) => setForm({ ...form, selectionProcess: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={saving}>
              Schedule Drive
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
