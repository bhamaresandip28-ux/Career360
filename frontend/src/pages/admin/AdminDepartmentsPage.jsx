import { useState, useEffect } from 'react';
import analyticsService from '../../services/analytics.service';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [modalOpen, setModalOpen]     = useState(false);
  const [saving, setSaving]           = useState(false);
  const [formError, setFormError]     = useState(null);

  const [form, setForm] = useState({
    code: '',
    name: '',
  });

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const data = await analyticsService.getDepartmentAnalytics();
      setDepartments(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await analyticsService.createDepartment({
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
      });
      setModalOpen(false);
      setForm({ code: '', name: '' });
      fetchDepartments();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to create department.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display font-bold text-2xl text-white">Academic Departments</h2>
          <p className="text-slate-400 text-sm">Configure institutional departments, discipline codes, and curriculum oversight.</p>
        </div>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          + Add Department
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Spinner size="lg" /></div>
      ) : departments.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-12">
            <span className="text-4xl">🏢</span>
            <p className="text-white font-medium mt-3">No departments created</p>
            <p className="text-slate-400 text-sm mt-1">Register your first institutional engineering branch.</p>
            <Button variant="primary" size="sm" className="mt-4" onClick={() => setModalOpen(true)}>
              Add Department
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((d) => (
            <Card key={d.id} className="hover:border-primary-500/40 transition-all flex flex-col justify-between">
              <Card.Body>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600/30 to-indigo-600/20 border border-white/10 flex items-center justify-center font-bold text-lg text-primary-400">
                    {d.code}
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 font-semibold">
                    Code: {d.code}
                  </span>
                </div>

                <h3 className="font-display font-bold text-base text-white mb-3">{d.name}</h3>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/5 text-center text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase">Students</span>
                    <span className="font-bold text-white text-sm">{d.studentCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase">Subjects</span>
                    <span className="font-bold text-primary-400 text-sm">{d.subjectCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase">Batches</span>
                    <span className="font-bold text-slate-300 text-sm">{d.batchCount}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Class Avg CGPA</span>
                  <span className="font-bold text-emerald-400">
                    {d.avgCgpa ? `${d.avgCgpa.toFixed(2)} / 10` : '—'}
                  </span>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* ── Add Department Modal ─────────────────────────────────────────── */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Academic Department">
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-danger-500/10 border border-danger-500/20 text-danger-400 text-xs">
              {formError}
            </div>
          )}

          <Input
            label="Department Code *"
            placeholder="e.g. AI, ME, CE, EEE"
            required
            maxLength={10}
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />

          <Input
            label="Department Full Name *"
            placeholder="e.g. Artificial Intelligence & Data Science"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={saving}>
              Register Department
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
