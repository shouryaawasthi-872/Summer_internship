import { format, formatDistanceToNow } from 'date-fns';

export const fmtDate = (d) => d ? format(new Date(d), 'dd MMM yyyy') : '—';
export const fmtDateTime = (d) => d ? format(new Date(d), 'dd MMM yyyy, hh:mm a') : '—';
export const timeAgo = (d) => d ? formatDistanceToNow(new Date(d), { addSuffix: true }) : '';

export const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

export const avatarColor = (name = '') => {
  const colors = ['bg-purple-500','bg-blue-500','bg-green-500','bg-orange-500','bg-pink-500','bg-teal-500'];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
};

export const getErrorMsg = (err) =>
  err?.response?.data?.message || err?.message || 'Something went wrong';
