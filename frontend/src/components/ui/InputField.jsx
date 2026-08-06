import React, { forwardRef } from "react";

export const InputField = forwardRef(
  ({ label, error, containerClassName = "", id, ...props }, ref) => {
    const inputId = id || `input-${label.replace(/\s+/g, "-").toLowerCase()}`;

    return (
      <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
        <label htmlFor={inputId} className="text-xs font-semibold text-[#334155] uppercase tracking-wider">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`w-full bg-white border text-[#0F172A] rounded-lg px-4 py-2 text-sm h-10 transition-all duration-150 focus:outline-none focus:border-[#0F172A] focus:ring-2 focus:ring-slate-100 placeholder-[#94A3B8] ${
            error ? "border-red-500 focus:border-red-500" : "border-[#E2E8F0]"
          }`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error ? (
          <span id={`${inputId}-error`} className="text-xs text-red-500 font-medium animate-fade-in" role="alert">
            {error}
          </span>
        ) : null}
      </div>
    );
  }
);

InputField.displayName = "InputField";
export default InputField;
