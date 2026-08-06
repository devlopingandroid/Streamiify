import React from "react";
import { UserCheck } from "lucide-react";
import { SubscriptionFeedSection } from "../components/recommendation/SubscriptionFeedSection";

export const SubscriptionsFeedPage = () => {
  return (
    <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-6 select-none animate-fade-in relative">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200/60 dark:border-cyan-800/40">
              <UserCheck size={20} />
            </span>
            <span>Subscriptions Feed</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Keep up with the latest uploads from channels you follow.
          </p>
        </div>
      </div>

      {/* Feed Section with built-in infinite scroll */}
      <SubscriptionFeedSection />
    </div>
  );
};

export default SubscriptionsFeedPage;
