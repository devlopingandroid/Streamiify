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
import { formatNumber } from "../utils";
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
    <div className="p-6 md:p-8 max-w-[1440px] mx-auto animate-fade-in text-[#111827] select-none">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        
        {/* Left Side: Main Player and Metadata Details */}
        <div className="flex flex-col">
          <VideoPlayer src={video.videoFile} poster={video.thumbnail} videoId={videoId} resumePosition={resumePosition} />
          
          <h1 className="text-lg md:text-xl font-bold text-[#111827] mt-4 leading-relaxed">
            {video.title}
          </h1>

          {/* Interactive Info Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-3 pb-6 border-b border-slate-800/60">
            {/* Owner channel details */}
            <div className="flex items-center gap-4">
              {ownerUsername ? (
                <Link to={`/c/${ownerUsername}`}>
                  <Avatar src={ownerAvatar} name={ownerFullname} size="lg" />
                </Link>
              ) : (
                <Avatar src={ownerAvatar} name={ownerFullname} size="lg" />
              )}
              <div className="flex flex-col">
                {ownerUsername ? (
                  <Link to={`/c/${ownerUsername}`} className="font-semibold text-[#374151] hover:text-brand-cyan transition-colors text-xs">
                    {ownerFullname}
                  </Link>
                ) : (
                  <span className="font-semibold text-[#374151] text-xs">{ownerFullname}</span>
                )}
                {ownerUsername && <span className="text-[10px] text-[#6B7280] mt-0.5">@{ownerUsername}</span>}
              </div>
              {!isOwnVideo && ownerId && (
                <Button 
                  variant={isSubscribed ? "outline" : "solid"} 
                  size="sm" 
                  className="ml-2 rounded-full"
                  onClick={() => toggleSubscription()}
                  isLoading={isSubscribing}
                >
                  {isSubscribed ? "Subscribed" : "Subscribe"}
                </Button>
              )}
            </div>

            {/* Utility action buttons */}
            <div className="flex gap-2 items-center flex-wrap">
              <Button 
                variant={likesInfo?.likedByCurrentUser ? "solid" : "outline"} 
                size="sm" 
                className="inline-flex items-center justify-center gap-1.5 rounded-full transition-all duration-150 active:scale-95 px-4"
                onClick={() => toggleLike()}
                disabled={isToggling}
              >
                <ThumbsUp size={14} className={likesInfo?.likedByCurrentUser ? "fill-current text-[#0F172A] animate-bounce" : "transition-transform"} />
                <span className="text-[11px] font-semibold">
                  {likesInfo?.likedByCurrentUser ? "Liked" : "Like"} ({formatNumber(likesInfo?.totalLikes || 0)})
                </span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="inline-flex items-center justify-center gap-1.5 rounded-full px-4"
                onClick={handleShare}
              >
                <Share2 size={14} />
                <span className="text-[11px] font-semibold">Share</span>
              </Button>
              <Button 
                variant={isWatchLater ? "solid" : "outline"} 
                size="sm" 
                className="inline-flex items-center justify-center gap-1.5 rounded-full px-4"
                onClick={() => toggleWatchLater({ videoId, video })}
                disabled={isWatchLaterPending}
              >
                {isWatchLaterPending ? (
                  <Loader2 size={14} className="animate-spin text-[#0F172A]" />
                ) : (
                  <Clock size={14} className={isWatchLater ? "text-[#0F172A]" : ""} />
                )}
                <span className="text-[11px] font-semibold">Watch Later</span>
              </Button>
              <Button 
                variant={isSaved ? "solid" : "outline"} 
                size="sm" 
                className="inline-flex items-center justify-center gap-1.5 rounded-full px-4"
                onClick={handleSave}
              >
                <Bookmark size={14} />
                <span className="text-[11px] font-semibold">Save</span>
              </Button>
            </div>
          </div>

          {/* Video Description panel */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 mt-6">
            <div className="flex gap-2 text-[10px] text-slate-500 font-semibold mb-2">
              <span>{formatNumber(video.views)} views</span>
              <span>•</span>
              <span>Uploaded 3 days ago</span>
            </div>
            <p className={`text-xs text-slate-600 leading-relaxed whitespace-pre-wrap break-words ${
              descExpanded ? "" : "line-clamp-2"
            }`}>
              {video.description}
            </p>
            <button 
              onClick={() => setDescExpanded(!descExpanded)}
              className="flex items-center gap-1 text-[11px] font-bold text-[#0F172A] hover:text-slate-700 mt-3 cursor-pointer transition-colors"
            >
              <span>{descExpanded ? "Show Less" : "Show More"}</span>
              {descExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>

          <CommentSection videoId={videoId} />
        </div>

        {/* Right Side: Suggestions List */}
        <aside className="flex flex-col gap-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Up Next</h2>
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
