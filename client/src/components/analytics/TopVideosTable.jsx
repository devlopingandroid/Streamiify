import React, { useState, useMemo, memo } from "react";
import { ChevronUp, ChevronDown, Flame } from "lucide-react";
import { ChartContainer } from "./ChartContainer";

export const TopVideosTable = memo(({
  data,
  isLoading = false,
  isError = false,
  onRetry,
}) => {
  const [sortColumn, setSortColumn] = useState("views");
  const [sortDirection, setSortDirection] = useState("desc");

  // Normalize list from API payload
  const videos = useMemo(() => {
    return Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : [];
  }, [data]);

  // Headers config
  const headers = [
    { label: "Video", key: "title", sortable: false },
    { label: "Views", key: "views", sortable: true },
    { label: "Likes", key: "likes", sortable: true },
    { label: "Comments", key: "comments", sortable: true },
    { label: "Watch Time", key: "watchTime", sortable: true },
    { label: "Engagement", key: "engagementRate", sortable: true },
  ];

  const handleSort = (key) => {
    if (sortColumn === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(key);
      setSortDirection("desc");
    }
  };

  // Safe sorting mapping
  const sortedVideos = useMemo(() => {
    if (!videos.length) return [];
    
    return [...videos].sort((a, b) => {
      let valA = a[sortColumn];
      let valB = b[sortColumn];

      // Handle camelCase vs snake_case aliases
      if (sortColumn === "watchTime") {
        valA = a.watchTime !== undefined ? a.watchTime : (a.watch_time || 0);
        valB = b.watchTime !== undefined ? b.watchTime : (b.watch_time || 0);
      } else if (sortColumn === "engagementRate") {
        const rateA = a.engagementRate !== undefined ? a.engagementRate : (a.engagement_rate || 0);
        const rateB = b.engagementRate !== undefined ? b.engagementRate : (b.engagement_rate || 0);
        valA = parseFloat(String(rateA).replace("%", ""));
        valB = parseFloat(String(rateB).replace("%", ""));
      }

      // Safe checks for numbers
      const numA = Number(valA);
      const numB = Number(valB);

      if (!isNaN(numA) && !isNaN(numB)) {
        return sortDirection === "asc" ? numA - numB : numB - numA;
      }

      // String fallback
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      if (strA < strB) return sortDirection === "asc" ? -1 : 1;
      if (strA > strB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [videos, sortColumn, sortDirection]);

  const handleHeaderKeyDown = (e, key, sortable) => {
    if (!sortable) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSort(key);
    }
  };

  const isEmpty = videos.length === 0;

  return (
    <ChartContainer
      title="Top Performing Videos"
      subtitle="Highest metrics and audience retention streams"
      isLoading={isLoading}
      isError={isError}
      isEmpty={isEmpty}
      onRetry={onRetry}
      className="lg:col-span-3 min-h-[420px]"
    >
      <div className="w-full h-full overflow-x-auto custom-scrollbar" tabIndex={0} aria-label="Top performing streams table container">
        <table className="w-full text-left border-collapse text-xs select-none">
          <thead>
            <tr className="border-b border-slate-800/80 text-slate-500 uppercase tracking-wider font-semibold">
              {headers.map((hdr) => (
                <th
                  key={hdr.key}
                  scope="col"
                  tabIndex={hdr.sortable ? 0 : -1}
                  onClick={() => hdr.sortable && handleSort(hdr.key)}
                  onKeyDown={(e) => handleHeaderKeyDown(e, hdr.key, hdr.sortable)}
                  className={`py-3 px-4 first:pl-0 last:pr-0 select-none ${
                    hdr.sortable
                      ? "cursor-pointer hover:text-slate-300 transition-colors focus-visible:ring-1 focus-visible:ring-brand-cyan outline-none"
                      : ""
                  }`}
                  aria-sort={
                    sortColumn === hdr.key
                      ? sortDirection === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <div className="flex items-center gap-1">
                    <span>{hdr.label}</span>
                    {hdr.sortable && sortColumn === hdr.key && (
                      <span className="text-brand-cyan" aria-hidden="true">
                        {sortDirection === "asc" ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40 text-slate-300 font-medium">
            {sortedVideos.map((video, idx) => {
              const videoId = video._id || video.id || `row-${idx}`;
              const videoTitle = video.title || "Untitled stream";
              const videoThumb = video.thumbnail || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=120&auto=format&fit=crop";
              const viewsCount = video.views !== undefined ? video.views : 0;
              const likesCount = video.likes !== undefined ? video.likes : 0;
              const commentsCount = video.comments !== undefined ? video.comments : 0;
              const watchHours = video.watchTime !== undefined ? video.watchTime : (video.watch_time || 0);
              const engagement = video.engagementRate !== undefined ? video.engagementRate : (video.engagement_rate || "0.0%");

              return (
                <tr
                  key={videoId}
                  className="hover:bg-slate-900/35 transition-colors group"
                >
                  {/* Thumbnail & Title Column */}
                  <td className="py-3 px-4 first:pl-0 max-w-[280px]">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-10 rounded-lg overflow-hidden border border-slate-800/80 bg-slate-950 flex-shrink-0 group-hover:border-slate-700/60 transition-colors relative">
                        <img
                          src={videoThumb}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {idx < 3 && (
                          <div className="absolute top-0.5 left-0.5 bg-brand-cyan/90 text-slate-950 rounded p-0.5 flex items-center justify-center" title="Top Performer">
                            <Flame size={10} className="fill-current" />
                          </div>
                        )}
                      </div>
                      <span
                        className="font-semibold text-slate-200 line-clamp-2 truncate max-w-[180px] group-hover:text-brand-cyan transition-colors"
                        title={videoTitle}
                      >
                        {videoTitle}
                      </span>
                    </div>
                  </td>
                  {/* Stats columns */}
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {viewsCount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {likesCount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {commentsCount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {Number(watchHours).toLocaleString()} hrs
                  </td>
                  <td className="py-3 px-4 font-mono text-brand-cyan font-bold">
                    {typeof engagement === "number" ? `${engagement.toFixed(1)}%` : engagement}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ChartContainer>
  );
});

TopVideosTable.displayName = "TopVideosTable";

export default TopVideosTable;
