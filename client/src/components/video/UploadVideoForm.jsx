import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UploadCloud, X, Film, Image as ImageIcon } from "lucide-react";
import { InputField } from "../ui/InputField";
import { Button } from "../ui/Button";
import { useUploadVideo } from "../../hooks/useUploadVideo";

// Validations matching backend constraints
const uploadSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be at most 100 characters"),
  description: z
    .string()
    .max(5000, "Description must be at most 5000 characters")
    .optional()
    .or(z.literal("")),
  videoFile: z
    .any()
    .refine((files) => files && files.length > 0, "Video file is required")
    .refine(
      (files) =>
        files &&
        files[0] &&
        ["video/mp4", "video/webm", "video/quicktime"].includes(files[0].type),
      "Acceptable video formats: .mp4, .webm, .mov"
    ),
  thumbnail: z
    .any()
    .refine((files) => files && files.length > 0, "Thumbnail is required")
    .refine(
      (files) =>
        files &&
        files[0] &&
        ["image/jpeg", "image/png", "image/webp"].includes(files[0].type),
      "Acceptable image formats: .jpg, .jpeg, .png, .webp"
    ),
});

export const UploadVideoForm = () => {
  const uploadMutation = useUploadVideo();
  const { isPending, uploadProgress } = uploadMutation;

  // Form setup
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      description: "",
      videoFile: null,
      thumbnail: null,
    },
  });

  // Watch fields for display / previews
  const videoFile = watch("videoFile");
  const thumbnailFile = watch("thumbnail");

  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  // Manage thumbnail object URL preview and cleanup
  useEffect(() => {
    if (thumbnailFile && thumbnailFile[0]) {
      const file = thumbnailFile[0];
      const objectUrl = URL.createObjectURL(file);
      setThumbnailPreview(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    } else {
      setThumbnailPreview(null);
    }
  }, [thumbnailFile]);

  const selectedVideoName = videoFile && videoFile[0] ? videoFile[0].name : null;
  const selectedVideoSize = videoFile && videoFile[0] ? (videoFile[0].size / (1024 * 1024)).toFixed(1) : null;

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description || "");
    formData.append("videoFile", data.videoFile[0]);
    formData.append("thumbnail", data.thumbnail[0]);

    uploadMutation.mutate(formData, {
      onSuccess: () => {
        reset();
      },
    });
  };

  const handleVideoDrop = (e) => {
    e.preventDefault();
    if (isPending) return;
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setValue("videoFile", files, { shouldValidate: true });
    }
  };

  const handleThumbnailDrop = (e) => {
    e.preventDefault();
    if (isPending) return;
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setValue("thumbnail", files, { shouldValidate: true });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 w-full text-left">
      {/* Video File Area */}
      <div className="flex flex-col gap-1.5 w-full">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Video File (Required)</span>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleVideoDrop}
          className={`w-full min-h-[120px] rounded-xl border border-dashed flex flex-col items-center justify-center p-4 transition-colors select-none ${
            errors.videoFile ? "border-red-500 bg-red-500/5" : "border-slate-800 bg-slate-900/10 hover:border-slate-700"
          }`}
        >
          {selectedVideoName ? (
            <div className="flex items-center gap-4 w-full">
              <div className="w-12 h-12 rounded bg-slate-800 flex items-center justify-center text-brand-cyan">
                <Film size={24} />
              </div>
              <div className="flex flex-col flex-grow min-w-0">
                <span className="text-xs font-semibold text-slate-200 truncate">{selectedVideoName}</span>
                <span className="text-[10px] text-slate-500">{selectedVideoSize} MB</span>
              </div>
              <button
                type="button"
                onClick={() => setValue("videoFile", null, { shouldValidate: true })}
                className="text-slate-500 hover:text-slate-200 cursor-pointer"
                disabled={isPending}
                aria-label="Remove video file"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center gap-1.5 cursor-pointer w-full text-center py-2">
              <UploadCloud size={28} className="text-slate-500" />
              <span className="text-xs text-slate-300">Drag & drop video or <span className="text-brand-cyan hover:underline">browse</span></span>
              <span className="text-[10px] text-slate-500">MP4, WebM, or MOV formats</span>
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={(e) => setValue("videoFile", e.target.files, { shouldValidate: true })}
                disabled={isPending}
                className="hidden"
              />
            </label>
          )}
        </div>
        {errors.videoFile && <span className="text-xs text-red-500" role="alert">{errors.videoFile.message}</span>}
      </div>

      {/* Thumbnail Area */}
      <div className="flex flex-col gap-1.5 w-full">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Thumbnail Image (Required)</span>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleThumbnailDrop}
          className={`w-full min-h-[120px] rounded-xl border border-dashed flex flex-col items-center justify-center p-4 transition-colors select-none ${
            errors.thumbnail ? "border-red-500 bg-red-500/5" : "border-slate-800 bg-slate-900/10 hover:border-slate-700"
          }`}
        >
          {thumbnailPreview ? (
            <div className="flex items-center gap-4 w-full">
              <img
                src={thumbnailPreview}
                alt="Thumbnail Preview"
                className="w-20 h-12 rounded object-cover border border-slate-800"
              />
              <div className="flex flex-col flex-grow min-w-0">
                <span className="text-xs font-semibold text-slate-200 truncate">{thumbnailFile[0]?.name}</span>
                <span className="text-[10px] text-slate-500">
                  {(thumbnailFile[0]?.size / 1024).toFixed(1)} KB
                </span>
              </div>
              <button
                type="button"
                onClick={() => setValue("thumbnail", null, { shouldValidate: true })}
                className="text-slate-500 hover:text-slate-200 cursor-pointer"
                disabled={isPending}
                aria-label="Remove thumbnail file"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center gap-1.5 cursor-pointer w-full text-center py-2">
              <ImageIcon size={28} className="text-slate-500" />
              <span className="text-xs text-slate-300">Drag & drop thumbnail or <span className="text-brand-cyan hover:underline">browse</span></span>
              <span className="text-[10px] text-slate-500">JPG, PNG, or WebP formats</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setValue("thumbnail", e.target.files, { shouldValidate: true })}
                disabled={isPending}
                className="hidden"
              />
            </label>
          )}
        </div>
        {errors.thumbnail && <span className="text-xs text-red-500" role="alert">{errors.thumbnail.message}</span>}
      </div>

      {/* Title Field */}
      <InputField
        label="Video Title"
        type="text"
        placeholder="Enter video title"
        error={errors.title?.message}
        disabled={isPending}
        {...register("title")}
        aria-label="Video Title Input"
      />

      {/* Description Field */}
      <div className="flex flex-col gap-1.5 w-full">
        <label htmlFor="video-description" className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          Description
        </label>
        <textarea
          id="video-description"
          rows={4}
          disabled={isPending}
          placeholder="Write a description for your video..."
          className={`w-full bg-slate-900 border text-slate-100 rounded-lg px-4 py-2 text-sm transition-all duration-150 focus:outline-none focus:border-brand-cyan focus:shadow-[0_0_10px_rgba(6,182,212,0.15)] resize-none ${
            errors.description ? "border-red-500 focus:border-red-500 focus:shadow-[0_0_10px_rgba(239,68,68,0.15)]" : "border-slate-800"
          }`}
          {...register("description")}
        />
        {errors.description && (
          <span className="text-xs text-red-500" role="alert">
            {errors.description.message}
          </span>
        )}
      </div>

      {/* Upload Progress Bar */}
      {isPending && (
        <div className="w-full flex flex-col gap-1.5 my-1">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-400">Uploading Video File...</span>
            <span className="text-brand-cyan">{uploadProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-cyan to-brand-indigo transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        isLoading={isPending}
        className="w-full mt-2"
        aria-label="Publish Video"
        disabled={isPending}
      >
        Publish Video
      </Button>
    </form>
  );
};

export default UploadVideoForm;
