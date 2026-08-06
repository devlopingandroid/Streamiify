import React from "react";
import { Button } from "../../components/ui/Button";
import { WifiOff } from "lucide-react";

export const OfflinePage = () => {
  const handleCheck = () => {
    if (navigator.onLine) {
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-dark-base text-slate-100 p-6 text-center select-none">
      <div className="z-10 flex flex-col items-center gap-4 max-w-md">
        <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
          <WifiOff size={28} />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-100">You are Offline</h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          Please check your network cables or Wi-Fi router. We will reconnect automatically as soon as bandwidth returns.
        </p>
        <Button variant="outline" size="sm" onClick={handleCheck} className="mt-2 rounded-full">
          Check Connection
        </Button>
      </div>
    </div>
  );
};
export default OfflinePage;
