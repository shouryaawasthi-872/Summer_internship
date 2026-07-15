const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/meeting.controller');

router.use(protect);

router.post('/',   authorize('mentor','admin','superadmin'), ctrl.createMeeting);
router.get('/',    ctrl.getMeetings);
router.put('/:id', authorize('mentor','admin','superadmin'), ctrl.updateMeeting);
router.delete('/:id', authorize('mentor','admin','superadmin'), ctrl.deleteMeeting);

module.exports = router;
