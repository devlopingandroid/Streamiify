import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSubscriptions, useSubscription } from "../hooks/useUserFeatures";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { PageLoader } from "../components/ui/PageLoader";
import { UserCheck, Search, PlaySquare } from "lucide-react";
import { formatNumber } from "../utils";

const SubscribedChannelItem = ({ channel }) => {
  const {
    subscribed,
    toggleSubscription,
    isToggling,
  } = useSubscription(channel._id);

  return (
    <div 
      className="flex items-center gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/10 hover:border-slate-700/60 hover:bg-slate-900/20 transition-all select-none"
    >
      <Link to={`/c/${channel.username}`} className="flex-shrink-0">
        <Avatar src={channel.avatar} name={channel.fullname} size="lg" />
      </Link>
      <div className="flex flex-col min-w-0 flex-grow text-left">
        <Link 
          to={`/c/${channel.username}`} 
          className="text-xs font-bold text-slate-200 truncate hover:text-brand-cyan transition-colors"
        >
          {channel.fullname}
        </Link>
        <span className="text-[10px] text-slate-500 truncate">@{channel.username}</span>
        <span className="text-[10px] text-brand-cyan font-medium mt-1">
          {formatNumber(channel.subscribersCount)} subscribers
        </span>
      </div>
      <Button 
        variant={subscribed ? "outline" : "solid"} 
        size="sm" 
        className="rounded-full flex-shrink-0"
        onClick={() => toggleSubscription()}
        isLoading={isToggling}
      >
        {subscribed ? "Subscribed" : "Subscribe"}
      </Button>
    </div>
  );
};

export const SubscriptionsPage = () => {
  const { data: channels, isLoading, error, refetch } = useSubscriptions();
  const [searchQuery, setSearchQuery] = useState("");

  if (isLoading) {
    return <PageLoader message="Fetching your subscription channel catalog..." />;
  }

  if (error) {
    return (
      <div className="p-6 md:p-8">
        <ErrorState 
          title="Subscriptions Handshake Failure"
          description="We had trouble retrieving your subscription channel catalog."
          onRetry={refetch}
        />
      </div>
    );
  }

  const hasChannels = channels && channels.length > 0;

  const filteredChannels = channels?.filter((channel) => 
    channel.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    channel.username.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="p-6 md:p-8 flex flex-col gap-8 text-slate-100 select-none animate-fade-in max-w-[1200px] mx-auto">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <UserCheck size={20} className="text-slate-400" />
            <span>My Subscriptions</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Explore channels you follow and manage your subscriptions.</p>
        </div>
        <Link to="/feed/subscriptions" className="flex-shrink-0">
          <Button variant="solid" size="sm" className="rounded-full gap-1.5">
            <PlaySquare size={14} />
            <span>View Subscriptions Feed</span>
          </Button>
        </Link>
      </div>

      {!hasChannels ? (
        <EmptyState 
          title="No Active Subscriptions"
          description="Follow creators to see their stream uploads and channels listed here."
        />
      ) : (
        <div className="flex flex-col gap-6">
          {/* Search Filter input */}
          <div className="flex items-center w-full max-w-[360px] bg-slate-900/60 border border-slate-800 focus-within:border-brand-cyan rounded-full px-3.5 py-1.5 transition-all select-none">
            <Search size={14} className="text-slate-500 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search subscribed channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-slate-100 w-full focus:outline-none placeholder-slate-500"
              aria-label="Filter subscribed channels"
            />
          </div>

          {/* Subscribed Channels Grid */}
          <section className="mt-2">
            {filteredChannels.length === 0 ? (
              <span className="text-xs text-slate-500 italic">No channels match your search query.</span>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredChannels.map((channel) => (
                  <SubscribedChannelItem key={channel._id} channel={channel} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

    </div>
  );
};

export default SubscriptionsPage;
