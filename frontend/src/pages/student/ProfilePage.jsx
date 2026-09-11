import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import * as studentApi from '../../services/student.service';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import CompletenessRing from '../../components/ui/CompletenessRing';
import Toast from '../../components/ui/Toast';

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
];

const PLATFORMS = [
  { key: 'LINKEDIN', label: 'LinkedIn', icon: '🔗', placeholder: 'https://linkedin.com/in/username' },
  { key: 'GITHUB', label: 'GitHub', icon: '🐙', placeholder: 'https://github.com/username' },
  { key: 'PORTFOLIO', label: 'Portfolio Website', icon: '🌐', placeholder: 'https://yourname.dev' },
  { key: 'LEETCODE', label: 'LeetCode', icon: '💡', placeholder: 'https://leetcode.com/username' },
  { key: 'CODECHEF', label: 'CodeChef', icon: '👨‍🍳', placeholder: 'https://codechef.com/users/username' },
  { key: 'HACKERRANK', label: 'HackerRank', icon: '💻', placeholder: 'https://hackerrank.com/username' },
  { key: 'CODEFORCES', label: 'Codeforces', icon: '⚡', placeholder: 'https://codeforces.com/profile/username' },
  { key: 'KAGGLE', label: 'Kaggle', icon: '📊', placeholder: 'https://kaggle.com/username' },
];

