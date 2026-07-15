import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  HiOutlineAcademicCap, HiOutlineUser, HiOutlineMail,
  HiOutlineLockClosed, HiOutlineIdentification, HiOutlineChevronLeft,
} from 'react-icons/hi';
import { getErrorMsg } from '../../utils/helpers';

const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'BCA', 'MCA', 'MBA', 'Other'];
const SEMESTERS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

export default function Register() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'student',
    rollNumber: '', branch: '', semester: '',
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.register(form);
      await login(form.email, form.password);
      toast.success('Account created! Welcome to KRMU Portal.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left brand panel ─────────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[40%] flex-col justify-between p-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #003087 0%, #001f5c 65%, #000c30 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-[0.08]"
          style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }} />
        <div className="absolute top-1/3 right-0 w-64 h-64 rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #C8102E 0%, transparent 70%)' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.20)' }}>
            <HiOutlineAcademicCap className="text-white text-2xl" />
          </div>
          <div>
            <p className="text-white font-bold text-base leading-none">K.R. Mangalam</p>
            <p className="text-white/50 text-xs mt-0.5">University</p>
          </div>
        </div>

        {/* Copy */}
        <div className="relative z-10 space-y-5">
          <div className="w-12 h-1 rounded-full" style={{ background: '#C8102E' }} />
          <h2 className="text-3xl font-extrabold text-white leading-tight">
            Start your<br />internship<br />journey
          </h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-xs">
            Register to access internship opportunities, get mentored,
            and build real-world skills through KRMU's industry network.
          </p>

          {/* Steps */}
          <ol className="space-y-3 pt-2">
            {[
              'Create your student account',
              'Browse & apply for internships',
              'Get mentor guidance & approval',
              'Receive your internship certificate',
            ].map((step, i) => (
              <li key={i} className="flex items-center gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
                  style={{ background: i === 0 ? '#C8102E' : 'rgba(255,255,255,0.12)' }}
                >
                  {i + 1}
                </span>
                <span className="text-white/70 text-sm">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <p className="relative z-10 text-white/30 text-xs">
          © {new Date().getFullYear()} K.R. Mangalam University. All rights reserved.
        </p>
      </div>

      {/* ── Right form panel ─────────────────────────────────────────── */}
      <div className="flex-1 flex items-start justify-center p-6 py-10 bg-[#f4f6fb] overflow-y-auto">
        <div className="w-full max-w-md animate-fade-in-up">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#003087' }}>
              <HiOutlineAcademicCap className="text-white text-xl" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">K.R. Mangalam University</p>
              <p className="text-gray-400 text-xs">Internship Portal</p>
            </div>
          </div>

          {/* Back link */}
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium mb-5 transition-colors"
            style={{ color: '#003087' }}
          >
            <HiOutlineChevronLeft className="text-base" />
            Back to sign in
          </Link>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold" style={{ color: '#003087' }}>Create account</h1>
            <p className="text-gray-500 text-sm mt-1">Join the KRMU Internship Portal</p>
          </div>

          {/* Form card */}
          <div className="card p-7">
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Full name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none" />
                  <input className="input-field pl-9" placeholder="Your full name"
                    value={form.name} onChange={e => set('name', e.target.value)} required />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none" />
                  <input className="input-field pl-9" type="email" placeholder="your@krmuedu.in"
                    value={form.email} onChange={e => set('email', e.target.value)} required autoComplete="email" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none" />
                  <input className="input-field pl-9" type="password" placeholder="Min. 6 characters"
                    value={form.password} onChange={e => set('password', e.target.value)} required autoComplete="new-password" />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role</label>
                <select className="input-field" value={form.role} onChange={e => set('role', e.target.value)}>
                  <option value="student">Student</option>
                  <option value="mentor">Mentor / Faculty</option>
                </select>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#C8102E' }} />
                  Admin accounts are provisioned by Super Admin only
                </p>
              </div>

              {/* Student-only fields */}
              {form.role === 'student' && (
                <div className="space-y-3 pt-1">
                  {/* Section label */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Student Details</span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>

                  {/* Roll + Branch */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Roll Number</label>
                      <div className="relative">
                        <HiOutlineIdentification className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none" />
                        <input className="input-field pl-8 text-xs" placeholder="22BTCS001"
                          value={form.rollNumber} onChange={e => set('rollNumber', e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Branch</label>
                      <select className="input-field text-xs" value={form.branch} onChange={e => set('branch', e.target.value)}>
                        <option value="">Select branch</option>
                        {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Semester */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Semester</label>
                    <select className="input-field text-xs" value={form.semester} onChange={e => set('semester', e.target.value)}>
                      <option value="">Select semester</option>
                      {SEMESTERS.map(s => <option key={s} value={s}>{s} Semester</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-kr-red w-full py-3 text-base mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Creating account…
                  </span>
                ) : 'Create Account'}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-400 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: '#003087' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
