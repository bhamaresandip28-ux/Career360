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
    <div className="min-h-screen bg-surface-950 text-white overflow-x-hidden">
      {/* ── Ambient Background Lighting ─────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-accent-600/10 rounded-full blur-3xl" />
      </div>

      {/* ── Navigation Header ──────────────────────────────────────────────────────── */}
      <header className="relative z-20 flex items-center justify-between px-6 md:px-12 h-16 border-b border-white/10 bg-surface-950/80 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center shadow-glow">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="font-display font-bold text-xl tracking-tight">
            Career<span className="text-primary-400">360</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs text-slate-300">
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#features" className="hover:text-white transition-colors">Platform Features</a>
          <a href="#career-intel" className="hover:text-white transition-colors">Career Intelligence</a>
          <a href="#placement-insights" className="hover:text-white transition-colors">Placement Insights</a>
          <a href="#why-career360" className="hover:text-white transition-colors">Why Career360</a>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-300 hidden sm:inline">
                Hi, <strong className="text-white">{currentUser?.name}</strong>
              </span>
              <Button size="sm" variant="primary" onClick={() => navigate('/student/dashboard')}>
                My Dashboard →
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button size="sm" variant="ghost" className="text-slate-300 hover:text-white">
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
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-xs text-primary-300 mb-6 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
          Engineered Exclusively for Engineering Students
        </div>

        <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight text-white leading-tight max-w-4xl mx-auto">
          Your Complete Career &amp; <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-primary-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
            Placement Intelligence
          </span> Platform
        </h1>

        <p className="mt-6 text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Empowering engineering students to track their academic journey, master in-demand skills, and explore real placement data from previous years.
        </p>

        {/* Hero CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <Button size="lg" variant="primary" onClick={handleGetStarted} className="w-full sm:w-auto shadow-glow px-8">
            Get Started →
          </Button>
          <Button size="lg" variant="outline" onClick={handleExploreInsights} className="w-full sm:w-auto border-white/20 hover:border-white/40 px-8">
            Explore Placement Insights 📊
          </Button>
        </div>

        {/* Key Metrics Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 text-left">
          <Card className="p-4 bg-surface-900/60 border border-white/10">
            <span className="text-2xl font-bold font-display text-white">360°</span>
            <span className="text-xs text-slate-400 block mt-1">Student Career Portfolio</span>
          </Card>
          <Card className="p-4 bg-surface-900/60 border border-white/10">
            <span className="text-2xl font-bold font-display text-primary-400">2023–2025</span>
            <span className="text-xs text-slate-400 block mt-1">Historical Placement Records</span>
          </Card>
          <Card className="p-4 bg-surface-900/60 border border-white/10">
            <span className="text-2xl font-bold font-display text-cyan-300">44 LPA</span>
            <span className="text-xs text-slate-400 block mt-1">Peak Verified CTC Benchmark</span>
          </Card>
          <Card className="p-4 bg-surface-900/60 border border-white/10">
            <span className="text-2xl font-bold font-display text-emerald-400">100%</span>
            <span className="text-xs text-slate-400 block mt-1">Personalized Skill Gap Matrix</span>
          </Card>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          2. HOW CAREER360 WORKS (Step-by-step student workflow)
         ══════════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="relative z-10 py-20 px-6 md:px-12 bg-surface-900/40 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Badge variant="primary" size="sm">Workflow</Badge>
            <h2 className="font-display font-bold text-3xl text-white mt-2">
              How Career360 Works
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl mx-auto">
              A structured, 4-step path from first-year academic tracking to high-impact campus recruitment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 bg-surface-900/80 rounded-2xl border border-white/10 relative">
              <div className="w-10 h-10 rounded-xl bg-primary-500/20 text-primary-400 font-bold font-mono flex items-center justify-center mb-4">
                01
              </div>
              <h3 className="font-semibold text-white text-base mb-1">Build Academic Profile</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Log semester grades, track SGPA/CGPA progression, and monitor backlog clearances with zero paperwork.
              </p>
            </div>

            <div className="p-6 bg-surface-900/80 rounded-2xl border border-white/10 relative">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 font-bold font-mono flex items-center justify-center mb-4">
                02
              </div>
              <h3 className="font-semibold text-white text-base mb-1">Curate Skills &amp; Projects</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Showcase practical engineering projects, verify technical certifications, and catalog internship experiences.
              </p>
            </div>

            <div className="p-6 bg-surface-900/80 rounded-2xl border border-white/10 relative">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 font-bold font-mono flex items-center justify-center mb-4">
                03
              </div>
              <h3 className="font-semibold text-white text-base mb-1">Benchmark &amp; Close Gaps</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Select your target career track (SDE, Cloud, Data) to evaluate readiness and bridge missing skill competencies.
              </p>
            </div>

            <div className="p-6 bg-surface-900/80 rounded-2xl border border-white/10 relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold font-mono flex items-center justify-center mb-4">
                04
              </div>
              <h3 className="font-semibold text-white text-base mb-1">Explore Placement Trends</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
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
          <h2 className="font-display font-bold text-3xl text-white mt-2">
            Engineered for Modern Engineering Careers
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-xl mx-auto">
            Everything you need to showcase your talent, monitor readiness, and land top technology offers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-surface-900 border border-white/10 hover:border-primary-500/40 transition-all">
            <div className="text-3xl mb-3">🎓</div>
            <h3 className="font-semibold text-white text-base mb-2">Academic Tracking</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Semester-wise SGPA logs, cumulative CGPA calculation, credit audits, and institutional academic transcripts.
            </p>
          </Card>

          <Card className="p-6 bg-surface-900 border border-white/10 hover:border-cyan-500/40 transition-all">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold text-white text-base mb-2">Skill Verification</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Tag technical proficiencies across Languages, Frameworks, Cloud, and Databases with verifiable evidence links.
            </p>
          </Card>

          <Card className="p-6 bg-surface-900 border border-white/10 hover:border-purple-500/40 transition-all">
            <div className="text-3xl mb-3">💻</div>
            <h3 className="font-semibold text-white text-base mb-2">Project Showcase</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Feature team and individual engineering builds with live demo URLs, GitHub repository links, and tech stacks.
            </p>
          </Card>

          <Card className="p-6 bg-surface-900 border border-white/10 hover:border-emerald-500/40 transition-all">
            <div className="text-3xl mb-3">📄</div>
            <h3 className="font-semibold text-white text-base mb-2">Resume &amp; Portfolio</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Instant ATS-friendly CV export, public shareable profiles, and verified academic record sheets in one click.
            </p>
          </Card>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          4. CAREER INTELLIGENCE
         ══════════════════════════════════════════════════════════════════ */}
      <section id="career-intel" className="relative z-10 py-20 px-6 md:px-12 bg-surface-900/40 border-y border-white/5">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge variant="primary" size="sm">Smart Career Guidance</Badge>
            <h2 className="font-display font-bold text-3xl text-white mt-2">
              Career Intelligence &amp; Skill Gap Analysis
            </h2>
            <p className="text-slate-300 text-sm mt-4 leading-relaxed">
              Don't guess what hiring managers look for. Career360 calculates an objective <strong>Career Readiness Score</strong> calibrated against real job benchmarks.
            </p>

            <div className="space-y-4 mt-6">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-xs mt-0.5">✓</div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Target Role Benchmarking</h4>
                  <p className="text-xs text-slate-400">Map your skills against Software Engineer, Full Stack, Cloud, and Data Engineer roles.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs mt-0.5">✓</div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Real-Time Skill Gap Matrix</h4>
                  <p className="text-xs text-slate-400">Identify critical and missing skills with prioritized recommendations.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs mt-0.5">✓</div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Actionable Semester Roadmaps</h4>
                  <p className="text-xs text-slate-400">Step-by-step milestones to complete projects, earn certifications, and prepare for interviews.</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Button variant="primary" onClick={() => navigate('/student/career')}>
                Explore Career Intelligence →
              </Button>
            </div>
          </div>

          {/* Graphic / Visual Box */}
          <Card className="p-6 bg-surface-900 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <span className="text-xs text-slate-400">Target Role:</span>
                <div className="text-sm font-bold text-white">Software Development Engineer (SDE)</div>
              </div>
              <Badge variant="success" size="sm">82% Match</Badge>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Data Structures &amp; Algorithms</span>
                  <span className="text-emerald-400 font-semibold">Matched</span>
                </div>
                <div className="w-full bg-surface-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">System Design &amp; Architecture</span>
                  <span className="text-amber-400 font-semibold">Recommended to Acquire</span>
                </div>
                <div className="w-full bg-surface-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Distributed Systems &amp; AWS</span>
                  <span className="text-primary-400 font-semibold">In Progress</span>
                </div>
                <div className="w-full bg-surface-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: '65%' }} />
                </div>
              </div>
            </div>

            <div className="mt-6 p-3 bg-surface-800/60 rounded-xl border border-white/5 text-xs text-slate-300">
              💡 <strong>AI Tip:</strong> Adding 1 Distributed Systems project will increase your eligibility for tier-1 product companies by 24%.
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
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              DEMO DATA
            </span>
          </div>
          <h2 className="font-display font-bold text-3xl text-white">
            Previous Year Placement Insights
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-xl mx-auto">
            Analyze historical placement outcomes from 2023–2025 cohorts. Discover recruiting companies, package brackets, and in-demand skills.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-surface-900 border border-white/10">
            <div className="text-primary-400 text-xl font-bold font-mono">01. Company Breakdown</div>
            <h3 className="font-semibold text-white text-base mt-2">Hiring Records &amp; CTCs</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Explore historical recruitment statistics from Microsoft, Amazon, Cisco, Oracle, Goldman Sachs, Deloitte, and TCS Digital.
            </p>
          </Card>

          <Card className="p-6 bg-surface-900 border border-white/10">
            <div className="text-cyan-400 text-xl font-bold font-mono">02. Skill Demand Distribution</div>
            <h3 className="font-semibold text-white text-base mt-2">High-Frequency Competencies</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Identify the exact technical skills possessed by previously placed students across 2023, 2024, and 2025 batches.
            </p>
          </Card>

          <Card className="p-6 bg-surface-900 border border-white/10">
            <div className="text-purple-400 text-xl font-bold font-mono">03. Profile Benchmark</div>
            <h3 className="font-semibold text-white text-base mt-2">Student vs History Match</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Run real-time profile comparisons to see which skills you share with previously hired candidates and what you should learn next.
            </p>
          </Card>
        </div>

        <div className="mt-10 text-center">
          <Button size="lg" variant="primary" onClick={handleExploreInsights} className="shadow-glow">
            Launch Placement Insights Suite 📊
          </Button>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          6. WHY CAREER360
         ══════════════════════════════════════════════════════════════════ */}
      <section id="why-career360" className="relative z-10 py-20 px-6 md:px-12 bg-surface-900/40 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Badge variant="primary" size="sm">Value Proposition</Badge>
            <h2 className="font-display font-bold text-3xl text-white mt-2">
              Why Students Choose Career360
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl mx-auto">
              Purpose-built to replace fragmented spreadsheets, vague resume advice, and unverified placement rumours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <h3 className="font-semibold text-white text-lg flex items-center gap-2">
                <span>🎯</span> Objective Clarity
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Know exactly where you stand with a computed Career Readiness Score and concrete milestones, instead of relying on guesswork.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-white text-lg flex items-center gap-2">
                <span>📊</span> Verified Insights
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Access genuine historical placement metrics and salary distributions from past engineering batches to plan your preparation.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-white text-lg flex items-center gap-2">
                <span>⚡</span> Single Unified Portal
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Manage your academic records, technical portfolio, interview prep, and placement intelligence in one unified, responsive platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          7. CALL TO ACTION
         ══════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-6 md:px-12 max-w-4xl mx-auto text-center">
        <div className="p-12 rounded-3xl bg-gradient-to-br from-primary-950/60 via-surface-900 to-purple-950/40 border border-primary-500/30 shadow-2xl relative overflow-hidden">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
            Start Your Career Journey Today
          </h2>
          <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Join Career360, build your verified engineering portfolio, and prepare strategically for campus placements.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Button size="lg" variant="primary" onClick={handleGetStarted} className="w-full sm:w-auto shadow-glow px-8">
              Get Started Free →
            </Button>
            <Button size="lg" variant="outline" onClick={handleExploreInsights} className="w-full sm:w-auto border-white/20 hover:border-white/40 px-8">
              View Historical Placements
            </Button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          8. FOOTER
         ══════════════════════════════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-white/10 bg-surface-950 py-12 px-6 md:px-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center">
              <span className="text-white font-bold text-xs">C</span>
            </div>
            <span className="font-display font-bold text-lg text-white tracking-tight">
              Career<span className="text-primary-400">360</span>
            </span>
          </div>

          <p className="text-xs text-slate-400 text-center">
            Student-Only Career &amp; Placement Intelligence Platform. Empowering next-generation engineers.
          </p>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/student/insights" className="hover:text-white transition-colors">Placement Insights</Link>
            <Link to="/student/career" className="hover:text-white transition-colors">Career Intelligence</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
