import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import KRMUBrandHeader from '../common/KRMULogo';
import {
  HiOutlineHome, HiOutlineBriefcase, HiOutlineDocumentText,
  HiOutlineFolder, HiOutlineCalendar, HiOutlineAcademicCap,
  HiOutlineBell, HiOutlineUsers, HiOutlineUserAdd, HiOutlineLogout,
  HiOutlineUser, HiOutlineChartPie, HiOutlineOfficeBuilding,
} from 'react-icons/hi';

const navItem = (to, Icon, label) => ({ to, Icon, label });

/**
 * NAV rules (strictly enforced):
 *  - CGPA: visible to mentor (edit) and student (view) ONLY
 *  - Marks: visible to mentor (give marks) and student (view) ONLY
 *  - Admin / Super Admin do NOT see CGPA Records or Marks in the sidebar
 */
const NAV = {
  student: [
    navItem('/dashboard',     HiOutlineHome,            'Dashboard'),
    navItem('/internships',   HiOutlineBriefcase,       'Internships'),
    navItem('/off-campus',    HiOutlineOfficeBuilding,  'Off-Campus Internship'),
    navItem('/applications',  HiOutlineDocumentText,    'My Applications'),
    navItem('/documents',     HiOutlineFolder,          'Documents'),
    navItem('/meetings',      HiOutlineCalendar,        'Meetings'),
    navItem('/marks',         HiOutlineAcademicCap,     'My Marks'),
    navItem('/cgpa',          HiOutlineChartPie,        'My CGPA'),
    navItem('/notifications', HiOutlineBell,            'Notifications'),
    navItem('/profile',       HiOutlineUser,            'Profile'),
  ],
  mentor: [
    navItem('/dashboard',     HiOutlineHome,         'Dashboard'),
    navItem('/internships',   HiOutlineBriefcase,    'Internships'),
    navItem('/applications',  HiOutlineDocumentText, 'Applications'),
    navItem('/documents',     HiOutlineFolder,       'Documents'),
    navItem('/meetings',      HiOutlineCalendar,     'Meetings'),
    navItem('/marks',         HiOutlineAcademicCap,  'Give Marks'),
    navItem('/cgpa',          HiOutlineChartPie,     'CGPA Management'),
    navItem('/notifications', HiOutlineBell,         'Notifications'),
    navItem('/profile',       HiOutlineUser,         'Profile'),
  ],
  // Admin: NO Marks, NO CGPA Records
  admin: [
    navItem('/dashboard',     HiOutlineHome,         'Dashboard'),
    navItem('/internships',   HiOutlineBriefcase,    'Internships'),
    navItem('/applications',  HiOutlineDocumentText, 'Applications'),
    navItem('/documents',     HiOutlineFolder,       'Documents'),
    navItem('/meetings',      HiOutlineCalendar,     'Meetings'),
    navItem('/users',         HiOutlineUsers,        'Users'),
    navItem('/assign-mentor', HiOutlineUserAdd,      'Assign Mentor'),
    navItem('/notifications', HiOutlineBell,         'Notifications'),
    navItem('/profile',       HiOutlineUser,         'Profile'),
  ],
  // Super Admin: NO Marks, NO CGPA Records
  superadmin: [
    navItem('/dashboard',     HiOutlineHome,         'Dashboard'),
    navItem('/internships',   HiOutlineBriefcase,    'Internships'),
    navItem('/applications',  HiOutlineDocumentText, 'Applications'),
    navItem('/documents',     HiOutlineFolder,       'Documents'),
    navItem('/meetings',      HiOutlineCalendar,     'Meetings'),
    navItem('/users',         HiOutlineUsers,        'Users'),
    navItem('/assign-mentor', HiOutlineUserAdd,      'Assign Mentor'),
    navItem('/notifications', HiOutlineBell,         'Notifications'),
    navItem('/profile',       HiOutlineUser,         'Profile'),
  ],
};

const ROLE_LABEL = {
  student:    'Student',
  mentor:     'Mentor',
  admin:      'Admin',
  superadmin: 'Super Admin',
};

/* Role pill colours inside sidebar (dark background) */
const ROLE_PILL = {
  student:    { bg: 'rgba(59,130,246,0.22)',  text: '#93c5fd' },
  mentor:     { bg: 'rgba(16,185,129,0.22)',  text: '#6ee7b7' },
  admin:      { bg: 'rgba(245,158,11,0.22)',  text: '#fcd34d' },
  superadmin: { bg: 'rgba(200,16,46,0.30)',   text: '#fca5a5' },
};

/**
 * KRMUCrest — faithful SVG recreation of the K.R. Mangalam University circular badge.
 * Matches the real logo: grey/silver outer ring, blue fill, central blue shield,
 * golden torch with orange flame, open book, circular gold "K.R. MANGALAM UNIVERSITY"
 * text along the top arc, red ribbon at bottom with "DESTINATION SUCCESS" in white.
 */
