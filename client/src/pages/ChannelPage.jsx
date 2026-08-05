//import all important directories 
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useChannel } from "../hooks/useUser";
import { useSubscription, useChannelSubscribers } from "../hooks/useUserFeatures";
import {
  useProfileUploadedVideos,
  useProfileLikedVideos,
  useProfileWatchHistory,
  useProfileContinueWatching,
} from "../hooks/useProfile";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { VideoGrid } from "../components/video/VideoGrid";
import { VideoCard } from "../components/video/VideoCard";
import { VideoCardSkeleton } from "../components/video/VideoCardSkeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { PageLoader } from "../components/ui/PageLoader";
import { Users, Mail, Settings } from "lucide-react";
import { formatNumber } from "../utils";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-center items-center gap-3 mt-8 select-none">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="rounded-full px-4 text-xs font-semibold"
      >
        Previous
      </Button>
      <span className="text-xs text-slate-400">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="rounded-full px-4 text-xs font-semibold"
      >
        Next
      </Button>
    </div>
  );
};

const SubscriberListItem = ({ subscriber }) => {
  const { user: currentUser } = useSelector((state) => state.auth);
  const {
    subscribed,
    toggleSubscription,
    isToggling,
  } = useSubscription(subscriber._id);

  const isSelf = currentUser?._id === subscriber._id;

  return (
    <div className="flex items-center justify-between gap-4 py-1.5 select-none">
      <div className="flex items-center gap-3 min-w-0">
        <Link to={`/c/${subscriber.username}`} className="flex-shrink-0">
          <Avatar src={subscriber.avatar} name={subscriber.fullname} size="sm" />
        </Link>
        <div className="flex flex-col min-w-0 text-left">
          <Link 
            to={`/c/${subscriber.username}`} 
            className="text-xs font-bold text-slate-200 truncate hover:text-brand-cyan transition-colors"
          >
            {subscriber.fullname}
          </Link>
          <span className="text-[10px] text-slate-500 truncate">@{subscriber.username}</span>
        </div>
      </div>
      {!isSelf && (
        <Button
          variant={subscribed ? "outline" : "solid"}
          size="sm"
          className="rounded-full flex-shrink-0 text-2xs px-2.5 py-1 h-7"
          onClick={() => toggleSubscription()}
          isLoading={isToggling}
        >
          {subscribed ? "Subscribed" : "Subscribe"}
        </Button>
      )}
    </div>
  );
};

const SubscriberListModal = ({ isOpen, onClose, channelId }) => {
  const { data: subscribers, isLoading, error } = useChannelSubscribers(channelId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Subscribers">
      {isLoading ? (
        <div className="flex flex-col gap-4 py-2">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={`sub-skel-${idx}`} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-slate-800" />
              <div className="flex-grow flex flex-col gap-1.5">
                <div className="w-24 h-3 bg-slate-800 rounded" />
                <div className="w-16 h-2 bg-slate-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-xs text-red-400 py-4 text-center">
          Failed to load subscribers. Connection refused.
        </div>
      ) : !subscribers || subscribers.length === 0 ? (
        <div className="text-xs text-slate-500 py-6 text-center italic">
          No subscribers yet.
        </div>
      ) : (
        <div className="flex flex-col gap-4 max-h-[50vh] overflow-y-auto pr-1">
          {(subscribers || []).map((subscriber) => (
            <SubscriberListItem key={subscriber._id} subscriber={subscriber} />
          ))}
        </div>
      )}
    </Modal>
  );
};

