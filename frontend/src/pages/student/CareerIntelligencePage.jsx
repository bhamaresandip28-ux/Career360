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

      const [allRoles, currentRole, roadmapData] = await Promise.all([
        careerApi.getTargetRoles(),
        roleId ? Promise.resolve(null) : careerApi.getMyTargetRole(),
        careerApi.getRoadmap(),
      ]);

      setRoles(allRoles || []);
      const activeRole = roleId
        ? allRoles.find((r) => r.id === roleId)
        : currentRole || allRoles[0];

      setSelectedRole(activeRole);
      setRoadmap(roadmapData || { summary: {}, items: [] });

      if (activeRole) {
        const [readinessData, gapData] = await Promise.all([
          careerApi.getReadiness(activeRole.id),
          careerApi.getSkillGap(activeRole.id),
        ]);
        setReadiness(readinessData);
        setSkillGap(gapData);
      }
    } catch (err) {
      console.error('Failed to load career intelligence:', err);
      setError(err.message || 'Unable to load career intelligence data.');
    } finally {
      setLoading(false);
      setSwitchingRole(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = async (newRoleId) => {
    try {
      setSwitchingRole(true);
      await careerApi.setTargetRole(newRoleId);
      setToast({ type: 'success', message: 'Target role updated successfully!' });
      await loadData(newRoleId);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to update target role.' });
      setSwitchingRole(false);
    }
  };

  const handleToggleMilestone = async (item) => {
    const newStatus = item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      const updated = await careerApi.updateRoadmapItem(item.id, { status: newStatus });
      setRoadmap((prev) => {
        const items = prev.items.map((i) => (i.id === item.id ? updated : i));
        const completed = items.filter((i) => i.status === 'COMPLETED').length;
        return {
          ...prev,
          items,
          summary: {
            ...prev.summary,
            completed,
            pending: items.length - completed,
            completionPercentage: Math.round((completed / items.length) * 100),
          },
        };
      });
      setToast({
        type: 'success',
        message: newStatus === 'COMPLETED' ? 'Milestone completed!' : 'Milestone marked as pending.',
      });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to update milestone.' });
    }
  };

  const handleQuickAddSkillToRoadmap = async (skill) => {
    try {
      const payload = {
        title: `Master ${skill.name}`,
        description: `Acquire ${skill.requiredProficiency || 'Intermediate'} level proficiency in ${skill.name} for ${selectedRole?.name}.`,
        category: 'SKILL',
        priority: 'HIGH',
        targetRoleId: selectedRole?.id,
      };
      const newItem = await careerApi.createRoadmapItem(payload);
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
        <Loading size="lg" label="Analyzing Career Readiness & Industry Gap Data..." />
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
    <div className="space-y-8 animate-fade-in pb-16 p-6 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header Banner & Target Role Switcher (Clean White Card) */}
      <div className="p-6 bg-white border border-[#BDD8E9]/80 rounded-2xl shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="primary" size="sm">Career Intelligence</Badge>
              <span className="text-xs text-slate-500">• Real-Time Industry Benchmarking</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#001D39] tracking-tight">
              Career Readiness &amp; Skill Gap Hub
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Benchmark your verified academic records, projects, and skills against top industry roles.
              Discover skill gaps and conquer your personalized roadmap milestones.
            </p>
          </div>

          {/* Role Picker Card */}
          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center gap-4 min-w-[320px]">
            <div className="flex-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#001D39] block mb-1.5">
                Target Role Benchmark
              </label>
              <select
                value={selectedRole?.id || ''}
                onChange={(e) => handleRoleChange(e.target.value)}
                disabled={switchingRole}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-[#001D39] font-medium focus:ring-2 focus:ring-[#0A4174]/20 focus:border-[#0A4174] focus:outline-none transition-colors shadow-sm"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id} className="bg-white text-[#001D39]">
                    {r.name} (Avg {r.averageCtcLpa} LPA)
                  </option>
                ))}
              </select>
            </div>
            <div className="text-left sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-4">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Avg Package</span>
              <span className="text-lg font-bold text-[#0A4174] tracking-tight">
                ₹{selectedRole?.averageCtcLpa || '—'} LPA
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Analytics Grid: Readiness Gauge & 5-Pillar Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 Cols: Career Readiness Score Gauge */}
        <Card className="lg:col-span-4 flex flex-col justify-between bg-white border border-[#BDD8E9]/70 shadow-sm">
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
                    stroke="#BDD8E9"
                    strokeWidth="12"
                    opacity="0.5"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    fill="none"
                    stroke={
                      score >= 85 ? '#10B981' : score >= 70 ? '#0A4174' : score >= 50 ? '#F59E0B' : '#EF4444'
                    }
                    strokeWidth="12"
                    strokeDasharray={2 * Math.PI * 80}
                    strokeDashoffset={(2 * Math.PI * 80) * (1 - score / 100)}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-extrabold text-[#001D39] tracking-tight">{score}</span>
                  <span className="text-xs text-slate-500 font-medium mt-0.5">out of 100</span>
                  <Badge variant={readiness?.tierBadge || 'primary'} size="sm" className="mt-2 text-[10px]">
                    {readiness?.tierLabel || 'Emerging'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Recommendations Alert */}
          {readiness?.recommendations && readiness.recommendations.length > 0 && (
            <div className="p-3.5 rounded-xl bg-[#BDD8E9]/20 border border-[#BDD8E9] text-xs text-slate-700">
              <div className="flex items-center gap-1.5 font-semibold text-[#0A4174] mb-1">
                <span>💡 Top Action Item</span>
              </div>
              <p>{readiness.recommendations[0].message}</p>
            </div>
          )}
        </Card>

        {/* Right 8 Cols: 5-Pillar Detailed Progress Bars */}
        <Card className="lg:col-span-8 flex flex-col justify-between bg-white border border-[#BDD8E9]/70 shadow-sm">
          <Card.Header>
            <div className="flex items-center justify-between">
              <div>
                <Card.Title>Readiness Pillars Breakdown</Card.Title>
                <Card.Description>Verified criteria measured against campus recruitment standards</Card.Description>
              </div>
              <Badge variant="primary" size="sm">
                Target Min CGPA: {selectedRole?.minCgpa || 6.5}
              </Badge>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              {readiness?.pillars?.map((p) => (
                <div key={p.key} className="space-y-1.5 p-3 rounded-xl bg-[#F8FAFC] border border-slate-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#001D39]">{p.label}</span>
                    <span className="font-mono text-slate-500">
                      <strong className="text-[#0A4174] font-bold">{p.score}</strong> / {p.max} pts
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        p.percentage >= 80 ? 'bg-emerald-600' : p.percentage >= 50 ? 'bg-[#0A4174]' : 'bg-amber-500'
                      }`}
                      style={{ width: `${p.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Strategic Advice Footer */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-start gap-2">
                <span className="text-base">🚀</span>
                <span>
                  <strong className="text-[#001D39]">Projects &amp; Deployments:</strong> Live links with functional GitHub repos add up to +8 pts to technical readiness.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-base">🎯</span>
                <span>
                  <strong className="text-[#001D39]">Skill Match:</strong> Acquiring critical role skills directly raises your placement candidate tier.
                </span>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Skill Gap Analysis Matrix */}
      <Card className="bg-white border border-[#BDD8E9]/70 shadow-sm">
        <Card.Header>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <Card.Title>Skill Gap Analysis: {selectedRole?.name}</Card.Title>
              <Card.Description>
                Comparing your verified profile skills against market expectations for this role
              </Card.Description>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs text-slate-500 font-medium">
                Skills Match:{' '}
                <strong className="text-[#0A4174] text-sm font-mono font-bold">
                  {skillGap?.matchPercentage ?? 0}%
                </strong>
              </div>
              <div className="w-24 h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-[#0A4174] rounded-full transition-all duration-500"
                  style={{ width: `${skillGap?.matchPercentage ?? 0}%` }}
                />
              </div>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Missing Critical Skills */}
            <div className="space-y-3 p-4 rounded-xl bg-red-50/50 border border-red-200">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
                  <span>🚨</span> Missing Critical Skills
                </h4>
                <Badge variant="danger" size="sm">{skillGap?.missingCritical?.length || 0}</Badge>
              </div>
              <p className="text-xs text-slate-500">Mandatory skills required by recruiters for this job profile.</p>

              <div className="space-y-2 mt-3">
                {skillGap?.missingCritical?.length > 0 ? (
                  skillGap.missingCritical.map((skill, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-white border border-red-200 flex items-center justify-between shadow-xs"
                    >
                      <div>
                        <span className="text-sm font-semibold text-[#001D39] block">{skill.name}</span>
                        <span className="text-[10px] text-red-600 font-medium">
                          Required: {skill.requiredProficiency}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAddSkillToRoadmap(skill)}
                        className="text-[11px] py-1 px-2.5 hover:border-red-500 hover:bg-red-50"
                      >
                        + Roadmap
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-emerald-700 py-3 font-medium text-center">
                    ✨ No missing critical skills! Excellent work.
                  </p>
                )}
              </div>
            </div>

            {/* 2. Needs Level-Up Skills */}
            <div className="space-y-3 p-4 rounded-xl bg-amber-50/50 border border-amber-200">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                  <span>📈</span> Needs Level-Up
                </h4>
                <Badge variant="warning" size="sm">{skillGap?.needsLevelUp?.length || 0}</Badge>
              </div>
              <p className="text-xs text-slate-500">Skills you know, but need deeper proficiency for this role.</p>

              <div className="space-y-2 mt-3">
                {skillGap?.needsLevelUp?.length > 0 ? (
                  skillGap.needsLevelUp.map((skill, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-white border border-amber-200 flex items-center justify-between shadow-xs"
                    >
                      <div>
                        <span className="text-sm font-semibold text-[#001D39] block">{skill.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          You: <span className="text-amber-700 font-semibold">{skill.studentProficiency}</span> → Need: <span className="text-[#001D39] font-bold">{skill.requiredProficiency}</span>
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuickAddSkillToRoadmap(skill)}
                        className="text-[11px] py-1 px-2.5 text-amber-700 hover:text-amber-800"
                      >
                        Practice ↗
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-3 text-center">No partial proficiency gaps.</p>
                )}
              </div>
            </div>

            {/* 3. Acquired & Verified Skills */}
            <div className="space-y-3 p-4 rounded-xl bg-emerald-50/50 border border-emerald-200">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                  <span>✅</span> Acquired &amp; Verified
                </h4>
                <Badge variant="success" size="sm">{skillGap?.acquired?.length || 0}</Badge>
              </div>
              <p className="text-xs text-slate-500">Skills matching or exceeding required industry standards.</p>

              <div className="space-y-2 mt-3">
                {skillGap?.acquired?.length > 0 ? (
                  skillGap.acquired.map((skill, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-white border border-emerald-200 flex items-center justify-between shadow-xs"
                    >
                      <div>
                        <span className="text-sm font-semibold text-[#001D39] block">{skill.name}</span>
                        <span className="text-[10px] text-emerald-700 font-mono font-medium">
                          Proficiency: {skill.studentProficiency}
                        </span>
                      </div>
                      <span className="text-xs text-emerald-700 font-bold">✓ Ready</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-3 text-center">
                    Add verified skills in your profile to see matches here.
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Interactive Career Roadmap Checklist */}
      <Card className="bg-white border border-[#BDD8E9]/70 shadow-sm">
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
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-600">
                Progress: <strong className="text-[#001D39]">{roadmap.summary.completionPercentage || 0}%</strong> ({roadmap.summary.completed || 0}/{roadmap.summary.total || 0} Done)
              </span>
              <div className="w-32 h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
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
                      ? 'bg-[#0A4174] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-[#BDD8E9]/30 hover:text-[#001D39]'
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
                        ? 'bg-emerald-50/60 border-emerald-200 opacity-80'
                        : 'bg-white border-slate-200 hover:border-[#0A4174]/40 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <button
                        onClick={() => handleToggleMilestone(item)}
                        className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                          isDone
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 hover:border-[#0A4174] text-transparent'
                        }`}
                      >
                        ✓
                      </button>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`font-semibold text-sm ${
                              isDone ? 'line-through text-slate-400' : 'text-[#001D39]'
                            }`}
                          >
                            {item.title}
                          </span>
                          <Badge variant={PRIORITY_BADGES[item.priority] || 'slate'} size="sm">
                            {item.priority}
                          </Badge>
                          <Badge variant="primary" size="sm">
                            {CATEGORY_ICONS[item.category] || '📌'} {item.category}
                          </Badge>
                        </div>
                        {item.description && (
                          <p className="text-xs text-slate-500 mt-1 max-w-xl">
                            {item.description}
                          </p>
                        )}
                        {item.dueDate && (
                          <p className="text-[11px] text-slate-400 mt-1">
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
                        className="text-xs text-slate-400 hover:text-red-600 p-1.5"
                        title="Remove milestone"
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-slate-500">
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
            <label className="text-xs font-semibold text-[#001D39] block mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Actionable notes or learning syllabus..."
              value={milestoneForm.description}
              onChange={(e) => setMilestoneForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-[#001D39] focus:ring-2 focus:ring-[#0A4174]/20 focus:border-[#0A4174] focus:outline-none transition-colors shadow-sm"
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

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
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
