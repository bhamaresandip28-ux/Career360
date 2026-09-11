/**
 * Career360 — Notification Service (Phase 7)
 * In-app notification persistence, unread counter, and notification dispatching
 */

const { prisma } = require('../config/database');
const AppError   = require('../utils/AppError');

async function getNotifications(userId, { type, unreadOnly = false, limit = 20, offset = 0 } = {}) {
  const where = { userId };
  if (type && type !== 'ALL') where.type = type;
  if (unreadOnly === true || unreadOnly === 'true') where.isRead = false;

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset),
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return {
    unreadCount,
    total,
    notifications,
  };
}

async function getUnreadCount(userId) {
  return await prisma.notification.count({ where: { userId, isRead: false } });
}

async function markAsRead(userId, notificationId) {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!notification) {
    throw new AppError('Notification not found.', 404, 'NOT_FOUND');
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true, readAt: new Date() },
  });

  return updated;
}

async function markAllAsRead(userId) {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });

  return { success: true };
}

async function deleteNotification(userId, notificationId) {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!notification) {
    throw new AppError('Notification not found.', 404, 'NOT_FOUND');
  }

  await prisma.notification.delete({ where: { id: notificationId } });
  return { success: true };
}

async function createNotification({ userId, title, message, type = 'INFO', linkUrl = null }) {
  return prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      linkUrl,
    },
  });
}

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
};
