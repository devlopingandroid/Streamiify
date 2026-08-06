import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "./Button";

export const EmptyState = ({
  title = "No data found",
  description = "There are no records matching your query criteria.",
  actionLabel,
  onAction,
  icon: Icon = FolderOpen,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-10 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0F172A]/80 shadow-sm backdrop-blur-xs max-w-md mx-auto my-8 animate-fade-in select-none">
      <div className="w-14 h-14 rounded-2xl bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200/60 dark:border-cyan-800/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-4 shadow-xs">
        <Icon size={24} />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1.5">{title}</h3>
      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-5 max-w-xs">{description}</p>
      {actionLabel && onAction ? (
        <Button variant="primary" size="sm" onClick={onAction} className="rounded-full px-5 shadow-xs">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
};
export default EmptyState;
