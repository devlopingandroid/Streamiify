import React from "react";
import { Hammer } from "lucide-react";

export const MaintenancePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-dark-base text-slate-100 p-6 text-center select-none">
      <div className="z-10 flex flex-col items-center gap-4 max-w-md">
        <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan animate-pulse">
          <Hammer size={28} />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-100">CDN System Maintenance</h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          We are upgrading our video encoding cluster pipelines to speed up transcoding times. Streamify services will resume shortly.
        </p>
      </div>
    </div>
  );
};
export default MaintenancePage;
