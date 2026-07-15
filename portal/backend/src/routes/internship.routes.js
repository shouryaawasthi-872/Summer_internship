const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/internship.controller');

router.use(protect);

router.get('/',              ctrl.getInternships);
router.get('/:id',           ctrl.getInternship);
router.post('/',             authorize('admin','superadmin','mentor'), ctrl.createInternship);
router.put('/:id',           authorize('admin','superadmin'), ctrl.updateInternship);
router.delete('/:id',        authorize('admin','superadmin'), ctrl.deleteInternship);
router.put('/:id/approve',   authorize('admin','superadmin'), ctrl.approveInternship);

module.exports = router;
