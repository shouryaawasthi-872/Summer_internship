const Meeting = require('../models/Meeting');
const { createNotification } = require('../utils/helpers');

/** POST /api/meetings */
exports.createMeeting = async (req, res) => {
  try {
    const { title, description, students, scheduledAt, duration, meetLink } = req.body;
    const meeting = await Meeting.create({ title, description, mentor: req.user._id, students, scheduledAt, duration, meetLink });

    for (const studentId of students) {
      await createNotification(studentId, 'Meeting Scheduled', `${req.user.name} scheduled "${title}" on ${new Date(scheduledAt).toLocaleString()}.`, 'meeting');
    }

    res.status(201).json({ success: true, meeting });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/meetings */
exports.getMeetings = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'mentor') query.mentor = req.user._id;
    if (req.user.role === 'student') query.students = req.user._id;
    const meetings = await Meeting.find(query)
      .populate('mentor', 'name email')
      .populate('students', 'name email')
      .sort('scheduledAt')
      .lean();
    res.json({ success: true, meetings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** PUT /api/meetings/:id */
exports.updateMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, meeting });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** DELETE /api/meetings/:id */
exports.deleteMeeting = async (req, res) => {
  try {
    await Meeting.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Meeting deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
