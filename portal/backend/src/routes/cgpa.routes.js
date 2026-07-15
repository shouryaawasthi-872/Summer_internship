const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/cgpa.controller');

router.use(protect);

// GET  /api/cgpa           — student: own records; mentor: assigned students; admin/superadmin: read-only
router.get('/',
  ctrl.getCgpaRecords,
);

// GET  /api/cgpa/students  — students list with current CGPA (mentor only)
router.get('/students',
  authorize('mentor'),
  ctrl.getStudentsWithCgpa,
);

/**
 * POST /api/cgpa  — upsert a semester CGPA entry
 *
 * STRICT RULE: Only Mentor can add / update CGPA.
 * Admin and Super Admin have READ access only.
 * This ensures academic integrity — only the assigned mentor records results.
 */
router.post('/',
  authorize('mentor'),
  ctrl.upsertCgpa,
);

/**
 * DELETE /api/cgpa/:id — mentor only (to correct their own erroneous entries).
 * Admin / Super Admin must request the mentor to make corrections.
 */
router.delete('/:id',
  authorize('mentor'),
  ctrl.deleteCgpaRecord,
);

module.exports = router;
