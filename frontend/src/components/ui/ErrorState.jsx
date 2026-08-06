import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "./Button";

export const ErrorState = ({
  title = "Connection error",
  description = "We experienced a network error loading these details.",
  onRetry,
  retryLabel = "Retry connection",
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-red-500/10 bg-red-500/5 max-w-md mx-auto my-6 animate-fade-in select-none">
      <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-400 mb-4">
        <AlertCircle size={20} />
      </div>
      <h3 className="text-sm font-semibold text-slate-200 mb-1">{title}</h3>
      <p className="text-xs text-slate-400 leading-relaxed mb-4">{description}</p>
      {onRetry ? (
        <Button variant="danger" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
};
export default ErrorState;
