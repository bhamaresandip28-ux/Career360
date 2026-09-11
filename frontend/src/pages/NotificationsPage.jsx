import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  Briefcase,
  AlertTriangle,
  Award,
  Info,
  Calendar,
  Trash2,
  Filter,
  ExternalLink,
} from 'lucide-react';
import notificationService from '../services/notification.service';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const FILTER_TABS = [
  { id: 'ALL', label: 'All Alerts' },
  { id: 'UNREAD', label: 'Unread Only' },
  { id: 'DRIVE_ANNOUNCEMENT', label: 'Drives' },
  { id: 'INTERVIEW_ROUND', label: 'Interviews' },
  { id: 'OFFER_ISSUED', label: 'Offers' },
  { id: 'ACADEMIC_ALERT', label: 'Academics' },
];

function getNotificationIcon(type) {
  switch (type) {
    case 'DRIVE_ANNOUNCEMENT':
      return <Briefcase className="w-5 h-5 text-indigo-400" />;
    case 'INTERVIEW_ROUND':
      return <Calendar className="w-5 h-5 text-amber-400" />;
    case 'OFFER_ISSUED':
      return <Award className="w-5 h-5 text-purple-400" />;
    case 'ACADEMIC_ALERT':
      return <AlertTriangle className="w-5 h-5 text-rose-400" />;
    case 'SUCCESS':
      return <Check className="w-5 h-5 text-emerald-400" />;
    default:
      return <Info className="w-5 h-5 text-blue-400" />;
  }
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (activeTab === 'UNREAD') {
        params.unreadOnly = 'true';
      }
      const res = await notificationService.getNotifications(params);
      let list = res.data?.notifications || [];
      if (['DRIVE_ANNOUNCEMENT', 'INTERVIEW_ROUND', 'OFFER_ISSUED', 'ACADEMIC_ALERT'].includes(activeTab)) {
        list = list.filter((n) => n.type === activeTab);
      }
      setNotifications(list);
      setTotalPages(res.data?.totalPages || 1);
      setUnreadCount(res.data?.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [activeTab, page]);

  const handleMarkAsRead = async (id, targetUrl) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      if (targetUrl) {
        navigate(targetUrl);
      }
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-surface-900 to-surface-850 p-6 rounded-2xl border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Bell className="w-6 h-6 text-primary-400" />
              Notifications & Alerts
            </h1>
            {unreadCount > 0 && (
              <Badge variant="primary" size="md">
                {unreadCount} Unread
              </Badge>
            )}
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Stay updated with campus recruitment announcements, interview schedules, and scholastic alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 self-start md:self-auto"
          >
            <CheckCheck className="w-4 h-4" />
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setPage(1);
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white shadow-glow'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-16 text-slate-400">Loading alerts...</div>
        ) : notifications.length === 0 ? (
          <Card className="text-center py-16">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white">No notifications found</h3>
            <p className="text-slate-400 text-xs mt-1">
              You're all caught up with your notifications!
            </p>
          </Card>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleMarkAsRead(n.id, n.targetUrl)}
              className={`group flex items-start justify-between gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                !n.isRead
                  ? 'bg-surface-850/90 border-primary-500/30 hover:border-primary-500/60 shadow-md'
                  : 'bg-surface-900/60 border-white/5 hover:border-white/15'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className="p-2.5 rounded-xl bg-surface-800 border border-white/10 flex-shrink-0">
                  {getNotificationIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h4 className={`text-sm font-semibold truncate ${
                      !n.isRead ? 'text-white font-bold' : 'text-slate-200'
                    }`}>
                      {n.title}
                    </h4>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary-400" />
                    )}
                    <span className="text-[11px] text-slate-400">
                      • {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                    {n.message}
                  </p>

                  {n.targetUrl && (
                    <span className="inline-flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 mt-2 font-medium">
                      <span>View details</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                {!n.isRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(n.id);
                    }}
                    title="Mark as read"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={(e) => handleDelete(e, n.id)}
                  title="Dismiss notification"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 pt-4">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-xs text-slate-400 font-medium">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
