import { toast as hotToast } from "react-hot-toast";

/**
 * Production-grade notification helper wrapping react-hot-toast.
 * Provides custom type routing for error, success, warning, info, and loading toasts.
 */
export const toast = (message, opts = {}) => {
  return hotToast(message, { ...opts, duration: opts.duration || 5000 });
};

toast.error = (message, opts = {}) => {
  return hotToast.error(message, { ...opts, duration: opts.duration || 5000, opts: { ...opts, type: "error" } });
};

toast.success = (message, opts = {}) => {
  return hotToast.success(message, { ...opts, duration: opts.duration || 5000, opts: { ...opts, type: "success" } });
};

toast.warning = (message, opts = {}) => {
  return hotToast(message, { ...opts, duration: opts.duration || 5000, opts: { ...opts, type: "warning" } });
};

toast.info = (message, opts = {}) => {
  return hotToast(message, { ...opts, duration: opts.duration || 5000, opts: { ...opts, type: "info" } });
};

toast.loading = (message, opts = {}) => {
  return hotToast.loading(message, { ...opts, opts: { ...opts, type: "loading" } });
};

toast.dismiss = (toastId) => {
  return hotToast.dismiss(toastId);
};

toast.remove = (toastId) => {
  return hotToast.remove(toastId);
};

toast.custom = (jsx, opts = {}) => {
  return hotToast.custom(jsx, opts);
};

toast.promise = (promise, msgs, opts) => {
  return hotToast.promise(promise, msgs, opts);
};

export default toast;
