import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import {
  Bell, CheckCircle2, AlertTriangle, AlertCircle, Info,
  Check, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const NotificationsPage = () => {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = () => {
    setLoading(true);
    notificationAPI.getNotifications()
      .then(res => setNotifications(res.data.notifications || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      showToast(id === 'all' ? 'All notifications marked as read.' : 'Notification marked as read.', 'success');
      loadNotifications();
    } catch (err) {
      showToast('Failed to update notification.', 'error');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'alert':
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-blue-500 shrink-0" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-primary-navy">
            Notifications Center
          </h1>
          <p className="text-xs text-slate-500">
            System alerts, inventory reminders, donation verifications, and blood request updates.
          </p>
        </div>

        {notifications.some(n => !n.is_read) && (
          <button
            onClick={() => handleMarkAsRead('all')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition"
          >
            <Check className="w-4 h-4" /> Mark All as Read
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSkeleton count={4} />
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 sm:p-5 rounded-2xl border transition flex items-start justify-between gap-4 ${
                !n.is_read
                  ? 'bg-white border-crimson-red/30 shadow-sm ring-1 ring-crimson-red/10'
                  : 'bg-white/60 border-slate-200 opacity-80'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5">{getIcon(n.type)}</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900">{n.title}</h4>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-crimson-red" title="Unread" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-xl">{n.message}</p>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {new Date(n.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {n.link && (
                  <Link
                    to={n.link}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-crimson-red transition"
                    title="Open Link"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                {!n.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    className="text-xs text-slate-400 hover:text-slate-800 p-1.5"
                    title="Mark Read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="All Caught Up!"
          description="You have no notifications in your inbox at this time."
          icon={Bell}
        />
      )}

    </div>
  );
};

export default NotificationsPage;
