const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/marks.controller');

router.use(protect);

router.post('/',                        authorize('mentor'), ctrl.saveMarks);
router.get('/',                         ctrl.getMarks);
router.put('/:id/verify-certificate',   authorize('mentor'), ctrl.verifyCertificate);

module.exports = router;