export default function ProfilePage() {
  const { currentUser } = useAuth();

  // Data states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [links, setLinks] = useState([]);
  const [careerPref, setCareerPref] = useState(null);

  // Modal states
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isEditLinksOpen, setIsEditLinksOpen] = useState(false);
  const [isEditCareerOpen, setIsEditCareerOpen] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    rollNumber: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    departmentId: '',
    batchId: '',
    currentSemester: '',
    admissionYear: '',
  });

  const [linksForm, setLinksForm] = useState({});
  const [careerForm, setCareerForm] = useState({
    targetRole: '',
    careerInterests: '',
    preferredLocation: '',
    careerGoals: '',
  });

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Fetch all profile data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [profRes, deptRes, linksRes, prefRes] = await Promise.all([
        studentApi.getProfile(),
        studentApi.getDepartments(),
        studentApi.getLinks(),
        studentApi.getCareerPreferences(),
      ]);

      const prof = profRes.data?.data || {};
      setProfileData(prof);

      const depts = deptRes.data?.data?.departments || [];
      setDepartments(depts);

      const l = linksRes.data?.data?.links || [];
      setLinks(l);

      const pref = prefRes.data?.data?.preferences || null;
      setCareerPref(pref);

      // Populate edit profile form
      const p = prof.profile || {};
      setProfileForm({
        rollNumber: p.rollNumber || '',
        phone: p.phone || '',
        gender: p.gender || '',
        dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '',
        address: p.address || '',
        departmentId: p.departmentId || '',
        batchId: p.batchId || '',
        currentSemester: p.currentSemester != null ? String(p.currentSemester) : '',
        admissionYear: p.admissionYear != null ? String(p.admissionYear) : '',
      });

      // If department is selected, load batches
      if (p.departmentId) {
        loadBatches(p.departmentId);
      }

      // Populate links form
      const linkMap = {};
      l.forEach((item) => {
        linkMap[item.platform] = item.url;
      });
      setLinksForm(linkMap);

      // Populate career form
      if (pref) {
        setCareerForm({
          targetRole: pref.targetRole || '',
          careerInterests: (pref.careerInterests || []).join(', '),
          preferredLocation: pref.preferredLocation || '',
          careerGoals: pref.careerGoals || '',
        });
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load student profile.');
    } finally {
      setLoading(false);
    }
  };

  const loadBatches = async (deptId) => {
    if (!deptId) {
      setBatches([]);
      return;
    }
    try {
      const res = await studentApi.getBatches(deptId);
      setBatches(res.data?.data?.batches || []);
    } catch (err) {
      console.error('Failed to load batches:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle department change in edit modal
  const handleDepartmentChange = (deptId) => {
    setProfileForm((prev) => ({ ...prev, departmentId: deptId, batchId: '' }));
    loadBatches(deptId);
  };

  // Submit Profile Form
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        rollNumber: profileForm.rollNumber || undefined,
        phone: profileForm.phone || undefined,
        gender: profileForm.gender || undefined,
        dateOfBirth: profileForm.dateOfBirth || undefined,
        address: profileForm.address || undefined,
        departmentId: profileForm.departmentId || undefined,
        batchId: profileForm.batchId || undefined,
        currentSemester: profileForm.currentSemester ? parseInt(profileForm.currentSemester, 10) : undefined,
        admissionYear: profileForm.admissionYear ? parseInt(profileForm.admissionYear, 10) : undefined,
      };

      await studentApi.updateProfile(payload);
      setToast({ type: 'success', message: 'Profile updated successfully!' });
      setIsEditProfileOpen(false);
      await fetchData();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  // Submit Links Form
  const handleLinksSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const linksArray = Object.entries(linksForm)
        .filter(([, url]) => url && url.trim() !== '')
        .map(([platform, url]) => ({
          platform,
          url: url.trim(),
          isPublic: true,
        }));

      await studentApi.upsertLinks(linksArray);
      setToast({ type: 'success', message: 'Professional links updated!' });
      setIsEditLinksOpen(false);
      await fetchData();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to update links.' });
    } finally {
      setSaving(false);
    }
  };

  // Submit Career Preferences Form
  const handleCareerSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const interestsArray = careerForm.careerInterests
        ? careerForm.careerInterests
            .split(',')
            .map((i) => i.trim())
            .filter(Boolean)
        : [];

      const payload = {
        targetRole: careerForm.targetRole || undefined,
        careerInterests: interestsArray,
        preferredLocation: careerForm.preferredLocation || undefined,
        careerGoals: careerForm.careerGoals || undefined,
      };

      await studentApi.updateCareerPreferences(payload);
      setToast({ type: 'success', message: 'Career preferences saved!' });
      setIsEditCareerOpen(false);
      await fetchData();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to save career preferences.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loading size="lg" text="Loading student profile..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to Load Profile"
        message={error}
        onRetry={fetchData}
      />
    );
  }

  const p = profileData?.profile || {};
  const u = profileData?.user || currentUser || {};
  const completeness = profileData?.completeness ?? 0;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Top Profile Banner */}
      <div className="p-6 bg-white border border-[#BDD8E9]/70 rounded-2xl shadow-card">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="w-20 h-20 rounded-2xl bg-[#0A4174] flex items-center justify-center text-white text-2xl font-bold shadow-md border-2 border-white">
              {u.name ? u.name[0].toUpperCase() : 'S'}
            </div>
            <div>
              <div className="flex items-center gap-3 justify-center sm:justify-start flex-wrap">
                <h2 className="font-display font-bold text-2xl text-[#001D39]">{u.name}</h2>
                <Badge variant="primary" size="sm">STUDENT</Badge>
                {p.rollNumber && (
                  <Badge variant="slate" size="sm">
                    Roll: {p.rollNumber}
                  </Badge>
                )}
              </div>
              <p className="text-slate-500 text-sm mt-1">{u.email}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 justify-center sm:justify-start flex-wrap">
                {p.department && (
                  <span className="flex items-center gap-1">
                    <span className="text-[#0A4174] font-semibold">{p.department.name}</span>
                  </span>
                )}
                {p.batch && (
                  <span className="text-slate-400">• Batch of {p.batch.year}</span>
                )}
                {p.currentSemester && (
                  <span className="text-slate-400">• Semester {p.currentSemester}</span>
                )}
              </div>
            </div>
          </div>

          {/* Completeness Ring & Action */}
          <div className="flex items-center gap-4 bg-[#F4F7FB] p-4 rounded-xl border border-[#BDD8E9]/60">
            <CompletenessRing value={completeness} size={88} />
            <div className="text-left">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Profile Health
              </h4>
              <p className="text-xs text-slate-600 mt-1 max-w-[140px]">
                {completeness >= 80
                  ? 'Great job! Profile is placement ready.'
                  : 'Add details to increase visibility to recruiters.'}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 text-xs py-1"
                onClick={() => setIsEditProfileOpen(true)}
              >
                Update Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Info + Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Personal & Academic Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal & Academic Details Card */}
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <Card.Title>Personal & Academic Details</Card.Title>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditProfileOpen(true)}
                  className="text-[#0A4174] hover:text-[#001D39] text-xs"
                >
                  Edit Details ✏️
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <span className="text-slate-500 text-xs block">Full Name</span>
                  <span className="text-[#001D39] font-medium">{u.name || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">Official Email</span>
                  <span className="text-[#001D39] font-medium">{u.email || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">Roll Number</span>
                  <span className="text-[#001D39] font-medium">{p.rollNumber || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">Contact Phone</span>
                  <span className="text-[#001D39] font-medium">{p.phone || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">Department</span>
                  <span className="text-[#001D39] font-medium">{p.department?.name || 'Not assigned'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">Graduation Batch</span>
                  <span className="text-[#001D39] font-medium">
                    {p.batch ? `Class of ${p.batch.year}` : 'Not assigned'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">Current Semester</span>
                  <span className="text-[#001D39] font-medium">
                    {p.currentSemester ? `Semester ${p.currentSemester}` : 'Not set'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">Admission Year</span>
                  <span className="text-[#001D39] font-medium">{p.admissionYear || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">Gender</span>
                  <span className="text-[#001D39] font-medium">
                    {p.gender ? p.gender.replace('_', ' ') : 'Not set'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">Date of Birth</span>
                  <span className="text-[#001D39] font-medium">
                    {p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString() : 'Not set'}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 text-xs block">Address</span>
                  <span className="text-[#001D39] font-medium">{p.address || 'Not provided'}</span>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Career Preferences Card */}
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <div>
                  <Card.Title>Career Preferences & Goals</Card.Title>
                  <Card.Description>Help the platform suggest suitable job drives and skill roadmaps</Card.Description>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditCareerOpen(true)}
                  className="text-[#0A4174] hover:text-[#001D39] text-xs"
                >
                  Edit Preferences ✏️
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-slate-500 text-xs block">Target Job Role</span>
                  <span className="text-[#001D39] font-medium text-base">
                    {careerPref?.targetRole || 'Not specified yet'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block mb-1">Career Interests</span>
                  {careerPref?.careerInterests && careerPref.careerInterests.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {careerPref.careerInterests.map((interest, i) => (
                        <Badge key={i} variant="teal" size="sm">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-500 text-sm">None specified</span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 text-xs block">Preferred Job Location</span>
                    <span className="text-[#001D39] font-medium">
                      {careerPref?.preferredLocation || 'Any / Remote'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs block">Career Goals & Aspirations</span>
                    <p className="text-slate-600 text-xs mt-0.5">
                      {careerPref?.careerGoals || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Right Col: Academic Stats & Professional Profiles */}
        <div className="space-y-6">
          {/* Academic Snapshot */}
          <Card>
            <Card.Header>
              <Card.Title>Academic Snapshot</Card.Title>
              <Card.Description>Verified academic performance metrics</Card.Description>
            </Card.Header>
            <Card.Body>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#F4F7FB] border border-[#BDD8E9]/60 text-center">
                  <span className="text-xs text-slate-500 block">Cumulative GPA</span>
                  <span className="text-2xl font-bold text-[#0A4174] mt-1 block">
                    {p.cgpa != null ? p.cgpa.toFixed(2) : '—'}
                  </span>
                  <span className="text-[10px] text-slate-400">Scale of 10.0</span>
                </div>
                <div className="p-3 rounded-xl bg-[#F4F7FB] border border-[#BDD8E9]/60 text-center">
                  <span className="text-xs text-slate-500 block">Latest SGPA</span>
                  <span className="text-2xl font-bold text-[#0A4174] mt-1 block">
                    {p.latestSgpa != null ? p.latestSgpa.toFixed(2) : '—'}
                  </span>
                  <span className="text-[10px] text-slate-400">Last semester</span>
                </div>
                <div className="p-3 rounded-xl bg-[#F4F7FB] border border-[#BDD8E9]/60 text-center">
                  <span className="text-xs text-slate-500 block">Active Backlogs</span>
                  <span className={`text-2xl font-bold mt-1 block ${p.activeBacklogs > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {p.activeBacklogs ?? 0}
                  </span>
                  <span className="text-[10px] text-slate-400">Currently pending</span>
                </div>
                <div className="p-3 rounded-xl bg-[#F4F7FB] border border-[#BDD8E9]/60 text-center">
                  <span className="text-xs text-slate-500 block">Total History</span>
                  <span className="text-2xl font-bold text-[#001D39] mt-1 block">
                    {p.totalBacklogs ?? 0}
                  </span>
                  <span className="text-[10px] text-slate-400">Lifetime backlogs</span>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Professional Profiles */}
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <Card.Title>Professional Profiles</Card.Title>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditLinksOpen(true)}
                  className="text-[#0A4174] hover:text-[#001D39] text-xs"
                >
                  Manage 🔗
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {links.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs text-slate-400 mb-2">No links added yet.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditLinksOpen(true)}
                    className="text-xs"
                  >
                    + Add LinkedIn / GitHub
                  </Button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {links.map((link) => {
                    const platformMeta = PLATFORMS.find((pl) => pl.key === link.platform);
                    return (
                      <a
                        key={link.id || link.platform}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#F4F7FB] hover:bg-[#BDD8E9]/25 border border-[#BDD8E9]/50 transition-all text-xs group"
                      >
                        <div className="flex items-center gap-2">
                          <span>{platformMeta?.icon || '🔗'}</span>
                          <span className="text-[#001D39] font-medium">
                            {platformMeta?.label || link.platform}
                          </span>
                        </div>
                        <span className="text-[#0A4174] flex items-center gap-1 font-semibold">
                          Open ↗
                        </span>
                      </a>
                    );
                  })}
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* ─── MODAL 1: Edit Profile ────────────────────────────────────────── */}
      <Modal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        title="Edit Personal & Academic Details"
        size="lg"
      >
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Roll Number"
              id="rollNumber"
              value={profileForm.rollNumber}
              onChange={(e) => setProfileForm({ ...profileForm, rollNumber: e.target.value })}
              placeholder="e.g. CS2024001"
            />
            <Input
              label="Contact Phone"
              id="phone"
              type="tel"
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              placeholder="10-digit mobile number"
            />
            <Select
              label="Gender"
              id="gender"
              options={GENDER_OPTIONS}
              value={profileForm.gender}
              onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
              placeholder="Select Gender"
            />
            <Input
              label="Date of Birth"
              id="dateOfBirth"
              type="date"
              value={profileForm.dateOfBirth}
              onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
            />
            <Select
              label="Department"
              id="departmentId"
              options={departments.map((d) => ({ value: d.id, label: `${d.name} (${d.code})` }))}
              value={profileForm.departmentId}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              placeholder="Select Department"
            />
            <Select
              label="Graduation Batch"
              id="batchId"
              options={batches.map((b) => ({ value: b.id, label: `Graduation Year: ${b.year}` }))}
              value={profileForm.batchId}
              onChange={(e) => setProfileForm({ ...profileForm, batchId: e.target.value })}
              placeholder={profileForm.departmentId ? 'Select Batch' : 'Select Department first'}
              disabled={!profileForm.departmentId}
            />
            <Input
              label="Current Semester (1-8)"
              id="currentSemester"
              type="number"
              min="1"
              max="8"
              value={profileForm.currentSemester}
              onChange={(e) => setProfileForm({ ...profileForm, currentSemester: e.target.value })}
              placeholder="e.g. 5"
            />
            <Input
              label="Admission Year"
              id="admissionYear"
              type="number"
              min="2018"
              max="2030"
              value={profileForm.admissionYear}
              onChange={(e) => setProfileForm({ ...profileForm, admissionYear: e.target.value })}
              placeholder="e.g. 2024"
            />
            <div className="sm:col-span-2">
              <Input
                label="Permanent / Current Address"
                id="address"
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                placeholder="City, State, Country"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditProfileOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Save Profile
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL 2: Edit Professional Links ─────────────────────────────── */}
      <Modal
        isOpen={isEditLinksOpen}
        onClose={() => setIsEditLinksOpen(false)}
        title="Manage Professional Links"
        size="md"
      >
        <form onSubmit={handleLinksSubmit} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <p className="text-xs text-slate-500 mb-2">
            Add links to your developer and professional profiles. LinkedIn or GitHub adds to your completeness score!
          </p>
          {PLATFORMS.map((platform) => (
            <div key={platform.key}>
              <Input
                label={`${platform.icon} ${platform.label}`}
                id={`link_${platform.key}`}
                type="url"
                value={linksForm[platform.key] || ''}
                onChange={(e) =>
                  setLinksForm({ ...linksForm, [platform.key]: e.target.value })
                }
                placeholder={platform.placeholder}
              />
            </div>
          ))}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditLinksOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Save Links
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL 3: Edit Career Preferences ─────────────────────────────── */}
      <Modal
        isOpen={isEditCareerOpen}
        onClose={() => setIsEditCareerOpen(false)}
        title="Edit Career Preferences"
        size="md"
      >
        <form onSubmit={handleCareerSubmit} className="space-y-4">
          <Input
            label="Target Job Role"
            id="targetRole"
            value={careerForm.targetRole}
            onChange={(e) => setCareerForm({ ...careerForm, targetRole: e.target.value })}
            placeholder="e.g. Full Stack Developer, Data Scientist"
            hint="The primary job title you aspire to achieve upon graduation."
          />
          <Input
            label="Career Interests (comma separated)"
            id="careerInterests"
            value={careerForm.careerInterests}
            onChange={(e) => setCareerForm({ ...careerForm, careerInterests: e.target.value })}
            placeholder="e.g. Cloud Computing, AI/ML, DevOps, Microservices"
          />
          <Input
            label="Preferred Location"
            id="preferredLocation"
            value={careerForm.preferredLocation}
            onChange={(e) => setCareerForm({ ...careerForm, preferredLocation: e.target.value })}
            placeholder="e.g. Bangalore, Hyderabad, Remote"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Career Goals & Aspirations</label>
            <textarea
              className="w-full rounded-xl bg-white border border-slate-300 text-sm text-[#001D39] placeholder-slate-400 p-3 focus:outline-none focus:ring-2 focus:ring-[#0A4174]"
              rows={3}
              value={careerForm.careerGoals}
              onChange={(e) => setCareerForm({ ...careerForm, careerGoals: e.target.value })}
              placeholder="Describe your 2-5 year career vision and learning ambitions..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditCareerOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Save Preferences
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
