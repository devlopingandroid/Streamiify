import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { ShieldAlert } from "lucide-react";

export const ForbiddenPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-dark-base text-slate-100 p-6 text-center select-none">
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-radial from-brand-indigo/10 to-transparent pointer-events-none z-0" />
      
      <div className="z-10 flex flex-col items-center gap-4 max-w-md">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
          <ShieldAlert size={28} />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-100">403</h1>
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-widest">Access Forbidden</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Your credentials do not permit access to this network layer. Contact an administrator to adjust permission profiles.
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
export default ForbiddenPage;
