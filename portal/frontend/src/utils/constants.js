export const ROLES = {
  STUDENT:    'student',
  MENTOR:     'mentor',
  ADMIN:      'admin',
  SUPERADMIN: 'superadmin',
};

export const STATUS_LABELS = {
  submitted:       'Submitted',
  mentor_approved: 'Mentor Approved',
  admin_approved:  'Admin Approved',
  fully_approved:  'Fully Approved',
  rejected:        'Rejected',
  pending:         'Pending',
  approved:        'Approved',
  scheduled:       'Scheduled',
  completed:       'Completed',
  cancelled:       'Cancelled',
};

// Maps overallStatus → CSS class (using KRMU-aligned badge classes from index.css)
export const STATUS_BADGE = {
  submitted:       'badge-submitted',
  mentor_approved: 'badge-info',
  admin_approved:  'badge-info',
  fully_approved:  'badge-approved',
  rejected:        'badge-rejected',
  pending:         'badge-pending',
  approved:        'badge-approved',
  scheduled:       'badge-info',
  completed:       'badge-approved',
  cancelled:       'badge-rejected',
};

// Role pills — used in Topbar, user tables, profile page
export const ROLE_COLORS = {
  student:    'bg-blue-50 text-blue-700 border border-blue-200',
  mentor:     'bg-emerald-50 text-emerald-700 border border-emerald-200',
  admin:      'bg-amber-50 text-amber-700 border border-amber-200',
  superadmin: 'bg-red-50 text-[#C8102E] border border-red-200',
};

// Approval pipeline step definitions
export const APPROVAL_STEPS = [
  { key: 'mentor',     label: 'Mentor Review',      role: 'mentor' },
  { key: 'admin',      label: 'Admin Review',        role: 'admin' },
  { key: 'superadmin', label: 'Super Admin Review',  role: 'superadmin' },
];

// Brand palette reference (use in inline styles when Tailwind class isn't enough)
export const KR_COLORS = {
  blue:      '#003087',
  blueDark:  '#001f5c',
  blueDeep:  '#000c30',
  red:       '#C8102E',
  redDark:   '#a50d24',
  redLight:  '#fce8ec',
};
