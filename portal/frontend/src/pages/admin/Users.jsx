import { useEffect, useState } from 'react';
import { usersAPI, authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import { SkeletonTable } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { getErrorMsg, fmtDate, getInitials, avatarColor } from '../../utils/helpers';
import { ROLE_COLORS } from '../../utils/constants';
import { HiOutlineUsers, HiOutlinePlus, HiOutlineTrash, HiOutlineInformationCircle } from 'react-icons/hi';

const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'BCA', 'MCA', 'MBA', 'Other'];
const SEMESTERS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

export default function UsersPage() {
  const { user: me } = useAuth();
  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState('');
  const [modalOpen,   setModalOpen]   = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'student',
    phone: '', rollNumber: '', branch: '', semester: '', department: '',
  });

  const load = () => {
    setLoading(true);
    usersAPI.getAll(filter ? { role: filter } : {})
      .then(r => setUsers(r.data.users))
      .finally(() => setLoading(false));
  };
  useEffect(load, [filter]);

  // Admin can create student/mentor; superadmin can create any role
  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await authAPI.register(form);
      toast.success(`${form.role.charAt(0).toUpperCase() + form.role.slice(1)} account created!`);
      setModalOpen(false);
      setForm({ name: '', email: '', password: '', role: 'student', phone: '', rollNumber: '', branch: '', semester: '', department: '' });
      load();
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    try { await usersAPI.toggleActive(id); toast.success('Account status updated'); load(); }
    catch (err) { toast.error(getErrorMsg(err)); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this user? This cannot be undone.')) return;
    try { await usersAPI.remove(id); toast.success('User deleted'); load(); }
    catch (err) { toast.error(getErrorMsg(err)); }
  };

  // Both admin and superadmin can create accounts (admin restricted in backend)
  const canCreate = ['admin', 'superadmin'].includes(me?.role);

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {me?.role === 'superadmin'
              ? 'Super Admin: Create and manage all user accounts'
              : 'Admin: Create and manage Student & Mentor accounts'}
          </p>
        </div>
        <div className="flex gap-3">
          <select
            className="input-field w-auto text-sm"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="mentor">Mentors</option>
            <option value="admin">Admins</option>
            {me?.role === 'superadmin' && <option value="superadmin">Super Admins</option>}
          </select>
          {canCreate && (
            <button
              onClick={() => setModalOpen(true)}
              className="btn-kr-red flex items-center gap-2"
            >
              <HiOutlinePlus /> Create User
            </button>
          )}
        </div>
      </div>

      {/* ── Info banner — no self-registration ── */}
      <div
        className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm"
        style={{ background: 'rgba(0,48,135,0.05)', border: '1px solid rgba(0,48,135,0.12)' }}
      >
        <HiOutlineInformationCircle className="text-lg flex-shrink-0 mt-0.5" style={{ color: '#003087' }} />
        <p style={{ color: '#003087' }}>
          <strong>No self-registration is allowed.</strong>{' '}
          All accounts are created by Admin or Super Admin.
          Students, Mentors, and Admins must use the credentials provided to them.
        </p>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <SkeletonTable rows={6} cols={6} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={HiOutlineUsers}
          title="No users found"
          description="Create user accounts using the 'Create User' button above."
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'rgba(0,48,135,0.04)', borderBottom: '2px solid rgba(0,48,135,0.10)' }}>
                <th className="text-left p-4 font-semibold text-gray-600">User</th>
                <th className="text-left p-4 font-semibold text-gray-600">Role</th>
                <th className="text-left p-4 font-semibold text-gray-600 hidden md:table-cell">Details</th>
                <th className="text-left p-4 font-semibold text-gray-600 hidden lg:table-cell">CGPA</th>
                <th className="text-left p-4 font-semibold text-gray-600 hidden lg:table-cell">Joined</th>
                <th className="text-left p-4 font-semibold text-gray-600">Status</th>
                <th className="text-left p-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center
                                    text-white text-xs font-bold flex-shrink-0 ${avatarColor(u.name)}`}
                      >
                        {getInitials(u.name)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_COLORS[u.role]}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 text-xs hidden md:table-cell">
                    {u.rollNumber && <span>{u.rollNumber} · </span>}
                    {u.branch     && <span>{u.branch}</span>}
                    {u.semester   && <span> · {u.semester}</span>}
                    {u.department && <span>{u.department}</span>}
                    {u.assignedMentor && (
                      <span className="block text-gray-400 mt-0.5">
                        Mentor: {u.assignedMentor.name}
                      </span>
                    )}
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    {u.role === 'student' && (
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={
                          u.currentCGPA != null
                            ? { background: 'rgba(0,48,135,0.08)', color: '#003087' }
                            : { background: '#f3f4f6', color: '#9ca3af' }
                        }
                      >
                        {u.currentCGPA != null ? Number(u.currentCGPA).toFixed(2) : '—'}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-gray-400 text-xs hidden lg:table-cell">
                    {fmtDate(u.createdAt)}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggle(u._id)}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors
                        ${u.isActive
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                    >
                      {u.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="p-4">
                    {me?.role === 'superadmin' && u._id !== me._id && (
                      <button
                        onClick={() => handleDelete(u._id)}
                        className="text-red-400 hover:text-red-600 p-1 rounded transition-colors"
                        title="Delete user"
                      >
                        <HiOutlineTrash />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Create User Modal ── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New User Account"
        size="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">

          {/* Permissions note */}
          <div
            className="rounded-lg px-3 py-2.5 text-xs flex items-start gap-2"
            style={{ background: 'rgba(0,48,135,0.05)', border: '1px solid rgba(0,48,135,0.12)' }}
          >
            <HiOutlineInformationCircle className="flex-shrink-0 mt-0.5" style={{ color: '#003087' }} />
            <span style={{ color: '#003087' }}>
              {me?.role === 'superadmin'
                ? 'As Super Admin, you can create accounts for any role.'
                : 'As Admin, you can create Student and Mentor accounts only.'}
              {' '}The user will log in using the email and password you set here.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                className="input-field"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <input
                type="email"
                className="input-field"
                value={form.email}
                placeholder="user@krmuedu.in"
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input
                type="password"
                className="input-field"
                value={form.password}
                placeholder="Min. 6 characters"
                onChange={e => setForm({ ...form, password: e.target.value })}
                minLength={6}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
              <select
                className="input-field"
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
              >
                <option value="student">Student</option>
                <option value="mentor">Mentor / Faculty</option>
                {me?.role === 'superadmin' && (
                  <>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                className="input-field"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>

          {/* Student-specific fields */}
          {form.role === 'student' && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Student Details
                </span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Roll Number</label>
                  <input
                    className="input-field"
                    placeholder="22BTCS001"
                    value={form.rollNumber}
                    onChange={e => setForm({ ...form, rollNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Branch</label>
                  <select
                    className="input-field"
                    value={form.branch}
                    onChange={e => setForm({ ...form, branch: e.target.value })}
                  >
                    <option value="">Select</option>
                    {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Semester</label>
                  <select
                    className="input-field"
                    value={form.semester}
                    onChange={e => setForm({ ...form, semester: e.target.value })}
                  >
                    <option value="">Select</option>
                    {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Mentor-specific fields */}
          {form.role === 'mentor' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                className="input-field"
                placeholder="e.g. Computer Science & Engineering"
                value={form.department}
                onChange={e => setForm({ ...form, department: e.target.value })}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
