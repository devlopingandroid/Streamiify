import React from "react";
import { UploadVideoForm } from "../components/video/UploadVideoForm";

export const UploadVideoPage = () => {
  return (
    <div className="max-w-[640px] mx-auto p-6 md:p-12 animate-fade-in text-slate-200">
      <h1 className="text-2xl font-bold text-slate-100 mb-1">Upload Video</h1>
      <p className="text-xs text-slate-400 mb-8 font-medium">
        Publish your media content to the enterprise CDN network repository.
      </p>

      <div className="rounded-xl border border-slate-800/40 bg-slate-900/10 p-6 md:p-8 glassmorphism shadow-xl">
        <UploadVideoForm />
      </div>
    </div>
  );
};

export default UploadVideoPage;
