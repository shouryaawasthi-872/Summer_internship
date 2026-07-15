import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { applicationsAPI, usersAPI, internshipsAPI } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import { SkeletonStats, SkeletonBanner, SkeletonList, SkeletonCard } from '../../components/common/Skeleton';
import { STATUS_LABELS, KR_COLORS } from '../../utils/constants';
import {
  HiOutlineUsers, HiOutlineCheckCircle, HiOutlineClock,
  HiOutlineBriefcase, HiOutlineDocumentText, HiOutlineArrowRight,
  HiOutlineChartBar,
} from 'react-icons/hi';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

// Custom tooltip for charts
const KRTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border rounded-lg px-3 py-2 text-xs font-semibold shadow-md"
      style={{ borderColor: 'rgba(0,48,135,0.15)', color: KR_COLORS.blue }}>
      {label && <p className="text-gray-500 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || KR_COLORS.blue }}>
          {p.name || p.dataKey}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [data, setData]     = useState({ stats: {}, apps: [], internships: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([usersAPI.getStats(), applicationsAPI.getAll(), internshipsAPI.getAll()])
      .then(([s, a, i]) => setData({
        stats:       s.data.stats,
        apps:        a.data.applications,
        internships: i.data.internships,
      }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <SkeletonBanner />
      <SkeletonStats />
      <div className="grid lg:grid-cols-2 gap-5">
        <SkeletonCard rows={5} />
        <SkeletonCard rows={5} />
      </div>
      <SkeletonList rows={4} />
    </div>
  );

  const statusCounts = {
    submitted:       data.apps.filter(a => a.overallStatus === 'submitted').length,
    mentor_approved: data.apps.filter(a => a.overallStatus === 'mentor_approved').length,
    admin_approved:  data.apps.filter(a => a.overallStatus === 'admin_approved').length,
    fully_approved:  data.apps.filter(a => a.overallStatus === 'fully_approved').length,
    rejected:        data.apps.filter(a => a.overallStatus === 'rejected').length,
  };

  const pieData = [
    { name: 'Submitted',       value: statusCounts.submitted,       fill: '#003087' },
    { name: 'Mentor Approved', value: statusCounts.mentor_approved,  fill: '#059669' },
    { name: 'Admin Approved',  value: statusCounts.admin_approved,   fill: '#d97706' },
    { name: 'Fully Approved',  value: statusCounts.fully_approved,   fill: '#0d9488' },
    { name: 'Rejected',        value: statusCounts.rejected,         fill: '#C8102E' },
  ].filter(d => d.value > 0);

  const barData = [
    { name: 'Students',     value: data.stats.students || 0 },
    { name: 'Mentors',      value: data.stats.mentors  || 0 },
    { name: 'Admins',       value: data.stats.admins   || 0 },
  ];

  const pendingFinal = data.apps.filter(a => a.overallStatus === 'admin_approved');

  return (
    <div className="space-y-6">

      {/* ── Hero ── */}
      <div className="kr-hero-banner">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-white/50">
              Super Admin
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold text-white"
              style={{ background: '#C8102E' }}>
              Full Access
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-1">
            Hi {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-sm text-white/60 mb-5">
            Full system control — analytics, users, approvals, and internship management.
          </p>

          {/* System overview pills */}
          <div className="flex flex-wrap gap-2 mb-5">
            {[
              { label: `${data.stats.students || 0} Students`, color: 'rgba(255,255,255,0.12)' },
              { label: `${data.stats.mentors  || 0} Mentors`,  color: 'rgba(255,255,255,0.12)' },
              { label: `${data.apps.length} Total Apps`,        color: 'rgba(255,255,255,0.12)' },
              { label: `${statusCounts.fully_approved} Approved`, color: 'rgba(5,150,105,0.40)' },
            ].map(({ label, color }) => (
              <span key={label}
                className="text-xs font-semibold px-3 py-1.5 rounded-full text-white"
                style={{ background: color, border: '1px solid rgba(255,255,255,0.15)' }}>
                {label}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/applications"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                         text-white transition-all hover:-translate-y-0.5"
              style={{ background: '#C8102E', boxShadow: '0 4px 12px rgba(200,16,46,0.40)' }}>
              Final Approvals
              {pendingFinal.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-[11px] font-bold flex items-center justify-center"
                  style={{ color: '#C8102E' }}>
                  {pendingFinal.length}
                </span>
              )}
            </Link>
            <Link to="/users"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                         text-white hover:bg-white/20 transition-all"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.20)' }}>
              <HiOutlineUsers /> Users
            </Link>
            <Link to="/internships"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                         text-white hover:bg-white/20 transition-all"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.20)' }}>
              <HiOutlineBriefcase /> Internships
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard label="Total Students"  value={data.stats.students || 0}    icon={HiOutlineUsers}       color="blue" />
        <StatCard label="Total Mentors"   value={data.stats.mentors  || 0}    icon={HiOutlineUsers}       color="green" />
        <StatCard label="Awaiting Final"  value={pendingFinal.length}         icon={HiOutlineClock}       color="red"  sub="Your approval needed" />
        <StatCard label="Fully Approved"  value={statusCounts.fully_approved} icon={HiOutlineCheckCircle} color="teal" />
      </div>

      {/* ── Charts ── */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* Pie — Application status */}
        <div className="card p-5">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <HiOutlineChartBar style={{ color: KR_COLORS.blue }} className="text-xl" />
            Application Status Distribution
          </h3>
          {data.apps.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              No applications yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  label={false}
                >
                  {pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip content={<KRTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(v) => <span className="text-xs text-gray-600">{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bar — Users by role */}
        <div className="card p-5">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <HiOutlineUsers style={{ color: KR_COLORS.blue }} className="text-xl" />
            Users by Role
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} barSize={36}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<KRTooltip />} cursor={{ fill: 'rgba(0,48,135,0.04)' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={['#003087', '#059669', '#C8102E'][i % 3]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Pending Final Approval ── */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(0,48,135,0.08)' }}>
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            Awaiting Your Final Approval
            {pendingFinal.length > 0 && (
              <span className="w-5 h-5 rounded-full text-white text-[11px] font-bold flex items-center justify-center"
                style={{ background: '#C8102E' }}>
                {pendingFinal.length}
              </span>
            )}
          </h3>
          <Link to="/applications?status=admin_approved"
            className="text-sm font-semibold flex items-center gap-1 hover:underline"
            style={{ color: KR_COLORS.blue }}>
            View all <HiOutlineArrowRight />
          </Link>
        </div>

        {pendingFinal.length === 0 ? (
          <div className="p-8 text-center">
            <HiOutlineCheckCircle className="text-4xl mx-auto mb-2 text-emerald-400" />
            <p className="text-sm font-medium text-gray-500">No pending final approvals</p>
            <p className="text-xs text-gray-400 mt-1">All applications have been processed.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(0,48,135,0.06)' }}>
            {pendingFinal.slice(0, 6).map(app => (
              <Link key={app._id} to={`/applications/${app._id}`}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-primary-50/50 transition-colors group">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#003087,#001f5c)' }}>
                  {app.student?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate group-hover:text-primary-700 transition-colors">
                    {app.student?.name}
                  </p>
                  <p className="text-xs text-gray-400">{app.internship?.title} · {app.internship?.company}</p>
                </div>
                <span className="badge-info">Awaiting Final</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── System stats footer ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Submitted',       value: statusCounts.submitted,       color: '#003087' },
          { label: 'Mentor Approved', value: statusCounts.mentor_approved,  color: '#059669' },
          { label: 'Admin Approved',  value: statusCounts.admin_approved,   color: '#d97706' },
          { label: 'Fully Approved',  value: statusCounts.fully_approved,   color: '#0d9488' },
          { label: 'Rejected',        value: statusCounts.rejected,         color: '#C8102E' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card px-4 py-3 text-center"
            style={{ borderTop: `3px solid ${color}` }}>
            <p className="text-2xl font-extrabold" style={{ color }}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
