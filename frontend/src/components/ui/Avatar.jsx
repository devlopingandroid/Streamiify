import React, { useState } from "react";

export const Avatar = ({
  src,
  name = "User",
  size = "md",
  className = "",
}) => {
  const [imageError, setImageError] = useState(false);

  const getInitials = (fullName) => {
    return fullName
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-xl",
    xl: "w-24 h-24 text-2xl",
  };

  const showFallback = !src || imageError;

  return (
    <div className={`rounded-full overflow-hidden flex items-center justify-center select-none bg-slate-800 border border-slate-700/50 flex-shrink-0 ${sizes[size]} ${className}`}>
      {showFallback ? (
        <div 
          className="w-full h-full bg-gradient-to-r from-brand-cyan to-brand-indigo text-slate-950 flex items-center justify-center font-bold uppercase"
          aria-label={name}
        >
          {getInitials(name)}
        </div>
      ) : (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover animate-fade-in"
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );
};
export default Avatar;
