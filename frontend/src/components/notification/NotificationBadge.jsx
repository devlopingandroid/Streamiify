import React from "react";
import { useUnreadCount } from "../../hooks/useNotifications";

export const NotificationBadge = ({ className = "" }) => {
  const { data: count = 0 } = useUnreadCount();

  if (count <= 0) return null;

  return (
    <span
      className={`flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold leading-none text-slate-950 bg-brand-cyan rounded-full animate-pulse select-none ${className}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
};
export default NotificationBadge;
