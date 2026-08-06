import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Compass } from "lucide-react";

export const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-dark-base text-slate-100 p-6 text-center select-none">
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-radial from-brand-cyan/10 to-transparent pointer-events-none z-0" />
      
      <div className="z-10 flex flex-col items-center gap-4 max-w-md">
        <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan">
          <Compass size={28} className="animate-spin-slow" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-100">404</h1>
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-widest">Page Not Found</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          The requested media folder, channel profile, or settings page could not be located on the CDN network.
        </p>
        <Link to="/" className="mt-4">
          <Button variant="solid" size="sm" className="rounded-full">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
export default NotFoundPage;
