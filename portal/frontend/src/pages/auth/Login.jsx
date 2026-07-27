import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { HiEye, HiEyeOff, HiOutlineMail, HiOutlineLockClosed, HiOutlineInformationCircle } from 'react-icons/hi';
import { getErrorMsg } from '../../utils/helpers';
import KRMUBrandHeader from '../../components/common/KRMULogo';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — KRMU branding ───────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[46%] xl:w-[42%] flex-col justify-between relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #002070 0%, #001540 55%, #000a28 100%)' }}
      >
        {/* Decorative red glow — bottom right */}
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #C8102E 0%, transparent 65%)' }} />
        {/* Faint white glow — top left */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full opacity-[0.06] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }} />

        {/* ── KRMU Logo block (official crest + banner) ── */}
        <div className="relative z-10 m-10 mb-0 flex items-center justify-center p-4 bg-white/10 rounded-2xl border border-white/15 backdrop-blur-xs">
          <KRMUBrandHeader crestSize={56} bannerSize="medium" />
        </div>

        {/* Main copy */}
        <div className="relative z-10 px-10 pb-4 space-y-5 flex-1 flex flex-col justify-center">
          <div className="w-10 h-1 rounded-full" style={{ background: '#C8102E' }} />
          <h2 className="text-3xl font-extrabold text-white leading-snug">
            Internship<br />Management<br />Portal
          </h2>
          <p className="text-white/55 text-sm leading-relaxed max-w-xs">
            Apply for internships, track approvals, upload documents,
            and connect with your mentor — all in one place.
          </p>
          <div className="flex flex-wrap gap-2">
            {['Multi-level approvals', 'CGPA-based eligibility', 'Document tracking', 'Live notifications'].map(f => (
              <span key={f}
                className="text-xs px-3 py-1.5 rounded-full text-white/75 font-medium"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 px-10 pb-8 text-white/25 text-xs">
          © {new Date().getFullYear()} K.R. Mangalam University. All rights reserved.
        </p>
      </div>

      {/* ── Right panel — form ───────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#f4f6fb]">
        <div className="w-full max-w-md animate-fade-in-up">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
            <KRMUBrandHeader crestSize={40} bannerSize="small" />
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-2xl font-extrabold" style={{ color: '#003087' }}>Welcome back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to your KRMU account</p>
          </div>

          {/* Card */}
          <div className="card p-7 space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none" />
                  <input
                    className="input-field pl-9"
                    type="email"
                    placeholder="your@krmuedu.in"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none" />
                  <input
                    className="input-field pl-9 pr-10"
                    type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPwd(!showPwd)}
                  >
                    {showPwd ? <HiEyeOff className="text-lg" /> : <HiEye className="text-lg" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-base mt-1"
                style={{ background: loading ? '#6b7280' : undefined }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Signing in…
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            {/* No self-registration notice */}
            <div
              className="flex items-start gap-2.5 rounded-xl px-3 py-3"
              style={{ background: 'rgba(0,48,135,0.05)', border: '1px solid rgba(0,48,135,0.12)' }}
            >
              <HiOutlineInformationCircle
                className="text-lg flex-shrink-0 mt-0.5"
                style={{ color: '#003087' }}
              />
              <p className="text-xs leading-relaxed" style={{ color: '#003087' }}>
                <strong>No self-registration.</strong> Your login credentials are provided by the
                Super Admin. Contact your university administrator if you don't have an account.
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-5">
            © {new Date().getFullYear()} K.R. Mangalam University
          </p>
        </div>
      </div>
    </div>
  );
}
