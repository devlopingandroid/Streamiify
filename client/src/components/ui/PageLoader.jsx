import React from "react";

export const PageLoader = ({ message = "Loading secure channel..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full p-6 text-center animate-fade-in">
      <div className="w-10 h-10 border-4 border-slate-800 border-t-brand-cyan rounded-full animate-spin mb-4" />
      <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase select-none">
        {message}
      </p>
    </div>
  );
};
export default PageLoader;
