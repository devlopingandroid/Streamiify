import React from "react";

export const FilterChips = ({ items = [], activeItem, onChange }) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none w-full select-none">
      {items.map((item) => {
        const id = item.id;
        const isActive = activeItem === id;

        return (
          <button
            type="button"
            key={id}
            onClick={() => onChange(id)}
            className={`px-3.5 py-1.5 rounded-full text-2xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all border cursor-pointer ${
              isActive
                ? "bg-cyan-500/10 text-brand-cyan border-brand-cyan"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
};
export default FilterChips;
