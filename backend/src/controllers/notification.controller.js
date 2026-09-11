/**
 * Career360 — Notification Controller (Phase 7)
 */

const notificationService = require('../services/notification.service');
const { sendSuccess }     = require('../utils/apiResponse');

const getNotifications = async (req, res, next) => {
  try {
    const { type, unreadOnly, limit, offset } = req.query;
    const result = await notificationService.getNotifications(req.user.id, {
      type,
      unreadOnly,
      limit,
      offset,
    });
    sendSuccess(res, result, 'Notifications fetched successfully.');
  } catch (e) { next(e); }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const unreadCount = await notificationService.getUnreadCount(req.user.id);
    sendSuccess(res, { unreadCount }, 'Unread count fetched.');
  } catch (e) { next(e); }
};

const markAsRead = async (req, res, next) => {
  try {
    const updated = await notificationService.markAsRead(req.user.id, req.params.id);
    sendSuccess(res, updated, 'Notification marked as read.');
  } catch (e) { next(e); }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    sendSuccess(res, null, 'All notifications marked as read.');
  } catch (e) { next(e); }
};

const deleteNotification = async (req, res, next) => {
  try {
    await notificationService.deleteNotification(req.user.id, req.params.id);
    sendSuccess(res, null, 'Notification dismissed.');
  } catch (e) { next(e); }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
