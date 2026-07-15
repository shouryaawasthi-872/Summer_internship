const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/notification.controller');

router.use(protect);

router.get('/',             ctrl.getNotifications);
router.put('/read-all',     ctrl.markAllRead);
router.put('/:id/read',     ctrl.markRead);

module.exports = router;
