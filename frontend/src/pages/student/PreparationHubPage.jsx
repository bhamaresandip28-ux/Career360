import { useState, useEffect } from 'react';
import * as careerApi from '../../services/career.service';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import Toast from '../../components/ui/Toast';

const PREP_CATEGORIES = [
  { key: 'ALL', label: 'All Modules', icon: '⚡' },
  { key: 'DSA', label: 'Data Structures & Algorithms', icon: '🧩' },
  { key: 'SYSTEM_DESIGN', label: 'System Design & Arch', icon: '🏛️' },
  { key: 'CORE_CS', label: 'Core CS (OS, DBMS, Networks)', icon: '💻' },
  { key: 'APTITUDE', label: 'Aptitude & Reasoning', icon: '🧠' },
  { key: 'BEHAVIORAL', label: 'HR & Behavioral', icon: '🤝' },
  { key: 'MOCK_TEST', label: 'Mock Assessments', icon: '⏱️' },
];

const DIFFICULTY_COLORS = {
  EASY: 'emerald',
  MEDIUM: 'warning',
  HARD: 'danger',
};

export default function PreparationHubPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const [catalog, setCatalog] = useState({ summary: {}, resources: [] });
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Notes Modal state
  const [editingNotesResource, setEditingNotesResource] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {};
      if (selectedCategory !== 'ALL') filters.category = selectedCategory;
      if (selectedDifficulty !== 'ALL') filters.difficulty = selectedDifficulty;

      const data = await careerApi.getPreparationCatalog(filters);
      setCatalog(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error?.message || err.message || 'Failed to load preparation resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [selectedCategory, selectedDifficulty]);

  const handleToggleStatus = async (resource) => {
    const current = resource.userProgress?.status || 'NOT_STARTED';
    const nextStatus = current === 'COMPLETED' ? 'NOT_STARTED' : 'COMPLETED';

    try {
      await careerApi.updatePrepProgress(resource.id, {
        status: nextStatus,
        notes: resource.userProgress?.notes,
      });

      setCatalog((prev) => ({
        ...prev,
        resources: prev.resources.map((r) =>
          r.id === resource.id
            ? {
                ...r,
                userProgress: {
                  ...r.userProgress,
                  status: nextStatus,
                  completedAt: nextStatus === 'COMPLETED' ? new Date() : null,
                },
              }
            : r
        ),
        summary: {
          ...prev.summary,
          completedModules:
            (prev.summary.completedModules || 0) + (nextStatus === 'COMPLETED' ? 1 : -1),
          progressPercentage: Math.round(
            (((prev.summary.completedModules || 0) + (nextStatus === 'COMPLETED' ? 1 : -1)) /
              (prev.summary.totalModules || 1)) *
              100
          ),
        },
      }));

      setToast({
        type: 'success',
        message: nextStatus === 'COMPLETED' ? 'Module marked as completed! 🎯' : 'Module marked as incomplete.',
      });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to update progress.' });
    }
  };

  const handleOpenNotes = (resource) => {
    setEditingNotesResource(resource);
    setNoteText(resource.userProgress?.notes || '');
  };

  const handleSaveNotes = async (e) => {
    e.preventDefault();
    if (!editingNotesResource) return;

    setSavingNote(true);
    try {
      await careerApi.updatePrepProgress(editingNotesResource.id, {
        status: editingNotesResource.userProgress?.status || 'IN_PROGRESS',
        notes: noteText.trim(),
      });

      setCatalog((prev) => ({
        ...prev,
        resources: prev.resources.map((r) =>
          r.id === editingNotesResource.id
            ? {
                ...r,
                userProgress: {
                  ...r.userProgress,
                  notes: noteText.trim(),
                  status: r.userProgress?.status === 'NOT_STARTED' ? 'IN_PROGRESS' : r.userProgress?.status,
                },
              }
            : r
        ),
      }));

      setToast({ type: 'success', message: 'Study notes saved.' });
      setEditingNotesResource(null);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to save notes.' });
    } finally {
      setSavingNote(false);
    }
  };

  const filteredResources = (catalog.resources || []).filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  const summary = catalog.summary || {};

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header Banner & Preparation Progress Ring */}
      <div className="glass p-6 bg-gradient-card border border-white/10 rounded-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="purple" size="sm">Placement Preparation Hub</Badge>
              <span className="text-xs text-slate-400">• Curated Technical & Interview Syllabus</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Placement Preparation & Practice Hub
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Sharpen your Data Structures, System Architecture, Core CS fundamentals, and Aptitude drills.
              Track your preparation hours and conquer mock technical drives.
            </p>
          </div>

          {/* KPI Mini Matrix */}
          <div className="grid grid-cols-3 gap-3 bg-surface-900/80 p-4 rounded-xl border border-white/10 text-center min-w-[320px]">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Modules</span>
              <span className="text-lg font-bold text-white">
                {summary.completedModules || 0}/{summary.totalModules || 0}
              </span>
            </div>
            <div className="border-x border-white/10">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Prep Time</span>
              <span className="text-lg font-bold text-primary-400">
                {summary.completedHours || 0}h / {summary.totalHours || 0}h
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Progress</span>
              <span className="text-lg font-bold text-accent-400">
                {summary.progressPercentage || 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="space-y-4">
        {/* Category Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {PREP_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.key
                  ? 'bg-primary-600 text-white shadow-glow'
                  : 'bg-surface-900 border border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Secondary Controls: Search & Difficulty Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-900/40 p-3 rounded-xl border border-white/5">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search topics (e.g., Two Pointers, B-Trees, Kafka)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 pl-8 bg-surface-950 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <span className="absolute left-2.5 top-2 text-slate-500 text-xs">🔍</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Difficulty:</span>
            {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors ${
                  selectedDifficulty === diff
                    ? 'bg-white/15 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resource Cards Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loading size="md" text="Loading study modules..." />
        </div>
      ) : error ? (
        <ErrorState title="Failed to Load Modules" message={error} onRetry={fetchCatalog} />
      ) : filteredResources.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-surface-900/30 rounded-2xl border border-white/5">
          <p className="text-base">No preparation resources match your criteria.</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedCategory('ALL');
              setSelectedDifficulty('ALL');
              setSearchQuery('');
            }}
            className="mt-3 text-xs text-primary-400"
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map((resource) => {
            const isCompleted = resource.userProgress?.status === 'COMPLETED';
            const hasNotes = resource.userProgress?.notes?.trim().length > 0;

            return (
              <Card
                key={resource.id}
                className={`flex flex-col justify-between transition-all ${
                  isCompleted
                    ? 'border-emerald-500/30 bg-emerald-500/[0.02]'
                    : 'hover:border-white/20'
                }`}
              >
                <div>
                  {/* Card Top: Category & Difficulty */}
                  <div className="flex items-center justify-between mb-2.5">
                    <Badge variant="purple" size="sm" className="text-[10px]">
                      {resource.category.replace('_', ' ')}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Badge variant={DIFFICULTY_COLORS[resource.difficulty] || 'slate'} size="sm" className="text-[10px]">
                        {resource.difficulty}
                      </Badge>
                      <span className="text-[11px] text-slate-400 font-mono">
                        ⏱️ {resource.estimatedHours}h
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-semibold text-white tracking-tight mb-1.5 line-clamp-2">
                    {resource.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                    {resource.description}
                  </p>

                  {/* Tags */}
                  {resource.tags && resource.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {resource.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-surface-950 text-[10px] text-slate-400 border border-white/5 font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {resource.contentUrl && (
                      <a
                        href={resource.contentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary-400 hover:text-primary-300 transition-colors"
                      >
                        Practice ↗
                      </a>
                    )}
                    <button
                      onClick={() => handleOpenNotes(resource)}
                      className={`text-xs p-1 rounded hover:text-white transition-colors ${
                        hasNotes ? 'text-accent-400' : 'text-slate-500'
                      }`}
                      title={hasNotes ? 'View/edit your notes' : 'Add study notes'}
                    >
                      📝 {hasNotes ? 'Notes (1)' : 'Notes'}
                    </button>
                  </div>

                  <Button
                    variant={isCompleted ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => handleToggleStatus(resource)}
                    className={`text-xs py-1 px-3 ${
                      isCompleted ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : ''
                    }`}
                  >
                    {isCompleted ? '✓ Completed' : 'Mark Done'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Notes Modal */}
      <Modal
        isOpen={!!editingNotesResource}
        onClose={() => setEditingNotesResource(null)}
        title={`Study Notes: ${editingNotesResource?.title || ''}`}
        size="md"
      >
        <form onSubmit={handleSaveNotes} className="space-y-4">
          <p className="text-xs text-slate-400">
            Jot down key takeaways, code snippets, or revision shortcuts for this topic:
          </p>
          <textarea
            rows={5}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="e.g. Mastered the sliding window template: windowEnd expands, windowStart contracts when condition is violated..."
            className="w-full px-3 py-2 bg-surface-950 border border-white/10 rounded-xl text-xs text-white focus:ring-2 focus:ring-primary-500 focus:outline-none font-mono"
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditingNotesResource(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={savingNote}
            >
              {savingNote ? 'Saving...' : 'Save Notes'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
