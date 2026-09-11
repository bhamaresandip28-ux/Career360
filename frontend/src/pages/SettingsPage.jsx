import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import {
  User,
  Lock,
  Bell,
  Shield,
  CheckCircle,
  AlertCircle,
  Key,
} from 'lucide-react';

export default function SettingsPage() {
  const { currentUser } = useAuth();
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const [notificationPrefs, setNotificationPrefs] = useState({
    drives: true,
    interviews: true,
    academics: true,
    system: true,
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (!passwords.currentPassword || !passwords.newPassword) {
      setMsg({ type: 'error', text: 'Please fill in all required password fields.' });
      return;
    }

    if (passwords.newPassword.length < 8) {
      setMsg({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setLoading(true);
    try {
      await api.patch('/users/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setMsg({ type: 'success', text: 'Password successfully updated!' });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || 'Failed to update password.';
      setMsg({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="p-6 bg-white border border-[#BDD8E9]/70 rounded-2xl shadow-card">
        <h1 className="text-2xl font-bold text-[#001D39] tracking-tight flex items-center gap-2">
          <Shield className="w-6 h-6 text-[#0A4174]" />
          Account & Security Settings
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          Manage your security credentials, notification preferences, and account privacy.
        </p>
      </div>

      {/* Account Overview Card */}
      <Card className="p-6">
        <h2 className="text-base font-bold text-[#001D39] mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-[#0A4174]" />
          Account Identity
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#F4F7FB] border border-[#BDD8E9]/60">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#0A4174] flex items-center justify-center text-white text-base font-bold shadow-sm">
              {currentUser?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#001D39]">{currentUser?.name}</h3>
              <p className="text-xs text-slate-500">{currentUser?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="primary" size="sm">{currentUser?.role}</Badge>
                <Badge variant="success" size="sm">ACTIVE</Badge>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Security: Password Change */}
      <Card className="p-6">
        <h2 className="text-base font-bold text-[#001D39] mb-1 flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#0A4174]" />
          Change Password
        </h2>
        <p className="text-xs text-slate-500 mb-5">
          Ensure your account is using a long, random password for maximum security.
        </p>

        {msg.text && (
          <div className={`p-3 rounded-xl text-xs mb-4 flex items-center gap-2 ${
            msg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              : 'bg-rose-50 border border-rose-200 text-rose-700'
          }`}>
            {msg.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{msg.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Current Password
            </label>
            <Input
              type="password"
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              placeholder="••••••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              New Password
            </label>
            <Input
              type="password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              placeholder="Min. 8 characters"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Confirm New Password
            </label>
            <Input
              type="password"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              placeholder="Repeat new password"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={loading}
            className="flex items-center gap-2 mt-2"
          >
            <Key className="w-4 h-4" />
            {loading ? 'Updating Password...' : 'Save New Password'}
          </Button>
        </form>
      </Card>

      {/* Notification Preferences */}
      <Card className="p-6">
        <h2 className="text-base font-bold text-[#001D39] mb-1 flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#0A4174]" />
          Notification Channels
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Control which system events trigger in-app bell notifications.
        </p>

        <div className="space-y-3">
          {[
            { key: 'drives', label: 'Placement Drive Announcements', desc: 'Alerts for new campus recruitment drives and eligibility.' },
            { key: 'interviews', label: 'Interview & Round Schedules', desc: 'Notices regarding scheduled tests, technical rounds, and links.' },
            { key: 'academics', label: 'Academic & Grade Records', desc: 'Updates to semester SGPA, grade sheets, or backlog warnings.' },
            { key: 'system', label: 'Security & System Alerts', desc: 'Important administrative notifications and security advisories.' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-[#F4F7FB] border border-[#BDD8E9]/50">
              <div>
                <p className="text-xs font-semibold text-[#001D39]">{item.label}</p>
                <p className="text-[11px] text-slate-500">{item.desc}</p>
              </div>
              <input
                type="checkbox"
                checked={notificationPrefs[item.key]}
                onChange={(e) => setNotificationPrefs({ ...notificationPrefs, [item.key]: e.target.checked })}
                className="w-4 h-4 rounded text-[#0A4174] focus:ring-[#0A4174] border-slate-300"
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
