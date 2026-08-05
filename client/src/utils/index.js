import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes dynamically with priority resolution.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a Date object or ISO string into a human-readable format.
 */
export function formatDate(dateInput, format = "standard") {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";

  if (format === "compact") {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "2-digit",
    });
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Formats numbers into shorthand annotations (e.g., 1.2M, 4.5K).
 */
export function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return "0";
  
  const absNum = Math.abs(num);
  
  if (absNum >= 1e9) {
    return `${(num / 1e9).toFixed(1).replace(/\.0$/, "")}B`;
  }
  if (absNum >= 1e6) {
    return `${(num / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (absNum >= 1e3) {
    return `${(num / 1e3).toFixed(1).replace(/\.0$/, "")}K`;
  }
  
  return String(num);
}

/**
 * Truncates text length with an ellipsis.
 */
export function truncateText(text, maxLength = 100) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Formats duration in seconds to standard time format HH:MM:SS or MM:SS
 */
export function formatDuration(seconds) {
  if (isNaN(seconds) || seconds === null || seconds === undefined) return "0:00";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const pad = (num) => String(num).padStart(2, "0");

  if (hrs > 0) {
    return `${hrs}:${pad(mins)}:${pad(secs)}`;
  }
  return `${mins}:${pad(secs)}`;
}

/**
 * Calculates and formats a relative time representation (e.g. "2 hours ago")
 */
export function formatTimeAgo(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
}
