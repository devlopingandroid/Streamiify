import React from "react";

export const Button = ({
  children,
  variant = "solid",
  size = "md",
  isLoading = false,
  className = "",
  disabled,
  ...props
}) => {
  // Variant mapping using tailwind classes
  const variants = {
    solid: "bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-sm hover:scale-[1.01] active:scale-[0.97]",
    outline: "border border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white active:scale-[0.97]",
    ghost: "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 active:scale-[0.97]",
    danger: "border border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20 active:scale-[0.97]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs h-8",
    md: "px-4 py-2 text-sm h-10",
    lg: "px-6 py-3 text-base h-12",
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 cubic-bezier(0.4, 0, 0.2, 1) cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-slate-400 focus-visible:outline-offset-2 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" aria-label="Loading..." />
      ) : null}
      <span className={isLoading ? "opacity-0" : ""}>{children}</span>
    </button>
  );
};
export default Button;
