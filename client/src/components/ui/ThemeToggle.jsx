import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { setTheme } from "../../store/uiSlice";
import { Sun, Moon } from "lucide-react";

export const ThemeToggle = ({ className = "" }) => {
  const { theme } = useSelector((state) => state.ui);
  const dispatch = useDispatch();

  const handleToggle = () => {
    dispatch(setTheme(theme === "dark" ? "light" : "dark"));
  };

  return (
    <button
      onClick={handleToggle}
      className={`w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-brand-cyan ${className}`}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};
export default ThemeToggle;
