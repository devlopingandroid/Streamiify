import React from "react";
import { useNavigate } from "react-router-dom";
import { Check, Trash } from "lucide-react";
import { useNotifications, useMarkAllNotificationsRead, useClearNotifications } from "../../hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";
import { NotificationSkeleton } from "./NotificationSkeleton";
import { NotificationEmpty } from "./NotificationEmpty";

export const NotificationDropdown = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { data, isLoading } = useNotifications(10);
  const markAllReadMutation = useMarkAllNotificationsRead();
  const clearNotificationsMutation = useClearNotifications();

  if (!isOpen) return null;

  const notifications = data?.pages?.flatMap((page) => page?.notifications || (Array.isArray(page) ? page : [])) || [];

  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    markAllReadMutation.mutate();
  };

  const handleClearAll = (e) => {
    e.stopPropagation();
    clearNotificationsMutation.mutate();
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div className="absolute right-0 top-full mt-3 w-80 md:w-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md p-4 shadow-2xl z-50 animate-fade-in flex flex-col gap-4 max-h-[80vh]">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800/60 select-none">
          <div className="flex flex-col">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-200">Alerts</h3>
            <span className="text-[10px] text-slate-500 font-semibold">Latest updates & activities</span>
          </div>

          {notifications.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-[10px] font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors cursor-pointer"
                title="Mark all as read"
              >
                <Check size={11} />
                <span>Read All</span>
              </button>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors cursor-pointer"
                title="Clear all"
              >
                <Trash size={11} />
                <span>Clear All</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto pr-1 flex-grow scrollbar-thin">
          {isLoading ? (
            <NotificationSkeleton />
          ) : notifications.length === 0 ? (
            <NotificationEmpty />
          ) : (
            notifications.map((notification) => (
              <NotificationItem key={notification._id} notification={notification} />
            ))
          )}
        </div>

        <div className="pt-2 border-t border-slate-200 dark:border-slate-800/40 flex justify-center">
          <button
            onClick={() => {
              navigate("/notifications");
              onClose();
            }}
            className="text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors py-1 cursor-pointer w-full text-center"
          >
            View all alerts
          </button>
        </div>
      </div>
    </>
  );
};
export default NotificationDropdown;
