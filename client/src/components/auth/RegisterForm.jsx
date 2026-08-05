import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRegister } from "../../hooks/useAuth";
import { toast } from "react-hot-toast";
import { InputField } from "../ui/InputField";
import { Button } from "../ui/Button";
import { UploadCloud, X } from "lucide-react";

// Production-grade Zod password strength schema
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

const registerSchema = z
  .object({
    fullname: z.string().min(1, "Full name is required"),
    username: z
      .string()
      .min(1, "Username is required")
      .refine((val) => !val.includes(" "), "Username cannot contain spaces"),
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const RegisterForm = () => {
  const navigate = useNavigate();
  const registerMutation = useRegister();

  // File States
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarError, setAvatarError] = useState("");

  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [coverError, setCoverError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullname: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const watchedPassword = watch("password", "");

  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (!pwd) return score;
    if (pwd.length >= 8) score += 25;
    if (/[A-Z]/.test(pwd)) score += 25;
    if (/[0-9]/.test(pwd)) score += 25;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 25;
    return score;
  };

  const strengthScore = getPasswordStrength(watchedPassword);

  const getStrengthLabel = (score) => {
    if (score === 0) return { label: "", color: "bg-transparent", text: "text-transparent" };
    if (score <= 25) return { label: "Weak", color: "bg-red-500", text: "text-red-500" };
    if (score <= 50) return { label: "Fair", color: "bg-amber-500", text: "text-amber-500" };
    if (score <= 75) return { label: "Good", color: "bg-cyan-600", text: "text-cyan-600" };
    return { label: "Strong", color: "bg-emerald-600", text: "text-emerald-600" };
  };

  const strengthMeta = getStrengthLabel(strengthScore);

  const validateFile = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      return "File size must be less than 5MB";
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return "Only JPG, PNG, and WebP formats are supported";
    }
    return "";
  };

  const handleAvatarChange = (file) => {
    if (!file) return;
    const errorMsg = validateFile(file);
    if (errorMsg) {
      setAvatarError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarError("");
  };

  const handleCoverChange = (file) => {
    if (!file) return;
    const errorMsg = validateFile(file);
    if (errorMsg) {
      setCoverError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    setCoverImage(file);
    setCoverImagePreview(URL.createObjectURL(file));
    setCoverError("");
  };

  const onSubmit = async (data) => {
    if (!avatar) {
      setAvatarError("Avatar image is required");
      toast.error("Avatar image is required");
      return;
    }

    const formData = new FormData();
    formData.append("fullname", data.fullname);
    formData.append("username", data.username.toLowerCase());
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("avatar", avatar);
    
    if (coverImage) {
      formData.append("coverImage", coverImage);
    }

    registerMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("Account created successfully! Please verify your email address.");
        navigate("/verify-email-pending", { state: { email: data.email } });
      },
      onError: (err) => {
        toast.error(err?.message || "Registration failed. Please check inputs.");
      },
    });
  };

  const isPending = registerMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full text-left">
      <InputField
        label="Full Name"
        type="text"
        placeholder="Enter your first and last name"
        error={errors.fullname?.message}
        disabled={isPending}
        {...register("fullname")}
        aria-label="Full Name input"
      />

      <InputField
        label="Username"
        type="text"
        placeholder="Choose username (no spaces)"
        error={errors.username?.message}
        disabled={isPending}
        {...register("username")}
        aria-label="Username input"
      />

      <InputField
        label="Email Address"
        type="email"
        placeholder="Enter email address"
        error={errors.email?.message}
        disabled={isPending}
        {...register("email")}
        aria-label="Email address input"
      />

      {/* Avatar Drag & Drop Upload */}
      <div className="flex flex-col gap-1.5 w-full">
        <span className="text-xs font-semibold text-[#334155] uppercase tracking-wider">Profile Avatar (Required)</span>
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (!isPending) handleAvatarChange(e.dataTransfer.files?.[0]);
          }}
          className={`w-full min-h-[96px] rounded-xl border border-dashed flex flex-col items-center justify-center p-4 transition-colors select-none ${
            avatarError ? "border-red-500 bg-red-50" : "border-[#E2E8F0] bg-[#F8FAFC] hover:border-slate-400"
          }`}
        >
          {avatarPreview ? (
            <div className="flex items-center gap-4 w-full">
              <img src={avatarPreview} alt="Avatar Preview" className="w-12 h-12 rounded-full object-cover border border-[#E2E8F0]" />
              <div className="flex flex-col flex-grow min-w-0">
                <span className="text-xs font-semibold text-[#0F172A] truncate">{avatar.name}</span>
                <span className="text-[10px] text-slate-500">{(avatar.size / 1024).toFixed(1)} KB</span>
              </div>
              <button 
                type="button" 
                onClick={() => { setAvatar(null); setAvatarPreview(null); }}
                className="text-slate-400 hover:text-[#0F172A] cursor-pointer"
                disabled={isPending}
                aria-label="Remove avatar file selection"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center gap-1 cursor-pointer w-full text-center">
              <UploadCloud size={24} className="text-[#334155]" />
              <span className="text-xs font-medium text-[#334155]">Drag & drop or <span className="text-[#0F172A] underline font-bold">browse</span> avatar</span>
              <span className="text-[10px] text-slate-500">JPG, PNG, or WebP (max 5MB)</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleAvatarChange(e.target.files?.[0])}
                disabled={isPending}
                className="hidden"
              />
            </label>
          )}
        </div>
        {avatarError && <span className="text-xs text-red-500 font-medium">{avatarError}</span>}
      </div>

      {/* Cover Image Drag & Drop Upload */}
      <div className="flex flex-col gap-1.5 w-full">
        <span className="text-xs font-semibold text-[#334155] uppercase tracking-wider">Cover Banner (Optional)</span>
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (!isPending) handleCoverChange(e.dataTransfer.files?.[0]);
          }}
          className={`w-full min-h-[96px] rounded-xl border border-dashed flex flex-col items-center justify-center p-4 transition-colors select-none ${
            coverError ? "border-red-500 bg-red-50" : "border-[#E2E8F0] bg-[#F8FAFC] hover:border-slate-400"
          }`}
        >
          {coverImagePreview ? (
            <div className="flex items-center gap-4 w-full">
              <img src={coverImagePreview} alt="Cover Preview" className="w-20 h-10 rounded object-cover border border-[#E2E8F0]" />
              <div className="flex flex-col flex-grow min-w-0">
                <span className="text-xs font-semibold text-[#0F172A] truncate">{coverImage.name}</span>
                <span className="text-[10px] text-slate-500">{(coverImage.size / 1024).toFixed(1)} KB</span>
              </div>
              <button 
                type="button" 
                onClick={() => { setCoverImage(null); setCoverImagePreview(null); }}
                className="text-slate-400 hover:text-[#0F172A] cursor-pointer"
                disabled={isPending}
                aria-label="Remove banner file selection"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center gap-1 cursor-pointer w-full text-center">
              <UploadCloud size={24} className="text-[#334155]" />
              <span className="text-xs font-medium text-[#334155]">Drag & drop or <span className="text-[#0F172A] underline font-bold">browse</span> banner</span>
              <span className="text-[10px] text-slate-500">JPG, PNG, or WebP (max 5MB)</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleCoverChange(e.target.files?.[0])}
                disabled={isPending}
                className="hidden"
              />
            </label>
          )}
        </div>
        {coverError && <span className="text-xs text-red-500 font-medium">{coverError}</span>}
      </div>

      <InputField
        label="Password"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        disabled={isPending}
        {...register("password")}
        aria-label="Password input"
      />

      {/* Password Strength Indicator */}
      {watchedPassword && (
        <div className="flex flex-col gap-1 mt-0.5">
          <div className="flex justify-between items-center text-[10px] font-semibold">
            <span className="text-[#334155]">Password Strength</span>
            <span className={strengthMeta.text}>{strengthMeta.label}</span>
          </div>
          <div className="w-full h-1 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div className={`h-full ${strengthMeta.color} transition-all duration-300`} style={{ width: `${strengthScore}%` }} />
          </div>
        </div>
      )}

      <InputField
        label="Confirm Password"
        type="password"
        placeholder="••••••••"
        error={errors.confirmPassword?.message}
        disabled={isPending}
        {...register("confirmPassword")}
        aria-label="Confirm Password input"
      />

      <Button 
        type="submit" 
        isLoading={isPending} 
        className="w-full mt-2"
        aria-label="Submit registration"
      >
        Sign Up
      </Button>
    </form>
  );
};
export default RegisterForm;
