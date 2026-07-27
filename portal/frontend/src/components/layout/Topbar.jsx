import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiOutlineMenu, HiOutlineBell } from 'react-icons/hi';
import { notificationsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import KRMUBrandHeader from '../common/KRMULogo';

/* Route → page title */
const PAGE_TITLES = {
  '/dashboard':    'Dashboard',
  '/internships':  'Internships',
  '/applications': 'Applications',
  '/documents':    'Documents',
  '/meetings':     'Meetings',
  '/marks':        'Marks & Feedback',
  '/cgpa':         'CGPA Management',
  '/off-campus':   'Off-Campus Internship',
  '/notifications':'Notifications',
  '/profile':      'My Profile',
  '/users':        'User Management',
  '/assign-mentor':'Assign Mentor',
};

const ROLE_BADGE = {
  student:    { label: 'Student',     bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  mentor:     { label: 'Mentor',      bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' },
  admin:      { label: 'Admin',       bg: '#FFFBEB', text: '#92400E', border: '#FDE68A' },
  superadmin: { label: 'Super Admin', bg: '#FEF2F2', text: '#C8102E', border: '#FECACA' },
};

/**
 * KRMULogoMark — compact inline SVG used in the Topbar.
 * Shows the circular badge at a small size (32×32) matching the official logo.
 */
function KRMULogoMark({ size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
      aria-label="K.R. Mangalam University Logo"
    >
      <defs>
        <path id="tb-top" d="M 16 60 A 44 44 0 0 1 104 60" />
        <path id="tb-bot" d="M 26 78 A 36 36 0 0 0 94 78" />
      </defs>

      {/* Outer silver ring */}
      <circle cx="60" cy="60" r="58" fill="#b0b8c8" />
      <circle cx="60" cy="60" r="54" fill="#8a94a8" />

      {/* Blue body */}
      <circle cx="60" cy="60" r="51" fill="#1a3a8f" />
      <circle cx="60" cy="60" r="51" fill="none" stroke="#c9a227" strokeWidth="1.8" />
      <circle cx="60" cy="60" r="47" fill="none" stroke="#c9a227" strokeWidth="0.7" />

      {/* Shield */}
      <path d="M60 22 L88 33 L88 58 C88 76 76 88 60 96 C44 88 32 76 32 58 L32 33 Z"
        fill="#1e4db7" stroke="#c9a227" strokeWidth="1.5" />
      <path d="M60 27 L83 37 L83 58 C83 73 73 83 60 91 C47 83 37 73 37 58 L37 37 Z"
        fill="#2558d0" />

      {/* Open book */}
      <path d="M44 76 Q60 71 76 76 L76 83 Q60 78 44 83 Z" fill="#ffffff" opacity="0.92" />
      <line x1="60" y1="71.5" x2="60" y2="83" stroke="#a0b0d0" strokeWidth="1.2" />

      {/* Torch pole */}
      <rect x="57.8" y="55" width="4.4" height="19" rx="2" fill="#d4a820" />
      <rect x="58.6" y="55" width="2.8" height="19" rx="1.5" fill="#f0c830" />

      {/* Torch cup */}
      <path d="M52 55 Q60 50 68 55 L66 62 Q60 60 54 62 Z" fill="#c49818" />
      <ellipse cx="60" cy="55" rx="8" ry="3" fill="#f0c830" />
      <ellipse cx="60" cy="55" rx="6" ry="2" fill="#ffe060" />

      {/* Flame — outer orange */}
      <path d="M60 24 C56 28 52 33 53 39 C49 36 48 31 50 27 C46 31 45 37 47 42
               C44 42 42 44 43.5 47 C45 50 49 51 52 50.5 C54 50.5 56 49.5 57 49
               L59 43 L61 49 C62 49.5 64 50.5 66 50.5 C69 51 73 50 74.5 47
               C76 44 74 42 71 42 C73 37 72 31 68 27 C70 31 69 36 65 39
               C66 33 64 28 60 24Z" fill="#e06010" />

      {/* Flame — mid orange */}
      <path d="M60 28 C57.5 31 55.5 35 56.5 39.5 C54 38 53.5 35 55 32
               C53 35 52.5 39 54 42.5 C52.5 43.5 52.5 45.5 54 47
               C55.5 48.5 58 49 59.5 48.8 C60.5 48.8 62 49 64.5 48.5
               C66 47.5 67.5 44 66 42.5 C67.5 39 67 35 65 32
               C66.5 35 66 38 63.5 39.5 C64.5 35 62.5 31 60 28Z" fill="#f07820" />

      {/* Flame — inner gold */}
      <path d="M60 32 C58.5 34.5 57.5 37.5 58.5 40.5 C57 39.5 56.5 37.5 57.5 35.5
               C56.5 37.5 56.5 40.5 58 43 C56.5 44 56.5 46 58 47.5
               C59 48.5 60 48.8 60 48.6 C61 48.8 62 48.5 62 47.5
               C63.5 46 63.5 44 62 43 C63.5 40.5 63.5 37.5 62.5 35.5
               C63.5 37.5 63 39.5 61.5 40.5 C62.5 37.5 61.5 34.5 60 32Z" fill="#fcd34d" />

      {/* Flame tip */}
      <ellipse cx="60" cy="36" rx="1.8" ry="3" fill="#fff9c4" opacity="0.7" />

      {/* Red ribbon */}
      <path d="M 22 80 A 40 40 0 0 0 98 80 L 97 83 A 39 39 0 0 1 23 83 Z" fill="#a50d24" />
      <path d="M 24 82 A 38 38 0 0 0 96 82 L 94 86 A 35 35 0 0 1 26 86 Z" fill="#C8102E" />
      <text fill="#ffffff" fontSize="6.5" fontWeight="bold"
        fontFamily="Arial, Helvetica, sans-serif" letterSpacing="0.6">
        <textPath href="#tb-bot" startOffset="50%" textAnchor="middle">
          DESTINATION SUCCESS
        </textPath>
      </text>

      {/* Top arc text */}
      <text fill="#f0c830" fontSize="7.2" fontWeight="bold"
        fontFamily="Arial, Helvetica, sans-serif" letterSpacing="0.9">
        <textPath href="#tb-top" startOffset="50%" textAnchor="middle">
          K.R. MANGALAM UNIVERSITY
        </textPath>
      </text>

      {/* Decorative gold dots */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <circle key={i}
            cx={60 + 52.5 * Math.cos(rad)}
            cy={60 + 52.5 * Math.sin(rad)}
            r="1.3" fill="#c9a227" opacity="0.7" />
        );
      })}
    </svg>
  );
}

