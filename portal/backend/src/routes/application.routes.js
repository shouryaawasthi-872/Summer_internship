const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/application.controller');

router.use(protect);

router.post('/',                        authorize('student'), ctrl.applyInternship);
router.get('/',                         ctrl.getApplications);
router.get('/:id',                      ctrl.getApplication);
router.put('/:id/review',               authorize('mentor','admin','superadmin'), ctrl.reviewApplication);
router.put('/:id/certificate',          authorize('student'), ctrl.submitCertificate);

module.exports = router;
