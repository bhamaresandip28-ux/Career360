import api from './api';

export const notificationService = {
  /**
   * Fetch paginated notifications with optional unread filter
   */
  async getNotifications(params = {}) {
    const res = await api.get('/notifications', { params });
    return res.data;
  },

  /**
   * Fetch unread notifications count
   */
  async getUnreadCount() {
    const res = await api.get('/notifications/unread-count');
    return res.data?.data?.unreadCount ?? 0;
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(notificationId) {
    const res = await api.patch(`/notifications/${notificationId}/read`);
    return res.data;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  },

  /**
   * Dismiss / delete a notification
   */
  async deleteNotification(notificationId) {
    const res = await api.delete(`/notifications/${notificationId}`);
    return res.data;
  },
};

export default notificationService;