export const ChannelPage = () => {
  const { username } = useParams();
  const { user: currentUser } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("videos");
  const [subscribersModalOpen, setSubscribersModalOpen] = useState(false);

  // Pagination states
  const [uploadedPage, setUploadedPage] = useState(1);
  const [likedPage, setLikedPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);

  // Queries
  const { data: channel, isLoading, error, refetch } = useChannel(username);

  // Subscription Hook Integration
  const {
    subscribed: isSubscribed,
    subscribersCount: dynamicSubscribersCount,
    toggleSubscription,
    isToggling: isSubscribing,
    isLoading: isSubscriptionLoading,
  } = useSubscription(channel?._id);

  const isOwnProfile = currentUser?.username === username;

  const displaySubscribersCount = (isSubscriptionLoading && dynamicSubscribersCount === 0)
    ? (channel?.subscribersCount || 0)
    : dynamicSubscribersCount;

  // Conditional features queries
  const {
    data: uploadedData,
    isLoading: uploadedLoading,
    isError: uploadedError,
    refetch: refetchUploaded,
  } = useProfileUploadedVideos(channel?._id, uploadedPage, 8);

  const {
    data: likedData,
    isLoading: likedLoading,
    isError: likedError,
    refetch: refetchLiked,
  } = useProfileLikedVideos(likedPage, 8, isOwnProfile && activeTab === "liked");

  const {
    data: historyData,
    isLoading: historyLoading,
    isError: historyError,
    refetch: refetchHistory,
  } = useProfileWatchHistory(historyPage, 8, isOwnProfile && activeTab === "history");

  const {
    data: continueWatchingVideos,
    isLoading: continueWatchingLoading,
    isError: continueWatchingError,
    refetch: refetchContinueWatching,
  } = useProfileContinueWatching(8, isOwnProfile && activeTab === "continue-watching");

  if (isLoading) {
    return <PageLoader message="Retrieving channel parameters..." />;
  }

  if (error || !channel) {
    return (
      <div className="p-6 md:p-12">
        <ErrorState
          title="Channel Profile Error"
          description="We had trouble establishing connection to retrieve this channel profile."
          onRetry={refetch}
        />
      </div>
    );
  }

  // Tabs layout Configuration
  const tabs = isOwnProfile
    ? [
        { id: "videos", label: "Uploaded Videos" },
        { id: "liked", label: "Liked Videos" },
        { id: "history", label: "Watch History" },
        { id: "continue-watching", label: "Continue Watching" },
        { id: "playlists", label: "Playlists" },
        { id: "about", label: "About" },
      ]
    : [
        { id: "videos", label: "Videos" },
        { id: "playlists", label: "Playlists" },
        { id: "about", label: "About" },
      ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "videos":
        if (uploadedLoading) {
          return (
            <VideoGrid>
              {Array.from({ length: 4 }).map((_, idx) => (
                <VideoCardSkeleton key={`uploaded-skel-${idx}`} />
              ))}
            </VideoGrid>
          );
        }
        if (uploadedError) {
          return (
            <ErrorState
              title="Query Error"
              description="Failed to load uploaded videos catalog."
              onRetry={refetchUploaded}
            />
          );
        }
        if (!uploadedData?.docs || uploadedData.docs.length === 0) {
          return (
            <EmptyState
              title="No Videos Uploaded"
              description="This channel hasn't uploaded any media streams yet."
            />
          );
        }
        return (
          <>
            <VideoGrid>
              {uploadedData.docs.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </VideoGrid>
            <Pagination
              currentPage={uploadedPage}
              totalPages={uploadedData.totalPages}
              onPageChange={setUploadedPage}
            />
          </>
        );

      case "liked":
        if (!isOwnProfile) return null;
        if (likedLoading) {
          return (
            <VideoGrid>
              {Array.from({ length: 4 }).map((_, idx) => (
                <VideoCardSkeleton key={`liked-skel-${idx}`} />
              ))}
            </VideoGrid>
          );
        }
        if (likedError) {
          return (
            <ErrorState
              title="Query Error"
              description="Failed to load liked videos catalog."
              onRetry={refetchLiked}
            />
          );
        }
        if (!likedData?.docs || likedData.docs.length === 0) {
          return (
            <EmptyState
              title="No Liked Videos"
              description="You haven't liked any videos yet."
            />
          );
        }
        return (
          <>
            <VideoGrid>
              {likedData.docs.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </VideoGrid>
            <Pagination
              currentPage={likedPage}
              totalPages={likedData.totalPages}
              onPageChange={setLikedPage}
            />
          </>
        );

      case "history":
        if (!isOwnProfile) return null;
        if (historyLoading) {
          return (
            <VideoGrid>
              {Array.from({ length: 4 }).map((_, idx) => (
                <VideoCardSkeleton key={`history-skel-${idx}`} />
              ))}
            </VideoGrid>
          );
        }
        if (historyError) {
          return (
            <ErrorState
              title="Query Error"
              description="Failed to load watch history feed."
              onRetry={refetchHistory}
            />
          );
        }
        if (!historyData?.docs || historyData.docs.length === 0) {
          return (
            <EmptyState
              title="History Empty"
              description="Your watch history list is currently empty."
            />
          );
        }
        return (
          <>
            <VideoGrid>
              {historyData.docs.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </VideoGrid>
            <Pagination
              currentPage={historyPage}
              totalPages={historyData.totalPages}
              onPageChange={setHistoryPage}
            />
          </>
        );

      case "continue-watching":
        if (!isOwnProfile) return null;
        if (continueWatchingLoading) {
          return (
            <VideoGrid>
              {Array.from({ length: 4 }).map((_, idx) => (
                <VideoCardSkeleton key={`continue-skel-${idx}`} />
              ))}
            </VideoGrid>
          );
        }
        if (continueWatchingError) {
          return (
            <ErrorState
              title="Query Error"
              description="Failed to load continue watching feed."
              onRetry={refetchContinueWatching}
            />
          );
        }
        if (!continueWatchingVideos || continueWatchingVideos.length === 0) {
          return (
            <EmptyState
              title="All Caught Up!"
              description="No incomplete video sessions found. Start watching some videos!"
            />
          );
        }
        return (
          <VideoGrid>
            {continueWatchingVideos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </VideoGrid>
        );

      case "playlists":
        return (
          <EmptyState
            title="No Playlists Configured"
            description="Playlists features will be enabled in subsequent phase releases."
          />
        );

      case "about":
      default:
        return (
          <div className="rounded-xl border border-slate-800/40 bg-slate-900/10 p-6 max-w-xl text-left">
            <h3 className="text-sm font-semibold text-slate-100 mb-2">About Channel</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Welcome to the workspace of {channel.fullname}. Streamify enterprise members distribute instructionals, media cards, and system reports here.
            </p>
            <div className="border-t border-slate-800/60 pt-4 mt-4 flex items-center gap-2 text-xs text-slate-400">
              <Mail size={14} className="text-slate-500" />
              <span>Contact: {channel.email}</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col w-full animate-fade-in text-slate-100 select-none">
      {/* Cover Banner */}
      <div className="w-full h-[180px] md:h-[260px] relative bg-slate-900 overflow-hidden border-b border-slate-800/60">
        {channel.coverImage ? (
          <img src={channel.coverImage} alt="Cover Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-brand-cyan/10 to-brand-indigo/10" />
        )}
      </div>

      {/* Profile Row Detail */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-6 px-6 md:px-12 -mt-12 relative z-10">
        <div className="relative w-24 h-24 rounded-full border-4 border-dark-base bg-dark-base shadow-xl flex-shrink-0">
          <Avatar src={channel.avatar} name={channel.fullname} size="xl" className="w-full h-full" />
        </div>

        <div className="flex flex-col flex-grow pb-2 text-left">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start w-full">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-100">{channel.fullname}</h1>
              <p className="text-xs text-slate-400 mt-0.5">@{channel.username}</p>
            </div>

            {isOwnProfile ? (
              <Link to="/settings">
                <Button variant="outline" size="sm" className="gap-1.5 rounded-full">
                  <Settings size={14} />
                  <span>Edit Profile</span>
                </Button>
              </Link>
            ) : (
              <Button
                variant={isSubscribed ? "outline" : "solid"}
                size="sm"
                className="rounded-full"
                onClick={() => toggleSubscription()}
                isLoading={isSubscribing}
              >
                {isSubscribed ? "Subscribed" : "Subscribe"}
              </Button>
            )}
          </div>

          <div className="flex gap-4 mt-3 flex-wrap">
            <div 
              className="flex items-center gap-1 text-[11px] text-slate-400 cursor-pointer hover:text-brand-cyan transition-colors"
              onClick={() => setSubscribersModalOpen(true)}
            >
              <Users size={12} className="text-slate-500" />
              <span>
                <strong>{formatNumber(displaySubscribersCount)}</strong> Subscribers
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Users size={12} className="text-slate-500" />
              <span>
                <strong>{formatNumber(channel.channelsSubscribedToCount)}</strong> Subscribed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs list menu */}
      <div className="flex border-b border-slate-800/80 mt-8 px-6 md:px-12 overflow-x-auto scrollbar-none whitespace-nowrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-5 py-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? "border-brand-cyan text-brand-cyan"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
            onClick={() => {
              setActiveTab(tab.id);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tabs Content panel */}
      <div className="p-6 md:p-12">{renderTabContent()}</div>

      {/* Subscriber List Modal */}
      <SubscriberListModal 
        isOpen={subscribersModalOpen} 
        onClose={() => setSubscribersModalOpen(false)} 
        channelId={channel?._id} 
      />
    </div>
  );
};

export default ChannelPage;
