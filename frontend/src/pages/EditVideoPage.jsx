import React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export const EditVideoPage = () => {
  const { videoId } = useParams();

  return (
    <div className="max-w-[640px] mx-auto p-6 md:p-12 animate-fade-in text-slate-200">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-brand-cyan transition-colors mb-6 font-semibold"
      >
        <ArrowLeft size={16} />
        <span>Back to Dashboard</span>
      </Link>

      <div className="rounded-xl border border-slate-800/40 bg-slate-900/10 p-8 glassmorphism shadow-xl text-center">
        <h1 className="text-xl font-bold text-slate-100 mb-2">Edit Video Settings</h1>
        <p className="text-2xs text-slate-500 mb-6 uppercase tracking-wider">Video ID: {videoId}</p>
        
        <p className="text-xs text-slate-300 bg-slate-950/40 rounded-lg p-4 border border-slate-800/60 leading-relaxed">
          Video editing will be implemented in the next phase.
        </p>
      </div>
    </div>
  );
};

export default EditVideoPage;
