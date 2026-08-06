import React, { memo } from "react";
import { BarChart3 } from "lucide-react";

export const AnalyticsEmpty = memo(({
  title = "No Analytics Available",
  description = "Your stream channel has not generated any view history, engagement events, or subscriber milestones for this period. Try uploading new streams to begin tracking metrics.",
}) => {
  return (
    <div
      className="bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center max-w-lg mx-auto my-12 animate-fade-in select-none shadow-sm"
      role="status"
    >
      <div className="w-14 h-14 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mx-auto mb-5 shadow-xs">
        <BarChart3 size={24} />
      </div>

      <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">{title}</h2>
      
      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
        {description}
      </p>
    </div>
  );
});

AnalyticsEmpty.displayName = "AnalyticsEmpty";

export default AnalyticsEmpty;
