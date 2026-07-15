const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/auth.controller');

/**
 * Auth routes
 *
 * NOTE: /register is protected — only authenticated admins/superadmins can
 * call it.  There is NO public self-registration endpoint.
 * Students, mentors, and admins receive their credentials from Super Admin.
 */
router.post('/register', protect, ctrl.register);
router.post('/login',    ctrl.login);
router.get('/me',        protect, ctrl.getMe);
router.put('/password',  protect, ctrl.changePassword);

module.exports = router;
