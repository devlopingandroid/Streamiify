import React, { useState } from "react";
import { Bell } from "lucide-react";
import { NotificationBadge } from "./NotificationBadge";
import { NotificationDropdown } from "./NotificationDropdown";

export const NotificationBell = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  return (
    <div className="relative flex items-center justify-center">
      <button
        onClick={toggleDropdown}
        className={`relative flex items-center justify-center w-9 h-9 rounded-full bg-[#0F172A] border border-slate-700 text-white hover:bg-slate-800 transition-all duration-200 cursor-pointer shadow-sm ${
          dropdownOpen ? "bg-slate-800 border-slate-600 text-white" : ""
        }`}
        aria-label="View notifications"
      >
        <Bell size={17} className="text-white" />
        <NotificationBadge className="absolute -top-0.5 -right-0.5 border-2 border-[#0F172A]" />
      </button>

      <NotificationDropdown isOpen={dropdownOpen} onClose={() => setDropdownOpen(false)} />
    </div>
  );
};
export default NotificationBell;
