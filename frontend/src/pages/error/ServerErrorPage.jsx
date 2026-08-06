import React from "react";
import { Button } from "../../components/ui/Button";
import { ServerCrash } from "lucide-react";

export const ServerErrorPage = () => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-dark-base text-slate-100 p-6 text-center select-none">
      <div className="z-10 flex flex-col items-center gap-4 max-w-md">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <ServerCrash size={28} />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-100">500</h1>
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-widest">Internal Server Error</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          The distribution backend encountered a database socket crash or parsing failure. We are actively troubleshooting.
        </p>
        <Button variant="solid" size="sm" onClick={handleReload} className="mt-4 rounded-full">
          Retry Handshake Connection
        </Button>
      </div>
    </div>
  );
};
export default ServerErrorPage;
