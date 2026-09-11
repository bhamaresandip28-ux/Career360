import { useState, useEffect } from 'react';
import * as placementApi from '../../services/placement.service';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Toast from '../../components/ui/Toast';

export default function PlacementsPage() {
  const [activeTab, setActiveTab] = useState('DRIVES'); // 'DRIVES' | 'APPLICATIONS' | 'COMPANIES'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [drives, setDrives] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [companies, setCompanies] = useState([]);

  // Selected Drive for Details/Application Modal
  const [selectedDriveId, setSelectedDriveId] = useState(null);
  const [driveDetails, setDriveDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Apply Form
  const [applyForm, setApplyForm] = useState({
    resumeUrl: '',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchPlacementData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [drivesRes, appsRes, compRes] = await Promise.all([
        placementApi.getDrives(),
        placementApi.getMyApplications(),
        placementApi.getCompanies(),
      ]);

      setDrives(drivesRes.data?.data?.drives || []);
      setMyApplications(appsRes.data?.data?.applications || []);
      setCompanies(compRes.data?.data?.companies || []);
    } catch (err) {
      console.error('Failed to load placement data:', err);
      setError(err.message || 'Failed to load placement portal.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacementData();
  }, []);

  const openDriveDetails = async (driveId) => {
    setSelectedDriveId(driveId);
    setLoadingDetails(true);
    setIsApplyModalOpen(true);
    try {
      const res = await placementApi.getDriveDetails(driveId);
      setDriveDetails(res.data?.data || null);
      setApplyForm({ resumeUrl: '', notes: '' });
    } catch (err) {
      console.error('Failed to load drive details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!selectedDriveId) return;

    setSubmitting(true);
    try {
      await placementApi.applyForDrive({
        driveId: selectedDriveId,
        resumeUrl: applyForm.resumeUrl ? applyForm.resumeUrl.trim() : undefined,
        notes: applyForm.notes ? applyForm.notes.trim() : undefined,
      });

      setToast({ type: 'success', message: 'Application submitted successfully! Check Interview Schedule tab.' });
      setIsApplyModalOpen(false);
      await fetchPlacementData();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to apply for drive.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loading size="lg" text="Loading campus placement drives & opportunities..." />
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Placement Portal Error" message={error} onRetry={fetchPlacementData} />;
  }

  const eligibleDrivesCount = drives.filter(d => d.isEligible && !d.hasApplied).length;
  const activeDrivesCount = drives.filter(d => d.status === 'ACTIVE').length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* ─── Hero Banner ─────────────────────────────────────────────────── */}
      <div className="p-6 bg-white border border-[#BDD8E9]/70 rounded-2xl shadow-card">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Placement & Career Opportunities Portal
              </span>
              <Badge variant="success" size="sm" dot>Active Season</Badge>
            </div>
            <h2 className="font-display font-bold text-2xl text-[#001D39]">
              Campus Recruitment & Drives
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-xl">
              Explore participating campus recruitment drives, verify academic eligibility against company criteria, and track selection rounds in real time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="primary" size="lg">
              {eligibleDrivesCount} Eligible Drives For You
            </Badge>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-[#F4F7FB] border border-[#BDD8E9]/60">
            <span className="text-xs text-slate-500 block">Active Drives</span>
            <span className="text-2xl font-bold text-[#001D39] mt-1 block">
              {activeDrivesCount}
            </span>
            <span className="text-[10px] text-slate-400">Currently accepting</span>
          </div>

          <div className="p-4 rounded-xl bg-[#F4F7FB] border border-[#BDD8E9]/60">
            <span className="text-xs text-slate-500 block">Eligible Opportunities</span>
            <span className="text-2xl font-bold text-[#0A4174] mt-1 block">
              {eligibleDrivesCount}
            </span>
            <span className="text-[10px] text-slate-400">Criteria satisfied</span>
          </div>

          <div className="p-4 rounded-xl bg-[#F4F7FB] border border-[#BDD8E9]/60">
            <span className="text-xs text-slate-500 block">Applications Submitted</span>
            <span className="text-2xl font-bold text-[#0A4174] mt-1 block">
              {myApplications.length}
            </span>
            <span className="text-[10px] text-slate-400">In review</span>
          </div>

          <div className="p-4 rounded-xl bg-[#F4F7FB] border border-[#BDD8E9]/60">
            <span className="text-xs text-slate-500 block">Partner Companies</span>
            <span className="text-2xl font-bold text-[#001D39] mt-1 block">
              {companies.length}
            </span>
            <span className="text-[10px] text-slate-400">Recruiting on campus</span>
          </div>
        </div>
      </div>

      {/* ─── Navigation Tabs ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <button
          onClick={() => setActiveTab('DRIVES')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'DRIVES'
              ? 'bg-[#0A4174] text-white shadow-sm'
              : 'bg-white border border-[#BDD8E9]/70 text-slate-600 hover:text-[#001D39] hover:bg-slate-50'
          }`}
        >
          <span>Active Placement Drives</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'DRIVES' ? 'bg-black/20 text-white' : 'bg-[#BDD8E9]/40 text-[#0A4174] font-semibold'}`}>
            {drives.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('APPLICATIONS')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'APPLICATIONS'
              ? 'bg-[#0A4174] text-white shadow-sm'
              : 'bg-white border border-[#BDD8E9]/70 text-slate-600 hover:text-[#001D39] hover:bg-slate-50'
          }`}
        >
          <span>My Applications & Rounds</span>
          {myApplications.length > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'APPLICATIONS' ? 'bg-black/20 text-white' : 'bg-[#BDD8E9]/40 text-[#0A4174] font-semibold'}`}>
              {myApplications.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('COMPANIES')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'COMPANIES'
              ? 'bg-[#0A4174] text-white shadow-sm'
              : 'bg-white border border-[#BDD8E9]/70 text-slate-600 hover:text-[#001D39] hover:bg-slate-50'
          }`}
        >
          <span>Company Directory</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'COMPANIES' ? 'bg-black/20 text-white' : 'bg-[#BDD8E9]/40 text-[#0A4174] font-semibold'}`}>
            {companies.length}
          </span>
        </button>
      </div>

      {/* ─── TAB 1: Drives List ───────────────────────────────────────────── */}
      {activeTab === 'DRIVES' && (
        <div className="space-y-4">
          {drives.length === 0 ? (
            <Card>
              <EmptyState
                icon="📋"
                title="No placement drives scheduled"
                description="Upcoming placement drives will be announced by the placement cell."
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {drives.map((drive) => {
                const daysLeft = Math.max(
                  0,
                  Math.ceil((new Date(drive.deadline) - new Date()) / (1000 * 60 * 60 * 24))
                );

                return (
                  <div
                    key={drive.id}
                    className="p-6 bg-white rounded-2xl border border-[#BDD8E9]/70 shadow-card hover:border-[#0A4174]/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-[#0A4174] uppercase tracking-wider">
                              {drive.company?.name}
                            </span>
                            <span className="text-xs text-slate-500">• {drive.company?.industry}</span>
                          </div>
                          <h3 className="font-semibold text-[#001D39] text-lg mt-0.5 leading-snug">
                            {drive.title}
                          </h3>
                        </div>

                        {/* Status / Eligibility Badge */}
                        {drive.hasApplied ? (
                          <Badge variant="primary" size="sm" dot>
                            {drive.applicationStatus || 'Applied'}
                          </Badge>
                        ) : drive.isEligible ? (
                          <Badge variant="success" size="sm" dot>
                            Eligible
                          </Badge>
                        ) : (
                          <Badge variant="danger" size="sm">
                            Not Eligible
                          </Badge>
                        )}
                      </div>

                      {/* Package & Role Info */}
                      <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#F4F7FB] border border-[#BDD8E9]/60 mt-4 text-xs">
                        <div>
                          <span className="text-slate-500 block">Package / CTC</span>
                          <span className="text-sm font-bold text-[#0A4174] block mt-0.5">
                            {drive.job?.packageMin && drive.job?.packageMax
                              ? `₹${drive.job.packageMin} - ${drive.job.packageMax} LPA`
                              : drive.job?.packageMin
                              ? `₹${drive.job.packageMin} LPA`
                              : 'Disclosed in Drive'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Designation</span>
                          <span className="text-sm font-medium text-[#001D39] block mt-0.5 truncate">
                            {drive.job?.title || drive.job?.role}
                          </span>
                        </div>
                      </div>

                      {/* Required Skills */}
                      {drive.job?.requiredSkills && drive.job.requiredSkills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {drive.job.requiredSkills.map((s, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-lg bg-[#BDD8E9]/20 border border-[#BDD8E9]/60 text-[11px] text-[#0A4174] font-mono font-medium"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Ineligibility Reason Callout */}
                      {!drive.isEligible && drive.eligibilityReasons && drive.eligibilityReasons.length > 0 && (
                        <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-700">
                          ⚠️ {drive.eligibilityReasons[0]}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100 flex-wrap gap-3">
                      <span className="text-xs text-slate-500">
                        ⏳ Deadline:{' '}
                        <strong className="text-slate-700">
                          {new Date(drive.deadline).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </strong>{' '}
                        ({daysLeft} days left)
                      </span>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDriveDetails(drive.id)}
                        >
                          Details & Rules ↗
                        </Button>
                        {drive.hasApplied ? (
                          <Button variant="ghost" size="sm" disabled className="text-slate-500 text-xs">
                            Applied ✓
                          </Button>
                        ) : drive.isEligible ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => openDriveDetails(drive.id)}
                          >
                            Apply Now
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" disabled className="opacity-50 text-xs">
                            Ineligible
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: My Applications & Rounds ─────────────────────────────── */}
      {activeTab === 'APPLICATIONS' && (
        <div className="space-y-4">
          {myApplications.length === 0 ? (
            <Card>
              <EmptyState
                icon="📝"
                title="No active applications"
                description="You haven't applied to any placement drives yet. Check the 'Active Placement Drives' tab to view eligible roles."
                action={
                  <Button variant="primary" size="sm" onClick={() => setActiveTab('DRIVES')}>
                    Browse Active Drives
                  </Button>
                }
              />
            </Card>
          ) : (
            myApplications.map((app) => (
              <div
                key={app.id}
                className="p-6 bg-white rounded-2xl border border-[#BDD8E9]/70 shadow-card hover:border-[#0A4174]/30 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[#001D39] text-lg">
                        {app.drive?.company?.name}
                      </h3>
                      <span className="text-xs text-slate-500">
                        • {app.drive?.job?.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Applied on{' '}
                      {new Date(app.appliedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  <Badge
                    variant={
                      app.status === 'OFFERED' || app.status === 'ACCEPTED'
                        ? 'success'
                        : app.status === 'INTERVIEW_SCHEDULED'
                        ? 'primary'
                        : app.status === 'REJECTED'
                        ? 'danger'
                        : 'teal'
                    }
                    size="md"
                    dot
                  >
                    {app.status.replace('_', ' ')}
                  </Badge>
                </div>

                {/* Selection Rounds Pipeline */}
                {app.selectionRounds && app.selectionRounds.length > 0 ? (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                      Selection Process & Rounds
                    </span>
                    <div className="space-y-2">
                      {app.selectionRounds.map((rnd) => (
                        <div
                          key={rnd.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-[#F4F7FB] border border-[#BDD8E9]/60 text-xs flex-wrap gap-2"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-[#0A4174] text-white font-bold flex items-center justify-center text-[10px]">
                              {rnd.roundNumber}
                            </span>
                            <div>
                              <span className="font-semibold text-[#001D39] block">
                                {rnd.roundName}
                              </span>
                              {rnd.scheduledAt && (
                                <span className="text-slate-500 text-[11px]">
                                  Scheduled: {new Date(rnd.scheduledAt).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {rnd.venueOrLink && (
                              <a
                                href={rnd.venueOrLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-[#0A4174] hover:underline font-semibold"
                              >
                                Meeting Link ↗
                              </a>
                            )}
                            <Badge
                              variant={
                                rnd.status === 'CLEARED'
                                  ? 'success'
                                  : rnd.status === 'ELIMINATED'
                                  ? 'danger'
                                  : 'warning'
                              }
                              size="sm"
                            >
                              {rnd.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                    Application under preliminary screening by the recruitment team.
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ─── TAB 3: Companies Directory ──────────────────────────────────── */}
      {activeTab === 'COMPANIES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {companies.map((comp) => (
            <div
              key={comp.id}
              className="p-6 bg-white rounded-2xl border border-[#BDD8E9]/70 shadow-card hover:border-[#0A4174]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-[#001D39] text-lg">{comp.name}</h3>
                    <p className="text-xs text-[#0A4174] font-medium mt-0.5">
                      {comp.industry}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#BDD8E9]/20 border border-[#BDD8E9]/60 flex items-center justify-center text-lg flex-shrink-0">
                    🏢
                  </div>
                </div>

                {comp.location && (
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                    📍 {comp.location}
                  </p>
                )}

                {comp.description && (
                  <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                    {comp.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500">
                <span>
                  Jobs: <strong className="text-[#001D39]">{comp._count?.jobs || 0}</strong>
                </span>
                {comp.website && (
                  <a
                    href={comp.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#0A4174] hover:text-[#001D39] font-medium"
                  >
                    Careers Portal ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── MODAL: Drive Details & Eligibility Rules Inspector ──────────── */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title={driveDetails?.drive?.title || 'Drive Details'}
        size="lg"
      >
        {loadingDetails ? (
          <div className="py-12 flex justify-center">
            <Loading size="md" text="Verifying academic criteria & drive terms..." />
          </div>
        ) : (
          <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
            {/* Overview */}
            <div className="p-4 rounded-xl bg-[#F4F7FB] border border-[#BDD8E9]/60">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <h4 className="font-semibold text-[#001D39] text-base">
                    {driveDetails?.drive?.company?.name} — {driveDetails?.drive?.job?.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {driveDetails?.drive?.company?.industry} • {driveDetails?.drive?.job?.location || 'On-site / Hybrid'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#0A4174]">
                    ₹{driveDetails?.drive?.job?.packageMin} - {driveDetails?.drive?.job?.packageMax} LPA
                  </span>
                  <span className="text-[10px] text-slate-500 block">Annual CTC</span>
                </div>
              </div>

              {driveDetails?.drive?.job?.description && (
                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  {driveDetails?.drive?.job?.description}
                </p>
              )}
            </div>

            {/* Selection Process */}
            {driveDetails?.drive?.selectionProcess && (
              <div>
                <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Selection Process
                </h5>
                <p className="text-xs text-slate-600 p-3 rounded-xl bg-[#F4F7FB] border border-[#BDD8E9]/60">
                  {driveDetails?.drive?.selectionProcess}
                </p>
              </div>
            )}

            {/* ─── Eligibility Checklist ───────────────────────────────────── */}
            <div>
              <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Your Eligibility Assessment
              </h5>
              <div className="space-y-2">
                {driveDetails?.studentEvaluation?.checks?.map((chk, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs ${
                      chk.passed
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{chk.passed ? '✅' : '❌'}</span>
                      <span className="font-medium text-[#001D39]">{chk.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <span className="text-slate-500">Req: {chk.required}</span>
                      <span className="font-semibold text-[#001D39]">Your: {chk.actual}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Application Section */}
            {driveDetails?.application ? (
              <div className="p-4 rounded-xl bg-[#BDD8E9]/25 border border-[#BDD8E9] text-center">
                <span className="text-sm font-semibold text-[#0A4174] block">
                  You have already applied for this drive!
                </span>
                <span className="text-xs text-slate-500 mt-1 block">
                  Status: {driveDetails.application.status}
                </span>
              </div>
            ) : driveDetails?.studentEvaluation?.isEligible ? (
              <form onSubmit={handleApply} className="space-y-4 pt-2 border-t border-slate-100">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-[#0A4174]">
                  Submit Candidate Application
                </h5>

                <Input
                  label="Resume / Portfolio Cloud URL"
                  id="appResume"
                  type="url"
                  value={applyForm.resumeUrl}
                  onChange={(e) => setApplyForm({ ...applyForm, resumeUrl: e.target.value })}
                  placeholder="https://drive.google.com/... or LinkedIn/GitHub"
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Candidate Statement / Notes (Optional)
                  </label>
                  <textarea
                    className="w-full rounded-xl bg-white border border-slate-300 text-sm text-[#001D39] placeholder-slate-400 p-3 focus:outline-none focus:ring-2 focus:ring-[#0A4174]"
                    rows={2}
                    value={applyForm.notes}
                    onChange={(e) => setApplyForm({ ...applyForm, notes: e.target.value })}
                    placeholder="Briefly state why you are interested in this position..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsApplyModalOpen(false)}
                    disabled={submitting}
                  >
                    Close
                  </Button>
                  <Button type="submit" variant="primary" loading={submitting}>
                    Confirm & Submit Application 🚀
                  </Button>
                </div>
              </form>
            ) : (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                <span className="font-semibold block mb-1">Ineligible to apply:</span>
                <ul className="list-disc pl-4 space-y-1">
                  {driveDetails?.studentEvaluation?.reasons?.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
