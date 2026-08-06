import React from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { formatTimeAgo } from "../../utils";
import { useMarkNotificationRead, useDeleteNotification } from "../../hooks/useNotifications";

export const NotificationItem = ({ notification }) => {
  const navigate = useNavigate();
  const markReadMutation = useMarkNotificationRead();
  const deleteMutation = useDeleteNotification();

  const handleItemClick = (e) => {
    if (e.target.closest(".delete-btn")) return;

    if (!notification.isRead) {
      markReadMutation.mutate(notification._id);
    }

    if (notification.type === "subscribe" && notification.sender?.username) {
      navigate(`/c/${notification.sender.username}`);
    } else if (
      ["like", "comment", "reply"].includes(notification.type) &&
      notification.video?._id
    ) {
      navigate(`/watch/${notification.video._id}`);
    } else if (notification.type === "playlist" && notification.playlist?._id) {
      navigate(`/playlist/${notification.playlist._id}`);
    } else if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    deleteMutation.mutate(notification._id);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "subscribe":
        return "border-emerald-300/80 dark:border-emerald-500/20 bg-emerald-50/80 dark:bg-emerald-500/5 hover:bg-emerald-100/60 dark:hover:bg-emerald-500/10";
      case "like":
        return "border-rose-300/80 dark:border-rose-500/20 bg-rose-50/80 dark:bg-rose-500/5 hover:bg-rose-100/60 dark:hover:bg-rose-500/10";
      case "comment":
      case "reply":
        return "border-cyan-300/80 dark:border-cyan-500/20 bg-cyan-50/80 dark:bg-cyan-500/5 hover:bg-cyan-100/60 dark:hover:bg-cyan-500/10";
      case "playlist":
        return "border-amber-300/80 dark:border-amber-500/20 bg-amber-50/80 dark:bg-amber-500/5 hover:bg-amber-100/60 dark:hover:bg-amber-500/10";
      default:
        return "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-800/40";
    }
  };

  return (
    <div
      onClick={handleItemClick}
      className={`group relative flex gap-3 p-3.5 border rounded-xl cursor-pointer transition-all duration-200 ${
        notification.isRead 
          ? "border-slate-200 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/20" 
          : `text-slate-900 dark:text-slate-100 ${getTypeColor(notification.type)}`
      }`}
    >
      <Avatar
        src={notification.sender?.avatar}
        name={notification.sender?.fullname || "System"}
        size="sm"
        className="w-8 h-8 rounded-full border border-slate-300/50 dark:border-slate-700/30 shrink-0"
      />

      <div className="flex flex-col gap-0.5 flex-grow pr-6 select-none">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-900 dark:text-slate-200">
            {notification.sender?.fullname || "System"}
          </span>
          <span className="text-[10px] text-slate-700 dark:text-slate-300 font-medium">
            {notification.title}
          </span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug mt-0.5">
          {notification.message}
        </p>
        <span className="text-[9px] text-slate-500 dark:text-slate-500 font-semibold mt-1">
          {formatTimeAgo(notification.createdAt)}
        </span>
      </div>

      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {!notification.isRead && (
          <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-xs group-hover:scale-0 transition-transform duration-200" />
        )}

        <button
          onClick={handleDelete}
          className="delete-btn opacity-0 group-hover:opacity-100 flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-slate-800 text-slate-500 hover:text-red-500 border border-slate-200 dark:border-slate-700 transition-all duration-200 cursor-pointer shadow-xs"
          title="Delete notification"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
};
export default NotificationItem;
