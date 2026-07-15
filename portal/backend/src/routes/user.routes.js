const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/user.controller');

router.use(protect);

router.get('/stats',         authorize('admin','superadmin'), ctrl.getStats);
router.get('/',              authorize('admin','superadmin','mentor'), ctrl.getUsers);
router.post('/assign-mentor',authorize('admin','superadmin'), ctrl.assignMentor);
router.get('/:id',           ctrl.getUserById);
router.put('/:id',           ctrl.updateUser);
router.put('/:id/toggle',    authorize('admin','superadmin'), ctrl.toggleActive);
router.delete('/:id',        authorize('superadmin'), ctrl.deleteUser);

module.exports = router;
