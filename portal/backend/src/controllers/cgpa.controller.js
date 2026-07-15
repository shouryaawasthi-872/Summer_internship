const CgpaRecord = require('../models/CgpaRecord');
const User       = require('../models/User');
const { createNotification } = require('../utils/helpers');

// ─────────────────────────────────────────────────────────────────────────────
/** GET /api/cgpa
 *  - Mentor: gets CGPA history for all their assigned students
 *  - Student: gets only their own history
 *  - Admin/SuperAdmin: can get all records (for oversight / export)
 *  Query param: ?studentId=<id>  (mentor/admin can filter by student)
 */
// ─────────────────────────────────────────────────────────────────────────────
exports.getCgpaRecords = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'student') {
      query.student = req.user._id;

    } else if (req.user.role === 'mentor') {
      // Restrict to assigned students only
      const mentor = await User.findById(req.user._id).select('assignedStudents').lean();
      const allowed = mentor.assignedStudents.map(String);
      if (req.query.studentId) {
        if (!allowed.includes(String(req.query.studentId)))
          return res.status(403).json({ success: false, message: 'This student is not assigned to you' });
        query.student = req.query.studentId;
      } else {
        query.student = { $in: mentor.assignedStudents };
      }

    } else {
      // Admin / superadmin — optional studentId filter
      if (req.query.studentId) query.student = req.query.studentId;
    }

    const records = await CgpaRecord.find(query)
      .populate('student', 'name email rollNumber branch currentCGPA')
      .populate('mentor',  'name email')
      .sort({ student: 1, semester: 1 })
      .lean();

    res.json({ success: true, count: records.length, records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
/** POST/PUT /api/cgpa  (upsert — create or update a semester entry)
 *  Body: { studentId, semester, cgpa, remarks }
 *  Only mentor (for their own students) or admin/superadmin can call this.
 */
// ─────────────────────────────────────────────────────────────────────────────
exports.upsertCgpa = async (req, res) => {
  try {
    const { studentId, semester, cgpa, remarks } = req.body;

    if (!studentId || !semester || cgpa === undefined)
      return res.status(400).json({ success: false, message: 'studentId, semester and cgpa are required' });

    if (cgpa < 0 || cgpa > 10)
      return res.status(400).json({ success: false, message: 'CGPA must be between 0 and 10' });

    // Mentors can only update their own assigned students
    if (req.user.role === 'mentor') {
      const mentor = await User.findById(req.user._id).select('assignedStudents').lean();
      const isAssigned = mentor.assignedStudents.map(String).includes(String(studentId));
      if (!isAssigned)
        return res.status(403).json({ success: false, message: 'This student is not assigned to you' });
    }

    // ── Upsert the semester record ───────────────────────────────────────────
    const record = await CgpaRecord.findOneAndUpdate(
      { student: studentId, semester: Number(semester) },
      {
        mentor:   req.user._id,
        cgpa:     Number(cgpa),
        remarks:  remarks || '',
        isLatest: false,   // will be recalculated below
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    // ── Recalculate which record is "latest" ─────────────────────────────────
    // Find the record with the highest semester number for this student
    const allRecords = await CgpaRecord.find({ student: studentId }).sort({ semester: -1 }).lean();

    if (allRecords.length > 0) {
      const latestSemester = allRecords[0].semester;

      // Mark only the highest-semester record as isLatest
      await CgpaRecord.updateMany({ student: studentId }, { isLatest: false });
      await CgpaRecord.updateOne({ student: studentId, semester: latestSemester }, { isLatest: true });

      // ── Update student.currentCGPA to the latest semester's CGPA ────────────
      const latestCGPA = allRecords[0].cgpa;
      await User.findByIdAndUpdate(studentId, { currentCGPA: latestCGPA });
    }

    // ── Notify the student ───────────────────────────────────────────────────
    await createNotification(
      studentId,
      'CGPA Updated',
      `Your Semester ${semester} CGPA has been recorded as ${cgpa}. ${remarks ? 'Note: ' + remarks : ''}`,
      'system',
    );

    // Return updated record with populated fields
    const populated = await CgpaRecord.findById(record._id)
      .populate('student', 'name email rollNumber branch currentCGPA')
      .populate('mentor',  'name email');

    res.json({ success: true, record: populated });
  } catch (err) {
    // Handle duplicate key gracefully (shouldn't happen with findOneAndUpdate but just in case)
    if (err.code === 11000)
      return res.status(409).json({ success: false, message: 'CGPA record for this semester already exists' });
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
/** DELETE /api/cgpa/:id — mentor only (must be assigned to that student) */
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteCgpaRecord = async (req, res) => {
  try {
    const record = await CgpaRecord.findById(req.params.id);
    if (!record)
      return res.status(404).json({ success: false, message: 'CGPA record not found' });

    // Mentors can only delete records for their own assigned students
    if (req.user.role === 'mentor') {
      const mentor = await User.findById(req.user._id).select('assignedStudents').lean();
      const isAssigned = mentor.assignedStudents.map(String).includes(String(record.student));
      if (!isAssigned)
        return res.status(403).json({ success: false, message: 'This student is not assigned to you' });
    }

    const studentId = record.student;
    await record.deleteOne();

    // Recalculate currentCGPA after deletion
    const remaining = await CgpaRecord.find({ student: studentId }).sort({ semester: -1 }).lean();
    if (remaining.length > 0) {
      await CgpaRecord.updateMany({ student: studentId }, { isLatest: false });
      await CgpaRecord.updateOne({ student: studentId, semester: remaining[0].semester }, { isLatest: true });
      await User.findByIdAndUpdate(studentId, { currentCGPA: remaining[0].cgpa });
    } else {
      // No records left — clear currentCGPA
      await User.findByIdAndUpdate(studentId, { currentCGPA: null });
    }

    res.json({ success: true, message: 'CGPA record deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
/** GET /api/cgpa/students — mentor gets list of their assigned students with CGPA summary */
// ─────────────────────────────────────────────────────────────────────────────
exports.getStudentsWithCgpa = async (req, res) => {
  try {
    let students;

    if (req.user.role === 'mentor') {
      const mentor = await User.findById(req.user._id).select('assignedStudents').lean();
      students = await User.find({ _id: { $in: mentor.assignedStudents } })
        .select('name email rollNumber branch semester currentCGPA')
        .lean();
    } else {
      // Admin/superadmin see all students
      students = await User.find({ role: 'student' })
        .select('name email rollNumber branch semester currentCGPA')
        .lean();
    }

    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
