import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useVideo } from "../hooks/useVideos";
import { useVideoLikes } from "../hooks/useLikes";
import { useSubscription, useMyPlaylists, useWatchLater, useResumePosition } from "../hooks/useUserFeatures";
import { AddToPlaylistModal } from "../components/ui/AddToPlaylistModal";
import { VideoPlayer } from "../components/video/VideoPlayer";
import { useSimilarVideos } from "../hooks/useRecommendations";
import { RecommendationSidebar } from "../components/recommendation/RecommendationSidebar";
import { CommentSection } from "../components/video/CommentSection";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { ErrorState } from "../components/ui/ErrorState";
import { PageLoader } from "../components/ui/PageLoader";
import { formatNumber, formatDate } from "../utils";
import { toast } from "react-hot-toast";
import { 
  ThumbsUp, 
  Share2, 
  Bookmark, 
  ChevronDown, 
  ChevronUp,
  Clock,
  Loader2 
} from "lucide-react";

export const WatchPage = () => {
  const { videoId } = useParams();
  const { user: currentUser } = useSelector((state) => state.auth);

  const [descExpanded, setDescExpanded] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const { data: playlists } = useMyPlaylists();
  const isSaved = playlists?.some((pl) =>
    pl.videos?.some((v) => (typeof v === "string" ? v : v?._id) === videoId)
  );
  const { 
    data: watchLaterVideos, 
    toggleWatchLater, 
    isToggling: isWatchLaterToggling, 
    togglingVideoId 
  } = useWatchLater();
  const isWatchLater = watchLaterVideos?.some((v) => (v._id || v) === videoId);
  const isWatchLaterPending = isWatchLaterToggling && (togglingVideoId === videoId);

  const { data: resumeData } = useResumePosition(videoId);
  const shouldResume = resumeData && resumeData.progress > 0 && !resumeData.completed;
  const resumePosition = shouldResume ? resumeData.progress : 0;

  // Video Queries
  const { data: video, isLoading: videoLoading, error: videoError, refetch: refetchVideo } = useVideo(videoId);
  const { 
    data: similarVideosData, 
    isLoading: similarLoading, 
    isError: similarError, 
    refetch: refetchSimilar 
  } = useSimilarVideos(videoId, 10);
  const { data: likesInfo, toggleLike, isToggling } = useVideoLikes(videoId);

  // Owner info extraction
  const ownerId = typeof video?.owner === "object" ? video?.owner?._id : video?.owner;
  const ownerUsername = typeof video?.owner === "object" ? video?.owner?.username : null;
  const ownerFullname = typeof video?.owner === "object" ? (video?.owner?.fullname || "User") : "User";
  const ownerAvatar = typeof video?.owner === "object" ? video?.owner?.avatar : null;

  // Subscription Hook Integration
  const { 
    subscribed: isSubscribed, 
    toggleSubscription, 
    isToggling: isSubscribing 
  } = useSubscription(ownerId);

  const isOwnVideo = currentUser?._id && ownerId && currentUser._id === ownerId;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Watch link copied to clipboard.");
  };

  const handleSave = () => {
    setIsPlaylistModalOpen(true);
  };

  if (videoLoading) {
    return <PageLoader message="Initializing video stream session..." />;
  }

  if (videoError || !video) {
    return (
      <div className="p-6 md:p-12">
        <ErrorState 
          title="Playback Error"
          description="The requested media stream could not be found or connection refused."
          onRetry={refetchVideo}
        />
      </div>
    );
  }

  // Filter out the currently playing video from recommendations
  const similarVideosList = similarVideosData?.docs || similarVideosData?.videos || (Array.isArray(similarVideosData) ? similarVideosData : []);
  const alternativeSuggestions = similarVideosList?.filter((v) => v._id !== videoId) || [];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1440px] mx-auto animate-fade-in text-slate-900 dark:text-slate-100 select-none">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        
        {/* Left Side: Main Player and Metadata Details */}
        <div className="flex flex-col">
          <VideoPlayer src={video.videoFile} poster={video.thumbnail} videoId={videoId} resumePosition={resumePosition} />
          
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-4 leading-snug">
            {video.title}
          </h1>

          {/* Interactive Info Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            {/* Owner channel details */}
            <div className="flex items-center gap-3.5">
              {ownerUsername ? (
                <Link to={`/c/${ownerUsername}`}>
                  <Avatar src={ownerAvatar} name={ownerFullname} size="lg" />
                </Link>
              ) : (
                <Avatar src={ownerAvatar} name={ownerFullname} size="lg" />
              )}
              <div className="flex flex-col">
                {ownerUsername ? (
                  <Link to={`/c/${ownerUsername}`} className="font-bold text-slate-900 dark:text-slate-100 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors text-sm">
                    {ownerFullname}
                  </Link>
                ) : (
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{ownerFullname}</span>
                )}
                {ownerUsername && <span className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">@{ownerUsername}</span>}
              </div>
              {!isOwnVideo && ownerId && (
                <Button 
                  variant={isSubscribed ? "outline" : "solid"} 
                  size="sm" 
                  className="ml-3 rounded-full px-4 shadow-xs"
                  onClick={() => toggleSubscription()}
                  isLoading={isSubscribing}
                >
                  {isSubscribed ? "Subscribed" : "Subscribe"}
                </Button>
              )}
            </div>

            {/* Utility action buttons */}
            <div className="flex gap-2.5 items-center flex-wrap">
              <Button 
                variant={likesInfo?.likedByCurrentUser ? "solid" : "outline"} 
                size="sm" 
                className="inline-flex items-center justify-center gap-1.5 rounded-full transition-all duration-150 active:scale-95 px-4 shadow-xs"
                onClick={() => toggleLike()}
                disabled={isToggling}
              >
                <ThumbsUp size={14} className={likesInfo?.likedByCurrentUser ? "fill-current animate-bounce" : "transition-transform"} />
                <span className="text-xs font-semibold">
                  {likesInfo?.likedByCurrentUser ? "Liked" : "Like"} ({formatNumber(likesInfo?.totalLikes || 0)})
                </span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 shadow-xs"
                onClick={handleShare}
              >
                <Share2 size={14} />
                <span className="text-xs font-semibold">Share</span>
              </Button>
              <Button 
                variant={isWatchLater ? "solid" : "outline"} 
                size="sm" 
                className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 shadow-xs"
                onClick={() => toggleWatchLater({ videoId, video })}
                disabled={isWatchLaterPending}
              >
                {isWatchLaterPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Clock size={14} className={isWatchLater ? "fill-current" : ""} />
                )}
                <span className="text-xs font-semibold">Watch Later</span>
              </Button>
              <Button 
                variant={isSaved ? "solid" : "outline"} 
                size="sm" 
                className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 shadow-xs"
                onClick={handleSave}
              >
                <Bookmark size={14} />
                <span className="text-xs font-semibold">Save</span>
              </Button>
            </div>
          </div>

          {/* Video Description panel */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0F172A]/80 p-5 mt-6 shadow-xs">
            <div className="flex gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              <span>{formatNumber(video.views)} views</span>
              <span>•</span>
              <span>Uploaded {formatDate(video.createdAt, "standard")}</span>
            </div>
            <p className={`text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap break-words ${
              descExpanded ? "" : "line-clamp-2"
            }`}>
              {video.description}
            </p>
            <button 
              onClick={() => setDescExpanded(!descExpanded)}
              className="flex items-center gap-1 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 mt-3 cursor-pointer transition-colors"
            >
              <span>{descExpanded ? "Show Less" : "Show More"}</span>
              {descExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          <CommentSection videoId={videoId} />
        </div>

        {/* Right Side: Suggestions List */}
        <aside className="flex flex-col gap-4">
          <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
            <span>Up Next</span>
          </h2>
          <RecommendationSidebar
            items={alternativeSuggestions}
            loading={similarLoading}
            error={similarError ? similarError : null}
            onRetry={refetchSimilar}
            skeletonCount={4}
          />
        </aside>

      </div>

      <AddToPlaylistModal 
        isOpen={isPlaylistModalOpen} 
        onClose={() => setIsPlaylistModalOpen(false)} 
        videoId={videoId} 
      />
    </div>
  );
};
export default WatchPage;
