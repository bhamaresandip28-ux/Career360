import { useState, useEffect } from 'react';
import * as academicApi from '../../services/academic.service';
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

const GRADE_OPTIONS = [
  { value: 'O', label: 'O (Outstanding - 10)' },
  { value: 'A+', label: 'A+ (Excellent - 9)' },
  { value: 'A', label: 'A (Very Good - 8)' },
  { value: 'B+', label: 'B+ (Good - 7)' },
  { value: 'B', label: 'B (Above Average - 6)' },
  { value: 'C', label: 'C (Average - 5)' },
  { value: 'P', label: 'P (Pass - 4)' },
  { value: 'F', label: 'F (Fail / Backlog - 0)' },
];

export default function AcademicsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemId, setSelectedSemId] = useState(null);
  const [selectedSemDetails, setSelectedSemDetails] = useState(null);
  const [subjectsList, setSubjectsList] = useState([]);

  // Modals
  const [isAddSemModalOpen, setIsAddSemModalOpen] = useState(false);
  const [isAddRecordModalOpen, setIsAddRecordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [deletingRecord, setDeletingRecord] = useState(null);

  // Forms
  const [semForm, setSemForm] = useState({
    semesterNumber: '1',
    academicYear: '2024-2025',
    sgpa: '',
    totalCredits: '',
  });

  const [recordForm, setRecordForm] = useState({
    subjectId: '',
    marksObtained: '',
    maxMarks: '100',
    grade: 'A+',
    attendance: '',
    isBacklog: false,
  });

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchAcademicData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [sumRes, semsRes, subsRes] = await Promise.all([
        academicApi.getAcademicSummary(),
        academicApi.getSemesters(),
        academicApi.getSubjects(),
      ]);

      const sum = sumRes.data?.data?.summary || null;
      setSummary(sum);

      const sems = semsRes.data?.data?.semesters || [];
      setSemesters(sems);

      const subs = subsRes.data?.data?.subjects || [];
      setSubjectsList(subs);

      // Select latest semester by default if available
      if (sems.length > 0) {
        const defaultSem = selectedSemId
          ? sems.find((s) => s.id === selectedSemId) || sems[sems.length - 1]
          : sems[sems.length - 1];
        setSelectedSemId(defaultSem.id);
        await loadSemesterDetails(defaultSem.id);
      } else {
        setSelectedSemId(null);
        setSelectedSemDetails(null);
      }
    } catch (err) {
      console.error('Failed to load academic records:', err);
      setError(err.message || 'Failed to load academic records.');
    } finally {
      setLoading(false);
    }
  };

  const loadSemesterDetails = async (semId) => {
    try {
      const res = await academicApi.getSemesterDetails(semId);
      setSelectedSemDetails(res.data?.data?.semester || null);
    } catch (err) {
      console.error('Failed to load semester details:', err);
    }
  };

  useEffect(() => {
    fetchAcademicData();
  }, []);

  const handleSelectSemester = (semId) => {
    setSelectedSemId(semId);
    loadSemesterDetails(semId);
  };

  // Submit Semester
  const handleSemSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        semesterNumber: parseInt(semForm.semesterNumber, 10),
        academicYear: semForm.academicYear.trim(),
        sgpa: semForm.sgpa ? parseFloat(semForm.sgpa) : undefined,
        totalCredits: semForm.totalCredits ? parseInt(semForm.totalCredits, 10) : undefined,
      };

      await academicApi.upsertSemester(payload);
      setToast({ type: 'success', message: 'Semester recorded successfully!' });
      setIsAddSemModalOpen(false);
      await fetchAcademicData();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to save semester.' });
    } finally {
      setSaving(false);
    }
  };

  // Open Add Record
  const openAddRecord = () => {
    setRecordForm({
      subjectId: subjectsList[0]?.id || '',
      marksObtained: '',
      maxMarks: '100',
      grade: 'A+',
      attendance: '',
      isBacklog: false,
    });
    setEditingRecord(null);
    setIsAddRecordModalOpen(true);
  };

  // Open Edit Record
  const openEditRecord = (rec) => {
    setRecordForm({
      subjectId: rec.subjectId,
      marksObtained: rec.marksObtained != null ? String(rec.marksObtained) : '',
      maxMarks: String(rec.maxMarks || 100),
      grade: rec.grade || 'A+',
      attendance: rec.attendance != null ? String(rec.attendance) : '',
      isBacklog: rec.isBacklog,
    });
    setEditingRecord(rec);
    setIsAddRecordModalOpen(true);
  };

  // Submit Record
  const handleRecordSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSemId) return;

    setSaving(true);
    try {
      const payload = {
        semesterId: selectedSemId,
        subjectId: recordForm.subjectId,
        marksObtained: recordForm.marksObtained ? parseFloat(recordForm.marksObtained) : undefined,
        maxMarks: recordForm.maxMarks ? parseFloat(recordForm.maxMarks) : 100,
        grade: recordForm.grade,
        attendance: recordForm.attendance ? parseFloat(recordForm.attendance) : undefined,
        isBacklog: recordForm.isBacklog,
      };

      await academicApi.upsertSubjectRecord(payload);
      setToast({ type: 'success', message: 'Subject record updated and SGPA recomputed!' });
      setIsAddRecordModalOpen(false);
      await loadSemesterDetails(selectedSemId);
      // Refresh summary
      const sumRes = await academicApi.getAcademicSummary();
      setSummary(sumRes.data?.data?.summary || null);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to save record.' });
    } finally {
      setSaving(false);
    }
  };

  // Delete Record
  const handleDeleteRecord = async () => {
    if (!deletingRecord) return;
    setSaving(true);
    try {
      await academicApi.deleteSubjectRecord(deletingRecord.id);
      setToast({ type: 'success', message: 'Subject record removed.' });
      setDeletingRecord(null);
      await loadSemesterDetails(selectedSemId);
      const sumRes = await academicApi.getAcademicSummary();
      setSummary(sumRes.data?.data?.summary || null);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to delete record.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loading size="lg" text="Loading academic intelligence & semester records..." />
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Academic Records Error" message={error} onRetry={fetchAcademicData} />;
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

      {/* ─── Hero Scorecard ──────────────────────────────────────────────── */}
      <div className="p-6 bg-white border border-[#BDD8E9]/70 rounded-2xl shadow-card">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Academic Management & Intelligence
              </span>
              <Badge variant="primary" size="sm" dot>Verified</Badge>
            </div>
            <h2 className="font-display font-bold text-2xl text-[#001D39]">
              Scholastic Standing & Performance
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-xl">
              Track SGPA semester progression, overall degree CGPA, attendance thresholds, and backlog clearances for placement drive eligibility.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="primary" size="sm" onClick={() => setIsAddSemModalOpen(true)}>
              + Add Semester Record
            </Button>
          </div>
        </div>

        {/* Metric Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-[#F4F7FB] border border-[#BDD8E9]/60 flex flex-col justify-between">
            <div>
              <span className="text-xs text-slate-500 block">Cumulative GPA</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold text-[#0A4174]">
                  {summary?.cgpa != null ? summary.cgpa.toFixed(2) : '—'}
                </span>
                <span className="text-xs text-slate-400">/ 10.0</span>
              </div>
            </div>
            <div className="mt-2">
              <Badge variant={summary?.cgpa >= 8.5 ? 'success' : summary?.cgpa >= 7.0 ? 'primary' : 'warning'} size="sm">
                {summary?.cgpa >= 8.5 ? 'Distinction' : summary?.cgpa >= 7.0 ? 'First Class' : 'Pass'}
              </Badge>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F4F7FB] border border-[#BDD8E9]/60 flex flex-col justify-between">
            <div>
              <span className="text-xs text-slate-500 block">Latest SGPA</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold text-[#0A4174]">
                  {summary?.latestSgpa != null ? summary.latestSgpa.toFixed(2) : '—'}
                </span>
                <span className="text-xs text-slate-400">Last sem</span>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-slate-500">
                {semesters.length} Semesters logged
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F4F7FB] border border-[#BDD8E9]/60 flex flex-col justify-between">
            <div>
              <span className="text-xs text-slate-500 block">Aggregate Attendance</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-3xl font-bold ${
                  summary?.overallAttendance >= 85
                    ? 'text-emerald-600'
                    : summary?.overallAttendance >= 75
                    ? 'text-[#0A4174]'
                    : 'text-rose-600'
                }`}>
                  {summary?.overallAttendance != null ? `${summary.overallAttendance}%` : '—'}
                </span>
              </div>
            </div>
            <div className="mt-2">
              <Badge variant={summary?.overallAttendance >= 75 ? 'success' : 'danger'} size="sm">
                {summary?.overallAttendance >= 75 ? 'Eligible (≥75%)' : 'Shortfall (<75%)'}
              </Badge>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F4F7FB] border border-[#BDD8E9]/60 flex flex-col justify-between">
            <div>
              <span className="text-xs text-slate-500 block">Backlog Status</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-3xl font-bold ${summary?.activeBacklogs > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {summary?.activeBacklogs ?? 0}
                </span>
                <span className="text-xs text-slate-400">active</span>
              </div>
            </div>
            <div className="mt-2">
              <Badge variant={summary?.activeBacklogs === 0 ? 'success' : 'danger'} size="sm">
                {summary?.activeBacklogs === 0 ? 'All Cleared' : `${summary?.activeBacklogs} Pending`}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* ─── SGPA Progression Trend Chart & Insights ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SGPA Trend Bar Chart (2 cols) */}
        <div className="lg:col-span-2">
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <div>
                  <Card.Title>Semester SGPA Trajectory</Card.Title>
                  <Card.Description>Grade point progression across registered semesters</Card.Description>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0A4174] inline-block" />
                  <span>SGPA</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4E8EA2] inline-block ml-2" />
                  <span>Benchmark (8.0)</span>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              {semesters.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No semester records added yet. Add your semester records to visualize trends.
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 items-end h-48 border-b border-slate-100 pb-2 px-2">
                    {semesters.map((s) => {
                      const sgpaVal = s.sgpa ?? 0;
                      const heightPercent = Math.min(100, Math.max(10, (sgpaVal / 10) * 100));
                      const isSelected = s.id === selectedSemId;
                      return (
                        <div
                          key={s.id}
                          onClick={() => handleSelectSemester(s.id)}
                          className="flex flex-col items-center gap-1.5 h-full justify-end cursor-pointer group"
                        >
                          <span className="text-[11px] font-bold text-[#001D39] group-hover:text-[#0A4174] transition-colors">
                            {sgpaVal > 0 ? sgpaVal.toFixed(2) : '—'}
                          </span>
                          <div className="w-full max-w-[36px] bg-slate-100 rounded-t-lg overflow-hidden flex flex-col justify-end h-full">
                            <div
                              className={`w-full rounded-t-lg transition-all duration-500 ${
                                isSelected
                                  ? 'bg-[#0A4174] shadow-sm'
                                  : sgpaVal >= 8.5
                                  ? 'bg-[#4E8EA2] group-hover:bg-[#4E8EA2]/90'
                                  : 'bg-[#49769F] group-hover:bg-[#0A4174]'
                              }`}
                              style={{ height: `${heightPercent}%` }}
                            />
                          </div>
                          <span className={`text-[11px] font-medium mt-1 ${isSelected ? 'text-[#0A4174] font-bold' : 'text-slate-500'}`}>
                            Sem {s.semesterNumber}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500 px-2">
                    <span>Baseline: 0.0</span>
                    <span>Target: 8.0+ for Top Tier Drives</span>
                    <span>Scale: 10.0</span>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>

        {/* Actionable Insights (1 col) */}
        <div>
          <Card>
            <Card.Header>
              <Card.Title>Placement Eligibility Insights</Card.Title>
              <Card.Description>Automated rules check for campus drives</Card.Description>
            </Card.Header>
            <Card.Body>
              {summary?.insights && summary.insights.length > 0 ? (
                <div className="space-y-3">
                  {summary.insights.map((ins, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border text-xs leading-relaxed ${
                        ins.type === 'DANGER'
                          ? 'bg-rose-50 border-rose-200 text-rose-800'
                          : ins.type === 'WARNING'
                          ? 'bg-amber-50 border-amber-200 text-amber-800'
                          : ins.type === 'SUCCESS'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-[#F4F7FB] border-[#BDD8E9]/60 text-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span>
                          {ins.type === 'DANGER' ? '🚨' : ins.type === 'WARNING' ? '⚠️' : ins.type === 'SUCCESS' ? '✅' : 'ℹ️'}
                        </span>
                        <span>{ins.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">
                  Add more academic records to receive AI-powered eligibility advice.
                </p>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* ─── Semester Subject Records Explorer ────────────────────────────── */}
      <Card>
        <Card.Header>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <Card.Title>Semester Course Records</Card.Title>
              <Card.Description>
                Detailed subject-by-subject credits, marks, grades, and attendance
              </Card.Description>
            </div>
            {selectedSemId && (
              <Button variant="primary" size="sm" onClick={openAddRecord}>
                + Add Subject Record
              </Button>
            )}
          </div>
        </Card.Header>
        <Card.Body>
          {semesters.length === 0 ? (
            <EmptyState
              icon="🎓"
              title="No semesters registered"
              description="Click '+ Add Semester Record' above to start tracking your academic semesters."
              action={
                <Button variant="primary" size="sm" onClick={() => setIsAddSemModalOpen(true)}>
                  + Add Semester Now
                </Button>
              }
            />
          ) : (
            <div>
              {/* Semester Switcher Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-slate-100 mb-4 scrollbar-none">
                {semesters.map((sem) => {
                  const isSelected = sem.id === selectedSemId;
                  return (
                    <button
                      key={sem.id}
                      onClick={() => handleSelectSemester(sem.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'bg-[#0A4174] text-white shadow-sm'
                          : 'bg-white border border-[#BDD8E9]/70 text-slate-600 hover:text-[#001D39] hover:bg-slate-50'
                      }`}
                    >
                      <span>Semester {sem.semesterNumber}</span>
                      {sem.sgpa != null && (
                        <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${isSelected ? 'bg-black/20 text-white' : 'bg-[#BDD8E9]/40 text-[#0A4174] font-semibold'}`}>
                          {sem.sgpa.toFixed(2)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selected Semester Details Header */}
              {selectedSemDetails && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F4F7FB] border border-[#BDD8E9]/60 mb-4 text-xs flex-wrap gap-2">
                  <div className="flex items-center gap-4 text-slate-600">
                    <span>Year: <strong className="text-[#001D39]">{selectedSemDetails.academicYear}</strong></span>
                    <span>Total Credits: <strong className="text-[#001D39]">{selectedSemDetails.totalCredits ?? 0}</strong></span>
                    <span>Computed SGPA: <strong className="text-[#0A4174] font-bold">{selectedSemDetails.sgpa ? selectedSemDetails.sgpa.toFixed(2) : '—'}</strong></span>
                  </div>
                  <span className="text-slate-500">
                    {selectedSemDetails.subjectRecords?.length || 0} subjects registered
                  </span>
                </div>
              )}

              {/* Subject Records Table */}
              {!selectedSemDetails?.subjectRecords || selectedSemDetails.subjectRecords.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-400 mb-3">
                    No subjects registered for Semester {selectedSemDetails?.semesterNumber} yet.
                  </p>
                  <Button variant="outline" size="sm" onClick={openAddRecord}>
                    + Add First Subject
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 bg-[#F4F7FB]/50">
                        <th className="py-2.5 px-3 font-semibold">Code</th>
                        <th className="py-2.5 px-3 font-semibold">Subject Title</th>
                        <th className="py-2.5 px-3 font-semibold text-center">Credits</th>
                        <th className="py-2.5 px-3 font-semibold text-center">Marks</th>
                        <th className="py-2.5 px-3 font-semibold text-center">Grade</th>
                        <th className="py-2.5 px-3 font-semibold text-center">Attendance</th>
                        <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedSemDetails.subjectRecords.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-3 font-mono font-medium text-[#0A4174]">
                            {rec.subject.code}
                          </td>
                          <td className="py-3 px-3 font-medium text-[#001D39] max-w-xs truncate">
                            {rec.subject.name}
                          </td>
                          <td className="py-3 px-3 text-center text-slate-700">
                            {rec.subject.credits}
                          </td>
                          <td className="py-3 px-3 text-center text-slate-700 font-mono">
                            {rec.marksObtained != null ? `${rec.marksObtained} / ${rec.maxMarks}` : '—'}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <Badge
                              variant={
                                ['O', 'A+'].includes(rec.grade)
                                  ? 'success'
                                  : ['A', 'B+'].includes(rec.grade)
                                  ? 'primary'
                                  : rec.grade === 'F'
                                  ? 'danger'
                                  : 'warning'
                              }
                              size="sm"
                            >
                              {rec.grade || '—'}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 text-center">
                            {rec.attendance != null ? (
                              <span className={`font-medium ${rec.attendance < 75 ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                                {rec.attendance}%
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {rec.isBacklog ? (
                              <Badge variant="danger" size="sm">Backlog</Badge>
                            ) : (
                              <Badge variant="success" size="sm">Cleared</Badge>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditRecord(rec)}
                                className="text-slate-400 hover:text-[#0A4174] p-1 transition-colors"
                                title="Edit Record"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => setDeletingRecord(rec)}
                                className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                                title="Delete Record"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* ─── MODAL: Add Semester ─────────────────────────────────────────── */}
      <Modal
        isOpen={isAddSemModalOpen}
        onClose={() => setIsAddSemModalOpen(false)}
        title="Add Semester Record"
        size="md"
      >
        <form onSubmit={handleSemSubmit} className="space-y-4">
          <Input
            label="Semester Number (1 - 8)"
            id="semNumber"
            type="number"
            min="1"
            max="12"
            required
            value={semForm.semesterNumber}
            onChange={(e) => setSemForm({ ...semForm, semesterNumber: e.target.value })}
            placeholder="e.g. 5"
          />

          <Input
            label="Academic Year"
            id="semYear"
            required
            value={semForm.academicYear}
            onChange={(e) => setSemForm({ ...semForm, academicYear: e.target.value })}
            placeholder="e.g. 2024-2025"
          />

          <Input
            label="Semester SGPA (Optional - can be auto-computed from subjects)"
            id="semSgpa"
            type="number"
            step="0.01"
            min="0"
            max="10"
            value={semForm.sgpa}
            onChange={(e) => setSemForm({ ...semForm, sgpa: e.target.value })}
            placeholder="e.g. 8.75"
          />

          <Input
            label="Total Credits"
            id="semCredits"
            type="number"
            min="0"
            max="50"
            value={semForm.totalCredits}
            onChange={(e) => setSemForm({ ...semForm, totalCredits: e.target.value })}
            placeholder="e.g. 22"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddSemModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Save Semester
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL: Add/Edit Subject Record ─────────────────────────────── */}
      <Modal
        isOpen={isAddRecordModalOpen}
        onClose={() => setIsAddRecordModalOpen(false)}
        title={editingRecord ? 'Edit Subject Grade' : 'Record Subject Grade'}
        size="md"
      >
        <form onSubmit={handleRecordSubmit} className="space-y-4">
          <Select
            label="Select Subject"
            id="subjectSelect"
            required
            options={subjectsList.map((s) => ({
              value: s.id,
              label: `${s.code} — ${s.name} (${s.credits} Credits)`,
            }))}
            value={recordForm.subjectId}
            onChange={(e) => setRecordForm({ ...recordForm, subjectId: e.target.value })}
            disabled={!!editingRecord}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Letter Grade"
              id="gradeSelect"
              required
              options={GRADE_OPTIONS}
              value={recordForm.grade}
              onChange={(e) => setRecordForm({ ...recordForm, grade: e.target.value })}
            />
            <Input
              label="Marks Obtained (out of 100)"
              id="marks"
              type="number"
              step="0.5"
              min="0"
              max="100"
              value={recordForm.marksObtained}
              onChange={(e) => setRecordForm({ ...recordForm, marksObtained: e.target.value })}
              placeholder="e.g. 88"
            />
          </div>

          <Input
            label="Attendance Percentage (0 - 100%)"
            id="attendance"
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={recordForm.attendance}
            onChange={(e) => setRecordForm({ ...recordForm, attendance: e.target.value })}
            placeholder="e.g. 88.5"
            hint="Mandatory 75% requirement for placement eligibility"
          />

          <div className="flex items-center gap-3 p-3 bg-[#F4F7FB] rounded-xl border border-[#BDD8E9]/60">
            <input
              type="checkbox"
              id="backlogCheck"
              checked={recordForm.isBacklog}
              onChange={(e) => setRecordForm({ ...recordForm, isBacklog: e.target.checked })}
              className="w-4 h-4 rounded text-danger-500 focus:ring-danger-500"
            />
            <label htmlFor="backlogCheck" className="text-sm font-medium text-slate-700 cursor-pointer">
              Mark as active backlog
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddRecordModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {editingRecord ? 'Update Record' : 'Save Record'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL: Delete Record ────────────────────────────────────────── */}
      <Modal
        isOpen={!!deletingRecord}
        onClose={() => setDeletingRecord(null)}
        title="Remove Subject Record"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to remove <strong>{deletingRecord?.subject?.name}</strong> from Semester records?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setDeletingRecord(null)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteRecord}
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
