const User = require('../models/User');
const { createNotification } = require('../utils/helpers');

/** GET /api/users — admin/superadmin gets all; mentor gets their students */
exports.getUsers = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'mentor') {
      const mentor = await User.findById(req.user._id);
      return res.json({ success: true, users: await User.find({ _id: { $in: mentor.assignedStudents } }).select('-password').lean() });
    }
    if (req.query.role) query.role = req.query.role;
    const users = await User.find(query).select('-password').populate('assignedMentor', 'name email').lean();
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/users/:id */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('assignedMentor', 'name email department').populate('assignedStudents', 'name email rollNumber branch');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** PUT /api/users/:id — update profile */
exports.updateUser = async (req, res) => {
  try {
    const { name, phone, branch, semester, department, rollNumber, university } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { name, phone, branch, semester, department, rollNumber, university }, { new: true, runValidators: true }).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** DELETE /api/users/:id — superadmin only */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await user.deleteOne();
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** POST /api/users/assign-mentor — admin assigns mentor to student */
exports.assignMentor = async (req, res) => {
  try {
    const { studentId, mentorId } = req.body;
    const student = await User.findById(studentId);
    const mentor  = await User.findById(mentorId);
    if (!student || !mentor) return res.status(404).json({ success: false, message: 'Student or Mentor not found' });

    student.assignedMentor = mentorId;
    await student.save();

    if (!mentor.assignedStudents.includes(studentId)) {
      mentor.assignedStudents.push(studentId);
      await mentor.save();
    }

    await createNotification(studentId, 'Mentor Assigned', `${mentor.name} has been assigned as your mentor.`, 'system');
    await createNotification(mentorId, 'New Student', `${student.name} has been assigned to you.`, 'system');

    res.json({ success: true, message: 'Mentor assigned successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** PUT /api/users/:id/toggle-active */
exports.toggleActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/users/stats — dashboard stats for admin/superadmin */
exports.getStats = async (req, res) => {
  try {
    const [students, mentors, admins] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'mentor' }),
      User.countDocuments({ role: 'admin' }),
    ]);
    res.json({ success: true, stats: { students, mentors, admins } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
