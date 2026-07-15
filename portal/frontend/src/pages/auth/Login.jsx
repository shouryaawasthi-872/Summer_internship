import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { HiEye, HiEyeOff, HiOutlineMail, HiOutlineLockClosed, HiOutlineInformationCircle } from 'react-icons/hi';
import { getErrorMsg } from '../../utils/helpers';

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

        {/* ── KRMU Logo block (mirrors real banner: blue bg + red strip) ── */}
        <div className="relative z-10 m-10 mb-0">
          {/* Blue header */}
          <div
            className="rounded-t-2xl px-5 py-4 flex items-center gap-4"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderBottom: 'none' }}
          >
            {/* Improved KRMU Crest SVG — matches real circular badge */}
            <svg width="72" height="72" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{flexShrink:0}}>
              <defs>
                <path id="lp-top" d="M 16 60 A 44 44 0 0 1 104 60" />
                <path id="lp-bot" d="M 26 78 A 36 36 0 0 0 94 78" />
              </defs>
              <circle cx="60" cy="60" r="58" fill="#b0b8c8"/>
              <circle cx="60" cy="60" r="54" fill="#8a94a8"/>
              <circle cx="60" cy="60" r="51" fill="#1a3a8f"/>
              <circle cx="60" cy="60" r="51" fill="none" stroke="#c9a227" strokeWidth="1.8"/>
              <circle cx="60" cy="60" r="47" fill="none" stroke="#c9a227" strokeWidth="0.7"/>
              <path d="M60 22 L88 33 L88 58 C88 76 76 88 60 96 C44 88 32 76 32 58 L32 33 Z" fill="#1e4db7" stroke="#c9a227" strokeWidth="1.5"/>
              <path d="M60 27 L83 37 L83 58 C83 73 73 83 60 91 C47 83 37 73 37 58 L37 37 Z" fill="#2558d0"/>
              <path d="M44 76 Q60 71 76 76 L76 83 Q60 78 44 83 Z" fill="#ffffff" opacity="0.92"/>
              <line x1="60" y1="71.5" x2="60" y2="83" stroke="#a0b0d0" strokeWidth="1.2"/>
              <line x1="47" y1="75" x2="58" y2="73" stroke="#a0b0d0" strokeWidth="0.6" opacity="0.6"/>
              <line x1="62" y1="73" x2="73" y2="75" stroke="#a0b0d0" strokeWidth="0.6" opacity="0.6"/>
              <rect x="57.8" y="55" width="4.4" height="19" rx="2" fill="#d4a820"/>
              <rect x="58.6" y="55" width="2.8" height="19" rx="1.5" fill="#f0c830"/>
              <path d="M52 55 Q60 50 68 55 L66 62 Q60 60 54 62 Z" fill="#c49818"/>
              <ellipse cx="60" cy="55" rx="8" ry="3" fill="#f0c830"/>
              <ellipse cx="60" cy="55" rx="6" ry="2" fill="#ffe060"/>
              <path d="M60 24 C56 28 52 33 53 39 C49 36 48 31 50 27 C46 31 45 37 47 42 C44 42 42 44 43.5 47 C45 50 49 51 52 50.5 C54 50.5 56 49.5 57 49 L59 43 L61 49 C62 49.5 64 50.5 66 50.5 C69 51 73 50 74.5 47 C76 44 74 42 71 42 C73 37 72 31 68 27 C70 31 69 36 65 39 C66 33 64 28 60 24Z" fill="#e06010"/>
              <path d="M60 28 C57.5 31 55.5 35 56.5 39.5 C54 38 53.5 35 55 32 C53 35 52.5 39 54 42.5 C52.5 43.5 52.5 45.5 54 47 C55.5 48.5 58 49 60 48.8 C62 49 64.5 48.5 66 47 C67.5 44 66 42.5 65 32 C66.5 35 66 38 63.5 39.5 C64.5 35 62.5 31 60 28Z" fill="#f07820"/>
              <path d="M60 32 C58.5 34.5 57.5 37.5 58.5 40.5 C57 39.5 56.5 37.5 57.5 35.5 C56.5 37.5 56.5 40.5 58 43 C56.5 46 58 47.5 60 48.6 C62 48.5 63.5 46 62 43 C63.5 40.5 62.5 35.5 60 32Z" fill="#fcd34d"/>
              <ellipse cx="60" cy="36" rx="1.8" ry="3" fill="#fff9c4" opacity="0.7"/>
              <path d="M 22 80 A 40 40 0 0 0 98 80 L 97 83 A 39 39 0 0 1 23 83 Z" fill="#a50d24"/>
              <path d="M 24 82 A 38 38 0 0 0 96 82 L 94 86 A 35 35 0 0 1 26 86 Z" fill="#C8102E"/>
              <text fill="#ffffff" fontSize="6.5" fontWeight="bold" fontFamily="Arial, Helvetica, sans-serif" letterSpacing="0.6">
                <textPath href="#lp-bot" startOffset="50%" textAnchor="middle">DESTINATION SUCCESS</textPath>
              </text>
              <text fill="#f0c830" fontSize="7.2" fontWeight="bold" fontFamily="Arial, Helvetica, sans-serif" letterSpacing="0.9">
                <textPath href="#lp-top" startOffset="50%" textAnchor="middle">K.R. MANGALAM UNIVERSITY</textPath>
              </text>
              {[0,45,90,135,180,225,270,315].map((deg,i)=>{const r=(deg*Math.PI)/180;return <circle key={i} cx={60+52.5*Math.cos(r)} cy={60+52.5*Math.sin(r)} r="1.3" fill="#c9a227" opacity="0.7"/>;})}
            </svg>
            <div>
              <p className="text-white font-extrabold text-lg leading-tight tracking-wide">
                K.R. MANGALAM
              </p>
              <p className="text-white font-bold text-base tracking-widest">UNIVERSITY</p>
            </div>
          </div>
          {/* Red tagline strip */}
          <div
            className="rounded-b-2xl px-5 py-2 text-center"
            style={{ background: 'linear-gradient(90deg, #C8102E, #a50d24)', border: '1px solid rgba(200,16,46,0.4)', borderTop: 'none' }}
          >
            <p className="text-white text-[11px] font-bold tracking-[0.22em] uppercase">
              The Complete World of Education
            </p>
          </div>
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
            <svg width="44" height="44" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <path id="mb-top" d="M 16 60 A 44 44 0 0 1 104 60" />
                <path id="mb-bot" d="M 26 78 A 36 36 0 0 0 94 78" />
              </defs>
              <circle cx="60" cy="60" r="58" fill="#b0b8c8"/>
              <circle cx="60" cy="60" r="54" fill="#8a94a8"/>
              <circle cx="60" cy="60" r="51" fill="#1a3a8f"/>
              <circle cx="60" cy="60" r="51" fill="none" stroke="#c9a227" strokeWidth="1.8"/>
              <path d="M60 22 L88 33 L88 58 C88 76 76 88 60 96 C44 88 32 76 32 58 L32 33 Z" fill="#1e4db7" stroke="#c9a227" strokeWidth="1.5"/>
              <path d="M60 27 L83 37 L83 58 C83 73 73 83 60 91 C47 83 37 73 37 58 L37 37 Z" fill="#2558d0"/>
              <path d="M44 76 Q60 71 76 76 L76 83 Q60 78 44 83 Z" fill="#ffffff" opacity="0.92"/>
              <line x1="60" y1="71.5" x2="60" y2="83" stroke="#a0b0d0" strokeWidth="1.2"/>
              <rect x="57.8" y="55" width="4.4" height="19" rx="2" fill="#d4a820"/>
              <ellipse cx="60" cy="55" rx="8" ry="3" fill="#f0c830"/>
              <path d="M60 24 C56 28 52 33 53 39 C49 36 48 31 50 27 C46 31 45 37 47 42 C44 42 42 44 43.5 47 C45 50 49 51 52 50.5 C57 49 L59 43 L61 49 C64 50.5 66 50.5 C69 51 73 50 74.5 47 C76 44 74 42 71 42 C73 37 72 31 68 27 C70 31 69 36 65 39 C66 33 64 28 60 24Z" fill="#e06010"/>
              <path d="M60 28 C57.5 31 55.5 35 56.5 39.5 C54 38 55 32 C53 35 52.5 39 54 42.5 C52.5 45.5 54 47 C55.5 48.5 58 49 60 48.8 C62 49 64.5 48.5 66 47 C67.5 44 66 42.5 C67.5 39 65 32 C66.5 35 63.5 39.5 C64.5 35 62.5 31 60 28Z" fill="#f07820"/>
              <path d="M60 32 C58.5 34.5 57.5 37.5 58.5 40.5 C57 39.5 57.5 35.5 C56.5 37.5 58 43 C56.5 46 60 48.6 C62 48.5 63.5 46 62 43 C63.5 40.5 62.5 35.5 60 32Z" fill="#fcd34d"/>
              <path d="M 22 80 A 40 40 0 0 0 98 80 L 97 83 A 39 39 0 0 1 23 83 Z" fill="#a50d24"/>
              <path d="M 24 82 A 38 38 0 0 0 96 82 L 94 86 A 35 35 0 0 1 26 86 Z" fill="#C8102E"/>
              <text fill="#ffffff" fontSize="6.5" fontWeight="bold" fontFamily="Arial, Helvetica, sans-serif" letterSpacing="0.6">
                <textPath href="#mb-bot" startOffset="50%" textAnchor="middle">DESTINATION SUCCESS</textPath>
              </text>
              <text fill="#f0c830" fontSize="7.2" fontWeight="bold" fontFamily="Arial, Helvetica, sans-serif" letterSpacing="0.9">
                <textPath href="#mb-top" startOffset="50%" textAnchor="middle">K.R. MANGALAM UNIVERSITY</textPath>
              </text>
            </svg>
            <div>
              <p className="font-bold text-gray-900 text-sm">K.R. Mangalam University</p>
              <p className="text-gray-400 text-xs">Internship Portal</p>
            </div>
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
