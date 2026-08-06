import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { setTheme } from "../../store/uiSlice";
import { Sun, Moon } from "lucide-react";

export const ThemeToggle = ({ className = "" }) => {
  const { theme } = useSelector((state) => state.ui);
  const dispatch = useDispatch();

  const handleToggle = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    dispatch(setTheme(nextTheme));
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`w-10 h-10 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 ${className}`}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun size={18} className="text-amber-400 fill-amber-400" />
      ) : (
        <Moon size={18} className="text-indigo-600 fill-indigo-600" />
      )}
    </button>
  );
};

export default ThemeToggle;
