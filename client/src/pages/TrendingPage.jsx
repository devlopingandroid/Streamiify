import React from "react";
import { Flame } from "lucide-react";
import { TrendingSection } from "../components/recommendation/TrendingSection";

/**
 * TrendingPage displays the trending videos feed with infinite scrolling.
 * Responsive, aligned with existing application layout and dark base styling.
 */
export const TrendingPage = () => {
  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 text-slate-100 select-none animate-fade-in relative">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800/60">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Flame size={20} className="text-slate-400" />
            <span>Trending Videos</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Most popular educational streams and trending uploads.
          </p>
        </div>
      </div>

      {/* Feed Section with built-in infinite scroll */}
      <TrendingSection />
    </div>
  );
};

export default TrendingPage;
