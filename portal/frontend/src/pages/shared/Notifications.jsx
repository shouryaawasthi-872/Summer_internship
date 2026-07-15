import { useEffect, useState } from 'react';
import { notificationsAPI } from '../../services/api';
import { SkeletonList } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { timeAgo } from '../../utils/helpers';
import { HiOutlineBell, HiCheck } from 'react-icons/hi';

const typeIcon = { application:'📋', document:'📁', meeting:'📅', marks:'🎓', system:'🔔' };

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);

  const load = () => {
    setError(null);
    notificationsAPI.getAll()
      .then(r => setNotifications(r.data.notifications || []))
      .catch(err => setError(err?.response?.data?.message || err?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const markAll = async () => {
    await notificationsAPI.markAllRead();
    setNotifications(n => n.map(x => ({...x, isRead:true})));
    toast.success('All marked as read');
  };

  const markOne = async (id) => {
    await notificationsAPI.markRead(id);
    setNotifications(n => n.map(x => x._id === id ? {...x, isRead:true} : x));
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Notifications</h1>
        {notifications.some(n => !n.isRead) && (
          <button onClick={markAll} className="btn-secondary text-sm flex items-center gap-2"><HiCheck />Mark all read</button>
        )}
      </div>

      {loading ? (
        <SkeletonList rows={6} />
      ) : error ? (
        <div className="card p-8 text-center text-red-500">
          <p className="font-medium">Failed to load notifications</p>
          <p className="text-xs text-gray-400 mt-1">{error}</p>
          <button className="btn-secondary text-sm mt-3" onClick={load}>Retry</button>
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={HiOutlineBell} title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="card divide-y divide-gray-50">
          {notifications.map(n => (
            <div key={n._id}
              className={`flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-50 transition ${!n.isRead ? 'bg-primary-50/30' : ''}`}
              onClick={() => !n.isRead && markOne(n._id)}>
              <span className="text-xl flex-shrink-0 mt-0.5">{typeIcon[n.type] ?? '🔔'}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!n.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{n.title || ''}</p>
                <p className="text-xs text-gray-500 mt-0.5">{n.message || ''}</p>
                <p className="text-xs text-gray-400 mt-1">{n.createdAt ? timeAgo(n.createdAt) : ''}</p>
              </div>
              {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
