import React from "react";
import { formatDuration } from "../../utils";

export const VideoDuration = ({ duration, className = "" }) => {
  return (
    <span className={`absolute bottom-2 right-2 bg-slate-950/80 text-slate-100 text-[10px] px-1.5 py-0.5 rounded font-medium select-none ${className}`}>
      {formatDuration(duration)}
    </span>
  );
};
export default VideoDuration;
