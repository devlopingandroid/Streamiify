import React from "react";
import { Grid, List } from "lucide-react";

export const ViewToggle = ({ layout = "grid", onChange }) => {
  return (
    <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-full p-1 select-none shadow-xs">
      <button
        type="button"
        onClick={() => onChange("grid")}
        className={`p-1.5 rounded-full transition-colors cursor-pointer ${
          layout === "grid" 
            ? "bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs font-bold" 
            : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
        }`}
        aria-label="Grid layout view"
      >
        <Grid size={15} />
      </button>
      <button
        type="button"
        onClick={() => onChange("list")}
        className={`p-1.5 rounded-full transition-colors cursor-pointer ${
          layout === "list" 
            ? "bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs font-bold" 
            : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
        }`}
        aria-label="List layout view"
      >
        <List size={15} />
      </button>
    </div>
  );
};
export default ViewToggle;
