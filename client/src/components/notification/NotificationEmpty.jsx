import React from "react";
import { BellOff } from "lucide-react";

export const NotificationEmpty = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center text-slate-600 dark:text-slate-400 gap-3 select-none">
      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800/40 flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50">
        <BellOff size={20} />
      </div>
      <div className="flex flex-col gap-1">
        <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-300">All caught up!</h4>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-[200px]">
          You have no new alerts or subscription activities.
        </p>
      </div>
    </div>
  );
};
export default NotificationEmpty;
