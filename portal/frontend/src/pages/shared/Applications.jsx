import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationsAPI } from '../../services/api';
import { SkeletonTable } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { STATUS_BADGE, STATUS_LABELS } from '../../utils/constants';
import { fmtDate } from '../../utils/helpers';
import { HiOutlineDocumentText } from 'react-icons/hi';

export default function Applications() {
  const [apps, setApps]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('');

  useEffect(() => {
    setLoading(true);
    applicationsAPI.getAll(filter ? { status: filter } : {})
      .then(r => setApps(r.data.applications))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="page-title">Applications</h1>
        <select className="input-field w-auto text-sm" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="submitted">Submitted</option>
          <option value="mentor_approved">Mentor Approved</option>
          <option value="admin_approved">Admin Approved</option>
          <option value="fully_approved">Fully Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <SkeletonTable rows={6} cols={5} />
      ) : apps.length === 0 ? (
        <EmptyState icon={HiOutlineDocumentText} title="No applications found" />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-600">Student</th>
                <th className="text-left p-4 font-semibold text-gray-600">Internship</th>
                <th className="text-left p-4 font-semibold text-gray-600 hidden md:table-cell">Company</th>
                <th className="text-left p-4 font-semibold text-gray-600 hidden lg:table-cell">Applied</th>
                <th className="text-left p-4 font-semibold text-gray-600">Status</th>
                <th className="text-left p-4 font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {apps.map(app => (
                <tr key={app._id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{app.student?.name}</td>
                  <td className="p-4 text-gray-600 max-w-[180px] truncate">{app.internship?.title}</td>
                  <td className="p-4 text-gray-500 hidden md:table-cell">{app.internship?.company}</td>
                  <td className="p-4 text-gray-400 hidden lg:table-cell">{fmtDate(app.createdAt)}</td>
                  <td className="p-4">
                    <span className={STATUS_BADGE[app.overallStatus] || 'badge-submitted'}>
                      {STATUS_LABELS[app.overallStatus] || app.overallStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <Link to={`/applications/${app._id}`} className="text-primary-600 font-medium text-xs hover:underline">View →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
