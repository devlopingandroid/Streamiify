import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { 
  useNotifications, 
  useUnreadNotifications, 
  useMarkAllNotificationsRead, 
  useClearNotifications 
} from "../hooks/useNotifications";
import { NotificationItem } from "../components/notification/NotificationItem";
import { NotificationSkeleton } from "../components/notification/NotificationSkeleton";
import { NotificationEmpty } from "../components/notification/NotificationEmpty";
import { ErrorState } from "../components/ui/ErrorState";
import { Button } from "../components/ui/Button";

export const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  
  // All Notifications Query (Paginated/Infinite)
  const {
    data: allData,
    isLoading: isAllLoading,
    isError: isAllError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch: refetchAll,
  } = useNotifications(15);

  // Unread Notifications Query (Static Array)
  const {
    data: unreadNotifications = [],
    isLoading: isUnreadLoading,
    isError: isUnreadError,
    refetch: refetchUnread,
  } = useUnreadNotifications();

  const markAllReadMutation = useMarkAllNotificationsRead();
  const clearNotificationsMutation = useClearNotifications();

  const observerTarget = useRef(null);

  // Infinite scroll intersection observer setup
  useEffect(() => {
    const target = observerTarget.current;
    if (!target || !hasNextPage || activeTab !== "all") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, activeTab]);

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  const handleClearAll = () => {
    clearNotificationsMutation.mutate();
  };

  const handleRetry = () => {
    if (activeTab === "all") refetchAll();
    else refetchUnread();
  };

  const isError = activeTab === "all" ? isAllError : isUnreadError;
  const isLoading = activeTab === "all" ? isAllLoading : isUnreadLoading;

  if (isError) {
    return (
      <div className="p-6 md:p-8">
        <ErrorState
          title="Notification Retreival Failure"
          description="Failed to establish a handshake with the notification server."
          onRetry={handleRetry}
        />
      </div>
    );
  }

  // Flatten notifications if "All" is active, otherwise use direct unread list
  const allNotifications = allData?.pages?.flatMap((page) => page?.notifications || (Array.isArray(page) ? page : [])) || [];
  const displayNotifications = activeTab === "all" ? allNotifications : unreadNotifications;
  
  const hasUnread = Array.isArray(unreadNotifications) && unreadNotifications.length > 0;
  const hasAny = allNotifications.length > 0;

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 text-slate-900 dark:text-slate-100 select-none animate-fade-in max-w-[800px] mx-auto">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800/60">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bell size={20} className="text-slate-700 dark:text-slate-400" />
            <span>Alerts & Notifications</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Stay updated with channel activity, comments, and likes.</p>
        </div>

        {/* Global batch actions */}
        {hasAny && (
          <div className="flex items-center gap-2.5">
            {hasUnread && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-full border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-xs"
                onClick={handleMarkAllRead}
                disabled={markAllReadMutation.isPending}
              >
                <Check size={13} className="text-slate-700 dark:text-slate-300" />
                <span>Mark all read</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-red-300 dark:border-red-500/30 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full text-xs font-semibold shadow-xs"
              onClick={handleClearAll}
              disabled={clearNotificationsMutation.isPending}
            >
              <Trash2 size={13} />
              <span>Clear all</span>
            </Button>
          </div>
        )}
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center gap-1.5 bg-slate-200/80 dark:bg-slate-900/60 border border-slate-300/80 dark:border-slate-800/80 p-1 rounded-xl self-start">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
            activeTab === "all"
              ? "bg-slate-900 text-white dark:bg-slate-800 dark:text-cyan-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab("unread")}
          className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
            activeTab === "unread"
              ? "bg-slate-900 text-white dark:bg-slate-800 dark:text-cyan-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <span>Unread</span>
          {hasUnread && (
            <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-xs" />
          )}
        </button>
      </div>

      {/* Notifications List Panel */}
      {isLoading ? (
        <NotificationSkeleton />
      ) : displayNotifications.length === 0 ? (
        <NotificationEmpty />
      ) : (
        <div className="flex flex-col gap-3">
          {displayNotifications.map((notification) => (
            <NotificationItem key={notification._id} notification={notification} />
          ))}

          {/* Skeletons on loading next page */}
          {activeTab === "all" && isFetchingNextPage && (
            <NotificationSkeleton />
          )}

          {/* Intersection Observer anchor */}
          {activeTab === "all" && (
            <div ref={observerTarget} className="h-10 w-full flex items-center justify-center text-xs font-medium text-slate-500 dark:text-slate-400">
              {isFetchingNextPage && "Loading more alerts..."}
              {!hasNextPage && allNotifications.length > 0 && "You've read all alerts!"}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default NotificationsPage;
