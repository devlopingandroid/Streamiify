import React from "react";
import { Skeleton } from "../ui/Skeleton";

export const NotificationSkeleton = () => {
  return (
    <div className="flex flex-col gap-3 p-3">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={`notif-skel-${idx}`} className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-850/30">
          <Skeleton variant="circle" className="w-8 h-8 flex-shrink-0" />
          <div className="flex flex-col gap-1.5 flex-grow">
            <Skeleton variant="text" className="w-1/3 h-3 bg-slate-800/40" />
            <Skeleton variant="text" className="w-3/4 h-2 bg-slate-800/40" />
            <Skeleton variant="text" className="w-1/4 h-2 bg-slate-800/40" />
          </div>
        </div>
      ))}
    </div>
  );
};
export default NotificationSkeleton;
