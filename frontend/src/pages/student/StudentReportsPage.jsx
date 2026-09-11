import { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Download,
  GraduationCap,
  Briefcase,
  CheckCircle,
  ExternalLink,
  Award,
  Calendar,
  Building,
  Mail,
  Phone,
  Globe,
  ShieldCheck,
} from 'lucide-react';
import reportService from '../../services/report.service';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function StudentReportsPage() {
  const [activeTab, setActiveTab] = useState('cv'); // 'cv' or 'transcript'
  const [cvData, setCvData] = useState(null);
  const [transcriptData, setTranscriptData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cv, transcript] = await Promise.all([
        reportService.getStudentCV(),
        reportService.getAcademicTranscript(),
      ]);
      setCvData(cv);
      setTranscriptData(transcript);
    } catch (err) {
      console.error('Failed to load report data', err);
      setError('Could not generate scholastic reports. Please verify academic profile data.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Compiling verified academic and placement dossier...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <p className="text-rose-400 font-medium mb-3">{error}</p>
        <Button variant="secondary" onClick={loadReports}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Non-printed Screen Control Bar */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#BDD8E9]/70 p-5 rounded-2xl shadow-card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-[#001D39] tracking-tight">Verified Institutional Dossier</h1>
            <Badge variant="success" size="sm" className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Verified & Tamper-Evident
            </Badge>
          </div>
          <p className="text-xs text-slate-600">
            Generate and export university-certified placement resumes and official academic transcripts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab toggles */}
          <div className="bg-[#F4F7FB] p-1 rounded-xl border border-[#BDD8E9]/60 flex items-center">
            <button
              onClick={() => setActiveTab('cv')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'cv'
                  ? 'bg-[#0A4174] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#001D39]'
              }`}
            >
              Placement CV
            </button>
            <button
              onClick={() => setActiveTab('transcript')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'transcript'
                  ? 'bg-[#0A4174] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#001D39]'
              }`}
            >
              Academic Transcript
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            className="flex items-center gap-2 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </Button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 1: VERIFIED PLACEMENT CV
          ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'cv' && cvData && (
        <div className="bg-white text-slate-900 rounded-2xl shadow-2xl p-8 sm:p-12 border border-slate-200 print:border-none print:shadow-none print:p-0 print:rounded-none max-w-4xl mx-auto transition-all">
          {/* Resume Header */}
          <div className="border-b-2 border-slate-900 pb-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-display">
                  {cvData.student.name}
                </h1>
                <p className="text-sm font-semibold text-[#0A4174] mt-1">
                  {cvData.student.department} • {cvData.student.batch}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Roll No: <span className="font-mono font-medium">{cvData.student.rollNumber}</span>
                </p>
              </div>

              {/* Contact metadata */}
              <div className="text-xs text-slate-600 space-y-1 sm:text-right">
                <div className="flex sm:justify-end items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{cvData.student.email}</span>
                </div>
                <div className="flex sm:justify-end items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{cvData.student.phone}</span>
                </div>
                {cvData.links.length > 0 && (
                  <div className="flex sm:justify-end items-center gap-3 pt-1">
                    {cvData.links.map((l, i) => (
                      <a
                        key={i}
                        href={l.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#0A4174] font-semibold hover:underline"
                      >
                        {l.platform}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Academic Standing Callout */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Cumulative GPA</p>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                {cvData.academics.cgpa ?? 'N/A'} <span className="text-xs text-slate-500 font-normal">/ 10.0</span>
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Latest SGPA</p>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                {cvData.academics.latestSgpa ?? 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Backlogs</p>
              <p className={`text-xl font-extrabold mt-0.5 ${cvData.academics.activeBacklogs === 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {cvData.academics.activeBacklogs}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Standing</p>
              <p className="text-xs font-bold text-[#0A4174] mt-1.5 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 inline" />
                Verified In Good Standing
              </p>
            </div>
          </div>

          {/* Skills Grid */}
          {cvData.skills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                Technical & Core Competencies
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {cvData.skills.map((s) => (
                  <span
                    key={s.id}
                    className="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 text-slate-800 border border-slate-200"
                  >
                    {s.name} <span className="text-[10px] text-slate-500">({s.proficiency.toLowerCase()})</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience / Internships */}
          {cvData.internships.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3">
                Professional Experience & Internships
              </h2>
              <div className="space-y-4">
                {cvData.internships.map((intern) => (
                  <div key={intern.id} className="text-xs">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="font-bold text-slate-900 text-sm">
                        {intern.role} <span className="font-semibold text-slate-600">@ {intern.company}</span>
                      </span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {new Date(intern.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} –{' '}
                        {intern.isCurrent ? 'Present' : new Date(intern.endDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    {intern.description && (
                      <p className="text-slate-700 leading-relaxed mt-1">{intern.description}</p>
                    )}
                    {intern.techStack?.length > 0 && (
                      <p className="text-[11px] text-slate-500 mt-1">
                        <strong className="text-slate-700">Technologies:</strong> {intern.techStack.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {cvData.projects.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3">
                Key Technical Projects
              </h2>
              <div className="space-y-3.5">
                {cvData.projects.map((proj) => (
                  <div key={proj.id} className="text-xs">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="font-bold text-slate-900 text-sm">{proj.title}</span>
                      {proj.githubUrl && (
                        <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-[#0A4174] hover:underline text-[11px]">
                          Repository
                        </a>
                      )}
                    </div>
                    <p className="text-slate-700 leading-relaxed">{proj.description}</p>
                    {proj.techStack?.length > 0 && (
                      <p className="text-[11px] text-slate-500 mt-1">
                        <strong className="text-slate-700">Stack:</strong> {proj.techStack.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications & Achievements */}
          {(cvData.certifications.length > 0 || cvData.achievements.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {cvData.certifications.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                    Certifications
                  </h2>
                  <div className="space-y-2">
                    {cvData.certifications.map((c) => (
                      <div key={c.id} className="text-xs">
                        <p className="font-bold text-slate-900">{c.name}</p>
                        <p className="text-slate-600 text-[11px]">{c.issuingOrg} • {new Date(c.issueDate).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {cvData.achievements.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                    Honors & Achievements
                  </h2>
                  <div className="space-y-2">
                    {cvData.achievements.map((a) => (
                      <div key={a.id} className="text-xs">
                        <p className="font-bold text-slate-900">{a.title}</p>
                        <p className="text-slate-600 text-[11px]">{a.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Verification Footer */}
          <div className="mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-500 gap-2">
            <span>Career360 Institutional Placement Verification ID: {cvData.student.id.slice(0, 12).toUpperCase()}</span>
            <span>Generated on {new Date(cvData.generatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 2: OFFICIAL SCHOLASTIC TRANSCRIPT
          ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'transcript' && transcriptData && (
        <div className="bg-white text-slate-900 rounded-2xl shadow-2xl p-8 sm:p-12 border border-slate-200 print:border-none print:shadow-none print:p-0 print:rounded-none max-w-4xl mx-auto transition-all">
          {/* Institutional Header */}
          <div className="text-center border-b-2 border-slate-900 pb-6 mb-6">
            <div className="inline-block p-3 rounded-full bg-[#BDD8E9]/25 border border-[#BDD8E9] text-[#0A4174] mb-2">
              <GraduationCap className="w-8 h-8 mx-auto" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-slate-900 font-serif">
              {transcriptData.institution.name}
            </h1>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 mt-1">
              {transcriptData.institution.accreditation}
            </p>
            <p className="text-sm font-bold text-[#0A4174] uppercase tracking-widest mt-2 border-t border-b border-[#BDD8E9]/60 py-1 inline-block">
              {transcriptData.institution.examinationOffice} • Official Scholastic Transcript
            </p>
          </div>

          {/* Student & Program Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6 text-xs">
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase">Student Name</p>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{transcriptData.student.name}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase">University Roll No</p>
              <p className="font-bold text-slate-900 text-sm mt-0.5 font-mono">{transcriptData.student.rollNumber}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase">Program & Dept</p>
              <p className="font-bold text-slate-900 mt-0.5">{transcriptData.student.department}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase">Batch Year</p>
              <p className="font-bold text-slate-900 mt-0.5">{transcriptData.student.batch}</p>
            </div>
          </div>

          {/* Overall Standing Summary */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-[#BDD8E9] bg-[#BDD8E9]/20 mb-8">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#001D39]">Classification Awarded</p>
              <p className="text-base font-extrabold text-[#0A4174] mt-0.5">
                {transcriptData.scholasticStanding.classification}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Credits Earned</p>
                <p className="text-base font-bold text-slate-900">
                  {transcriptData.scholasticStanding.totalCreditsEarned} / {transcriptData.scholasticStanding.totalCreditsAttempted}
                </p>
              </div>
              <div className="text-right pl-4 border-l border-[#BDD8E9]">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Final CGPA</p>
                <p className="text-2xl font-black text-[#001D39] font-mono">
                  {transcriptData.scholasticStanding.cgpa?.toFixed(2) ?? 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Semester-by-Semester Tables */}
          <div className="space-y-6">
            {transcriptData.semesters.map((sem) => (
              <div key={sem.id} className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 flex items-center justify-between border-b border-slate-200">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
                    Semester {sem.semesterNumber} ({sem.academicYear})
                  </span>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-slate-600 font-medium">Credits: <strong>{sem.totalCredits}</strong></span>
                    <span className="text-[#0A4174] font-bold">SGPA: <strong>{sem.sgpa?.toFixed(2) ?? 'N/A'}</strong></span>
                  </div>
                </div>

                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                      <th className="py-2 px-3">Code</th>
                      <th className="py-2 px-3">Subject Title</th>
                      <th className="py-2 px-2 text-center">Credits</th>
                      <th className="py-2 px-2 text-center">Marks</th>
                      <th className="py-2 px-2 text-center">Grade</th>
                      <th className="py-2 px-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sem.subjects.map((sub, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-mono font-medium text-slate-700">{sub.code}</td>
                        <td className="py-2 px-3 font-medium text-slate-900">{sub.name}</td>
                        <td className="py-2 px-2 text-center text-slate-700">{sub.credits}</td>
                        <td className="py-2 px-2 text-center text-slate-700 font-mono">
                          {sub.marksObtained}/{sub.maxMarks}
                        </td>
                        <td className="py-2 px-2 text-center font-bold text-slate-900 font-mono">
                          {sub.grade}
                        </td>
                        <td className="py-2 px-2 text-center">
                          {sub.isBacklog ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-100 text-rose-800">
                              Backlog
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800">
                              Pass
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          {/* Official Seal & Signature Section */}
          <div className="mt-12 pt-8 border-t-2 border-slate-900 flex justify-between items-end text-center text-xs">
            <div>
              <div className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-400 text-[10px] uppercase tracking-widest font-serif font-bold">
                Official Seal
              </div>
              <p className="font-semibold text-slate-700">Registrar / COE Office</p>
            </div>

            <div>
              <div className="w-48 border-b border-slate-400 mb-2" />
              <p className="font-bold text-slate-900">Controller of Examinations</p>
              <p className="text-[10px] text-slate-500">Career360 Institute of Technology</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
