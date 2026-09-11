import { useState, useEffect } from 'react';
import * as studentApi from '../../services/student.service';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Toast from '../../components/ui/Toast';

const CATEGORIES = [
  { value: 'ALL', label: 'All Categories' },
  { value: 'PROGRAMMING', label: 'Programming' },
  { value: 'WEB_DEVELOPMENT', label: 'Web Development' },
  { value: 'DATABASE', label: 'Database' },
  { value: 'CLOUD', label: 'Cloud' },
  { value: 'DEVOPS', label: 'DevOps' },
  { value: 'AI_ML', label: 'AI & ML' },
  { value: 'TOOLS', label: 'Tools' },
  { value: 'SOFT_SKILLS', label: 'Soft Skills' },
  { value: 'OTHER', label: 'Other' },
];

const PROFICIENCIES = [
  { value: 'BEGINNER', label: 'Beginner (25%)', color: 'slate', percent: 25 },
  { value: 'INTERMEDIATE', label: 'Intermediate (50%)', color: 'purple', percent: 50 },
  { value: 'ADVANCED', label: 'Advanced (75%)', color: 'primary', percent: 75 },
  { value: 'EXPERT', label: 'Expert (100%)', color: 'success', percent: 100 },
];

export default function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [deletingSkill, setDeletingSkill] = useState(null);

  // Form
  const [form, setForm] = useState({
    name: '',
    category: 'PROGRAMMING',
    proficiency: 'INTERMEDIATE',
    evidence: '',
  });

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await studentApi.getSkills();
      setSkills(res.data?.data?.skills || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch skills.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const openAddModal = () => {
    setForm({
      name: '',
      category: activeCategory !== 'ALL' ? activeCategory : 'PROGRAMMING',
      proficiency: 'INTERMEDIATE',
      evidence: '',
    });
    setEditingSkill(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (skill) => {
    setForm({
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency,
      evidence: skill.evidence || '',
    });
    setEditingSkill(skill);
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editingSkill) {
        await studentApi.updateSkill(editingSkill.id, form);
        setToast({ type: 'success', message: 'Skill updated successfully!' });
      } else {
        await studentApi.createSkill(form);
        setToast({ type: 'success', message: 'Skill added to your profile!' });
      }
      setIsAddModalOpen(false);
      await fetchSkills();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to save skill.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSkill) return;
    setSaving(true);
    try {
      await studentApi.deleteSkill(deletingSkill.id);
      setToast({ type: 'success', message: 'Skill removed.' });
      setDeletingSkill(null);
      await fetchSkills();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to delete skill.' });
    } finally {
      setSaving(false);
    }
  };

  const filteredSkills = activeCategory === 'ALL'
    ? skills
    : skills.filter((s) => s.category === activeCategory);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loading size="lg" text="Loading technical & soft skills..." />
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Skills Error" message={error} onRetry={fetchSkills} />;
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
      <div className="glass p-6 bg-gradient-card border border-white/10 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-white">Skills & Competencies</h2>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Highlight your technical toolkit, programming proficiencies, and professional skills for matching with company requirements.
          </p>
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-300">
            <span>Total: <strong className="text-white">{skills.length}</strong></span>
            <span>• Advanced/Expert: <strong className="text-accent-400">{skills.filter(s => ['ADVANCED', 'EXPERT'].includes(s.proficiency)).length}</strong></span>
          </div>
        </div>
        <Button variant="primary" onClick={openAddModal} className="flex-shrink-0">
          + Add New Skill
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const count = cat.value === 'ALL' ? skills.length : skills.filter(s => s.category === cat.value).length;
          const isActive = activeCategory === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-primary-500 text-white shadow-glow'
                  : 'bg-surface-900/80 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              <span>{cat.label}</span>
              {count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-black/20 text-white' : 'bg-white/10 text-slate-300'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Skills Grid */}
      {filteredSkills.length === 0 ? (
        <Card>
          <EmptyState
            icon="⚡"
            title="No skills found"
            description={
              activeCategory === 'ALL'
                ? 'Start adding your core programming languages, frameworks, databases, and tools.'
                : `No skills recorded under the "${CATEGORIES.find(c => c.value === activeCategory)?.label}" category yet.`
            }
            action={
              <Button variant="primary" size="sm" onClick={openAddModal}>
                + Add Skill Now
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((skill) => {
            const profMeta = PROFICIENCIES.find((p) => p.value === skill.proficiency) || PROFICIENCIES[1];
            return (
              <div
                key={skill.id}
                className="glass p-5 rounded-2xl border border-white/10 hover:border-primary-500/30 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-white text-base group-hover:text-primary-300 transition-colors">
                        {skill.name}
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        {skill.category.replace('_', ' ')}
                      </span>
                    </div>
                    <Badge variant={profMeta.color} size="sm">
                      {skill.proficiency}
                    </Badge>
                  </div>

                  {/* Proficiency Meter */}
                  <div className="mt-4">
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Proficiency</span>
                      <span className="font-medium text-slate-300">{profMeta.percent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          profMeta.color === 'success'
                            ? 'bg-accent-400'
                            : profMeta.color === 'primary'
                            ? 'bg-primary-500'
                            : profMeta.color === 'purple'
                            ? 'bg-purple-500'
                            : 'bg-slate-400'
                        }`}
                        style={{ width: `${profMeta.percent}%` }}
                      />
                    </div>
                  </div>

                  {skill.evidence && (
                    <p className="mt-3 text-xs text-slate-400 line-clamp-2 bg-white/5 p-2 rounded-lg border border-white/5">
                      💡 {skill.evidence}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-white/5">
                  <button
                    onClick={() => openEditModal(skill)}
                    className="p-1.5 text-xs text-slate-400 hover:text-primary-400 hover:bg-white/5 rounded-lg transition-colors"
                    title="Edit Skill"
                  >
                    Edit ✏️
                  </button>
                  <button
                    onClick={() => setDeletingSkill(skill)}
                    className="p-1.5 text-xs text-slate-400 hover:text-danger-400 hover:bg-danger-500/10 rounded-lg transition-colors"
                    title="Delete Skill"
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
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingSkill ? 'Edit Skill' : 'Add New Skill'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Skill Name"
            id="skillName"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Python, React, PostgreSQL, Docker"
          />

          <Select
            label="Category"
            id="skillCategory"
            options={CATEGORIES.filter((c) => c.value !== 'ALL')}
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />

          <Select
            label="Proficiency Level"
            id="skillProficiency"
            options={PROFICIENCIES.map((p) => ({ value: p.value, label: p.label }))}
            value={form.proficiency}
            onChange={(e) => setForm({ ...form, proficiency: e.target.value })}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">
              Evidence / Proof (Optional)
            </label>
            <textarea
              className="w-full rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 p-3 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              rows={2}
              value={form.evidence}
              onChange={(e) => setForm({ ...form, evidence: e.target.value })}
              placeholder="e.g. 2 years building full-stack apps, solved 150+ LeetCode problems, GitHub project link..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {editingSkill ? 'Save Changes' : 'Add Skill'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── DELETE CONFIRM MODAL ────────────────────────────────────────── */}
      <Modal
        isOpen={!!deletingSkill}
        onClose={() => setDeletingSkill(null)}
        title="Remove Skill"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Are you sure you want to remove <strong>{deletingSkill?.name}</strong> from your profile?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setDeletingSkill(null)}
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
