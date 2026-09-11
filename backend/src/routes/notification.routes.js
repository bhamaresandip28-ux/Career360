/**
 * Career360 — Notification Routes (Phase 7)
 */

const router       = require('express').Router();
const ctrl         = require('../controllers/notification.controller');
const authenticate = require('../middleware/authenticate');

router.use(authenticate);

router.get   ('/',             ctrl.getNotifications);
router.get   ('/unread-count', ctrl.getUnreadCount);
router.patch ('/read-all',     ctrl.markAllAsRead);
router.patch ('/:id/read',     ctrl.markAsRead);
router.delete('/:id',          ctrl.deleteNotification);

module.exports = router;
