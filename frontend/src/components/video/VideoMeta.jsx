import React from "react";
import { formatNumber, formatTimeAgo } from "../../utils";

export const VideoMeta = ({ views, createdAt, className = "" }) => {
  return (
    <div className={`flex items-center gap-1.5 text-[11px] text-slate-500 font-medium select-none ${className}`}>
      <span>{formatNumber(views)} views</span>
      <span>•</span>
      <span>{formatTimeAgo(createdAt)}</span>
    </div>
  );
};
export default VideoMeta;
