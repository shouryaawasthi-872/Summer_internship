import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usersAPI, authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { getErrorMsg, getInitials, avatarColor } from '../../utils/helpers';
import { ROLE_COLORS, KR_COLORS } from '../../utils/constants';
import { HiOutlineAcademicCap, HiOutlineChartPie } from 'react-icons/hi';

/**
 * Colour band for a CGPA value — consistent with CgpaManagement page.
 */
const cgpaBand = (v) => {
  if (v >= 9)   return { bg: 'rgba(5,150,105,0.10)',  text: '#059669', label: 'Excellent' };
  if (v >= 7.5) return { bg: 'rgba(0,48,135,0.09)',   text: '#003087', label: 'Good' };
  if (v >= 6)   return { bg: 'rgba(217,119,6,0.10)',  text: '#d97706', label: 'Average' };
  return          { bg: 'rgba(200,16,46,0.09)',  text: '#C8102E', label: 'Below Average' };
};

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name:       user?.name       || '',
    phone:      user?.phone      || '',
    branch:     user?.branch     || '',
    semester:   user?.semester   || '',
    department: user?.department || '',
    rollNumber: user?.rollNumber || '',
  });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '' });
  const [saving,   setSaving]   = useState(false);
  const [changing, setChanging] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await usersAPI.update(user._id, form);
      updateUser(r.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setChanging(true);
    try {
      await authAPI.changePassword(pwdForm);
      toast.success('Password changed!');
      setPwdForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setChanging(false);
    }
  };

  // Derived CGPA info for students
  const cgpa   = user?.currentCGPA;
  const band   = cgpa != null ? cgpaBand(cgpa) : null;

  return (
    <div className="max-w-2xl space-y-5">
      <h1 className="page-title">My Profile</h1>

      {/* ── Avatar / identity card ── */}
      <div className="card p-6 flex items-center gap-4">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center
                      text-xl font-bold text-white flex-shrink-0 ${avatarColor(user?.name)}`}
        >
          {getInitials(user?.name)}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-900">{user?.name}</h2>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full mt-1 inline-block ${ROLE_COLORS[user?.role]}`}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* ── CGPA card — students only ── */}
      {user?.role === 'student' && (
        <div
          className="card p-5 flex items-center gap-5"
          style={{ borderLeft: `4px solid ${band ? band.text : KR_COLORS.blue}` }}
        >
          {/* Big CGPA number */}
          <div
            className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center flex-shrink-0"
            style={{ background: band ? band.bg : 'rgba(0,48,135,0.07)' }}
          >
            <span
              className="text-2xl font-extrabold leading-none"
              style={{ color: band ? band.text : KR_COLORS.blue }}
            >
              {cgpa != null ? Number(cgpa).toFixed(2) : '—'}
            </span>
            <span className="text-[10px] font-semibold text-gray-400 mt-1">CGPA</span>
          </div>

          {/* Text info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <HiOutlineAcademicCap
                className="text-xl flex-shrink-0"
                style={{ color: band ? band.text : KR_COLORS.blue }}
              />
              <span className="font-bold text-gray-900">Current CGPA</span>
              {band && (
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: band.bg, color: band.text }}
                >
                  {band.label}
                </span>
              )}
            </div>

            {cgpa != null ? (
              <>
                {/* Progress bar */}
                <div className="kr-progress-track w-full mt-2">
                  <div
                    className="kr-progress-fill"
                    style={{ width: `${(cgpa / 10) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  Score: <strong>{Number(cgpa).toFixed(2)}</strong> / 10.00 · Updated by your mentor
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-400 mt-1">
                No CGPA recorded yet. Ask your mentor to enter your semester results.
              </p>
            )}

            <Link
              to="/cgpa"
              className="inline-flex items-center gap-1.5 text-xs font-semibold mt-2 hover:underline"
              style={{ color: KR_COLORS.blue }}
            >
              <HiOutlineChartPie />
              View semester-wise CGPA history →
            </Link>
          </div>
        </div>
      )}

      {/* ── Edit profile form ── */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Edit Information</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                className="input-field"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                className="input-field"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            {user?.role === 'student' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                  <input
                    className="input-field"
                    value={form.rollNumber}
                    onChange={e => setForm({ ...form, rollNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                  <input
                    className="input-field"
                    value={form.branch}
                    onChange={e => setForm({ ...form, branch: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                  <select
                    className="input-field"
                    value={form.semester}
                    onChange={e => setForm({ ...form, semester: e.target.value })}
                  >
                    <option value="">Select</option>
                    {['1st','2nd','3rd','4th','5th','6th','7th','8th'].map(s => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {user?.role === 'mentor' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  className="input-field"
                  value={form.department}
                  onChange={e => setForm({ ...form, department: e.target.value })}
                />
              </div>
            )}
          </div>

          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* ── Change password ── */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Change Password</h3>
        <form onSubmit={handlePassword} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              className="input-field"
              value={pwdForm.currentPassword}
              onChange={e => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              className="input-field"
              value={pwdForm.newPassword}
              onChange={e => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
              minLength={6}
              required
            />
          </div>
          <button type="submit" disabled={changing} className="btn-primary">
            {changing ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
