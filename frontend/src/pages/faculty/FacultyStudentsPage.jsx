import { useState, useEffect } from 'react';
import analyticsService from '../../services/analytics.service';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

export default function FacultyStudentsPage() {
  const [students, setStudents]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [deptFilter, setDeptFilter]   = useState('');

  const fetchRoster = async () => {
    setLoading(true);
    try {
      const data = await analyticsService.getStudentRoster();
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, []);

  const departments = Array.from(new Set(students.map((s) => s.department).filter(Boolean)));

  const filtered = students.filter((s) => {
    const matchesSearch = !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase());
    const matchesDept = !deptFilter || s.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display font-bold text-2xl text-white">Department Student Roster</h2>
        <p className="text-slate-400 text-sm">Comprehensive scholastic directory of enrolled students and academic performance.</p>
      </div>

      {/* Filter bar */}
      <div className="glass p-4 rounded-xl border border-white/5 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="w-64">
            <Input
              placeholder="Search by name, roll, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="bg-surface-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary-500"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-400">
          Showing <strong className="text-white">{filtered.length}</strong> of {students.length} students
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center p-12"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-12">
            <span className="text-4xl">👥</span>
            <p className="text-white font-medium mt-3">No students found</p>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your search criteria or department filter.</p>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Body className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-white/5 text-slate-400 border-b border-white/10">
                <tr>
                  <th className="px-5 py-3">Student</th>
                  <th className="px-4 py-3">Roll / Dept</th>
                  <th className="px-4 py-3">Semester</th>
                  <th className="px-4 py-3">CGPA</th>
                  <th className="px-4 py-3">Attendance</th>
                  <th className="px-4 py-3">Backlogs</th>
                  <th className="px-4 py-3">Portfolio Stats</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((s) => {
                  const isAtRisk = (s.cgpa && s.cgpa < 6.0) || (s.avgAttendance && s.avgAttendance < 75) || s.activeBacklogs > 0;
                  return (
                    <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold text-xs">
                            {s.name[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{s.name}</p>
                            <p className="text-xs text-slate-400">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-white text-xs">{s.rollNumber}</p>
                        <p className="text-[11px] text-slate-400">{s.department}</p>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-white">
                        {s.currentSemester ? `Semester ${s.currentSemester}` : '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`font-bold text-xs ${s.cgpa >= 8.5 ? 'text-emerald-400' : s.cgpa >= 7.0 ? 'text-primary-400' : s.cgpa < 6.0 ? 'text-danger-400' : 'text-slate-200'}`}>
                          {s.cgpa ? `${s.cgpa.toFixed(2)}` : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-semibold ${s.avgAttendance && s.avgAttendance < 75 ? 'text-danger-400' : 'text-emerald-400'}`}>
                          {s.avgAttendance ? `${s.avgAttendance}%` : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-medium ${s.activeBacklogs > 0 ? 'text-danger-400 font-bold' : 'text-slate-400'}`}>
                          {s.activeBacklogs || 0} active
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-400">
                        {s.skillsCount} skills • {s.projectsCount} projects • {s.internshipsCount} internships
                      </td>
                      <td className="px-4 py-3.5">
                        {isAtRisk ? (
                          <Badge variant="danger" size="sm">AT RISK</Badge>
                        ) : (
                          <Badge variant="success" size="sm">ON TRACK</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
