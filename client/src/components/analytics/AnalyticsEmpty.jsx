import React, { memo } from "react";
import { BarChart3 } from "lucide-react";

export const AnalyticsEmpty = memo(({
  title = "No Analytics Available",
  description = "Your stream channel has not generated any view history, engagement events, or subscriber milestones for this period. Try uploading new streams to begin tracking metrics.",
}) => {
  return (
    <div
      className="glassmorphism rounded-2xl border border-slate-800/80 p-8 text-center max-w-lg mx-auto my-12 animate-fade-in select-none"
      role="status"
    >
      <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-5 shadow-inner">
        <BarChart3 size={24} className="stroke-slate-500" />
      </div>

      <h2 className="text-base font-bold text-slate-200 mb-2">{title}</h2>
      
      <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
        {description}
      </p>
    </div>
  );
});

AnalyticsEmpty.displayName = "AnalyticsEmpty";

export default AnalyticsEmpty;
