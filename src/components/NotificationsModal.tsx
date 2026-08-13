import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Bell, Check, ShoppingBag, Info, Sparkles } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrackOrder?: (orderId: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onTrackOrder,
}) => {
  const { notifications, currentRole, markNotificationRead } = useApp();

  if (!isOpen) return null;

  const roleNotifs = notifications.filter(
    n => n.targetRole === currentRole || n.targetRole === 'all'
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden my-auto max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="bg-orange-500 dark:bg-orange-900 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-200" />
            <h3 className="text-base font-black">Notifications</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-orange-100 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications list */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {roleNotifs.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">
              No notifications yet for this role.
            </div>
          ) : (
            roleNotifs.map(n => (
              <div
                key={n.id}
                onClick={() => {
                  markNotificationRead(n.id);
                  if (n.orderId && onTrackOrder) {
                    onClose();
                    onTrackOrder(n.orderId);
                  }
                }}
                className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                  n.read
                    ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 opacity-80'
                    : 'bg-orange-50/70 dark:bg-orange-950/40 border-orange-300 dark:border-orange-800 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="text-orange-800 dark:text-orange-300 flex items-center gap-1">
                    {n.type === 'order' ? '🛒' : n.type === 'promo' ? '🎉' : '🔔'} {n.title}
                  </span>
                  <span className="text-[10px] text-gray-400">{n.timestamp}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-[11px] font-medium leading-relaxed">
                  {n.message}
                </p>
                {n.orderId && (
                  <span className="text-[10px] font-extrabold text-orange-600 dark:text-orange-400 hover:underline mt-1 inline-block">
                    Tap to track order #{n.orderId} ➔
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
