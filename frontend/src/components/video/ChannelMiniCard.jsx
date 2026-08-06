import React from "react";
import { Link } from "react-router-dom";
import { Avatar } from "../ui/Avatar";

export const ChannelMiniCard = ({ username, fullname, avatar, className = "" }) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Link to={`/landing`} className="flex-shrink-0">
        <Avatar src={avatar} name={fullname} size="sm" />
      </Link>
      <div className="flex flex-col min-w-0 select-none">
        <span className="text-xs font-semibold text-slate-200 truncate hover:text-brand-cyan transition-colors">
          {fullname}
        </span>
        <span className="text-[10px] text-slate-500 truncate">
          @{username}
        </span>
      </div>
    </div>
  );
};
export default ChannelMiniCard;
