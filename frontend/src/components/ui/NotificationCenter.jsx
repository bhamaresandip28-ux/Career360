import { useState, useEffect, useRef } from 'react';
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
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import notificationService from '../../services/notification.service';
import { useAuth } from '../../hooks/useAuth';

function getNotificationIcon(type) {
  switch (type) {
    case 'DRIVE_ANNOUNCEMENT':
      return <Briefcase className="w-4 h-4 text-indigo-500" />;
    case 'INTERVIEW_ROUND':
      return <Calendar className="w-4 h-4 text-amber-500" />;
    case 'OFFER_ISSUED':
      return <Award className="w-4 h-4 text-purple-500" />;
    case 'ACADEMIC_ALERT':
      return <AlertTriangle className="w-4 h-4 text-rose-500" />;
    case 'SUCCESS':
      return <Check className="w-4 h-4 text-emerald-500" />;
    default:
      return <Info className="w-4 h-4 text-blue-500" />;
  }
}

function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSec = Math.floor((now - date) / 1000);

  if (diffInSec < 60) return 'Just now';
  const diffInMin = Math.floor(diffInSec / 60);
  if (diffInMin < 60) return `${diffInMin}m ago`;
  const diffInHours = Math.floor(diffInMin / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

export default function NotificationCenter() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch count on mount and polling
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch notifications whenever opened
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // Ignore polling errors
    }
  };

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications({ page: 1, limit: 6 });
      setNotifications(res.data?.notifications || []);
      setUnreadCount(res.data?.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (e, id, targetUrl) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      if (targetUrl) {
        setIsOpen(false);
        navigate(targetUrl);
      }
    } catch (err) {
      console.error('Failed to mark notification as read', err);
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

  // Determine full notifications page URL based on role
  const notificationsUrl = currentUser?.role === 'STUDENT'
    ? '/student/notifications'
    : currentUser?.role === 'PLACEMENT_COORDINATOR'
    ? '/coordinator/notifications'
    : currentUser?.role === 'FACULTY'
    ? '/faculty/notifications'
    : '/admin/notifications';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        title="Notifications"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-600 text-[10px] font-bold text-white items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 z-50 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl shadow-indigo-950/10 overflow-hidden transform transition-all animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium transition"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-2 text-slate-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  All caught up!
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  No unread alerts at the moment.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={(e) => handleMarkAsRead(e, n.id, n.targetUrl)}
                  className={`p-3.5 transition-colors cursor-pointer flex gap-3 items-start ${
                    !n.isRead
                      ? 'bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="mt-0.5 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 shadow-xs flex-shrink-0">
                    {getNotificationIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className={`text-xs font-semibold truncate ${
                        !n.isRead ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800/80 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate(notificationsUrl);
              }}
              className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center gap-1.5 transition"
            >
              <span>View all notifications</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
