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
  { value: 'WEB', label: 'Web Application' },
  { value: 'MOBILE', label: 'Mobile App' },
  { value: 'AI_ML', label: 'AI & Machine Learning' },
  { value: 'DATA_SCIENCE', label: 'Data Science & Analytics' },
  { value: 'DESKTOP', label: 'Desktop Application' },
  { value: 'IOT', label: 'IoT & Hardware' },
  { value: 'GAME', label: 'Game Development' },
  { value: 'OTHER', label: 'Other' },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('ALL');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    techStack: '',
    role: '',
    category: 'WEB',
    isTeam: false,
    teamSize: '',
    startDate: '',
    endDate: '',
    githubUrl: '',
    liveUrl: '',
  });

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await studentApi.getProjects();
      setProjects(res.data?.data?.projects || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openAddModal = () => {
    setForm({
      title: '',
      description: '',
      techStack: '',
      role: '',
      category: activeCategory !== 'ALL' ? activeCategory : 'WEB',
      isTeam: false,
      teamSize: '',
      startDate: '',
      endDate: '',
      githubUrl: '',
      liveUrl: '',
    });
    setEditingProject(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (proj) => {
    setForm({
      title: proj.title,
      description: proj.description,
      techStack: (proj.techStack || []).join(', '),
      role: proj.role || '',
      category: proj.category,
      isTeam: proj.isTeam,
      teamSize: proj.teamSize ? String(proj.teamSize) : '',
      startDate: proj.startDate ? proj.startDate.split('T')[0] : '',
      endDate: proj.endDate ? proj.endDate.split('T')[0] : '',
      githubUrl: proj.githubUrl || '',
      liveUrl: proj.liveUrl || '',
    });
    setEditingProject(proj);
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;

    setSaving(true);
    try {
      const techStackArray = form.techStack
        ? form.techStack.split(',').map((t) => t.trim()).filter(Boolean)
        : [];
      if (techStackArray.length === 0) {
        techStackArray.push('General');
      }

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        techStack: techStackArray,
        role: form.role?.trim() || undefined,
        category: form.category,
        isTeam: form.isTeam,
        teamSize: form.isTeam && form.teamSize ? parseInt(form.teamSize, 10) : undefined,
        startDate: form.startDate ? form.startDate : undefined,
        endDate: form.endDate ? form.endDate : undefined,
        githubUrl: form.githubUrl?.trim() || undefined,
        liveUrl: form.liveUrl?.trim() || undefined,
      };

      if (editingProject) {
        await studentApi.updateProject(editingProject.id, payload);
        setToast({ type: 'success', message: 'Project updated!' });
      } else {
        await studentApi.createProject(payload);
        setToast({ type: 'success', message: 'Project added to your portfolio!' });
      }

      setIsAddModalOpen(false);
      await fetchProjects();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to save project.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProject) return;
    setSaving(true);
    try {
      await studentApi.deleteProject(deletingProject.id);
      setToast({ type: 'success', message: 'Project deleted.' });
      setDeletingProject(null);
      await fetchProjects();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to delete project.' });
    } finally {
      setSaving(false);
    }
  };

  const filteredProjects = activeCategory === 'ALL'
    ? projects
    : projects.filter((p) => p.category === activeCategory);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loading size="lg" text="Loading student projects..." />
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Projects Error" message={error} onRetry={fetchProjects} />;
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
          <h2 className="font-display font-bold text-2xl text-[#001D39]">Project Showcase</h2>
          <p className="text-slate-600 text-sm mt-1 max-w-xl">
            Real-world projects validate your problem-solving, architectural skills, and tool expertise for recruitment drives.
          </p>
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
            <span>Total Projects: <strong className="text-[#001D39]">{projects.length}</strong></span>
            <span>• Team: <strong className="text-[#0A4174]">{projects.filter(p => p.isTeam).length}</strong></span>
            <span>• Solo: <strong className="text-[#4E8EA2]">{projects.filter(p => !p.isTeam).length}</strong></span>
          </div>
        </div>
        <Button variant="primary" onClick={openAddModal} className="flex-shrink-0">
          + Add Project
        </Button>
      </div>

      {/* Categories */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const count = cat.value === 'ALL' ? projects.length : projects.filter(p => p.category === cat.value).length;
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

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <Card>
          <EmptyState
            icon="💻"
            title="No projects found"
            description={
              activeCategory === 'ALL'
                ? 'Showcase your engineering capabilities by adding academic, hackathon, or personal projects.'
                : `No projects found under "${CATEGORIES.find(c => c.value === activeCategory)?.label}".`
            }
            action={
              <Button variant="primary" size="sm" onClick={openAddModal}>
                + Add Project Now
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="p-6 bg-white rounded-2xl border border-[#BDD8E9]/70 shadow-card hover:border-[#0A4174]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-[#001D39] text-lg leading-snug">
                      {proj.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="primary" size="sm">
                        {proj.category.replace('_', ' ')}
                      </Badge>
                      {proj.isTeam ? (
                        <Badge variant="teal" size="sm">
                          Team {proj.teamSize ? `(${proj.teamSize})` : ''}
                        </Badge>
                      ) : (
                        <Badge variant="slate" size="sm">Solo</Badge>
                      )}
                      {proj.role && (
                        <span className="text-xs text-slate-500">
                          Role: <strong className="text-[#001D39] font-medium">{proj.role}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  {proj.description}
                </p>

                {/* Tech Stack */}
                {proj.techStack && proj.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {proj.techStack.map((tech, i) => (
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

              {/* Footer Links & Actions */}
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-slate-600 hover:text-[#0A4174] flex items-center gap-1.5 font-medium transition-colors"
                    >
                      <span>🐙 Code</span>
                    </a>
                  )}
                  {proj.liveUrl && (
                    <a
                      href={proj.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#0A4174] hover:text-[#001D39] flex items-center gap-1.5 font-semibold transition-colors"
                    >
                      <span>🌐 Live Demo</span>
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(proj)}
                    className="text-xs text-slate-500 hover:text-[#0A4174] p-1.5 transition-colors"
                  >
                    Edit ✏️
                  </button>
                  <button
                    onClick={() => setDeletingProject(proj)}
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
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'Add Project'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Project Title"
            id="projTitle"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Distributed Task Scheduler, E-Commerce Platform"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              id="projCategory"
              options={CATEGORIES.filter((c) => c.value !== 'ALL')}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <Input
              label="Your Role"
              id="projRole"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="e.g. Lead Architect, Backend Engineer"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">
              Project Description <span className="text-danger-400">*</span>
            </label>
            <textarea
              className="w-full rounded-xl bg-white border border-slate-300 text-sm text-[#001D39] placeholder-slate-400 p-3 focus:outline-none focus:ring-2 focus:ring-[#0A4174]"
              rows={3}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Explain what the project does, problems it solves, and its architecture..."
            />
          </div>

          <Input
            label="Tech Stack (comma separated)"
            id="projTech"
            value={form.techStack}
            onChange={(e) => setForm({ ...form, techStack: e.target.value })}
            placeholder="e.g. Node.js, React, PostgreSQL, Docker, Redis, TailwindCSS"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-[#F4F7FB] rounded-xl border border-[#BDD8E9]/60">
              <input
                type="checkbox"
                id="isTeam"
                checked={form.isTeam}
                onChange={(e) => setForm({ ...form, isTeam: e.target.checked })}
                className="w-4 h-4 rounded text-[#0A4174] focus:ring-[#0A4174]"
              />
              <label htmlFor="isTeam" className="text-sm font-medium text-slate-700 cursor-pointer">
                Team Project
              </label>
            </div>
            {form.isTeam && (
              <Input
                label="Team Size"
                id="teamSize"
                type="number"
                min="2"
                max="20"
                value={form.teamSize}
                onChange={(e) => setForm({ ...form, teamSize: e.target.value })}
                placeholder="Number of members"
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="GitHub Repository URL"
              id="githubUrl"
              type="url"
              value={form.githubUrl}
              onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
              placeholder="https://github.com/..."
            />
            <Input
              label="Live Demo / Deployment URL"
              id="liveUrl"
              type="url"
              value={form.liveUrl}
              onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {editingProject ? 'Save Changes' : 'Add Project'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── DELETE CONFIRM MODAL ────────────────────────────────────────── */}
      <Modal
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        title="Delete Project"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete project <strong>{deletingProject?.title}</strong>?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setDeletingProject(null)}
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
