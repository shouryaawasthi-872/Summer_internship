const User = require('../models/User');
const { sendToken } = require('../utils/helpers');

/**
 * POST /api/auth/register
 *
 * STRICT RULE — No self-registration allowed.
 * Only Super Admin can create any account (student, mentor, admin, superadmin).
 * Admin can create student and mentor accounts only.
 * All other callers receive 403.
 */
exports.register = async (req, res) => {
  try {
    // Must be authenticated
    if (!req.user) {
      return res.status(403).json({
        success: false,
        message: 'Account creation is not allowed. Please contact the Super Admin for your login credentials.',
      });
    }

    const { name, email, password, role = 'student', phone, rollNumber, branch, semester, department } = req.body;

    // Super Admin can create any role
    // Admin can create student and mentor only (not admin or superadmin)
    const callerRole = req.user.role;
    if (callerRole === 'superadmin') {
      // allowed — no restriction
    } else if (callerRole === 'admin') {
      if (['admin', 'superadmin'].includes(role)) {
        return res.status(403).json({
          success: false,
          message: 'Admin can only create Student or Mentor accounts. Contact Super Admin to create Admin/SuperAdmin accounts.',
        });
      }
    } else {
      // Mentor / Student cannot create accounts
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to create user accounts.',
      });
    }

    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password, role, phone, rollNumber, branch, semester, department });

    // Return the created user data (not a login token — admin stays logged in as themselves)
    const userData = user.toObject();
    delete userData.password;
    res.status(201).json({ success: true, user: userData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** POST /api/auth/login */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (!user.isActive)
      return res.status(401).json({ success: false, message: 'Account is deactivated' });

    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/auth/me */
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate('assignedMentor', 'name email').populate('assignedStudents', 'name email');
  res.json({ success: true, user });
};

/** PUT /api/auth/password */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword)))
      return res.status(400).json({ success: false, message: 'Current password is wrong' });
    user.password = newPassword;
    await user.save();
    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
