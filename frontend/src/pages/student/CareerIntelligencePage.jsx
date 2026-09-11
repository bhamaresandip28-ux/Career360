import { useState, useEffect } from 'react';
import * as careerApi from '../../services/career.service';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import Toast from '../../components/ui/Toast';

const CATEGORY_ICONS = {
  ACADEMIC: '🎓',
  SKILL: '⚡',
  PROJECT: '💻',
  INTERNSHIP: '🏢',
  CERTIFICATION: '🏅',
  PREPARATION: '📚',
};

const PRIORITY_BADGES = {
  HIGH: 'danger',
  MEDIUM: 'warning',
  LOW: 'slate',
};

export default function CareerIntelligencePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Core data states
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [skillGap, setSkillGap] = useState(null);
  const [roadmap, setRoadmap] = useState({ summary: {}, items: [] });

  // Filtering and interaction states
  const [activeTab, setActiveTab] = useState('ALL'); // Roadmap category filter
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);
  const [savingMilestone, setSavingMilestone] = useState(false);

  // New milestone form
  const [milestoneForm, setMilestoneForm] = useState({
    title: '',
    description: '',
    category: 'SKILL',
    priority: 'HIGH',
    dueDate: '',
  });

  const loadData = async (roleId = null) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all roles & active target role
      const [allRoles, currentRole] = await Promise.all([
        careerApi.getTargetRoles(),
        careerApi.getMyTargetRole(),
      ]);

      setRoles(allRoles);

      const targetId = roleId || currentRole?.id || (allRoles[0] ? allRoles[0].id : null);
      const activeRoleObj = allRoles.find((r) => r.id === targetId) || currentRole || allRoles[0];
      setSelectedRole(activeRoleObj);

      if (targetId) {
        const [readinessData, gapData, roadmapData] = await Promise.all([
          careerApi.getReadiness(targetId),
          careerApi.getSkillGap(targetId),
          careerApi.getRoadmap(),
        ]);

        setReadiness(readinessData);
        setSkillGap(gapData);
        setRoadmap(roadmapData);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error?.message || err.message || 'Failed to load career intelligence.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = async (newRoleId) => {
    if (newRoleId === selectedRole?.id) return;
    setSwitchingRole(true);
    try {
      await careerApi.setTargetRole(newRoleId);
      const chosen = roles.find((r) => r.id === newRoleId);
      setSelectedRole(chosen);

      const [readinessData, gapData] = await Promise.all([
        careerApi.getReadiness(newRoleId),
        careerApi.getSkillGap(newRoleId),
      ]);

      setReadiness(readinessData);
      setSkillGap(gapData);
      setToast({ type: 'success', message: `Target role updated to ${chosen.name}.` });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to switch target role.' });
    } finally {
      setSwitchingRole(false);
    }
  };

  const handleToggleMilestone = async (item) => {
    const nextStatus = item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      const updated = await careerApi.updateRoadmapItem(item.id, { status: nextStatus });
      setRoadmap((prev) => ({
        ...prev,
        items: prev.items.map((i) => (i.id === item.id ? updated : i)),
        summary: {
          ...prev.summary,
          completed: prev.summary.completed + (nextStatus === 'COMPLETED' ? 1 : -1),
        },
      }));
      setToast({
        type: 'success',
        message: nextStatus === 'COMPLETED' ? `Milestone completed! 🎉` : 'Milestone reopened.',
      });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to update milestone status.' });
    }
  };

  const handleQuickAddSkillToRoadmap = async (skill) => {
    try {
      const newItem = await careerApi.createRoadmapItem({
        title: `Master ${skill.name} (${skill.requiredProficiency})`,
        description: `Acquire required ${skill.importance.toLowerCase()} skill proficiency for ${selectedRole?.name}.`,
        category: 'SKILL',
        priority: skill.importance === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
        targetRoleId: selectedRole?.id,
      });

      setRoadmap((prev) => ({
        ...prev,
        items: [newItem, ...prev.items],
        summary: { ...prev.summary, total: prev.summary.total + 1, pending: prev.summary.pending + 1 },
      }));
      setToast({ type: 'success', message: `Added "${skill.name}" to your career roadmap!` });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to add milestone.' });
    }
  };

  const handleCreateMilestone = async (e) => {
    e.preventDefault();
    if (!milestoneForm.title.trim()) return;

    setSavingMilestone(true);
    try {
      const payload = {
        title: milestoneForm.title.trim(),
        description: milestoneForm.description ? milestoneForm.description.trim() : undefined,
        category: milestoneForm.category,
        priority: milestoneForm.priority,
        dueDate: milestoneForm.dueDate || undefined,
        targetRoleId: selectedRole?.id,
      };

      const created = await careerApi.createRoadmapItem(payload);
      setRoadmap((prev) => ({
        ...prev,
        items: [created, ...prev.items],
        summary: { ...prev.summary, total: prev.summary.total + 1, pending: prev.summary.pending + 1 },
      }));

      setIsAddModalOpen(false);
      setMilestoneForm({
        title: '',
        description: '',
        category: 'SKILL',
        priority: 'HIGH',
        dueDate: '',
      });
      setToast({ type: 'success', message: 'Career roadmap milestone created!' });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to save milestone.' });
    } finally {
      setSavingMilestone(false);
    }
  };

  const handleDeleteMilestone = async (id) => {
    try {
      await careerApi.deleteRoadmapItem(id);
      setRoadmap((prev) => ({
        ...prev,
        items: prev.items.filter((i) => i.id !== id),
        summary: { ...prev.summary, total: prev.summary.total - 1 },
      }));
      setToast({ type: 'info', message: 'Milestone removed.' });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to delete milestone.' });
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loading size="lg" text="Analyzing Career Readiness & Industry Gap Data..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to Load Career Intelligence"
        message={error}
        onRetry={() => loadData()}
      />
    );
  }

  const score = readiness?.score ?? 0;
  const filteredMilestones = roadmap.items.filter((item) => {
    if (activeTab === 'ALL') return true;
    return item.category === activeTab;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Toast */}
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header Banner & Target Role Switcher */}
      <div className="glass p-6 bg-gradient-card border border-white/10 rounded-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="purple" size="sm">Phase 6 — Career Intelligence</Badge>
              <span className="text-xs text-slate-400">• Real-Time Industry Benchmarking</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Career Readiness & Skill Gap Hub
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Benchmark your verified academic records, projects, and skills against top industry roles.
              Discover skill gaps and conquer your personalized roadmap milestones.
            </p>
          </div>

          {/* Role Picker Card */}
          <div className="bg-surface-900/80 p-4 rounded-xl border border-white/10 flex flex-col sm:flex-row sm:items-center gap-4 min-w-[320px]">
            <div className="flex-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                Target Role Benchmark
              </label>
              <select
                value={selectedRole?.id || ''}
                onChange={(e) => handleRoleChange(e.target.value)}
                disabled={switchingRole}
                className="w-full px-3 py-2 bg-surface-950 border border-white/15 rounded-lg text-sm text-white font-medium focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id} className="bg-surface-900 text-white">
                    {r.name} (Avg {r.averageCtcLpa} LPA)
                  </option>
                ))}
              </select>
            </div>
            <div className="text-left sm:text-right border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-4">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Avg Package</span>
              <span className="text-lg font-bold text-accent-400 tracking-tight">
                ₹{selectedRole?.averageCtcLpa || '—'} LPA
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Analytics Grid: Readiness Gauge & 5-Pillar Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 Cols: Career Readiness Score Gauge */}
        <Card className="lg:col-span-4 flex flex-col justify-between">
          <div>
            <Card.Header>
              <Card.Title>Career Readiness Score</Card.Title>
              <Card.Description>5-pillar algorithmic evaluation for campus recruitment</Card.Description>
            </Card.Header>

            {/* Circular Gauge Visual */}
            <div className="flex flex-col items-center justify-center my-6">
              <div className="relative flex items-center justify-center w-48 h-48">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="14"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    fill="none"
                    stroke={
                      score >= 85 ? '#10b981' : score >= 70 ? '#6366f1' : score >= 50 ? '#f59e0b' : '#ef4444'
                    }
                    strokeWidth="14"
                    strokeDasharray={2 * Math.PI * 80}
                    strokeDashoffset={(2 * Math.PI * 80) * (1 - score / 100)}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-extrabold text-white tracking-tight">{score}</span>
                  <span className="text-xs text-slate-400 font-medium mt-0.5">out of 100</span>
                  <Badge variant={readiness?.tierBadge || 'slate'} size="sm" className="mt-2 text-[10px]">
                    {readiness?.tierLabel || 'Emerging'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Recommendations Alert */}
          {readiness?.recommendations && readiness.recommendations.length > 0 && (
            <div className="p-3.5 rounded-xl bg-primary-500/10 border border-primary-500/20 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 font-semibold text-primary-300 mb-1">
                <span>💡 Top Action Item</span>
              </div>
              <p>{readiness.recommendations[0].message}</p>
            </div>
          )}
        </Card>

        {/* Right 8 Cols: 5-Pillar Detailed Progress Bars */}
        <Card className="lg:col-span-8 flex flex-col justify-between">
          <Card.Header>
            <div className="flex items-center justify-between">
              <div>
                <Card.Title>Readiness Pillars Breakdown</Card.Title>
                <Card.Description>Verified criteria measured against campus recruitment standards</Card.Description>
              </div>
              <Badge variant="slate" size="sm">
                Target Min CGPA: {selectedRole?.minCgpa || 6.5}
              </Badge>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              {readiness?.pillars?.map((p) => (
                <div key={p.key} className="space-y-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{p.label}</span>
                    <span className="font-mono text-slate-400">
                      <strong className="text-white font-bold">{p.score}</strong> / {p.max} pts
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-950 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        p.percentage >= 80 ? 'bg-emerald-500' : p.percentage >= 50 ? 'bg-primary-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${p.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Strategic Advice Footer */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-white/10 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <span className="text-base">🚀</span>
                <span>
                  <strong>Projects & Deployments:</strong> Live links with functional GitHub repos add up to +8 pts to technical readiness.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-base">🎯</span>
                <span>
                  <strong>Skill Match:</strong> Acquiring critical role skills directly raises your placement candidate tier.
                </span>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Skill Gap Analysis Matrix */}
      <Card>
        <Card.Header>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <Card.Title>Skill Gap Analysis: {selectedRole?.name}</Card.Title>
              <Card.Description>
                Comparing your verified profile skills against market expectations for this role
              </Card.Description>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs text-slate-400">
                Skills Match:{' '}
                <strong className="text-white text-sm font-mono">
                  {skillGap?.matchPercentage ?? 0}%
                </strong>
              </div>
              <div className="w-24 h-2 rounded-full bg-surface-950 overflow-hidden">
                <div
                  className="h-full bg-gradient-brand rounded-full transition-all duration-500"
                  style={{ width: `${skillGap?.matchPercentage ?? 0}%` }}
                />
              </div>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Missing Critical Skills */}
            <div className="space-y-3 p-4 rounded-xl bg-danger-500/5 border border-danger-500/15">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-danger-400 flex items-center gap-1.5">
                  <span>🚨</span> Missing Critical Skills
                </h4>
                <Badge variant="danger" size="sm">{skillGap?.missingCritical?.length || 0}</Badge>
              </div>
              <p className="text-xs text-slate-400">Mandatory skills required by recruiters for this job profile.</p>

              <div className="space-y-2 mt-3">
                {skillGap?.missingCritical?.length > 0 ? (
                  skillGap.missingCritical.map((skill, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-surface-900 border border-danger-500/20 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-sm font-semibold text-white block">{skill.name}</span>
                        <span className="text-[10px] text-danger-300 font-medium">
                          Required: {skill.requiredProficiency}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAddSkillToRoadmap(skill)}
                        className="text-[11px] py-1 px-2.5 hover:border-danger-400"
                      >
                        + Roadmap
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-emerald-400 py-3 font-medium text-center">
                    ✨ No missing critical skills! Excellent work.
                  </p>
                )}
              </div>
            </div>

            {/* 2. Needs Level-Up Skills */}
            <div className="space-y-3 p-4 rounded-xl bg-warning-500/5 border border-warning-500/15">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-warning-400 flex items-center gap-1.5">
                  <span>📈</span> Needs Level-Up
                </h4>
                <Badge variant="warning" size="sm">{skillGap?.needsLevelUp?.length || 0}</Badge>
              </div>
              <p className="text-xs text-slate-400">Skills you know, but need deeper proficiency for this role.</p>

              <div className="space-y-2 mt-3">
                {skillGap?.needsLevelUp?.length > 0 ? (
                  skillGap.needsLevelUp.map((skill, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-surface-900 border border-warning-500/20 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-sm font-semibold text-white block">{skill.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          You: <span className="text-warning-300">{skill.studentProficiency}</span> → Need: <span className="text-white">{skill.requiredProficiency}</span>
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuickAddSkillToRoadmap(skill)}
                        className="text-[11px] py-1 px-2.5 text-warning-400 hover:text-warning-300"
                      >
                        Practice ↗
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-3 text-center">No partial proficiency gaps.</p>
                )}
              </div>
            </div>

            {/* 3. Acquired & Verified Skills */}
            <div className="space-y-3 p-4 rounded-xl bg-accent-500/5 border border-accent-500/15">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-accent-400 flex items-center gap-1.5">
                  <span>✅</span> Acquired & Verified
                </h4>
                <Badge variant="emerald" size="sm">{skillGap?.acquired?.length || 0}</Badge>
              </div>
              <p className="text-xs text-slate-400">Skills matching or exceeding required industry standards.</p>

              <div className="space-y-2 mt-3">
                {skillGap?.acquired?.length > 0 ? (
                  skillGap.acquired.map((skill, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-surface-900 border border-accent-500/20 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-sm font-semibold text-white block">{skill.name}</span>
                        <span className="text-[10px] text-accent-300 font-mono">
                          Proficiency: {skill.studentProficiency}
                        </span>
                      </div>
                      <span className="text-xs text-accent-400 font-bold">✓ Ready</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-3 text-center">
                    Add verified skills in your profile to see matches here.
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Interactive Career Roadmap Checklist */}
      <Card>
        <Card.Header>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Card.Title>Personalized Career Roadmap</Card.Title>
              <Card.Description>
                Track your active milestones, placement goals, and skill acquisitions
              </Card.Description>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              className="self-start sm:self-auto"
            >
              + Add Milestone
            </Button>
          </div>

          {/* Progress Bar & Category Filter Pills */}
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-400">
                Progress: <strong className="text-white">{roadmap.summary.completionPercentage || 0}%</strong> ({roadmap.summary.completed || 0}/{roadmap.summary.total || 0} Done)
              </span>
              <div className="w-32 h-2 rounded-full bg-surface-950 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${roadmap.summary.completionPercentage || 0}%` }}
                />
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {['ALL', 'SKILL', 'PROJECT', 'PREPARATION', 'CERTIFICATION', 'INTERNSHIP', 'ACADEMIC'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                    activeTab === cat
                      ? 'bg-primary-600 text-white shadow-glow'
                      : 'bg-surface-900 text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cat === 'ALL' ? 'All' : `${CATEGORY_ICONS[cat] || ''} ${cat}`}
                </button>
              ))}
            </div>
          </div>
        </Card.Header>

        <Card.Body>
          <div className="space-y-3">
            {filteredMilestones.length > 0 ? (
              filteredMilestones.map((item) => {
                const isDone = item.status === 'COMPLETED';
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isDone
                        ? 'bg-emerald-500/[0.03] border-emerald-500/20 opacity-75'
                        : 'bg-surface-900/60 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <button
                        onClick={() => handleToggleMilestone(item)}
                        className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                          isDone
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-white/20 hover:border-white/40 text-transparent'
                        }`}
                      >
                        ✓
                      </button>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`font-semibold text-sm ${
                              isDone ? 'line-through text-slate-400' : 'text-white'
                            }`}
                          >
                            {item.title}
                          </span>
                          <Badge variant={PRIORITY_BADGES[item.priority] || 'slate'} size="sm">
                            {item.priority}
                          </Badge>
                          <Badge variant="purple" size="sm">
                            {CATEGORY_ICONS[item.category] || '📌'} {item.category}
                          </Badge>
                        </div>
                        {item.description && (
                          <p className="text-xs text-slate-400 mt-1 max-w-xl">
                            {item.description}
                          </p>
                        )}
                        {item.dueDate && (
                          <p className="text-[11px] text-slate-500 mt-1">
                            Target Date: {new Date(item.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMilestone(item.id)}
                        className="text-xs text-slate-500 hover:text-danger-400 p-1.5"
                        title="Remove milestone"
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-slate-400">
                <p className="text-sm">No milestones found in this category.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-3 text-xs"
                >
                  + Add New Goal
                </Button>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Add Milestone Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Career Roadmap Milestone"
        size="md"
      >
        <form onSubmit={handleCreateMilestone} className="space-y-4">
          <Input
            label="Milestone Title *"
            placeholder="e.g. Master Binary Trees & Graph BFS"
            value={milestoneForm.title}
            onChange={(e) => setMilestoneForm((f) => ({ ...f, title: e.target.value }))}
            required
          />

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Actionable notes or learning syllabus..."
              value={milestoneForm.description}
              onChange={(e) => setMilestoneForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2 bg-surface-950 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              value={milestoneForm.category}
              onChange={(e) => setMilestoneForm((f) => ({ ...f, category: e.target.value }))}
              options={[
                { value: 'SKILL', label: '⚡ Skill Acquisition' },
                { value: 'PROJECT', label: '💻 Technical Project' },
                { value: 'PREPARATION', label: '📚 Preparation & DSA' },
                { value: 'CERTIFICATION', label: '🏅 Certification' },
                { value: 'INTERNSHIP', label: '🏢 Internship / Job' },
                { value: 'ACADEMIC', label: '🎓 Academic / CGPA' },
              ]}
            />
            <Select
              label="Priority"
              value={milestoneForm.priority}
              onChange={(e) => setMilestoneForm((f) => ({ ...f, priority: e.target.value }))}
              options={[
                { value: 'HIGH', label: '🔥 High Priority' },
                { value: 'MEDIUM', label: '⚡ Medium Priority' },
                { value: 'LOW', label: '🌱 Low Priority' },
              ]}
            />
          </div>

          <Input
            type="date"
            label="Target Due Date (Optional)"
            value={milestoneForm.dueDate}
            onChange={(e) => setMilestoneForm((f) => ({ ...f, dueDate: e.target.value }))}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={savingMilestone || !milestoneForm.title.trim()}
            >
              {savingMilestone ? 'Adding...' : 'Add Milestone'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