export default function Topbar({ onMenuClick }) {
  const { user } = useAuth();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  const pathKey   = '/' + location.pathname.split('/')[1];
  const pageTitle = PAGE_TITLES[pathKey] || 'Portal';

  useEffect(() => {
    const fetch = () =>
      notificationsAPI.getAll()
        .then(r => setUnread(r.data.unreadCount || 0))
        .catch(() => {});
    fetch();
    const t = setInterval(fetch, 30_000);
    return () => clearInterval(t);
  }, []);

  const badge    = ROLE_BADGE[user?.role];
  const initials = getInitials(user?.name || '');

  return (
    <header className="flex-shrink-0 sticky top-0 z-10">
      {/* ── KRMU university header bar ─────────────────────────────── */}
      <div
        className="w-full flex items-center gap-3 px-4"
        style={{
          background: 'linear-gradient(90deg, #002070 0%, #001540 60%, #000a28 100%)',
          height: '40px',
          borderBottom: '3px solid #C8102E',
        }}
      >
        {/* Official KRMU Brand Logo Header */}
        <div className="flex items-center">
          <KRMUBrandHeader crestSize={30} bannerSize="small" />
        </div>

        {/* Vertical separator */}
        <div className="hidden sm:block h-5 w-px mx-1 bg-white/20" />

        {/* Portal label */}
        <p className="hidden sm:block text-white/60 text-[10px] font-semibold tracking-widest uppercase">
          Internship Portal
        </p>

        {/* Spacer */}
        <div className="flex-1" />

        {/* NAAC / accreditation badge */}
        <span
          className="hidden md:inline-flex items-center gap-1 text-[9px] font-bold tracking-wider
                     px-2 py-0.5 rounded text-white/90 uppercase"
          style={{ background: 'rgba(200,16,46,0.50)', border: '1px solid rgba(200,16,46,0.60)' }}
        >
          NAAC A+
        </span>
      </div>

      {/* ── Main topbar row ─────────────────────────────────────────── */}
      <div
        className="h-12 flex items-center px-4 gap-3"
        style={{
          background: '#ffffff',
          borderBottom: '1px solid rgba(0,48,135,0.09)',
          boxShadow: '0 2px 10px rgba(0,48,135,0.07)',
        }}
      >
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg transition-colors text-gray-500
                     hover:bg-red-50 hover:text-[#C8102E]"
          aria-label="Open menu"
        >
          <HiOutlineMenu className="text-xl" />
        </button>

        {/* Page title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="hidden sm:block w-1 h-4 rounded-full flex-shrink-0"
              style={{ background: '#C8102E' }}
            />
            <h1 className="text-sm font-bold truncate" style={{ color: '#003087' }}>
              {pageTitle}
            </h1>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1.5">

          {/* Role badge */}
          {badge && (
            <span
              className="hidden md:inline-flex items-center px-2.5 py-1 rounded-full
                         text-xs font-semibold border"
              style={{ background: badge.bg, color: badge.text, borderColor: badge.border }}
            >
              {badge.label}
            </span>
          )}

          {/* Notification bell */}
          <Link
            to="/notifications"
            className="relative p-2 rounded-lg transition-colors text-gray-400
                       hover:bg-red-50 hover:text-[#C8102E]"
            aria-label="Notifications"
          >
            <HiOutlineBell className="text-xl" />
            {unread > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 text-white text-[9px]
                           font-bold rounded-full flex items-center justify-center
                           animate-pulse-red"
                style={{ background: '#C8102E' }}
              >
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>

          {/* Profile link */}
          <Link
            to="/profile"
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg
                       transition-colors hover:bg-blue-50 group"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center
                         text-white text-xs font-bold flex-shrink-0
                         transition-transform group-hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #003087 0%, #C8102E 100%)' }}
            >
              {initials}
            </div>
            <div className="hidden sm:block leading-tight">
              <p className="text-xs font-semibold text-gray-800 leading-none">
                {user?.name?.split(' ')[0]}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-none">View profile</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
