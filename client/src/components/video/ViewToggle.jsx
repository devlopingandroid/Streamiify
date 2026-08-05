import React from "react";
import { Grid, List } from "lucide-react";

export const ViewToggle = ({ layout = "grid", onChange }) => {
  return (
    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 select-none">
      <button
        type="button"
        onClick={() => onChange("grid")}
        className={`p-1.5 rounded-md transition-colors cursor-pointer ${
          layout === "grid" 
            ? "bg-slate-800 text-brand-cyan" 
            : "text-slate-500 hover:text-slate-300"
        }`}
        aria-label="Grid layout view"
      >
        <Grid size={16} />
      </button>
      <button
        type="button"
        onClick={() => onChange("list")}
        className={`p-1.5 rounded-md transition-colors cursor-pointer ${
          layout === "list" 
            ? "bg-slate-800 text-brand-cyan" 
            : "text-slate-500 hover:text-slate-300"
        }`}
        aria-label="List layout view"
      >
        <List size={16} />
      </button>
    </div>
  );
};
export default ViewToggle;
