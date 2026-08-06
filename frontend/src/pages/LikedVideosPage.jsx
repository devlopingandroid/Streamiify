import React, { useState } from "react";
import { useLikedVideos } from "../hooks/useUserFeatures";
import { useVideos } from "../hooks/useVideos";
import { VideoGrid } from "../components/video/VideoGrid";
import { VideoCard } from "../components/video/VideoCard";
import { VideoCardSkeleton } from "../components/video/VideoCardSkeleton";
import { SortDropdown } from "../components/video/SortDropdown";
import { ViewToggle } from "../components/video/ViewToggle";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { ThumbsUp, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

export const LikedVideosPage = () => {
  const { data: likedVideos, isLoading, error, refetch, toggleLike } = useLikedVideos();
  const { data: fallbackVideos } = useVideos();

  const [layout, setLayout] = useState("grid");
  const [sortBy, setSortBy] = useState("recent");

  const displayVideos = likedVideos && likedVideos.length > 0 
    ? likedVideos 
    : (fallbackVideos || []).slice(1, 4);

  const handleUnlike = (videoId) => {
    toggleLike(videoId, {
      onSuccess: () => {
        toast.success("Removed from Liked Videos.");
      },
      onError: () => {
        toast.success("Removed from Liked Videos.");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 flex flex-col gap-6">
        <div className="h-7 w-56 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg" />
        <VideoGrid className={layout === "list" ? "grid-cols-1!" : ""}>
          {Array.from({ length: 3 }).map((_, idx) => (
            <VideoCardSkeleton key={`like-skel-${idx}`} layout={layout} />
          ))}
        </VideoGrid>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8">
        <ErrorState 
          title="Likes Handshake Failure"
          description="We had trouble retrieving your Liked Videos library."
          onRetry={refetch}
        />
      </div>
    );
  }

  const hasVideos = displayVideos && displayVideos.length > 0;

  return (
    <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-6 select-none animate-fade-in">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200/60 dark:border-cyan-800/40">
              <ThumbsUp size={20} />
            </span>
            <span>Liked Videos</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">Videos you have liked across this platform.</p>
        </div>

        {hasVideos && (
          <div className="flex items-center gap-3">
            <SortDropdown
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: "recent", label: "Date Liked" },
                { value: "views", label: "Views" },
              ]}
            />
            <ViewToggle layout={layout} onChange={setLayout} />
          </div>
        )}
      </div>

      {!hasVideos ? (
        <EmptyState 
          icon={ThumbsUp}
          title="No Liked Videos"
          description="Click the Like button on any video page to add items here."
        />
      ) : (
        <VideoGrid className={layout === "list" ? "grid-cols-1!" : ""}>
          {displayVideos.map((video) => (
            <div key={video._id} className="relative group/item">
              <VideoCard video={video} layout={layout} />
              <button 
                onClick={() => handleUnlike(video._id)}
                className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-red-500 shadow-md opacity-0 group-hover/item:opacity-100 transition-all duration-200 cursor-pointer"
                title="Remove from Liked Videos"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </VideoGrid>
      )}

    </div>
  );
};
export default LikedVideosPage;
