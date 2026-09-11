import { useState, useEffect, useMemo } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import Toast from '../../components/ui/Toast';
import {
  getHistoricalOverview,
  getCompanyPlacements,
  getPlacedSkills,
  getSkillCompanyAnalysis,
  getPlacementTrends,
  compareStudentWithHistorical,
} from '../../services/placementInsights.service';

export default function PlacementInsightsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Filter states
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [companySearch, setCompanySearch] = useState('');

  // Data states
  const [overview, setOverview] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [placedSkills, setPlacedSkills] = useState([]);
  const [skillCompanyData, setSkillCompanyData] = useState([]);
  const [trends, setTrends] = useState([]);

  // Modal state
  const [selectedCompanyModal, setSelectedCompanyModal] = useState(null);

  // Student Benchmark Tool state
  const [targetRoleForCompare, setTargetRoleForCompare] = useState('Software Development Engineer');
  const [compareData, setCompareData] = useState(null);
  const [comparing, setComparing] = useState(false);

  // Load core data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (selectedYear !== 'ALL') params.year = selectedYear;
      if (selectedDept !== 'ALL') params.departmentId = selectedDept;
      if (selectedRole !== 'ALL') params.role = selectedRole;

      const [overviewRes, companiesRes, skillsRes, skillCompanyRes, trendsRes] = await Promise.all([
        getHistoricalOverview(params),
        getCompanyPlacements(params),
        getPlacedSkills(params),
        getSkillCompanyAnalysis(),
        getPlacementTrends(),
      ]);

      setOverview(overviewRes.data?.data || null);
      setCompanies(companiesRes.data?.data || []);
      setPlacedSkills(skillsRes.data?.data?.skills || []);
      setSkillCompanyData(skillCompanyRes.data?.data || []);
      setTrends(trendsRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load placement insights:', err);
      setError('Unable to load placement insights. Please check connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedYear, selectedDept, selectedRole]);

  // Load benchmark comparison
  const handleRunComparison = async (roleToCompare) => {
    try {
      setComparing(true);
      const res = await compareStudentWithHistorical(roleToCompare || targetRoleForCompare);
      setCompareData(res.data?.data || null);
    } catch (err) {
      console.error('Comparison error:', err);
      setToast({ type: 'error', message: 'Could not compute comparison with target role.' });
    } finally {
      setComparing(false);
    }
  };

  useEffect(() => {
    handleRunComparison(targetRoleForCompare);
  }, [targetRoleForCompare]);

  // Filtered companies based on search
  const filteredCompanies = useMemo(() => {
    if (!companySearch.trim()) return companies;
    const q = companySearch.toLowerCase();
    return companies.filter(
      (c) =>
        c.companyName?.toLowerCase().includes(q) ||
        c.industry?.toLowerCase().includes(q) ||
        c.rolesHired?.some((r) => r.toLowerCase().includes(q))
    );
  }, [companies, companySearch]);

  if (loading && !overview) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[60vh]">
        <Loading message="Loading historical placement intelligence..." />
      </div>
    );
  }

  if (error && !overview) {
    return (
      <div className="p-8">
        <ErrorState title="Insights Unavailable" message={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header with Title & DEMO DATA Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-display font-bold text-white tracking-tight">
              Previous Year Placement Insights
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              DEMO DATA
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Explore verified historical placement records, package distributions, recruiting companies, and in-demand skills from past cohorts (2023–2025).
          </p>
        </div>

        {/* Demo Data Disclaimer notice */}
        <div className="bg-surface-800/80 border border-amber-500/30 rounded-xl px-4 py-2.5 flex items-center gap-3 text-xs text-amber-200">
          <span className="text-base">ℹ️</span>
          <div>
            <span className="font-semibold text-amber-100">Career Exploration Purpose:</span> Records displayed here are curated historical benchmarks to help guide skill acquisition.
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 bg-surface-900/60 border border-white/10 shadow-lg backdrop-blur-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Academic Cohort</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-surface-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
            >
              <option value="ALL">All Cohorts (2023 - 2025)</option>
              <option value="2025">2025 Batch</option>
              <option value="2024">2024 Batch</option>
              <option value="2023">2023 Batch</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full bg-surface-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
            >
              <option value="ALL">All Engineering Branches</option>
              <option value="CS">Computer Science & Eng (CSE)</option>
              <option value="IT">Information Technology (IT)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Job Role Track</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-surface-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
            >
              <option value="ALL">All Job Profiles</option>
              <option value="Software Development Engineer">Software Development Engineer</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
              <option value="Systems Engineer">Systems & Network Engineer</option>
              <option value="Data Engineer">Data Engineer & Analyst</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              className="w-full text-xs py-2 h-[38px] border-white/20 hover:border-white/40"
              onClick={() => {
                setSelectedYear('ALL');
                setSelectedDept('ALL');
                setSelectedRole('ALL');
                setCompanySearch('');
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* KPI Overview Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4 bg-surface-900 border border-white/10 relative overflow-hidden group hover:border-primary-500/40 transition-all">
          <div className="text-xs font-medium text-slate-400">Total Placed</div>
          <div className="mt-2 text-2xl font-bold font-display text-white">{overview?.totalPlaced || 0}</div>
          <div className="text-xs text-primary-400 mt-1">{overview?.totalOffers || 0} offers received</div>
        </Card>

        <Card className="p-4 bg-surface-900 border border-white/10 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="text-xs font-medium text-slate-400">Placement Rate</div>
          <div className="mt-2 text-2xl font-bold font-display text-emerald-400">
            {overview?.placementPercentage || 0}%
          </div>
          <div className="text-xs text-slate-400 mt-1">Cohort conversion</div>
        </Card>

        <Card className="p-4 bg-surface-900 border border-white/10 relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="text-xs font-medium text-slate-400">Highest Package</div>
          <div className="mt-2 text-2xl font-bold font-display text-purple-300">
            {overview?.highestPackageLpa || 0} <span className="text-xs font-normal text-slate-400">LPA</span>
          </div>
          <div className="text-xs text-purple-400 mt-1">Tier-1 product</div>
        </Card>

        <Card className="p-4 bg-surface-900 border border-white/10 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="text-xs font-medium text-slate-400">Average CTC</div>
          <div className="mt-2 text-2xl font-bold font-display text-cyan-300">
            {overview?.averagePackageLpa || 0} <span className="text-xs font-normal text-slate-400">LPA</span>
          </div>
          <div className="text-xs text-cyan-400 mt-1">Mean compensation</div>
        </Card>

        <Card className="p-4 bg-surface-900 border border-white/10 relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="text-xs font-medium text-slate-400">Min Package</div>
          <div className="mt-2 text-2xl font-bold font-display text-blue-300">
            {overview?.lowestPackageLpa || 0} <span className="text-xs font-normal text-slate-400">LPA</span>
          </div>
          <div className="text-xs text-blue-400 mt-1">Base offer baseline</div>
        </Card>

        <Card className="p-4 bg-surface-900 border border-white/10 relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="text-xs font-medium text-slate-400">Hiring Companies</div>
          <div className="mt-2 text-2xl font-bold font-display text-amber-300">
            {overview?.recruitingCompaniesCount || 0}
          </div>
          <div className="text-xs text-amber-400 mt-1">Active recruiters</div>
        </Card>
      </div>

      {/* Student Historical Benchmark Tool ("Compare My Profile with Historical Placements") */}
      <Card className="p-6 bg-gradient-to-br from-surface-900 via-surface-900/90 to-primary-950/20 border border-primary-500/30 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🎯</span>
              <h2 className="text-lg font-bold font-display text-white">
                Compare My Profile with Historical Placements
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Select your targeted career role to see how your current skills match up against students placed in this role in previous cohorts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={targetRoleForCompare}
              onChange={(e) => setTargetRoleForCompare(e.target.value)}
              className="bg-surface-800 border border-primary-500/40 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary-400"
            >
              <option value="Software Development Engineer">Software Development Engineer</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
              <option value="Systems Engineer">Systems & Network Engineer</option>
              <option value="Data Engineer">Data Engineer</option>
            </select>
            <Button
              variant="primary"
              size="sm"
              loading={comparing}
              onClick={() => handleRunComparison(targetRoleForCompare)}
            >
              Recalculate
            </Button>
          </div>
        </div>

        {compareData && (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Match Gauge */}
            <div className="flex flex-col items-center justify-center p-4 bg-surface-800/40 rounded-xl border border-white/5">
              <div className="text-xs font-semibold text-slate-400 mb-2">Historical Skill Match</div>
              <div className="relative w-28 h-28 flex items-center justify-center">
                <div className="text-3xl font-bold font-display text-primary-400">
                  {compareData.matchPercentage}%
                </div>
              </div>
              <p className="text-[11px] text-center text-slate-400 mt-2">
                Based on benchmark skills of students placed in <span className="text-white font-medium">{compareData.targetRole}</span>
              </p>
            </div>

            {/* Matched Skills */}
            <div className="p-4 bg-surface-800/40 rounded-xl border border-white/5 h-full">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <span>✓</span> Verified Matching Skills ({compareData.matchedSkills?.length || 0})
                </span>
              </div>
              {compareData.matchedSkills?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {compareData.matchedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No direct matches yet. Consider adding core competencies.</p>
              )}
            </div>

            {/* In-Demand Missing Skills */}
            <div className="p-4 bg-surface-800/40 rounded-xl border border-white/5 h-full">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                  <span>⚡</span> Recommended to Acquire ({compareData.missingSkills?.length || 0})
                </span>
              </div>
              {compareData.missingSkills?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {compareData.missingSkills.map((skill) => (
                    <span
                      key={typeof skill === 'string' ? skill : skill.name}
                      className="px-2.5 py-1 text-xs font-medium rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    >
                      {typeof skill === 'string' ? skill : skill.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-emerald-400 font-medium">Outstanding! You match all historical core requirements.</p>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Two Columns: Top Placed Skills & Placement Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Placed Students Skill Frequency */}
        <Card className="p-6 bg-surface-900 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold font-display text-white">Top Skills of Placed Students</h2>
              <p className="text-xs text-slate-400">Frequency of technical competencies across successful candidates</p>
            </div>
            <Badge variant="primary" size="sm">{placedSkills.length} Skills Tracked</Badge>
          </div>

          <div className="space-y-3 mt-4 max-h-80 overflow-y-auto pr-1">
            {placedSkills.slice(0, 10).map((item, idx) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-200">
                    <span className="text-slate-500 mr-2 font-mono">#{idx + 1}</span>
                    {item.name}
                  </span>
                  <span className="text-primary-400 font-mono">
                    {item.count} offers ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-surface-800 rounded-full h-2 overflow-hidden border border-white/5">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-cyan-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, item.percentage * 1.5)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Year-Over-Year Placement Trends */}
        <Card className="p-6 bg-surface-900 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold font-display text-white">Year-Over-Year Placement Trends</h2>
              <p className="text-xs text-slate-400">Package growth and placement volumes over 2023–2025</p>
            </div>
            <Badge variant="slate" size="sm">Multi-Year Growth</Badge>
          </div>

          <div className="grid grid-cols-3 gap-3 my-4">
            {trends.filter((t) => t.year >= 2023 && t.year <= 2025).map((t) => (
              <div key={t.year} className="bg-surface-800/60 border border-white/5 rounded-xl p-3 text-center">
                <div className="text-xs font-bold text-primary-400 font-mono">{t.year} Batch</div>
                <div className="text-xl font-bold text-white mt-1.5">{t.placementsCount}</div>
                <div className="text-[11px] text-slate-400">Offers Accepted</div>
                <div className="mt-2 pt-2 border-t border-white/10 text-xs">
                  <span className="text-slate-400">Avg: </span>
                  <span className="text-cyan-300 font-semibold">{t.averagePackageLpa} LPA</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Peak: <span className="text-purple-300 font-semibold">{t.highestPackageLpa} LPA</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-surface-800/30 rounded-lg border border-white/5 text-xs text-slate-400 flex items-center justify-between">
            <span>📈 Avg CTC 3-Year Growth:</span>
            <span className="text-emerald-400 font-semibold">+12.6% (20.0 LPA → 22.5 LPA)</span>
          </div>
        </Card>
      </div>

      {/* Company-Wise Placement Records Table */}
      <Card className="p-6 bg-surface-900 border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold font-display text-white">Company-Wise Placement Breakdown</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical hiring records, roles, salary brackets, and demanded tech stacks by recruiting partner
            </p>
          </div>

          {/* Search bar */}
          <div className="w-full md:w-72">
            <Input
              placeholder="Search companies, roles, skills..."
              value={companySearch}
              onChange={(e) => setCompanySearch(e.target.value)}
              className="text-xs"
            />
          </div>
        </div>

        {filteredCompanies.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            No company records found matching the current search and filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Industry</th>
                  <th className="py-3 px-4 text-center">Placements</th>
                  <th className="py-3 px-4 text-right">Avg Package</th>
                  <th className="py-3 px-4 text-right">Peak Package</th>
                  <th className="py-3 px-4">Roles Hired</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCompanies.map((c) => (
                  <tr key={c.companyId || c.companyName} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white text-sm">{c.companyName}</div>
                      {c.location && <div className="text-[11px] text-slate-500">{c.location}</div>}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <span className="inline-block px-2 py-0.5 rounded bg-surface-800 text-slate-300 border border-white/5">
                        {c.industry || 'Technology'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-white">
                      {c.placementCount}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-cyan-300">
                      {c.averagePackageLpa} LPA
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-purple-300">
                      {c.highestPackageLpa} LPA
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {c.rolesHired?.slice(0, 2).map((role) => (
                          <span
                            key={role}
                            className="px-2 py-0.5 rounded text-[10px] bg-surface-800 text-slate-300 border border-white/5 truncate"
                          >
                            {role}
                          </span>
                        ))}
                        {c.rolesHired?.length > 2 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            +{c.rolesHired.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Button
                        variant="outline"
                        size="xs"
                        className="text-[11px] border-white/20 hover:border-primary-400 hover:text-primary-300"
                        onClick={() => setSelectedCompanyModal(c)}
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Skill to Company Analysis Matrix */}
      <Card className="p-6 bg-surface-900 border border-white/10">
        <div className="mb-4">
          <h2 className="text-base font-bold font-display text-white">Skill-to-Company Intelligence Mapping</h2>
          <p className="text-xs text-slate-400">Discover which high-frequency technologies are prioritized by specific recruiting partners</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
          {skillCompanyData.slice(0, 8).map((sc) => (
            <div
              key={sc.skill}
              className="p-3 bg-surface-800/40 rounded-xl border border-white/5 hover:border-white/15 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-xs text-primary-300 font-mono">{sc.skill}</span>
                <span className="text-[11px] text-slate-400">{sc.count} Placements</span>
              </div>
              <div className="text-[11px] text-slate-400">Recruiting Companies:</div>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {sc.companies?.slice(0, 3).map((comp) => (
                  <span
                    key={comp}
                    className="px-1.5 py-0.5 rounded text-[10px] bg-surface-700/80 text-slate-200"
                  >
                    {comp}
                  </span>
                ))}
                {sc.companies?.length > 3 && (
                  <span className="text-[10px] text-slate-500 self-center">
                    +{sc.companies.length - 3}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Company Details Modal */}
      {selectedCompanyModal && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedCompanyModal(null)}
          title={`${selectedCompanyModal.companyName} — Historical Placement Profile`}
        >
          <div className="space-y-4 text-xs text-slate-300">
            <div className="grid grid-cols-2 gap-3 p-3 bg-surface-800 rounded-lg border border-white/5">
              <div>
                <span className="text-slate-400 block">Industry</span>
                <span className="text-white font-medium">{selectedCompanyModal.industry || 'Software / Technology'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Location</span>
                <span className="text-white font-medium">{selectedCompanyModal.location || 'Bangalore / Pan-India'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Avg Package Offered</span>
                <span className="text-cyan-300 font-mono font-bold text-sm">{selectedCompanyModal.averagePackageLpa} LPA</span>
              </div>
              <div>
                <span className="text-slate-400 block">Peak Package Recorded</span>
                <span className="text-purple-300 font-mono font-bold text-sm">{selectedCompanyModal.highestPackageLpa} LPA</span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-1.5">Roles Hired</h3>
              <div className="flex flex-wrap gap-1.5">
                {selectedCompanyModal.rolesHired?.map((role) => (
                  <Badge key={role} variant="primary" size="sm">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-1.5">Demanded Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {selectedCompanyModal.skillsDemanded?.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 rounded bg-surface-800 text-slate-300 border border-white/10 text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {selectedCompanyModal.website && (
              <div className="pt-2">
                <a
                  href={selectedCompanyModal.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary-400 hover:underline inline-flex items-center gap-1 text-xs"
                >
                  Visit Official Careers Page ↗
                </a>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
