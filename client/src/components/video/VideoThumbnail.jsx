import React from "react";
import { VideoDuration } from "./VideoDuration";

export const VideoThumbnail = ({ src, alt, duration, className = "" }) => {
  return (
    <div className={`relative aspect-video w-full overflow-hidden bg-slate-800 rounded-lg select-none ${className}`}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.03]"
        loading="lazy"
      />
      <VideoDuration duration={duration} />
    </div>
  );
};
export default VideoThumbnail;
