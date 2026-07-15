const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const ctrl = require('../controllers/document.controller');

router.use(protect);

router.post('/',             authorize('student'), upload.single('file'), ctrl.uploadDocument);
router.get('/',              ctrl.getDocuments);
router.put('/:id/review',    authorize('mentor','admin','superadmin'), ctrl.reviewDocument);
router.delete('/:id',        ctrl.deleteDocument);

module.exports = router;
