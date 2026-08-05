import React from "react";

export const VideoGrid = ({ children, className = "" }) => {
  return (
    <div 
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full ${className}`}
    >
      {children}
    </div>
  );
};
export default VideoGrid;