function KRMUCrest({ size = 46 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <defs>
        {/* Arc path for the top circular university text */}
        <path id="krmu-top-arc" d="M 16 60 A 44 44 0 0 1 104 60" />
        {/* Arc path for the bottom ribbon text */}
        <path id="krmu-bot-arc" d="M 26 78 A 36 36 0 0 0 94 78" />
      </defs>

      {/* ── Outermost silver/grey ring ── */}
      <circle cx="60" cy="60" r="58" fill="#b0b8c8" />
      <circle cx="60" cy="60" r="54" fill="#8a94a8" />

      {/* ── Blue main circle body ── */}
      <circle cx="60" cy="60" r="51" fill="#1a3a8f" />

      {/* ── Inner blue ring border ── */}
      <circle cx="60" cy="60" r="51" fill="none" stroke="#c9a227" strokeWidth="1.8" />
      <circle cx="60" cy="60" r="47" fill="none" stroke="#c9a227" strokeWidth="0.7" />

      {/* ── Shield body ── */}
      <path
        d="M60 22 L88 33 L88 58 C88 76 76 88 60 96 C44 88 32 76 32 58 L32 33 Z"
        fill="#1e4db7"
        stroke="#c9a227"
        strokeWidth="1.5"
      />
      {/* Shield inner highlight */}
      <path
        d="M60 27 L83 37 L83 58 C83 73 73 83 60 91 C47 83 37 73 37 58 L37 37 Z"
        fill="#2558d0"
      />
      {/* Shield inner edge accent */}
      <path
        d="M60 27 L83 37 L83 58 C83 73 73 83 60 91 C47 83 37 73 37 58 L37 37 Z"
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1"
      />

      {/* ── Open book at shield bottom center ── */}
      <path d="M44 76 Q60 71 76 76 L76 83 Q60 78 44 83 Z" fill="#ffffff" opacity="0.92"/>
      <line x1="60" y1="71.5" x2="60" y2="83" stroke="#a0b0d0" strokeWidth="1.2"/>
      {/* Book page lines */}
      <line x1="47" y1="75" x2="58" y2="73" stroke="#a0b0d0" strokeWidth="0.6" opacity="0.6"/>
      <line x1="47" y1="78" x2="58" y2="76.5" stroke="#a0b0d0" strokeWidth="0.6" opacity="0.6"/>
      <line x1="62" y1="73" x2="73" y2="75" stroke="#a0b0d0" strokeWidth="0.6" opacity="0.6"/>
      <line x1="62" y1="76.5" x2="73" y2="78" stroke="#a0b0d0" strokeWidth="0.6" opacity="0.6"/>

      {/* ── Torch pole (golden) ── */}
      <rect x="57.8" y="55" width="4.4" height="19" rx="2" fill="#d4a820"/>
      <rect x="58.6" y="55" width="2.8" height="19" rx="1.5" fill="#f0c830"/>

      {/* ── Torch cup/bowl ── */}
      <path d="M52 55 Q60 50 68 55 L66 62 Q60 60 54 62 Z" fill="#c49818"/>
      <path d="M53 55 Q60 51 67 55 L65.5 61 Q60 59.5 54.5 61 Z" fill="#e0b020"/>
      <ellipse cx="60" cy="55" rx="8" ry="3" fill="#f0c830"/>
      <ellipse cx="60" cy="55" rx="6" ry="2" fill="#ffe060"/>

      {/* ── Outer flame (deep orange) ── */}
      <path
        d="M60 24
           C56 28 52 33 53 39
           C49 36 48 31 50 27
           C46 31 45 37 47 42
           C44 42 42 44 43.5 47
           C45 50 49 51 52 50.5
           C54 50.5 56 49.5 57 49
           L59 43 L61 49
           C62 49.5 64 50.5 66 50.5
           C69 51 73 50 74.5 47
           C76 44 74 42 71 42
           C73 37 72 31 68 27
           C70 31 69 36 65 39
           C66 33 64 28 60 24Z"
        fill="#e06010"
      />
      {/* ── Mid flame (orange) ── */}
      <path
        d="M60 28
           C57.5 31 55.5 35 56.5 39.5
           C54 38 53.5 35 55 32
           C53 35 52.5 39 54 42.5
           C52.5 43.5 52.5 45.5 54 47
           C55.5 48.5 58 49 59.5 48.8
           C59.8 49 60.2 49 60.5 48.8
           C62 49 64.5 48.5 66 47
           C67.5 45.5 67.5 43.5 66 42.5
           C67.5 39 67 35 65 32
           C66.5 35 66 38 63.5 39.5
           C64.5 35 62.5 31 60 28Z"
        fill="#f07820"
      />
      {/* ── Inner flame (yellow-gold) ── */}
      <path
        d="M60 32
           C58.5 34.5 57.5 37.5 58.5 40.5
           C57 39.5 56.5 37.5 57.5 35.5
           C56.5 37.5 56.5 40.5 58 43
           C56.5 44 56.5 46 58 47.5
           C59 48.5 60 48.8 60 48.6
           C60 48.8 61 48.5 62 47.5
           C63.5 46 63.5 44 62 43
           C63.5 40.5 63.5 37.5 62.5 35.5
           C63.5 37.5 63 39.5 61.5 40.5
           C62.5 37.5 61.5 34.5 60 32Z"
        fill="#fcd34d"
      />
      {/* ── Flame tip highlight (white-yellow) ── */}
      <ellipse cx="60" cy="36" rx="1.8" ry="3" fill="#fff9c4" opacity="0.7"/>

      {/* ── Red ribbon arc at bottom of badge ── */}
      <path
        d="M 24 82 A 38 38 0 0 0 96 82 L 94 86 A 35 35 0 0 1 26 86 Z"
        fill="#C8102E"
      />
      <path
        d="M 22 80 A 40 40 0 0 0 98 80 L 97 83 A 39 39 0 0 1 23 83 Z"
        fill="#a50d24"
      />
      <path
        d="M 23 81.5 A 39 39 0 0 0 97 81.5"
        fill="none"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="0.5"
      />
      {/* Ribbon text */}
      <text
        fill="#ffffff"
        fontSize="6.5"
        fontWeight="bold"
        fontFamily="Arial, Helvetica, sans-serif"
        letterSpacing="0.6"
      >
        <textPath href="#krmu-bot-arc" startOffset="50%" textAnchor="middle">
          DESTINATION SUCCESS
        </textPath>
      </text>

      {/* ── Top arc text — K.R. MANGALAM UNIVERSITY ── */}
      <text
        fill="#f0c830"
        fontSize="7.2"
        fontWeight="bold"
        fontFamily="Arial, Helvetica, sans-serif"
        letterSpacing="0.9"
      >
        <textPath href="#krmu-top-arc" startOffset="50%" textAnchor="middle">
          K.R. MANGALAM UNIVERSITY
        </textPath>
      </text>

      {/* ── Small decorative dots on the ring ── */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x = 60 + 52.5 * Math.cos(rad);
        const y = 60 + 52.5 * Math.sin(rad);
        return <circle key={i} cx={x} cy={y} r="1.3" fill="#c9a227" opacity="0.7" />;
      })}
    </svg>
  );
}

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items    = NAV[user?.role] || [];
  const pill     = ROLE_PILL[user?.role] || { bg: 'rgba(255,255,255,0.12)', text: 'rgba(255,255,255,0.8)' };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 flex flex-col z-30
          transform transition-transform duration-300 ease-in-out kr-sidebar
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        `}
      >
        {/* ── Brand Header ─────────────────────────────────────────────── */}
        <div
          className="px-4 pt-5 pb-0 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* Official KRMU Brand Logo Header */}
          <div className="py-2 flex items-center justify-center">
            <KRMUBrandHeader crestSize={42} bannerSize="small" />
          </div>

          {/* Role badge */}
          <div className="py-2.5 flex items-center gap-2">
            <span
              className="text-[11px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: pill.bg, color: pill.text }}
            >
              {ROLE_LABEL[user?.role] || 'User'}
            </span>
          </div>
        </div>

        {/* ── Navigation ───────────────────────────────────────────────── */}
        <nav className="flex-1 py-2 px-2.5 space-y-0.5 overflow-y-auto">
          {items.map(({ to, Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                 transition-all duration-150 group
                 ${isActive
                   ? 'text-white'
                   : 'text-white/60 hover:text-white hover:bg-white/08'
                 }`
              }
              style={({ isActive }) =>
                isActive
                  ? {
                      background: 'rgba(255,255,255,0.12)',
                      boxShadow: 'inset 3px 0 0 #C8102E',
                    }
                  : {}
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`text-[17px] flex-shrink-0 transition-colors
                      ${isActive ? 'text-white' : 'text-white/45 group-hover:text-white/75'}`}
                  />
                  <span className="truncate">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── User Footer ──────────────────────────────────────────────── */}
        <div
          className="p-3 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* Avatar + name */}
          <div className="flex items-center gap-3 mb-2 px-1">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center
                         text-white text-xs font-bold flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #C8102E, #a50d24)',
                border: '2px solid rgba(255,255,255,0.15)',
              }}
            >
              {getInitials(user?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate leading-tight">
                {user?.name}
              </p>
              <p className="text-white/40 text-[10px] truncate mt-0.5">{user?.email}</p>
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium w-full px-3 py-2
                       rounded-lg text-white/55 hover:text-white hover:bg-white/10
                       transition-all duration-150"
          >
            <HiOutlineLogout className="text-base flex-shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
