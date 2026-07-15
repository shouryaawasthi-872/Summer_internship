import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { applicationsAPI, internshipsAPI, documentsAPI } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import { SkeletonStats, SkeletonBanner, SkeletonList } from '../../components/common/Skeleton';
import { STATUS_BADGE, STATUS_LABELS, KR_COLORS } from '../../utils/constants';
import { fmtDate } from '../../utils/helpers';
import {
  HiOutlineBriefcase, HiOutlineDocumentText,
  HiOutlineFolder, HiOutlineCheckCircle,
  HiOutlineArrowRight, HiOutlineUserCircle,
  HiOutlineMailOpen, HiOutlineOfficeBuilding,
  HiOutlineExclamationCircle, HiOutlineAcademicCap,
  HiOutlineInformationCircle,
} from 'react-icons/hi';

/* Mandatory docs required for every internship application */
const MANDATORY_DOCS = [
  { key: 'noc',              label: 'NOC',              full: 'No Objection Certificate' },
  { key: 'offer_letter',     label: 'Offer Letter',     full: 'Official offer letter from company' },
  { key: 'email_screenshot', label: 'Email Screenshot', full: 'Screenshot of offer/joining email' },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData]       = useState({ apps: [], internships: [], docs: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([applicationsAPI.getAll(), internshipsAPI.getAll(), documentsAPI.getAll()])
      .then(([a, i, d]) => setData({
        apps:        a.data.applications,
        internships: i.data.internships,
        docs:        d.data.documents,
      }))
      .finally(() => setLoading(false));
  }, []);

  const approved  = data.apps.filter(a => a.overallStatus === 'fully_approved').length;
  const pending   = data.apps.filter(a => !['fully_approved', 'rejected'].includes(a.overallStatus)).length;
  const offCampusApps = data.apps.filter(a => a.internshipType === 'off_campus').length;

  /* Mandatory doc status */
  const docSet = new Set(
    data.docs.flatMap(d => [
      (d.type  || '').toLowerCase().trim(),
      (d.title || '').toLowerCase().trim(),
    ])
  );
  const mandatoryStatus = MANDATORY_DOCS.map(m => ({ ...m, uploaded: docSet.has(m.key) }));
  const mandatoryDone   = mandatoryStatus.every(m => m.uploaded);
  const mandatoryCount  = mandatoryStatus.filter(m => m.uploaded).length;

  /* Completion certificates uploaded */
  const certCount = data.docs.filter(d => d.type === 'completion_certificate').length;

  if (loading) return (
    <div className="space-y-6">
      <SkeletonBanner />
      <SkeletonStats />
      <SkeletonList rows={4} />
    </div>
  );

  return (
    <div className="space-y-6">

      {/* ── Hero Banner ── */}
      <div className="kr-hero-banner">
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-1">
            Student Portal
          </p>
          <h2 className="text-2xl font-extrabold text-white mb-1">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-sm text-white/60 mb-5">
            Track your applications, upload documents, and connect with your mentor.
          </p>

          {/* Progress summary */}
          {data.apps.length > 0 && (
            <div className="mb-5 bg-white/10 rounded-xl px-4 py-3 inline-flex items-center gap-4 flex-wrap">
              <span className="text-xs text-white/70">Applications</span>
              <div className="flex items-center gap-2">
                <div className="kr-progress-track w-32">
                  <div
                    className="kr-progress-fill"
                    style={{ width: `${(approved / Math.max(data.apps.length, 1)) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-white">
                  {approved}/{data.apps.length} approved
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Link
              to="/internships"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                         text-white transition-all hover:-translate-y-0.5"
              style={{ background: '#C8102E', boxShadow: '0 4px 12px rgba(200,16,46,0.40)' }}
            >
              Browse Internships <HiOutlineArrowRight />
            </Link>
            <Link
              to="/off-campus"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                         text-white transition-all hover:-translate-y-0.5"
              style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.30)' }}
            >
              <HiOutlineOfficeBuilding /> Off-Campus Internship
            </Link>
            <Link
              to="/documents"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                         text-white hover:bg-white/20 transition-all"
              style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              Upload Documents
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard label="Applications"   value={data.apps.length}  icon={HiOutlineDocumentText} color="blue" />
        <StatCard label="Fully Approved" value={approved}           icon={HiOutlineCheckCircle}  color="green" />
        <StatCard label="In Progress"    value={pending}            icon={HiOutlineBriefcase}    color="orange" sub="Pending review" />
        <StatCard label="Documents"      value={data.docs.length}   icon={HiOutlineFolder}       color="navy" />
      </div>

      {/* ── Internship Source Selection Cards ── */}
      <div>
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <HiOutlineBriefcase style={{ color: KR_COLORS.blue }} className="text-lg" />
          How do you want to do your internship?
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">

          {/* Portal internship */}
          <Link to="/internships" className="card p-5 block group hover:-translate-y-0.5 transition-transform">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-white"
                style={{ background: 'linear-gradient(135deg,#003087,#001f5c)' }}>
                <HiOutlineBriefcase className="text-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
                  Portal / On-Campus Internship
                </p>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Browse and apply for internships listed on this portal by the university.
                  These go through mentor → admin → super admin approval.
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold mt-3"
                  style={{ color: KR_COLORS.blue }}>
                  Browse listings <HiOutlineArrowRight />
                </span>
              </div>
            </div>
          </Link>

          {/* Off-campus internship */}
          <Link to="/off-campus" className="card p-5 block group hover:-translate-y-0.5 transition-transform"
            style={{ borderTop: `3px solid #C8102E` }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-white"
                style={{ background: 'linear-gradient(135deg,#C8102E,#a50d24)' }}>
                <HiOutlineOfficeBuilding className="text-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-gray-900 group-hover:text-red-700 transition-colors">
                    Off-Campus / Own Source
                  </p>
                  {offCampusApps > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ background: '#C8102E' }}>
                      {offCampusApps} registered
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Arranged an internship yourself? Register it here for university records,
                  approval pipeline, and marks calculation.
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold mt-3"
                  style={{ color: '#C8102E' }}>
                  Register now <HiOutlineArrowRight />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* ── Mandatory Documents Status ── */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <HiOutlineDocumentText
              className="text-lg"
              style={{ color: mandatoryDone ? '#059669' : KR_COLORS.red }}
            />
            Mandatory Documents
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full"
              style={{
                background: mandatoryDone ? 'rgba(5,150,105,0.10)' : 'rgba(200,16,46,0.10)',
                color:      mandatoryDone ? '#059669' : KR_COLORS.red,
              }}>
              {mandatoryCount}/3 uploaded
            </span>
          </h3>
          <Link to="/documents" className="text-xs font-semibold hover:underline flex items-center gap-1"
            style={{ color: KR_COLORS.blue }}>
            Manage documents <HiOutlineArrowRight />
          </Link>
        </div>

        {/* Info strip */}
        <div className="rounded-lg px-3 py-2 mb-4 flex items-center gap-2 text-xs"
          style={{ background: 'rgba(0,48,135,0.04)', border: '1px solid rgba(0,48,135,0.10)' }}>
          <HiOutlineInformationCircle className="flex-shrink-0 text-base" style={{ color: KR_COLORS.blue }} />
          <span style={{ color: KR_COLORS.blue }}>
            These 3 documents are required for <strong>every internship application</strong> — both portal
            and off-campus.
          </span>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          {mandatoryStatus.map(m => (
            <div key={m.key}
              className="flex items-start gap-3 p-3 rounded-xl"
              style={{
                background: m.uploaded ? 'rgba(5,150,105,0.05)' : 'rgba(200,16,46,0.04)',
                border: `1px solid ${m.uploaded ? 'rgba(5,150,105,0.20)' : 'rgba(200,16,46,0.18)'}`,
              }}>
              {m.uploaded
                ? <HiOutlineCheckCircle className="text-xl flex-shrink-0 mt-0.5 text-emerald-500" />
                : <HiOutlineExclamationCircle className="text-xl flex-shrink-0 mt-0.5" style={{ color: KR_COLORS.red }} />
              }
              <div>
                <p className="text-sm font-bold" style={{ color: m.uploaded ? '#059669' : KR_COLORS.red }}>
                  {m.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{m.full}</p>
                {!m.uploaded && (
                  <Link to="/documents"
                    className="text-xs font-semibold mt-1.5 inline-flex items-center gap-0.5 hover:underline"
                    style={{ color: KR_COLORS.red }}>
                    Upload now →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {mandatoryDone && (
          <div className="mt-3 rounded-lg px-3 py-2 flex items-center gap-2 text-xs"
            style={{ background: 'rgba(5,150,105,0.07)', border: '1px solid rgba(5,150,105,0.20)' }}>
            <HiOutlineCheckCircle className="text-emerald-500 flex-shrink-0 text-base" />
            <span className="text-emerald-700 font-semibold">
              All mandatory documents uploaded — you're ready to apply!
            </span>
          </div>
        )}
      </div>

      {/* ── Completion Certificate nudge (after any fully approved app) ── */}
      {approved > 0 && certCount === 0 && (
        <div className="rounded-xl p-4 flex items-start gap-3"
          style={{ background: 'rgba(5,150,105,0.06)', border: '1px solid rgba(5,150,105,0.22)' }}>
          <HiOutlineAcademicCap className="text-xl flex-shrink-0 mt-0.5 text-emerald-600" />
          <div className="flex-1">
            <p className="text-sm font-bold text-emerald-800">
              Upload your Completion Certificate to earn bonus marks!
            </p>
            <p className="text-xs text-emerald-700 mt-0.5">
              You have {approved} approved internship{approved > 1 ? 's' : ''}. Upload your completion
              certificate from the Documents page — your mentor will verify it and it counts as a
              5th component in your final marks.
            </p>
          </div>
          <Link to="/documents"
            className="btn-success text-xs px-3 py-1.5 flex-shrink-0">
            Upload Cert
          </Link>
        </div>
      )}

      {/* ── Cert uploaded confirmation ── */}
      {certCount > 0 && (
        <div className="rounded-xl px-4 py-3 flex items-center gap-3 text-sm"
          style={{ background: 'rgba(5,150,105,0.05)', border: '1px solid rgba(5,150,105,0.18)' }}>
          <HiOutlineCheckCircle className="text-emerald-500 flex-shrink-0 text-xl" />
          <p className="text-emerald-700 font-semibold text-xs">
            {certCount} completion certificate{certCount > 1 ? 's' : ''} uploaded — pending mentor
            verification for marks.{' '}
            <Link to="/marks" className="underline">View marks →</Link>
          </p>
        </div>
      )}

      {/* ── Recent Applications ── */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(0,48,135,0.08)' }}>
          <h3 className="font-bold text-gray-900">My Applications</h3>
          <Link to="/applications"
            className="text-sm font-semibold flex items-center gap-1 hover:underline"
            style={{ color: KR_COLORS.blue }}>
            View all <HiOutlineArrowRight className="text-base" />
          </Link>
        </div>

        {data.apps.length === 0 ? (
          <div className="p-10 text-center">
            <div className="kr-empty-icon">
              <HiOutlineBriefcase className="text-3xl" />
            </div>
            <p className="text-gray-500 font-medium text-sm">No applications yet</p>
            <p className="text-gray-400 text-xs mt-1">
              Browse portal internships or register an off-campus one to get started.
            </p>
            <div className="flex gap-3 justify-center mt-4 flex-wrap">
              <Link to="/internships" className="btn-primary inline-flex text-sm px-5 py-2">
                Browse Internships
              </Link>
              <Link to="/off-campus"
                className="inline-flex items-center gap-2 text-sm px-5 py-2 rounded-lg font-semibold text-white transition-all"
                style={{ background: '#C8102E' }}>
                Off-Campus
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(0,48,135,0.06)' }}>
            {data.apps.slice(0, 5).map(app => (
              <Link
                key={app._id}
                to={`/applications/${app._id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-primary-50/50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: app.internshipType === 'off_campus'
                      ? 'rgba(200,16,46,0.08)'
                      : 'rgba(0,48,135,0.07)',
                  }}>
                  {app.internshipType === 'off_campus'
                    ? <HiOutlineOfficeBuilding style={{ color: '#C8102E' }} className="text-lg" />
                    : <HiOutlineBriefcase style={{ color: KR_COLORS.blue }} className="text-lg" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-primary-700 transition-colors">
                      {app.internshipType === 'off_campus'
                        ? `${app.offCampusDetails?.role || 'Internship'} at ${app.offCampusDetails?.companyName || '—'}`
                        : app.internship?.title}
                    </p>
                    {app.internshipType === 'off_campus' && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white flex-shrink-0"
                        style={{ background: '#C8102E' }}>
                        Off-Campus
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    {app.internshipType === 'off_campus'
                      ? app.offCampusDetails?.location || 'Own source'
                      : app.internship?.company
                    } · Applied {fmtDate(app.createdAt)}
                  </p>
                </div>
                <span className={STATUS_BADGE[app.overallStatus] || 'badge-submitted'}>
                  {STATUS_LABELS[app.overallStatus]}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Mentor Info ── */}
      {user?.assignedMentor && (
        <div className="card p-5">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <HiOutlineUserCircle style={{ color: KR_COLORS.blue }} className="text-xl" />
            Your Mentor
          </h3>
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
              style={{ background: KR_COLORS.blue }}
            >
              {user.assignedMentor.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user.assignedMentor.name}</p>
              <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-0.5">
                <HiOutlineMailOpen className="text-base" />
                {user.assignedMentor.email}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Available Internships ── */}
      {data.internships.filter(i => i.status === 'approved').length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid rgba(0,48,135,0.08)' }}>
            <h3 className="font-bold text-gray-900">Available Internships</h3>
            <Link to="/internships"
              className="text-sm font-semibold flex items-center gap-1 hover:underline"
              style={{ color: KR_COLORS.blue }}>
              See all <HiOutlineArrowRight className="text-base" />
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(0,48,135,0.06)' }}>
            {data.internships.filter(i => i.status === 'approved').slice(0, 4).map(i => (
              <Link
                key={i._id}
                to={`/internships/${i._id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-primary-50/50 transition-colors group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                  style={{ background: KR_COLORS.blue }}
                >
                  {i.company?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-primary-700 transition-colors">
                    {i.title}
                  </p>
                  <p className="text-xs text-gray-400">{i.company} · {i.seats} seats</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                  style={{ background: '#C8102E' }}>
                  Apply
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
