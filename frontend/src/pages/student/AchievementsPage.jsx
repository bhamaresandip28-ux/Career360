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
  { value: 'HACKATHON', label: 'Hackathon', icon: '🏆' },
  { value: 'COMPETITION', label: 'Coding / Tech Contest', icon: '⚡' },
  { value: 'AWARD', label: 'Academic / Honor Award', icon: '🏅' },
  { value: 'LEADERSHIP', label: 'Leadership & Clubs', icon: '👥' },
  { value: 'PUBLICATION', label: 'Research Publication', icon: '📄' },
  { value: 'SPORTS', label: 'Sports', icon: '⚽' },
  { value: 'CULTURAL', label: 'Cultural & Arts', icon: '🎭' },
  { value: 'OTHER', label: 'Other Distinction', icon: '⭐' },
];

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  const [form, setForm] = useState({
    title: '',
    category: 'HACKATHON',
    date: '',
    description: '',
    proofUrl: '',
  });

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await studentApi.getAchievements();
      setAchievements(res.data?.data?.achievements || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch achievements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const openAddModal = () => {
    setForm({
      title: '',
      category: activeCategory !== 'ALL' ? activeCategory : 'HACKATHON',
      date: '',
      description: '',
      proofUrl: '',
    });
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setForm({
      title: item.title,
      category: item.category,
      date: item.date ? item.date.split('T')[0] : '',
      description: item.description || '',
      proofUrl: item.proofUrl || '',
    });
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) return;

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        category: form.category,
        date: new Date(form.date),
        description: form.description ? form.description.trim() : undefined,
        proofUrl: form.proofUrl ? form.proofUrl.trim() : undefined,
      };

      if (editingItem) {
        await studentApi.updateAchievement(editingItem.id, payload);
        setToast({ type: 'success', message: 'Achievement updated!' });
      } else {
        await studentApi.createAchievement(payload);
        setToast({ type: 'success', message: 'Achievement recorded!' });
      }

      setIsModalOpen(false);
      await fetchAchievements();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to save achievement.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setSaving(true);
    try {
      await studentApi.deleteAchievement(deletingItem.id);
      setToast({ type: 'success', message: 'Achievement removed.' });
      setDeletingItem(null);
      await fetchAchievements();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to delete achievement.' });
    } finally {
      setSaving(false);
    }
  };

  const filtered = activeCategory === 'ALL'
    ? achievements
    : achievements.filter((a) => a.category === activeCategory);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loading size="lg" text="Loading student achievements..." />
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Achievements Error" message={error} onRetry={fetchAchievements} />;
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
          <h2 className="font-display font-bold text-2xl text-[#001D39]">Honors & Achievements</h2>
          <p className="text-slate-600 text-sm mt-1 max-w-xl">
            National hackathons, competitive coding ranks, publications, leadership roles, and extracurricular distinctions.
          </p>
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
            <span>Total Accolades: <strong className="text-[#001D39]">{achievements.length}</strong></span>
          </div>
        </div>
        <Button variant="primary" onClick={openAddModal} className="flex-shrink-0">
          + Add Achievement
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const count = cat.value === 'ALL' ? achievements.length : achievements.filter(a => a.category === cat.value).length;
          const isActive = activeCategory === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#0A4174] text-white shadow-sm'
                  : 'bg-white border border-[#BDD8E9]/70 text-slate-600 hover:text-[#001D39] hover:bg-slate-50'
              }`}
            >
              {cat.icon && <span>{cat.icon}</span>}
              <span>{cat.label}</span>
              {count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-black/20 text-white' : 'bg-[#BDD8E9]/40 text-[#0A4174] font-semibold'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Achievements List */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon="🏆"
            title="No achievements found"
            description="Add your hackathon wins, top leaderboard finishes, leadership roles, or research papers."
            action={
              <Button variant="primary" size="sm" onClick={openAddModal}>
                + Add Achievement Now
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => {
            const catMeta = CATEGORIES.find(c => c.value === item.category);
            return (
              <div
                key={item.id}
                className="p-6 bg-white rounded-2xl border border-[#BDD8E9]/70 shadow-card hover:border-[#0A4174]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-[#001D39] text-base leading-snug">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="warning" size="sm">
                          {catMeta?.icon || '🏆'} {catMeta?.label || item.category}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 font-medium">
                    {new Date(item.date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                  </p>

                  {item.description && (
                    <p className="text-sm text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
                  {item.proofUrl ? (
                    <a
                      href={item.proofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#0A4174] hover:text-[#001D39] font-medium flex items-center gap-1"
                    >
                      <span>Certificate / Link ↗</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400">Self-attested</span>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="text-xs text-slate-500 hover:text-[#0A4174] p-1.5 transition-colors"
                    >
                      Edit ✏️
                    </button>
                    <button
                      onClick={() => setDeletingItem(item)}
                      className="text-xs text-slate-500 hover:text-rose-600 p-1.5 transition-colors"
                    >
                      Delete 🗑️
                    </button>
                  </div>
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
        title={editingItem ? 'Edit Achievement' : 'Add Achievement'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Achievement / Honor Title"
            id="achTitle"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. 1st Place - Smart India Hackathon 2024"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              id="achCategory"
              options={CATEGORIES.filter((c) => c.value !== 'ALL')}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <Input
              label="Date Awarded"
              id="achDate"
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Description & Impact</label>
            <textarea
              className="w-full rounded-xl bg-white border border-slate-300 text-sm text-[#001D39] placeholder-slate-400 p-3 focus:outline-none focus:ring-2 focus:ring-[#0A4174]"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Highlight team accomplishments, rank achieved, competition scope, or certificate details..."
            />
          </div>

          <Input
            label="Certificate / Proof URL"
            id="proofUrl"
            type="url"
            value={form.proofUrl}
            onChange={(e) => setForm({ ...form, proofUrl: e.target.value })}
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
              {editingItem ? 'Save Changes' : 'Add Achievement'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── DELETE MODAL ────────────────────────────────────────────────── */}
      <Modal
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        title="Remove Achievement"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <strong>{deletingItem?.title}</strong>?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setDeletingItem(null)}
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
