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

export default function CertificationsPage() {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  const [deletingCert, setDeletingCert] = useState(null);

  const [form, setForm] = useState({
    name: '',
    issuingOrg: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    verificationUrl: '',
  });

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchCertifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await studentApi.getCertifications();
      setCertifications(res.data?.data?.certifications || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load certifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertifications();
  }, []);

  const openAddModal = () => {
    setForm({
      name: '',
      issuingOrg: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      verificationUrl: '',
    });
    setEditingCert(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cert) => {
    setForm({
      name: cert.name,
      issuingOrg: cert.issuingOrg,
      issueDate: cert.issueDate ? cert.issueDate.split('T')[0] : '',
      expiryDate: cert.expiryDate ? cert.expiryDate.split('T')[0] : '',
      credentialId: cert.credentialId || '',
      verificationUrl: cert.verificationUrl || '',
    });
    setEditingCert(cert);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.issuingOrg.trim() || !form.issueDate) return;

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        issuingOrg: form.issuingOrg.trim(),
        issueDate: new Date(form.issueDate),
        expiryDate: form.expiryDate ? new Date(form.expiryDate) : undefined,
        credentialId: form.credentialId ? form.credentialId.trim() : undefined,
        verificationUrl: form.verificationUrl ? form.verificationUrl.trim() : undefined,
      };

      if (editingCert) {
        await studentApi.updateCertification(editingCert.id, payload);
        setToast({ type: 'success', message: 'Certification updated!' });
      } else {
        await studentApi.createCertification(payload);
        setToast({ type: 'success', message: 'Certification added to your credentials!' });
      }

      setIsModalOpen(false);
      await fetchCertifications();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to save certification.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCert) return;
    setSaving(true);
    try {
      await studentApi.deleteCertification(deletingCert.id);
      setToast({ type: 'success', message: 'Certification removed.' });
      setDeletingCert(null);
      await fetchCertifications();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to delete certification.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loading size="lg" text="Loading professional certifications..." />
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Certifications Error" message={error} onRetry={fetchCertifications} />;
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
          <h2 className="font-display font-bold text-2xl text-[#001D39]">Professional Certifications</h2>
          <p className="text-slate-600 text-sm mt-1 max-w-xl">
            Industry recognized certifications from cloud providers, vendor programs, and recognized academies.
          </p>
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
            <span>Verified Credentials: <strong className="text-[#001D39]">{certifications.length}</strong></span>
          </div>
        </div>
        <Button variant="primary" onClick={openAddModal} className="flex-shrink-0">
          + Add Certification
        </Button>
      </div>

      {/* Certifications List */}
      {certifications.length === 0 ? (
        <Card>
          <EmptyState
            icon="🏅"
            title="No certifications added yet"
            description="Add certifications from AWS, Azure, Google Cloud, Meta, Cisco, Oracle, or Coursera."
            action={
              <Button variant="primary" size="sm" onClick={openAddModal}>
                + Add Certification Now
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {certifications.map((cert) => (
            <div
              key={cert.id}
              className="p-6 bg-white rounded-2xl border border-[#BDD8E9]/70 shadow-card hover:border-[#0A4174]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-[#001D39] text-base leading-snug">
                      {cert.name}
                    </h3>
                    <p className="text-xs text-[#0A4174] font-medium mt-1">
                      {cert.issuingOrg}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#BDD8E9]/25 border border-[#BDD8E9] flex items-center justify-center text-lg flex-shrink-0">
                    🏅
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                  <div>
                    <span>Issued: </span>
                    <strong className="text-slate-700">
                      {new Date(cert.issueDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </strong>
                    {cert.expiryDate && (
                      <span> • Expires: <strong className="text-slate-700">{new Date(cert.expiryDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</strong></span>
                    )}
                  </div>
                  {cert.credentialId && (
                    <div className="truncate">
                      <span>ID: </span>
                      <span className="font-mono text-slate-700">{cert.credentialId}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions & Verification */}
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
                {cert.verificationUrl ? (
                  <a
                    href={cert.verificationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#0A4174] hover:text-[#001D39] font-semibold flex items-center gap-1"
                  >
                    <span>Verify Link ↗</span>
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-400">Self-reported</span>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(cert)}
                    className="text-xs text-slate-500 hover:text-[#0A4174] p-1.5 transition-colors"
                  >
                    Edit ✏️
                  </button>
                  <button
                    onClick={() => setDeletingCert(cert)}
                    className="text-xs text-slate-500 hover:text-rose-600 p-1.5 transition-colors"
                  >
                    Delete 🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── ADD / EDIT MODAL ────────────────────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCert ? 'Edit Certification' : 'Add Certification'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Certification Name"
            id="certName"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. AWS Certified Solutions Architect"
          />

          <Input
            label="Issuing Organization"
            id="issuingOrg"
            required
            value={form.issuingOrg}
            onChange={(e) => setForm({ ...form, issuingOrg: e.target.value })}
            placeholder="e.g. Amazon Web Services, Google, Meta"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Issue Date"
              id="issueDate"
              type="date"
              required
              value={form.issueDate}
              onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
            />
            <Input
              label="Expiry Date (Optional)"
              id="expiryDate"
              type="date"
              value={form.expiryDate}
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            />
          </div>

          <Input
            label="Credential ID / License Number"
            id="credentialId"
            value={form.credentialId}
            onChange={(e) => setForm({ ...form, credentialId: e.target.value })}
            placeholder="e.g. AWS-PSA-12345"
          />

          <Input
            label="Verification / Badge URL"
            id="verificationUrl"
            type="url"
            value={form.verificationUrl}
            onChange={(e) => setForm({ ...form, verificationUrl: e.target.value })}
            placeholder="https://www.credly.com/badges/..."
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
              {editingCert ? 'Save Changes' : 'Add Certification'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── DELETE MODAL ────────────────────────────────────────────────── */}
      <Modal
        isOpen={!!deletingCert}
        onClose={() => setDeletingCert(null)}
        title="Remove Certification"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to remove <strong>{deletingCert?.name}</strong>?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setDeletingCert(null)}
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
