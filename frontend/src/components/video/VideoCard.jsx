import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { MoreVertical, Bookmark, Loader2 } from "lucide-react";
import { VideoThumbnail } from "./VideoThumbnail";
import { VideoMeta } from "./VideoMeta";
import { Avatar } from "../ui/Avatar";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { AddToPlaylistModal } from "../ui/AddToPlaylistModal";
import { useDeleteVideo } from "../../hooks/useDeleteVideo";
import { useToggleVideoStatus } from "../../hooks/useToggleVideoStatus";
import { useWatchLater } from "../../hooks/useUserFeatures";
import { truncateText } from "../../utils";

export const VideoCard = ({ video, layout = "grid" }) => {
  const isList = layout === "list";
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  if (!video) return null;

  const videoId = video._id || video.id;

  // Ownership check
  const ownerId = video.owner?._id || video.owner?.id || video.owner;
  const isOwner = user && ownerId && (user._id === ownerId || user.id === ownerId);

  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);

  const {
    data: watchLaterVideos,
    toggleWatchLater,
    isToggling: isWatchLaterToggling,
    togglingVideoId
  } = useWatchLater();
  const isWatchLater = watchLaterVideos?.some((v) => (v._id || v.id || v) === videoId);
  const isWatchLaterPending = isWatchLaterToggling && (togglingVideoId === videoId);

  const deleteMutation = useDeleteVideo();
  const toggleStatusMutation = useToggleVideoStatus();

  const handleDeleteConfirm = () => {
    if (!videoId) return;
    deleteMutation.mutate(videoId, {
      onSuccess: () => {
        setConfirmDeleteOpen(false);
      },
    });
  };

  const handleCardClick = (e) => {
    // If target click was inside interactive links or action buttons, do not double trigger
    if (e.target.closest("button") || e.target.closest("a")) {
      return;
    }
    if (videoId) {
      navigate(`/watch/${videoId}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`flex rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group overflow-hidden relative cursor-pointer ${
        isList ? "flex-col sm:flex-row gap-6 p-5" : "flex-col gap-3.5 p-4 sm:p-5"
      }`}
    >
      {/* Management Actions (Only for owners) */}
      {isOwner && (
        <div className="absolute top-6 right-6 z-20">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="w-7 h-7 rounded-full bg-white/90 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-colors shadow-xs cursor-pointer focus:outline-none"
            aria-label="Manage video"
          >
            <MoreVertical size={14} />
          </button>

          {menuOpen && (
            <>
              {/* Overlay background to close the menu on clicking outside */}
              <div
                className="fixed inset-0 z-30"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMenuOpen(false);
                }}
              />
              <div
                className="absolute right-0 mt-1 w-36 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-1.5 shadow-xl z-40 animate-fade-in flex flex-col gap-0.5"
                onClick={(e) => e.stopPropagation()} // Prevent card navigation
              >
                <Link
                  to={`/edit-video/${videoId}`}
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors block"
                >
                  Edit Video
                </Link>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setMenuOpen(false);
                    setIsPlaylistModalOpen(true);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors block cursor-pointer"
                >
                  Save to Playlist
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setMenuOpen(false);
                    toggleStatusMutation.mutate(videoId);
                  }}
                  disabled={toggleStatusMutation.isPending}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {video.isPublished ? "Make Private" : "Publish"}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setMenuOpen(false);
                    setConfirmDeleteOpen(true);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                >
                  Delete Video
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {!isOwner && (
        <div className={`absolute top-6 right-6 z-20 transition-opacity duration-150 ${
          isWatchLater ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWatchLater({ videoId, video });
            }}
            disabled={isWatchLaterPending}
            className="w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all shadow-xs cursor-pointer focus:outline-none disabled:opacity-50"
            aria-label="Toggle Watch Later"
            title={isWatchLater ? "Remove from Watch Later" : "Watch Later"}
          >
            {isWatchLaterPending ? (
              <Loader2 size={13} className="animate-spin text-slate-900 dark:text-slate-100" />
            ) : (
              <Bookmark size={13} className={isWatchLater ? "fill-cyan-500 text-cyan-500" : ""} />
            )}
          </button>
        </div>
      )}

      {/* Thumbnail Trigger */}
      <Link
        to={`/watch/${videoId}`}
        className={`block w-full ${isList ? "sm:w-[240px] flex-shrink-0" : ""}`}
        aria-label={`Play video: ${video.title}`}
      >
        <VideoThumbnail
          src={video.thumbnail}
          alt={video.title}
          duration={video.duration}
        />
      </Link>

      {/* Detail Metadata Box */}
      <div className={`flex gap-3 ${isList ? "sm:p-0 flex-grow" : "flex-grow px-0.5 py-0.5"}`}>
        {!isList && (
          <Link 
            to={video.owner?.username ? `/c/${video.owner.username}` : `/watch/${videoId}`} 
            onClick={(e) => e.stopPropagation()} 
            className="flex-shrink-0"
          >
            <Avatar src={video.owner?.avatar} name={video.owner?.fullname || "User"} size="sm" />
          </Link>
        )}

        <div className="flex flex-col gap-1 flex-grow min-w-0">
          <Link to={`/watch/${videoId}`}>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors leading-snug line-clamp-2">
              {video.title}
            </h3>
          </Link>

          <Link
            to={video.owner?.username ? `/c/${video.owner.username}` : `/watch/${videoId}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium transition-colors select-none w-fit mt-0.5"
          >
            {video.owner?.fullname || "User"}
          </Link>

          <VideoMeta views={video.views} createdAt={video.createdAt} />

          {isList && (
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 mt-2 hidden sm:block select-none">
              {truncateText(video.description, 160)}
            </p>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete this video?"
        message="This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isDanger={true}
        isLoading={deleteMutation.isPending}
      />

      <AddToPlaylistModal
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
        videoId={video._id}
      />
    </div>
  );
};
export default VideoCard;
