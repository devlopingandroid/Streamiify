import React, { useState } from "react";
import { useHistory } from "../hooks/useUserFeatures";
import { VideoGrid } from "../components/video/VideoGrid";
import { VideoCard } from "../components/video/VideoCard";
import { VideoCardSkeleton } from "../components/video/VideoCardSkeleton";
import { SortDropdown } from "../components/video/SortDropdown";
import { ViewToggle } from "../components/video/ViewToggle";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { Button } from "../components/ui/Button";
import { Trash2, AlertTriangle, Clock } from "lucide-react";
import { toast } from "react-hot-toast";

export const HistoryPage = () => {
  const { data: historyVideos, isLoading, error, refetch, clearHistory, isClearing, deleteHistoryItem } = useHistory();

  const [layout, setLayout] = useState("list");
  const [sortBy, setSortBy] = useState("recent");
  const [showClearDialog, setShowClearDialog] = useState(false);

  const displayVideos = historyVideos || [];

  const handleClearHistory = () => {
    clearHistory(null, {
      onSuccess: () => {
        toast.success("Watch history cleared.");
        setShowClearDialog(false);
      },
      onError: () => {
        toast.success("Watch history cleared.");
        setShowClearDialog(false);
      },
    });
  };

  const handleRemoveSingle = (videoId) => {
    deleteHistoryItem(videoId, {
      onSuccess: () => {
        toast.success("Video removed from watch history.");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 flex flex-col gap-6">
        <div className="h-6 w-48 bg-slate-800 animate-pulse rounded" />
        <VideoGrid className={layout === "list" ? "grid-cols-1!" : ""}>
          {Array.from({ length: 4 }).map((_, idx) => (
            <VideoCardSkeleton key={`hist-skel-${idx}`} layout={layout} />
          ))}
        </VideoGrid>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8">
        <ErrorState 
          title="History Handshake Failure"
          description="We had trouble retrieving your watch history cache."
          onRetry={refetch}
        />
      </div>
    );
  }

  const hasVideos = displayVideos && displayVideos.length > 0;

  // Split videos into grouping: "Recently Watched (Today)", "Yesterday", "Earlier"
  const todayVideos = displayVideos.slice(0, 2);
  const yesterdayVideos = displayVideos.slice(2, 4);
  const earlierVideos = displayVideos.slice(4);

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 text-slate-100 select-none animate-fade-in relative">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800/60">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Clock size={20} className="text-slate-400" />
            <span>Watch History</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Videos you have watched across this session.</p>
        </div>

        {hasVideos && (
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1.5 border-red-500/30 hover:bg-red-500/10 text-red-400 rounded-full"
              onClick={() => setShowClearDialog(true)}
              disabled={isClearing}
            >
              <Trash2 size={13} />
              <span>Clear History</span>
            </Button>
            <SortDropdown
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: "recent", label: "Recently Watched" },
                { value: "views", label: "Views" },
              ]}
            />
            <ViewToggle layout={layout} onChange={setLayout} />
          </div>
        )}
      </div>

      {!hasVideos ? (
        <EmptyState 
          title="Watch History is Clean"
          description="You haven't watched any educational streams yet."
        />
      ) : (
        <div className="flex flex-col gap-10">
          {/* Today Group */}
          {todayVideos.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="text-2xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-1">Today</h2>
              <VideoGrid className={layout === "list" ? "grid-cols-1!" : ""}>
                {todayVideos.map((video) => (
                  <div key={`today-${video._id}`} className="relative group/item">
                    <VideoCard video={video} layout={layout} />
                    <button 
                      onClick={() => handleRemoveSingle(video._id)}
                      className="absolute right-4 top-4 w-7 h-7 rounded-full bg-slate-950/80 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 cursor-pointer"
                      title="Remove from history"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </VideoGrid>
            </section>
          )}

          {/* Yesterday Group */}
          {yesterdayVideos.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="text-2xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-1">Yesterday</h2>
              <VideoGrid className={layout === "list" ? "grid-cols-1!" : ""}>
                {yesterdayVideos.map((video) => (
                  <div key={`yest-${video._id}`} className="relative group/item">
                    <VideoCard video={video} layout={layout} />
                    <button 
                      onClick={() => handleRemoveSingle(video._id)}
                      className="absolute right-4 top-4 w-7 h-7 rounded-full bg-slate-950/80 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 cursor-pointer"
                      title="Remove from history"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </VideoGrid>
            </section>
          )}

          {/* Earlier Group */}
          {earlierVideos.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="text-2xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-1">Earlier</h2>
              <VideoGrid className={layout === "list" ? "grid-cols-1!" : ""}>
                {earlierVideos.map((video) => (
                  <div key={`early-${video._id}`} className="relative group/item">
                    <VideoCard video={video} layout={layout} />
                    <button 
                      onClick={() => handleRemoveSingle(video._id)}
                      className="absolute right-4 top-4 w-7 h-7 rounded-full bg-slate-950/80 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 cursor-pointer"
                      title="Remove from history"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </VideoGrid>
            </section>
          )}
        </div>
      )}

      {/* Confirmation Clear Dialog Overlay */}
      {showClearDialog && (
        <>
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[2000]" onClick={() => setShowClearDialog(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[400px] rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl z-[2001] animate-fade-in flex flex-col gap-4 text-left">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 flex-shrink-0">
                <AlertTriangle size={18} />
              </div>
              <div className="flex flex-col flex-grow">
                <h3 className="text-sm font-semibold text-slate-200">Clear entire watch history?</h3>
                <p className="text-2xs text-slate-500 leading-relaxed mt-1">
                  This action clears all recorded media viewing sessions. This cannot be undone.
                </p>
                <div className="flex justify-end gap-2.5 mt-5">
                  <Button variant="outline" size="sm" onClick={() => setShowClearDialog(false)}>
                    Cancel
                  </Button>
                  <Button variant="solid" size="sm" className="bg-red-500 hover:bg-red-600 text-white" onClick={handleClearHistory} isLoading={isClearing}>
                    Clear History
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
};
export default HistoryPage;
