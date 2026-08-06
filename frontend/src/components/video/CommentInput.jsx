import React, { useState, useEffect, useRef } from "react";
import { Button } from "../ui/Button";

export const CommentInput = ({
  initialValue = "",
  placeholder = "Add a public comment...",
  submitLabel = "Comment",
  onSubmit,
  onCancel,
  isLoading = false,
  autoFocus = false,
}) => {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef(null);

  // Auto focus input if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim() || isLoading) return;
    onSubmit(value);
    setValue("");
  };

  const handleCancel = () => {
    setValue(initialValue);
    if (onCancel) onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full text-left">
      <textarea
        ref={inputRef}
        rows={2}
        placeholder={placeholder}
        disabled={isLoading}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full bg-slate-900/60 border border-slate-800 focus:border-brand-cyan focus:shadow-[0_0_10px_rgba(6,182,212,0.1)] text-slate-100 placeholder-slate-500 rounded-lg px-4 py-2.5 text-xs transition-all duration-150 focus:outline-none resize-none"
      />

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={isLoading}
            className="rounded-full px-4"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="solid"
          size="sm"
          disabled={!value.trim() || isLoading}
          isLoading={isLoading}
          className="rounded-full px-4 font-semibold text-[11px]"
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default CommentInput;
