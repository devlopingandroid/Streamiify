import React from "react";

export const AppLogo = ({ className = "", showText = true }) => {
  return (
    <div className={`flex items-center gap-2 font-bold text-xl tracking-wider text-[#111827] select-none ${className}`}>
      <span className="rotate-90 inline-block text-[#111827] text-lg">▲</span>
      {showText && <span className="text-[#111827]">STREAMIFY</span>}
    </div>
  );
};
export default AppLogo;
