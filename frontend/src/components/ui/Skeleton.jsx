import React from "react";

export const Skeleton = ({ className = "", variant = "rect" }) => {
  const baseClass = "shimmer-bg";
  
  const variants = {
    circle: "rounded-full",
    text: "rounded h-3 w-full",
    rect: "rounded-xl",
  };

  return (
    <div className={`${baseClass} ${variants[variant]} ${className}`} />
  );
};
export default Skeleton;
