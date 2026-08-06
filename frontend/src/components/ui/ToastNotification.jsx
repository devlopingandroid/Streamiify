import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X, Loader2 } from "lucide-react";

/**
 * Custom Toast Component for react-hot-toast.
 * Implements high-contrast semantic design tokens:
 * - Error: BG #FEE2E2, Border #EF4444, Title #991B1B, Body #7F1D1D
 * - Success: BG #DCFCE7, Border #22C55E, Title #166534, Body #166534
 * - Warning: BG #FEF3C7, Border #F59E0B, Title #92400E, Body #78350F
 * - Info: BG #DBEAFE, Border #3B82F6, Title #1E3A8A, Body #1E40AF
 */
export const ToastNotification = ({ t }) => {
  const duration = t.duration || 5000;
  const isInfinite = duration === Infinity;

  // Determine toast type
  let type = t.type;
  if (t.opts?.type) {
    type = t.opts.type;
  }

  // Parse message content (supports object { title, body } or string)
  let title = "";
  let body = "";

  if (typeof t.message === "object" && t.message !== null && !React.isValidElement(t.message)) {
    title = t.message.title || "";
    body = t.message.body || t.message.message || "";
  } else if (typeof t.message === "string") {
    if (t.message.includes("\n")) {
      const parts = t.message.split("\n");
      title = parts[0];
      body = parts.slice(1).join(" ");
    } else {
      body = t.message;
    }
  } else {
    body = t.message;
  }

  // Default title fallback based on type if title is empty
  if (!title) {
    switch (type) {
      case "error":
        title = "Error";
        break;
      case "success":
        title = "Success";
        break;
      case "warning":
        title = "Warning";
        break;
      case "info":
        title = "Information";
        break;
      case "loading":
        title = "Loading";
        break;
      default:
        title = "Notification";
        break;
    }
  }

  // Styles per type
  const getTypeStyles = () => {
    switch (type) {
      case "error":
        return {
          bg: "#FEE2E2",
          border: "#EF4444",
          titleColor: "#991B1B",
          bodyColor: "#7F1D1D",
          progressBg: "#EF4444",
          iconBg: "#EF4444",
          iconColor: "#FFFFFF",
          IconComponent: AlertCircle,
          closeHover: "hover:bg-red-200/60 text-red-900",
        };
      case "success":
        return {
          bg: "#DCFCE7",
          border: "#22C55E",
          titleColor: "#166534",
          bodyColor: "#166534",
          progressBg: "#22C55E",
          iconBg: "#22C55E",
          iconColor: "#FFFFFF",
          IconComponent: CheckCircle2,
          closeHover: "hover:bg-emerald-200/60 text-emerald-900",
        };
      case "warning":
        return {
          bg: "#FEF3C7",
          border: "#F59E0B",
          titleColor: "#92400E",
          bodyColor: "#78350F",
          progressBg: "#F59E0B",
          iconBg: "#F59E0B",
          iconColor: "#FFFFFF",
          IconComponent: AlertTriangle,
          closeHover: "hover:bg-amber-200/60 text-amber-900",
        };
      case "info":
        return {
          bg: "#DBEAFE",
          border: "#3B82F6",
          titleColor: "#1E3A8A",
          bodyColor: "#1E40AF",
          progressBg: "#3B82F6",
          iconBg: "#3B82F6",
          iconColor: "#FFFFFF",
          IconComponent: Info,
          closeHover: "hover:bg-blue-200/60 text-blue-900",
        };
      case "loading":
        return {
          bg: "#F1F5F9",
          border: "#94A3B8",
          titleColor: "#0F172A",
          bodyColor: "#334155",
          progressBg: "#64748B",
          iconBg: "#64748B",
          iconColor: "#FFFFFF",
          IconComponent: Loader2,
          isSpinningIcon: true,
          closeHover: "hover:bg-slate-200/60 text-slate-800",
        };
      default:
        return {
          bg: "#DBEAFE",
          border: "#3B82F6",
          titleColor: "#1E3A8A",
          bodyColor: "#1E40AF",
          progressBg: "#3B82F6",
          iconBg: "#3B82F6",
          iconColor: "#FFFFFF",
          IconComponent: Info,
          closeHover: "hover:bg-blue-200/60 text-blue-900",
        };
    }
  };

  const styles = getTypeStyles();
  const IconComponent = styles.IconComponent;

  return (
    <AnimatePresence>
      {t.visible && (
        <motion.div
          initial={{ opacity: 0, x: 60, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 60, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          style={{
            backgroundColor: styles.bg,
            borderColor: styles.border,
            borderRadius: "14px",
          }}
          className="relative flex flex-col w-[360px] max-w-[calc(100vw-32px)] border overflow-hidden shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] select-none z-[99999]"
          role="alert"
          aria-live="assertive"
        >
          {/* Main Content Area */}
          <div className="flex items-start gap-3 p-4 pr-9">
            {/* Left Icon: Red/Green/Amber/Blue circle with icon */}
            <div
              style={{ backgroundColor: styles.iconBg, color: styles.iconColor }}
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-xs mt-0.5"
            >
              <IconComponent
                size={18}
                className={styles.isSpinningIcon ? "animate-spin" : "stroke-[2.5]"}
              />
            </div>

            {/* Middle Text: Title and Body */}
            <div className="flex flex-col flex-grow text-left leading-tight gap-1">
              <span
                style={{ color: styles.titleColor }}
                className="text-sm font-bold tracking-tight"
              >
                {title}
              </span>
              {body && (
                <span
                  style={{ color: styles.bodyColor }}
                  className="text-xs font-medium leading-relaxed break-words"
                >
                  {body}
                </span>
              )}
            </div>

            {/* Right Close Button */}
            <button
              type="button"
              onClick={() => toast.dismiss(t.id)}
              className={`absolute top-3 right-3 p-1 rounded-lg transition-colors cursor-pointer ${styles.closeHover}`}
              aria-label="Close notification"
            >
              <X size={16} className="stroke-[2.5]" />
            </button>
          </div>

          {/* Bottom Progress Bar for Auto Dismiss */}
          {!isInfinite && type !== "loading" && (
            <div className="w-full h-[3px] bg-black/5 overflow-hidden">
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: duration / 1000, ease: "linear" }}
                style={{ backgroundColor: styles.progressBg }}
                className="h-full"
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ToastNotification;
