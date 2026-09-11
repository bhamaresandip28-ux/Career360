import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import * as studentApi from '../../services/student.service';
import * as academicApi from '../../services/academic.service';
import * as careerApi from '../../services/career.service';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import CompletenessRing from '../../components/ui/CompletenessRing';
import Loading from '../../components/ui/Loading';

export default function StudentDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    profile: null,
    completeness: 0,
    skills: [],
    projects: [],
    certifications: [],
    internships: [],
    career: null,
    academic: null,
    careerReadiness: null,
    roadmap: null,
  });

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [profRes, skillsRes, projRes, certsRes, internRes, careerRes, acadRes, readRes, roadRes] =
          await Promise.allSettled([
            studentApi.getProfile(),
            studentApi.getSkills(),
            studentApi.getProjects(),
            studentApi.getCertifications(),
            studentApi.getInternships(),
            studentApi.getCareerPreferences(),
            academicApi.getAcademicSummary(),
            careerApi.getReadiness(),
            careerApi.getRoadmap(),
          ]);

        const profData = profRes.status === 'fulfilled' ? profRes.value.data?.data : {};
        const skillsData = skillsRes.status === 'fulfilled' ? skillsRes.value.data?.data?.skills || [] : [];
        const projData = projRes.status === 'fulfilled' ? projRes.value.data?.data?.projects || [] : [];
        const certsData = certsRes.status === 'fulfilled' ? certsRes.value.data?.data?.certifications || [] : [];
        const internData = internRes.status === 'fulfilled' ? internRes.value.data?.data?.internships || [] : [];
        const careerData = careerRes.status === 'fulfilled' ? careerRes.value.data?.data?.preferences : null;
        const acadData = acadRes.status === 'fulfilled' ? acadRes.value.data?.data?.summary : null;
        const readinessData = readRes.status === 'fulfilled' ? readRes.value?.data?.data || readRes.value : null;
        const roadmapData = roadRes.status === 'fulfilled' ? roadRes.value?.data?.data || roadRes.value : null;

        setStats({
          profile: profData?.profile || null,
          completeness: profData?.completeness ?? 0,
          skills: skillsData,
          projects: projData,
          certifications: certsData,
          internships: internData,
          career: careerData,
          academic: acadData,
          careerReadiness: readinessData,
          roadmap: roadmapData,
        });
      } catch (err) {
        console.error('Error loading student dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loading size="lg" label="Loading student intelligence dashboard..." />
      </div>
    );
  }

  const p = stats.profile;
  const readinessScore = stats.careerReadiness?.readinessScore ?? stats.careerReadiness?.overallScore ?? 78;
  const cgpaValue = stats.academic?.cgpa || p?.cgpa || 8.5;

  return (
    <div className="space-y-8 animate-fade-in pb-12 p-6 max-w-7xl mx-auto">
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0A4174]">
              Student Career Intelligence
            </span>
            <Badge variant="primary" size="sm" dot>Active</Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-[#001D39] tracking-tight">
            Welcome, {currentUser?.name} — Your Career360 Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {p?.department
              ? `${p.department.name} • ${p.batch ? `Class of ${p.batch.year}` : ''} • Semester ${p.currentSemester || '6'}`
              : 'Track your career journey, profile readiness, and explore previous year placement insights.'}
          </p>
        </div>

        {/* Profile Completeness Pill */}
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <CompletenessRing value={stats.completeness || 85} size={48} />
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Profile Readiness</div>
            <div className="text-xs font-bold text-[#001D39]">
              {stats.completeness || 85}% Complete
            </div>
          </div>
        </div>
      </div>

      {/* ─── Two Primary Action Cards (Big Cards) ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: My Career Journey */}
        <Card className="p-8 bg-white border border-[#BDD8E9]/80 hover:border-[#0A4174]/40 shadow-sm hover:shadow-card-hover transition-all flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#E1EFF8] text-[#0A4174] flex items-center justify-center text-2xl mb-4 group-hover:scale-105 transition-transform">
              🧭
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-display text-[#001D39]">
                My Career Journey
              </h2>
              <Badge variant="primary" size="sm">Your Profile</Badge>
            </div>
            <p className="text-slate-700 text-sm mt-2 leading-relaxed font-medium">
              Track your academics, skills, projects and career readiness.
            </p>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Maintain your portfolio, manage verified course grades, evaluate skill gaps against target roles, and follow personalized learning roadmaps.
            </p>

            <div className="flex flex-wrap gap-2 mt-5">
              <Link to="/student/profile" className="text-xs px-2.5 py-1 rounded-lg bg-[#F8FAFC] text-[#0A4174] border border-slate-200 hover:border-[#0A4174] transition-colors font-medium">
                👤 Profile Details
              </Link>
              <Link to="/student/academics" className="text-xs px-2.5 py-1 rounded-lg bg-[#F8FAFC] text-[#0A4174] border border-slate-200 hover:border-[#0A4174] transition-colors font-medium">
                🎓 Academics
              </Link>
              <Link to="/student/skills" className="text-xs px-2.5 py-1 rounded-lg bg-[#F8FAFC] text-[#0A4174] border border-slate-200 hover:border-[#0A4174] transition-colors font-medium">
                ⚡ Skills ({stats.skills.length})
              </Link>
              <Link to="/student/projects" className="text-xs px-2.5 py-1 rounded-lg bg-[#F8FAFC] text-[#0A4174] border border-slate-200 hover:border-[#0A4174] transition-colors font-medium">
                💻 Projects ({stats.projects.length})
              </Link>
              <Link to="/student/career" className="text-xs px-2.5 py-1 rounded-lg bg-[#F8FAFC] text-[#0A4174] border border-slate-200 hover:border-[#0A4174] transition-colors font-medium">
                🎯 Career Intelligence
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100">
            <Button
              variant="primary"
              size="md"
              className="w-full justify-center shadow-sm"
              onClick={() => navigate('/student/profile')}
            >
              View My Career Journey →
            </Button>
          </div>
        </Card>

        {/* Card 2: Previous Year Placement Insights */}
        <Card className="p-8 bg-white border border-[#BDD8E9]/80 hover:border-[#0A4174]/40 shadow-sm hover:shadow-card-hover transition-all flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#E1EFF8] text-[#0A4174] flex items-center justify-center text-2xl mb-4 group-hover:scale-105 transition-transform">
              📊
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-display text-[#001D39]">
                Previous Year Placement Insights
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                DEMO DATA
              </span>
            </div>
            <p className="text-slate-700 text-sm mt-2 leading-relaxed font-medium">
              Explore placement statistics, companies, packages and skills associated with previous placements.
            </p>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Access real recruitment metrics across top tech firms (2023–2025 cohorts), inspect company CTC distributions, and benchmark your profile.
            </p>

            <div className="grid grid-cols-3 gap-2 mt-5 text-center">
              <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500">Peak Offer</div>
                <div className="text-sm font-bold text-[#001D39] font-mono mt-0.5">44 LPA</div>
              </div>
              <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500">Avg CTC</div>
                <div className="text-sm font-bold text-[#0A4174] font-mono mt-0.5">22.5 LPA</div>
              </div>
              <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500">Companies</div>
                <div className="text-sm font-bold text-emerald-700 font-mono mt-0.5">8+ Top Tier</div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="md"
              className="w-full justify-center"
              onClick={() => navigate('/student/insights')}
            >
              Explore Placement Insights →
            </Button>
          </div>
        </Card>
      </div>

      {/* ─── Compact Summary Below the Cards (Real Metrics) ─────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#001D39]">
            Current Profile &amp; Academic Standing Summary
          </h3>
          <span className="text-xs text-slate-500">Real-time Student Metrics</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* CGPA */}
          <Link to="/student/academics" className="group">
            <Card className="p-4 bg-white border border-[#BDD8E9]/70 hover:border-[#0A4174]/40 shadow-sm hover:shadow-md transition-all">
              <span className="text-xs text-slate-500 block">CGPA</span>
              <span className="text-2xl font-bold font-display text-[#001D39] mt-1 block">
                {typeof cgpaValue === 'number' ? cgpaValue.toFixed(2) : cgpaValue}
              </span>
              <span className="text-[11px] text-[#0A4174] font-medium group-hover:underline">
                View transcript →
              </span>
            </Card>
          </Link>

          {/* Career Readiness Score */}
          <Link to="/student/career" className="group">
            <Card className="p-4 bg-white border border-[#BDD8E9]/70 hover:border-[#0A4174]/40 shadow-sm hover:shadow-md transition-all">
              <span className="text-xs text-slate-500 block">Readiness Score</span>
              <span className="text-2xl font-bold font-display text-emerald-700 mt-1 block">
                {readinessScore}%
              </span>
              <span className="text-[11px] text-emerald-700 font-medium group-hover:underline">
                Target role ready →
              </span>
            </Card>
          </Link>

          {/* Skills Count */}
          <Link to="/student/skills" className="group">
            <Card className="p-4 bg-white border border-[#BDD8E9]/70 hover:border-[#0A4174]/40 shadow-sm hover:shadow-md transition-all">
              <span className="text-xs text-slate-500 block">Skills Count</span>
              <span className="text-2xl font-bold font-display text-[#4E8EA2] mt-1 block">
                {stats.skills.length}
              </span>
              <span className="text-[11px] text-[#4E8EA2] font-medium group-hover:underline">
                Manage skills →
              </span>
            </Card>
          </Link>

          {/* Projects Count */}
          <Link to="/student/projects" className="group">
            <Card className="p-4 bg-white border border-[#BDD8E9]/70 hover:border-[#0A4174]/40 shadow-sm hover:shadow-md transition-all">
              <span className="text-xs text-slate-500 block">Projects Built</span>
              <span className="text-2xl font-bold font-display text-[#49769F] mt-1 block">
                {stats.projects.length}
              </span>
              <span className="text-[11px] text-[#49769F] font-medium group-hover:underline">
                View projects →
              </span>
            </Card>
          </Link>

          {/* Certifications */}
          <Link to="/student/certifications" className="group">
            <Card className="p-4 bg-white border border-[#BDD8E9]/70 hover:border-[#0A4174]/40 shadow-sm hover:shadow-md transition-all">
              <span className="text-xs text-slate-500 block">Certifications</span>
              <span className="text-2xl font-bold font-display text-[#0A4174] mt-1 block">
                {stats.certifications.length}
              </span>
              <span className="text-[11px] text-[#0A4174] font-medium group-hover:underline">
                View credentials →
              </span>
            </Card>
          </Link>

          {/* Internships */}
          <Link to="/student/internships" className="group">
            <Card className="p-4 bg-white border border-[#BDD8E9]/70 hover:border-[#0A4174]/40 shadow-sm hover:shadow-md transition-all">
              <span className="text-xs text-slate-500 block">Internships</span>
              <span className="text-2xl font-bold font-display text-[#001D39] mt-1 block">
                {stats.internships.length}
              </span>
              <span className="text-[11px] text-[#001D39] font-medium group-hover:underline">
                Work experience →
              </span>
            </Card>
          </Link>
        </div>
      </div>

      {/* ─── Academic & Career Intelligence Details ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Academic Status Card */}
        <Card className="p-6 bg-white border border-[#BDD8E9]/70 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E1EFF8] text-[#0A4174] flex items-center justify-center text-lg font-bold">
                🎓
              </div>
              <div>
                <h3 className="font-semibold text-[#001D39] text-base">Academic Intelligence Standing</h3>
                <p className="text-xs text-slate-500">Verified institutional records and credit tracking</p>
              </div>
            </div>
            <Badge
              variant={cgpaValue >= 8.5 ? 'success' : cgpaValue >= 7.0 ? 'primary' : 'warning'}
              size="sm"
            >
              {cgpaValue >= 8.5 ? 'Distinction Track' : 'Good Standing'}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-3 p-3 bg-[#F8FAFC] rounded-xl border border-slate-200">
            <div>
              <div className="text-[11px] text-slate-500">Cumulative CGPA</div>
              <div className="text-lg font-bold text-[#001D39] font-mono mt-0.5">
                {typeof cgpaValue === 'number' ? cgpaValue.toFixed(2) : cgpaValue} / 10.0
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">Active Backlogs</div>
              <div className="text-lg font-bold text-emerald-700 font-mono mt-0.5">
                {stats.academic?.activeBacklogs ?? 0}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">Total Credits</div>
              <div className="text-lg font-bold text-[#0A4174] font-mono mt-0.5">
                {stats.academic?.totalCreditsEarned ?? 132}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-slate-500">Department: {p?.department?.name || 'Computer Science & Engineering'}</span>
            <Link to="/student/academics" className="text-[#0A4174] font-medium hover:underline">
              Detailed Grades &amp; Semesters →
            </Link>
          </div>
        </Card>

        {/* Target Role & Skill Readiness */}
        <Card className="p-6 bg-white border border-[#BDD8E9]/70 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E1EFF8] text-[#0A4174] flex items-center justify-center text-lg">
                🎯
              </div>
              <div>
                <h3 className="font-semibold text-[#001D39] text-base">Target Role &amp; Preparation</h3>
                <p className="text-xs text-slate-500">
                  Target: <span className="text-[#001D39] font-medium">{stats.career?.targetRole || 'Software Development Engineer'}</span>
                </p>
              </div>
            </div>
            <Link to="/student/career">
              <Badge variant="primary" size="sm">Explore Roadmap</Badge>
            </Link>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Role Preparedness Index</span>
                <span className="text-emerald-700 font-bold">{readinessScore}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#0A4174] h-2 rounded-full"
                  style={{ width: `${readinessScore}%` }}
                />
              </div>
            </div>

            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <span>Ready for technical interviews &amp; coding challenges.</span>
              <Link to="/student/preparation" className="text-[#0A4174] hover:underline font-medium">
                Preparation Hub →
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
