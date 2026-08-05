import React from "react";
import { UserCheck } from "lucide-react";
import { SubscriptionFeedSection } from "../components/recommendation/SubscriptionFeedSection";

/**
 * SubscriptionsFeedPage displays the personalized subscriptions feed with infinite scrolling.
 * Aligns with the sidebar UserCheck navigation icon and dashboard container styles.
 */
export const SubscriptionsFeedPage = () => {
  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 text-slate-100 select-none animate-fade-in relative">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800/60">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <UserCheck size={20} className="text-slate-400" />
            <span>Subscriptions Feed</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
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
