import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/student/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleExploreInsights = () => {
    navigate('/student/insights');
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 overflow-x-hidden">
      {/* ── Navigation Header ──────────────────────────────────────────────────────── */}
      <header className="relative z-20 flex items-center justify-between px-6 md:px-12 h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0A4174] flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-[#001D39]">
            Career<span className="text-[#0A4174]">360</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-600">
          <a href="#how-it-works" className="hover:text-[#0A4174] transition-colors">How It Works</a>
          <a href="#features" className="hover:text-[#0A4174] transition-colors">Platform Features</a>
          <a href="#career-intel" className="hover:text-[#0A4174] transition-colors">Career Intelligence</a>
          <a href="#placement-insights" className="hover:text-[#0A4174] transition-colors">Placement Insights</a>
          <a href="#why-career360" className="hover:text-[#0A4174] transition-colors">Why Career360</a>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-600 hidden sm:inline">
                Hi, <strong className="text-[#001D39]">{currentUser?.name}</strong>
              </span>
              <Button size="sm" variant="primary" onClick={() => navigate('/student/dashboard')}>
                My Dashboard →
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button size="sm" variant="ghost" className="text-slate-600 hover:text-[#001D39]">
                  Sign In
                </Button>
              </Link>
              <Button size="sm" variant="primary" onClick={handleGetStarted}>
                Get Started
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════
          1. HERO SECTION
         ══════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 pt-20 pb-20 px-6 md:px-12 max-w-6xl mx-auto text-center">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#BDD8E9]/30 to-[#7BBDE8]/20 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E1EFF8] border border-[#BDD8E9] text-xs font-semibold text-[#0A4174] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0A4174] animate-pulse" />
          Engineered Exclusively for Engineering Students
        </div>

        <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight text-[#001D39] leading-tight max-w-4xl mx-auto">
          Your Complete Career &amp; <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-[#001D39] via-[#0A4174] to-[#49769F] bg-clip-text text-transparent">
            Placement Intelligence
          </span> Platform
        </h1>

        <p className="mt-6 text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Empowering engineering students to track their academic journey, master in-demand skills, and explore real placement data from previous years.
        </p>

        {/* Hero CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <Button size="lg" variant="primary" onClick={handleGetStarted} className="w-full sm:w-auto px-8 shadow-sm">
            Get Started →
          </Button>
          <Button size="lg" variant="outline" onClick={handleExploreInsights} className="w-full sm:w-auto px-8">
            Explore Placement Insights 📊
          </Button>
        </div>

        {/* Key Metrics Banner (Clean White Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 text-left">
          <Card className="p-4 bg-white border border-[#BDD8E9]/70 shadow-sm">
            <span className="text-2xl font-bold font-display text-[#001D39]">360°</span>
            <span className="text-xs text-slate-500 block mt-1">Student Career Portfolio</span>
          </Card>
          <Card className="p-4 bg-white border border-[#BDD8E9]/70 shadow-sm">
            <span className="text-2xl font-bold font-display text-[#0A4174]">2023–2025</span>
            <span className="text-xs text-slate-500 block mt-1">Historical Placement Records</span>
          </Card>
          <Card className="p-4 bg-white border border-[#BDD8E9]/70 shadow-sm">
            <span className="text-2xl font-bold font-display text-[#4E8EA2]">44 LPA</span>
            <span className="text-xs text-slate-500 block mt-1">Peak Verified CTC Benchmark</span>
          </Card>
          <Card className="p-4 bg-white border border-[#BDD8E9]/70 shadow-sm">
            <span className="text-2xl font-bold font-display text-emerald-600">100%</span>
            <span className="text-xs text-slate-500 block mt-1">Personalized Skill Gap Matrix</span>
          </Card>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          2. HOW CAREER360 WORKS (Step-by-step student workflow)
         ══════════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="relative z-10 py-20 px-6 md:px-12 bg-[#F8FAFC] border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Badge variant="primary" size="sm">Workflow</Badge>
            <h2 className="font-display font-bold text-3xl text-[#001D39] mt-2">
              How Career360 Works
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-xl mx-auto">
              A structured, 4-step path from first-year academic tracking to high-impact campus recruitment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-[#BDD8E9]/70 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#E1EFF8] text-[#0A4174] font-bold font-mono flex items-center justify-center mb-4">
                01
              </div>
              <h3 className="font-semibold text-[#001D39] text-base mb-1">Build Academic Profile</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Log semester grades, track SGPA/CGPA progression, and monitor backlog clearances with zero paperwork.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[#BDD8E9]/70 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#E1EFF8] text-[#0A4174] font-bold font-mono flex items-center justify-center mb-4">
                02
              </div>
              <h3 className="font-semibold text-[#001D39] text-base mb-1">Curate Skills &amp; Projects</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Showcase practical engineering projects, verify technical certifications, and catalog internship experiences.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[#BDD8E9]/70 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#E1EFF8] text-[#0A4174] font-bold font-mono flex items-center justify-center mb-4">
                03
              </div>
              <h3 className="font-semibold text-[#001D39] text-base mb-1">Benchmark &amp; Close Gaps</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Select your target career track (SDE, Cloud, Data) to evaluate readiness and bridge missing skill competencies.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[#BDD8E9]/70 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#E1EFF8] text-[#0A4174] font-bold font-mono flex items-center justify-center mb-4">
                04
              </div>
              <h3 className="font-semibold text-[#001D39] text-base mb-1">Explore Placement Trends</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Inspect historical recruiting data, package bands, and top recruiter requirements to ace campus interviews.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          3. PLATFORM FEATURES
         ══════════════════════════════════════════════════════════════════ */}
      <section id="features" className="relative z-10 py-20 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <Badge variant="primary" size="sm">Core Capabilities</Badge>
          <h2 className="font-display font-bold text-3xl text-[#001D39] mt-2">
            Engineered for Modern Engineering Careers
          </h2>
          <p className="text-slate-600 text-sm mt-1 max-w-xl mx-auto">
            Everything you need to showcase your talent, monitor readiness, and land top technology offers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-white border border-[#BDD8E9]/70 shadow-sm hover:border-[#0A4174]/40 hover:shadow-md transition-all">
            <div className="text-3xl mb-3">🎓</div>
            <h3 className="font-semibold text-[#001D39] text-base mb-2">Academic Tracking</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Semester-wise SGPA logs, cumulative CGPA calculation, credit audits, and institutional academic transcripts.
            </p>
          </Card>

          <Card className="p-6 bg-white border border-[#BDD8E9]/70 shadow-sm hover:border-[#0A4174]/40 hover:shadow-md transition-all">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold text-[#001D39] text-base mb-2">Skill Verification</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Tag technical proficiencies across Languages, Frameworks, Cloud, and Databases with verifiable evidence links.
            </p>
          </Card>

          <Card className="p-6 bg-white border border-[#BDD8E9]/70 shadow-sm hover:border-[#0A4174]/40 hover:shadow-md transition-all">
            <div className="text-3xl mb-3">💻</div>
            <h3 className="font-semibold text-[#001D39] text-base mb-2">Project Showcase</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Feature team and individual engineering builds with live demo URLs, GitHub repository links, and tech stacks.
            </p>
          </Card>

          <Card className="p-6 bg-white border border-[#BDD8E9]/70 shadow-sm hover:border-[#0A4174]/40 hover:shadow-md transition-all">
            <div className="text-3xl mb-3">📄</div>
            <h3 className="font-semibold text-[#001D39] text-base mb-2">Resume &amp; Portfolio</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Instant ATS-friendly CV export, public shareable profiles, and verified academic record sheets in one click.
            </p>
          </Card>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          4. CAREER INTELLIGENCE
         ══════════════════════════════════════════════════════════════════ */}
      <section id="career-intel" className="relative z-10 py-20 px-6 md:px-12 bg-[#F8FAFC] border-y border-slate-200">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge variant="primary" size="sm">Smart Career Guidance</Badge>
            <h2 className="font-display font-bold text-3xl text-[#001D39] mt-2">
              Career Intelligence &amp; Skill Gap Analysis
            </h2>
            <p className="text-slate-600 text-sm mt-4 leading-relaxed">
              Don't guess what hiring managers look for. Career360 calculates an objective <strong className="text-[#001D39]">Career Readiness Score</strong> calibrated against real job benchmarks.
            </p>

            <div className="space-y-4 mt-6">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#E1EFF8] text-[#0A4174] flex items-center justify-center text-xs mt-0.5 font-bold">✓</div>
                <div>
                  <h4 className="text-sm font-semibold text-[#001D39]">Target Role Benchmarking</h4>
                  <p className="text-xs text-slate-500">Map your skills against Software Engineer, Full Stack, Cloud, and Data Engineer roles.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#E1EFF8] text-[#0A4174] flex items-center justify-center text-xs mt-0.5 font-bold">✓</div>
                <div>
                  <h4 className="text-sm font-semibold text-[#001D39]">Real-Time Skill Gap Matrix</h4>
                  <p className="text-xs text-slate-500">Identify critical and missing skills with prioritized recommendations.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#E1EFF8] text-[#0A4174] flex items-center justify-center text-xs mt-0.5 font-bold">✓</div>
                <div>
                  <h4 className="text-sm font-semibold text-[#001D39]">Actionable Semester Roadmaps</h4>
                  <p className="text-xs text-slate-500">Step-by-step milestones to complete projects, earn certifications, and prepare for interviews.</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Button variant="primary" onClick={() => navigate('/student/career')}>
                Explore Career Intelligence →
              </Button>
            </div>
          </div>

          {/* Graphic Preview Box (Clean White Surface) */}
          <Card className="p-6 bg-white border border-[#BDD8E9]/80 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="text-xs text-slate-500">Target Role:</span>
                <div className="text-sm font-bold text-[#001D39]">Software Development Engineer (SDE)</div>
              </div>
              <Badge variant="success" size="sm">82% Match</Badge>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 font-medium">Data Structures &amp; Algorithms</span>
                  <span className="text-emerald-600 font-semibold">Matched</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 font-medium">System Design &amp; Architecture</span>
                  <span className="text-amber-600 font-semibold">Recommended to Acquire</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 font-medium">Distributed Systems &amp; AWS</span>
                  <span className="text-[#0A4174] font-semibold">In Progress</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[#0A4174] h-1.5 rounded-full" style={{ width: '65%' }} />
                </div>
              </div>
            </div>

            <div className="mt-6 p-3 bg-[#BDD8E9]/20 rounded-xl border border-[#BDD8E9] text-xs text-[#001D39]">
              💡 <strong>Intelligence Tip:</strong> Adding 1 Distributed Systems project will increase your eligibility for tier-1 product companies by 24%.
            </div>
          </Card>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          5. PREVIOUS YEAR PLACEMENT INSIGHTS
         ══════════════════════════════════════════════════════════════════ */}
      <section id="placement-insights" className="relative z-10 py-20 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 mb-2">
            <Badge variant="primary" size="sm">Placement Intelligence</Badge>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              DEMO DATA
            </span>
          </div>
          <h2 className="font-display font-bold text-3xl text-[#001D39]">
            Previous Year Placement Insights
          </h2>
          <p className="text-slate-600 text-sm mt-1 max-w-xl mx-auto">
            Analyze historical placement outcomes from 2023–2025 cohorts. Discover recruiting companies, package brackets, and in-demand skills.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-white border border-[#BDD8E9]/70 shadow-sm">
            <div className="text-[#0A4174] text-xl font-bold font-mono">01. Company Breakdown</div>
            <h3 className="font-semibold text-[#001D39] text-base mt-2">Hiring Records &amp; CTCs</h3>
            <p className="text-slate-500 text-xs mt-2 leading-relaxed">
              Explore historical recruitment statistics from Microsoft, Amazon, Cisco, Oracle, Goldman Sachs, Deloitte, and TCS Digital.
            </p>
          </Card>

          <Card className="p-6 bg-white border border-[#BDD8E9]/70 shadow-sm">
            <div className="text-[#4E8EA2] text-xl font-bold font-mono">02. Skill Demand Distribution</div>
            <h3 className="font-semibold text-[#001D39] text-base mt-2">High-Frequency Competencies</h3>
            <p className="text-slate-500 text-xs mt-2 leading-relaxed">
              Identify the exact technical skills possessed by previously placed students across 2023, 2024, and 2025 batches.
            </p>
          </Card>

          <Card className="p-6 bg-white border border-[#BDD8E9]/70 shadow-sm">
            <div className="text-[#49769F] text-xl font-bold font-mono">03. Profile Benchmark</div>
            <h3 className="font-semibold text-[#001D39] text-base mt-2">Student vs History Match</h3>
            <p className="text-slate-500 text-xs mt-2 leading-relaxed">
              Run real-time profile comparisons to see which skills you share with previously hired candidates and what you should learn next.
            </p>
          </Card>
        </div>

        <div className="mt-10 text-center">
          <Button size="lg" variant="primary" onClick={handleExploreInsights}>
            Launch Placement Insights Suite 📊
          </Button>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          6. WHY CAREER360
         ══════════════════════════════════════════════════════════════════ */}
      <section id="why-career360" className="relative z-10 py-20 px-6 md:px-12 bg-[#F8FAFC] border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Badge variant="primary" size="sm">Value Proposition</Badge>
            <h2 className="font-display font-bold text-3xl text-[#001D39] mt-2">
              Why Students Choose Career360
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-xl mx-auto">
              Purpose-built to replace fragmented spreadsheets, vague resume advice, and unverified placement rumours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <h3 className="font-semibold text-[#001D39] text-lg flex items-center gap-2">
                <span>🎯</span> Objective Clarity
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Know exactly where you stand with a computed Career Readiness Score and concrete milestones, instead of relying on guesswork.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-[#001D39] text-lg flex items-center gap-2">
                <span>📊</span> Verified Insights
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Access genuine historical placement metrics and salary distributions from past engineering batches to plan your preparation.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-[#001D39] text-lg flex items-center gap-2">
                <span>⚡</span> Single Unified Portal
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Manage your academic records, technical portfolio, interview prep, and placement intelligence in one unified, responsive platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          7. CALL TO ACTION (Dark Navy #001D39 Brand Box)
         ══════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-6 md:px-12 max-w-4xl mx-auto text-center">
        <div className="p-12 rounded-3xl bg-gradient-to-br from-[#001D39] to-[#0A4174] text-white shadow-xl relative overflow-hidden border border-[#0A4174]/40">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
            Start Your Career Journey Today
          </h2>
          <p className="mt-3 text-[#BDD8E9] text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Join Career360, build your verified engineering portfolio, and prepare strategically for campus placements.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Button size="lg" variant="primary" onClick={handleGetStarted} className="w-full sm:w-auto px-8 bg-white text-[#001D39] hover:bg-[#BDD8E9] border-white">
              Get Started Free →
            </Button>
            <Button size="lg" variant="outline" onClick={handleExploreInsights} className="w-full sm:w-auto px-8 border-white/50 text-white hover:bg-white/10 hover:text-white">
              View Historical Placements
            </Button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          8. FOOTER (Dark Navy #001D39)
         ══════════════════════════════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-[#0A4174]/30 bg-[#001D39] text-white py-12 px-6 md:px-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#0A4174] flex items-center justify-center">
              <span className="text-white font-bold text-xs">C</span>
            </div>
            <span className="font-display font-bold text-lg text-white tracking-tight">
              Career<span className="text-[#7BBDE8]">360</span>
            </span>
          </div>

          <p className="text-xs text-[#BDD8E9]/70 text-center">
            Student-Only Career &amp; Placement Intelligence Platform. Empowering next-generation engineers.
          </p>

          <div className="flex items-center gap-6 text-xs text-[#BDD8E9]">
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/student/insights" className="hover:text-white transition-colors">Placement Insights</Link>
            <Link to="/student/career" className="hover:text-white transition-colors">Career Intelligence</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
