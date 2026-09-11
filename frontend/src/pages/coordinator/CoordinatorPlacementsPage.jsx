import { useState, useEffect } from 'react';
import { getOutcomes, recordOutcome, getCompanies, getJobs } from '../../services/placement.service';
import analyticsService from '../../services/analytics.service';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

export default function CoordinatorPlacementsPage() {
  const [outcomes, setOutcomes]   = useState([]);
  const [students, setStudents]   = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [errorMsg, setErrorMsg]   = useState(null);

  const [form, setForm] = useState({
    studentId: '',
    companyId: '',
    jobId: '',
    packageOffered: '',
    offerLetterUrl: '',
    status: 'ACCEPTED',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [outcomesRes, rosterRes, compRes] = await Promise.all([
        getOutcomes(),
        analyticsService.getStudentRoster(),
        getCompanies(),
      ]);
      setOutcomes(outcomesRes.data?.data?.outcomes || []);
      setStudents(rosterRes || []);
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

  const handleRecord = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    try {
      await recordOutcome({
        ...form,
        packageOffered: Number(form.packageOffered),
        offerLetterUrl: form.offerLetterUrl.trim() || undefined,
      });
      setModalOpen(false);
      setForm({ studentId: '', companyId: '', jobId: '', packageOffered: '', offerLetterUrl: '', status: 'ACCEPTED' });
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to record offer.');
    } finally {
      setSaving(false);
    }
  };

  const packages = outcomes.map((o) => o.packageOffered || 0);
  const highestPkg = packages.length > 0 ? Math.max(...packages) : 0;
  const avgPkg = packages.length > 0
    ? (packages.reduce((a, b) => a + b, 0) / packages.length).toFixed(2)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display font-bold text-2xl text-white">Campus Placement Outcomes</h2>
          <p className="text-slate-400 text-sm">Verified job offers, CTC compensations, and corporate hiring records.</p>
        </div>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          + Record Placement Offer
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass p-4 rounded-xl border border-white/5 bg-surface-900/60">
          <p className="text-xs text-slate-400 uppercase">Offers Recorded</p>
          <p className="text-2xl font-bold text-white mt-1">{outcomes.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Verified candidate selections</p>
        </div>

        <div className="glass p-4 rounded-xl border border-white/5 bg-surface-900/60">
          <p className="text-xs text-slate-400 uppercase">Highest Package</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{highestPkg ? `${highestPkg} LPA` : '—'}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Campus peak offer</p>
        </div>

        <div className="glass p-4 rounded-xl border border-white/5 bg-surface-900/60">
          <p className="text-xs text-slate-400 uppercase">Average CTC</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{avgPkg ? `${avgPkg} LPA` : '—'}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Cohort compensation average</p>
        </div>

        <div className="glass p-4 rounded-xl border border-white/5 bg-surface-900/60">
          <p className="text-xs text-slate-400 uppercase">Hiring Partners</p>
          <p className="text-2xl font-bold text-primary-400 mt-1">{new Set(outcomes.map(o => o.companyId)).size}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Active offering employers</p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center p-12"><Spinner size="lg" /></div>
      ) : outcomes.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-12">
            <span className="text-4xl">🏆</span>
            <p className="text-white font-medium mt-3">No placement outcomes recorded yet</p>
            <p className="text-slate-400 text-sm mt-1">Record the first confirmed job offer from a hiring drive.</p>
            <Button variant="primary" size="sm" className="mt-4" onClick={() => setModalOpen(true)}>
              Record Offer
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Body className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-white/5 text-slate-400 border-b border-white/10">
                <tr>
                  <th className="px-5 py-3">Candidate</th>
                  <th className="px-4 py-3">Recruiting Company</th>
                  <th className="px-4 py-3">Designation</th>
                  <th className="px-4 py-3">Package (CTC)</th>
                  <th className="px-4 py-3">Date Accepted</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {outcomes.map((o) => (
                  <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                          {o.student?.name?.[0] || 'S'}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{o.student?.name}</p>
                          <p className="text-xs text-slate-400">{o.student?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-white">{o.company?.name}</p>
                      <p className="text-xs text-slate-400">{o.company?.industry}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-white text-xs">{o.job?.title || 'Software Engineer'}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-bold text-emerald-400">{o.packageOffered} LPA</span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-400">
                      {new Date(o.acceptedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="success" size="sm">ACCEPTED</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card.Body>
        </Card>
      )}

      {/* ── Record Outcome Modal ─────────────────────────────────────────── */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Record Verified Placement Offer">
        <form onSubmit={handleRecord} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-danger-500/10 border border-danger-500/20 text-danger-400 text-xs">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Select Student *</label>
            <select
              className="w-full bg-surface-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
              required
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
            >
              <option value="">Select placed candidate...</option>
              {students.map((s) => (
                <option key={s.userId} value={s.userId}>
                  {s.name} ({s.rollNumber} - {s.department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Recruiting Partner *</label>
            <select
              className="w-full bg-surface-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
              required
              value={form.companyId}
              onChange={(e) => handleCompanyChange(e.target.value)}
            >
              <option value="">Select company...</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Job Designation *</label>
            <select
              className="w-full bg-surface-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
              required
              value={form.jobId}
              onChange={(e) => setForm({ ...form, jobId: e.target.value })}
              disabled={!form.companyId}
            >
              <option value="">{form.companyId ? 'Select job position...' : 'Select company first'}</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>
          </div>

          <Input
            label="Package Offered (CTC in LPA) *"
            type="number"
            step="0.1"
            min="1"
            placeholder="e.g. 14.5"
            required
            value={form.packageOffered}
            onChange={(e) => setForm({ ...form, packageOffered: e.target.value })}
          />

          <Input
            label="Offer Letter / Verification Link"
            placeholder="https://drive.google.com/..."
            type="url"
            value={form.offerLetterUrl}
            onChange={(e) => setForm({ ...form, offerLetterUrl: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={saving}>
              Confirm Offer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
