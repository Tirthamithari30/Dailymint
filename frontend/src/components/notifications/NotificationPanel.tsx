import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, Sun, Moon, AlertTriangle, Check, BellRing, Settings, X } from 'lucide-react';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
}) => {
  const { notifications, unreadCount, markAllAsRead, requestPushPermission } = useNotifications();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-sm bg-surface-card border-l border-surface-border h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface/80">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-primary" />
            <h3 className="text-sm font-bold text-white">Smart Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-black">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs"
                title="Mark all as read"
              >
                <Check size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Enable Web Push Notification Banner */}
        <div className="p-3.5 bg-primary/10 border-b border-primary/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-200">
            <BellRing size={16} className="text-primary shrink-0" />
            <span>Enable Web Push Alerts</span>
          </div>
          <button
            onClick={() => requestPushPermission()}
            className="px-2.5 py-1 bg-primary text-black font-bold rounded-lg text-[11px] hover:bg-primary-hover shadow-neon-sm"
          >
            Enable
          </button>
        </div>

        {/* Notifications Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No new alerts. Your spending is operating smoothly.
            </div>
          ) : (
            notifications.map((n) => {
              const isAlert = n.type === 'alert';
              const isMorning = n.type === 'morning';
              const isSummary = n.type === 'summary';

              return (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-2xl border text-xs transition-all ${
                    isAlert
                      ? 'bg-red-500/10 border-red-500/30 text-red-200'
                      : isMorning
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                      : 'bg-surface/60 border-surface-border text-slate-200'
                  } ${n.unread ? 'ring-1 ring-primary/40' : ''}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      {isAlert ? (
                        <AlertTriangle size={14} className="text-red-400 shrink-0" />
                      ) : isMorning ? (
                        <Sun size={14} className="text-amber-400 shrink-0" />
                      ) : isSummary ? (
                        <Moon size={14} className="text-blue-400 shrink-0" />
                      ) : (
                        <Bell size={14} className="text-primary shrink-0" />
                      )}
                      <span>{n.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{n.time}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">{n.message}</p>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-surface-border bg-surface flex justify-between items-center text-xs">
          <span className="text-slate-400">Scheduled: 8:30 AM & 9:30 PM</span>
          <button
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="flex items-center gap-1 text-primary hover:underline font-semibold text-xs"
          >
            <Settings size={13} /> Settings
          </button>
        </div>
      </div>
    </div>
  );
};
