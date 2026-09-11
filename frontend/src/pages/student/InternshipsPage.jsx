import { useState, useEffect } from 'react';
import * as studentApi from '../../services/student.service';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Toast from '../../components/ui/Toast';

export default function InternshipsPage() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInternship, setEditingInternship] = useState(null);
  const [deletingInternship, setDeletingInternship] = useState(null);

  const [isOngoing, setIsOngoing] = useState(false);
  const [form, setForm] = useState({
    organization: '',
    role: '',
    startDate: '',
    endDate: '',
    description: '',
    techStack: '',
    verificationUrl: '',
  });

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await studentApi.getInternships();
      setInternships(res.data?.data?.internships || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch internships.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, []);

  const openAddModal = () => {
    setForm({
      organization: '',
      role: '',
      startDate: '',
      endDate: '',
      description: '',
      techStack: '',
      verificationUrl: '',
    });
    setIsOngoing(false);
    setEditingInternship(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setForm({
      organization: item.organization,
      role: item.role,
      startDate: item.startDate ? item.startDate.split('T')[0] : '',
      endDate: item.endDate ? item.endDate.split('T')[0] : '',
      description: item.description || '',
      techStack: (item.techStack || []).join(', '),
      verificationUrl: item.verificationUrl || '',
    });
    setIsOngoing(!item.endDate);
    setEditingInternship(item);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.organization.trim() || !form.role.trim() || !form.startDate) return;

    setSaving(true);
    try {
      const techStackArray = form.techStack
        ? form.techStack.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      const payload = {
        organization: form.organization.trim(),
        role: form.role.trim(),
        startDate: new Date(form.startDate),
        endDate: isOngoing ? null : form.endDate ? new Date(form.endDate) : undefined,
        description: form.description ? form.description.trim() : undefined,
        techStack: techStackArray,
        verificationUrl: form.verificationUrl ? form.verificationUrl.trim() : undefined,
      };

      if (editingInternship) {
        await studentApi.updateInternship(editingInternship.id, payload);
        setToast({ type: 'success', message: 'Internship updated!' });
      } else {
        await studentApi.createInternship(payload);
        setToast({ type: 'success', message: 'Internship added to your profile!' });
      }

      setIsModalOpen(false);
      await fetchInternships();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to save internship.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingInternship) return;
    setSaving(true);
    try {
      await studentApi.deleteInternship(deletingInternship.id);
      setToast({ type: 'success', message: 'Internship removed.' });
      setDeletingInternship(null);
      await fetchInternships();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to delete internship.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loading size="lg" text="Loading internship records..." />
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Internships Error" message={error} onRetry={fetchInternships} />;
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header Banner */}
      <div className="p-6 bg-white border border-[#BDD8E9]/70 rounded-2xl shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-[#001D39]">Work Experience & Internships</h2>
          <p className="text-slate-600 text-sm mt-1 max-w-xl">
            Real industry exposure, corporate traineeships, and research internships demonstrate professional readiness.
          </p>
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
            <span>Total Internships: <strong className="text-[#001D39]">{internships.length}</strong></span>
            <span>• Ongoing: <strong className="text-[#4E8EA2]">{internships.filter(i => !i.endDate).length}</strong></span>
          </div>
        </div>
        <Button variant="primary" onClick={openAddModal} className="flex-shrink-0">
          + Add Internship
        </Button>
      </div>

      {/* Internships List */}
      {internships.length === 0 ? (
        <Card>
          <EmptyState
            icon="🏢"
            title="No internships recorded"
            description="Add your summer internships, off-campus roles, or corporate trainee experiences."
            action={
              <Button variant="primary" size="sm" onClick={openAddModal}>
                + Add Internship Now
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {internships.map((item) => {
            const isCurrent = !item.endDate;
            return (
              <div
                key={item.id}
                className="p-6 bg-white rounded-2xl border border-[#BDD8E9]/70 shadow-card hover:border-[#0A4174]/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#BDD8E9]/25 border border-[#BDD8E9] flex items-center justify-center text-xl flex-shrink-0">
                    🏢
                  </div>
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-[#001D39] text-lg">{item.role}</h3>
                      <span className="text-slate-600 font-medium">@ {item.organization}</span>
                      {isCurrent ? (
                        <Badge variant="success" size="sm" dot>Present / Ongoing</Badge>
                      ) : (
                        <Badge variant="slate" size="sm">Completed</Badge>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(item.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                      {' — '}
                      {isCurrent
                        ? 'Present'
                        : new Date(item.endDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </p>

                    {item.description && (
                      <p className="text-sm text-slate-600 mt-3 max-w-2xl leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    {item.techStack && item.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {item.techStack.map((tech, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-lg bg-[#BDD8E9]/20 border border-[#BDD8E9]/60 text-[11px] text-[#0A4174] font-mono font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 self-end md:self-center">
                  {item.verificationUrl && (
                    <a
                      href={item.verificationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#0A4174] hover:text-[#001D39] font-medium px-3 py-1.5 rounded-xl bg-[#BDD8E9]/25 border border-[#BDD8E9] transition-all flex items-center gap-1"
                    >
                      <span>Offer / Certificate ↗</span>
                    </a>
                  )}
                  <button
                    onClick={() => openEditModal(item)}
                    className="text-xs text-slate-500 hover:text-[#0A4174] p-2 transition-colors"
                  >
                    Edit ✏️
                  </button>
                  <button
                    onClick={() => setDeletingInternship(item)}
                    className="text-xs text-slate-500 hover:text-rose-600 p-2 transition-colors"
                  >
                    Delete 🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── ADD / EDIT MODAL ────────────────────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingInternship ? 'Edit Internship' : 'Add Internship'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Organization / Company"
              id="org"
              required
              value={form.organization}
              onChange={(e) => setForm({ ...form, organization: e.target.value })}
              placeholder="e.g. Microsoft, Infosys, Tech Startup"
            />
            <Input
              label="Job Role / Title"
              id="role"
              required
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="e.g. Software Development Intern"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              id="startDate"
              type="date"
              required
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
            {!isOngoing ? (
              <Input
                label="End Date"
                id="endDate"
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            ) : (
              <div className="flex flex-col justify-center">
                <span className="text-sm text-slate-500 mt-6">Role is currently active</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 p-3 bg-[#F4F7FB] rounded-xl border border-[#BDD8E9]/60">
            <input
              type="checkbox"
              id="isOngoing"
              checked={isOngoing}
              onChange={(e) => setIsOngoing(e.target.checked)}
              className="w-4 h-4 rounded text-[#0A4174] focus:ring-[#0A4174]"
            />
            <label htmlFor="isOngoing" className="text-sm font-medium text-slate-700 cursor-pointer">
              I am currently working in this internship role
            </label>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Description of Work</label>
            <textarea
              className="w-full rounded-xl bg-white border border-slate-300 text-sm text-[#001D39] placeholder-slate-400 p-3 focus:outline-none focus:ring-2 focus:ring-[#0A4174]"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Summary of responsibilities, features developed, and measurable impacts..."
            />
          </div>

          <Input
            label="Technologies Used (comma separated)"
            id="internTech"
            value={form.techStack}
            onChange={(e) => setForm({ ...form, techStack: e.target.value })}
            placeholder="e.g. React, Spring Boot, AWS, Docker"
          />

          <Input
            label="Verification Letter / Offer Link URL"
            id="verificationUrl"
            type="url"
            value={form.verificationUrl}
            onChange={(e) => setForm({ ...form, verificationUrl: e.target.value })}
            placeholder="https://..."
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {editingInternship ? 'Save Changes' : 'Add Internship'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── DELETE MODAL ────────────────────────────────────────────────── */}
      <Modal
        isOpen={!!deletingInternship}
        onClose={() => setDeletingInternship(null)}
        title="Remove Internship"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to remove internship at <strong>{deletingInternship?.organization}</strong>?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setDeletingInternship(null)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={saving}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
