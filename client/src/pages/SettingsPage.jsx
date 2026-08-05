import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useUpdateAccount,
  useChangePassword,
  useUpdateAvatar,
  useUpdateCover
} from "../hooks/useUser";
import { toast } from "react-hot-toast";
import { InputField } from "../components/ui/InputField";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import {
  User,
  ShieldAlert,
  Paintbrush,
  Image as ImageIcon,
  UploadCloud,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react";

// Schemas
const detailsSchema = z.object({
  fullname: z.string().min(1, "Full name is required"),
});

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const SettingsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("account");

  return (
    <div className="max-w-[1000px] mx-auto p-6 md:p-12 animate-fade-in text-slate-200 select-none">
      <h1 className="text-2xl font-bold text-slate-100 mb-1">Account Settings</h1>
      <p className="text-xs text-slate-400 mb-8">Configure your corporate credentials, session passwords, and channels identity.</p>

      {/* Tabs Row */}
      <div className="flex border-b border-slate-800/80 mb-8 overflow-x-auto">
        {[
          { id: "account", label: "Account Details", icon: User },
          { id: "security", label: "Security & Keys", icon: ShieldAlert },
          { id: "appearance", label: "Appearance", icon: Paintbrush },
          { id: "avatar-cover", label: "Avatar & Cover", icon: ImageIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`flex items-center gap-2 px-5 py-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap cursor-pointer ${activeTab === tab.id
                ? "border-brand-cyan text-brand-cyan"
                : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="w-full">
        {activeTab === "account" && <AccountTab user={user} />}
        {activeTab === "security" && <SecurityTab />}
        {activeTab === "appearance" && <AppearanceTab />}
        {activeTab === "avatar-cover" && <AvatarCoverTab user={user} />}
      </div>
    </div>
  );
};

// ==========================================
// Sub Tab Component: AccountTab
// ==========================================
const AccountTab = ({ user }) => {
  const updateAccountMutation = useUpdateAccount();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      fullname: user?.fullname || "",
    },
  });

  const onSubmit = (data) => {
    updateAccountMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Account details updated successfully.");
      },
      onError: (err) => {
        toast.error(err?.message || "Failed to update account details.");
      },
    });
  };

  const isPending = updateAccountMutation.isPending;

  return (
    <section className="rounded-xl border border-slate-800/40 bg-slate-900/10 p-6 max-w-xl text-left">
      <h2 className="text-sm font-semibold text-slate-200 mb-2">Profile details</h2>
      <p className="text-xs text-slate-500 mb-6 leading-relaxed">
        Modify the primary naming parameters and contact address.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <InputField
          label="Full Name"
          type="text"
          error={errors.fullname?.message}
          disabled={isPending}
          {...register("fullname")}
        />

        <InputField
          label="Email Address (Read Only)"
          type="email"
          value={user?.email || ""}
          disabled
          readOnly
        />

        <InputField
          label="Username (Read Only)"
          type="text"
          value={user?.username || ""}
          disabled={true}
          readOnly
        />

        <Button type="submit" isLoading={isPending} className="w-full mt-2">
          Save Details
        </Button>
      </form>
    </section>
  );
};

// ==========================================
// Sub Tab Component: SecurityTab
// ==========================================
const SecurityTab = () => {
  const changePasswordMutation = useChangePassword();
  const [showPwd, setShowPwd] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const watchedPassword = watch("newPassword", "");

  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (!pwd) return score;
    if (pwd.length >= 8) score += 33;
    if (/[A-Z]/.test(pwd)) score += 33;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 34;
    return score;
  };

  const strengthScore = getPasswordStrength(watchedPassword);

  const getStrengthMeta = (score) => {
    if (score === 0) return { label: "", color: "bg-transparent", text: "text-transparent" };
    if (score <= 33) return { label: "Weak", color: "bg-red-500", text: "text-red-400" };
    if (score <= 66) return { label: "Fair", color: "bg-amber-500", text: "text-amber-400" };
    return { label: "Strong", color: "bg-emerald-500", text: "text-emerald-400" };
  };

  const strengthMeta = getStrengthMeta(strengthScore);

  const onSubmit = (data) => {
    changePasswordMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Password changed successfully.");
        reset();
      },
      onError: (err) => {
        toast.error(err?.message || "Failed to update security credentials.");
      },
    });
  };

  const isPending = changePasswordMutation.isPending;

  return (
    <section className="rounded-xl border border-slate-800/40 bg-slate-900/10 p-6 max-w-xl text-left">
      <h2 className="text-sm font-semibold text-slate-200 mb-2">Modify Password</h2>
      <p className="text-xs text-slate-500 mb-6 leading-relaxed">
        Ensure your new passphrase incorporates mixed character blocks.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <InputField
          label="Current Password"
          type="password"
          error={errors.oldPassword?.message}
          disabled={isPending}
          {...register("oldPassword")}
        />

        <div className="relative w-full">
          <InputField
            label="New Password"
            type={showPwd ? "text" : "password"}
            placeholder="••••••••"
            error={errors.newPassword?.message}
            disabled={isPending}
            {...register("newPassword")}
          />
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="absolute right-3 top-[34px] text-slate-500 hover:text-slate-200 cursor-pointer"
            disabled={isPending}
          >
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Strength Meter */}
        {watchedPassword && (
          <div className="flex flex-col gap-1 mt-0.5">
            <div className="flex justify-between items-center text-[10px] font-semibold">
              <span className="text-slate-400">Password Strength</span>
              <span className={strengthMeta.text}>{strengthMeta.label}</span>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full ${strengthMeta.color} transition-all duration-300`} style={{ width: `${strengthScore}%` }} />
            </div>
          </div>
        )}

        <InputField
          label="Confirm New Password"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          disabled={isPending}
          {...register("confirmPassword")}
        />

        <Button type="submit" isLoading={isPending} className="w-full mt-2">
          Update Password
        </Button>
      </form>
    </section>
  );
};

// ==========================================
// Sub Tab Component: AppearanceTab (Placeholder)
// ==========================================
const AppearanceTab = () => {
  return (
    <section className="rounded-xl border border-slate-800/40 bg-slate-900/10 p-6 max-w-xl text-left">
      <h2 className="text-sm font-semibold text-slate-200 mb-2">Workspace Theme</h2>
      <p className="text-xs text-slate-500 mb-6 leading-relaxed">
        Customize background schemes and canvas visibility triggers.
      </p>
      <div className="flex items-center justify-between p-4 bg-slate-900/60 rounded-xl border border-slate-800">
        <span className="text-xs text-slate-300">Default dark visual system</span>
        <ThemeToggle />
      </div>
    </section>
  );
};

// ==========================================
// Sub Tab Component: AvatarCoverTab
// ==========================================
const AvatarCoverTab = ({ user }) => {
  const updateAvatarMutation = useUpdateAvatar();
  const updateCoverMutation = useUpdateCover();

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const validateFile = (file) => {
    if (file.size > MAX_FILE_SIZE) return "File must be less than 5MB";
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return "Only JPG, PNG, and WebP formats are supported";
    return "";
  };

  const handleAvatarChange = (file) => {
    if (!file) return;
    const errorMsg = validateFile(file);
    if (errorMsg) {
      toast.error(errorMsg);
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleCoverChange = (file) => {
    if (!file) return;
    const errorMsg = validateFile(file);
    if (errorMsg) {
      toast.error(errorMsg);
      return;
    }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleUploadAvatar = () => {
    if (!avatarFile) return;
    const formData = new FormData();
    formData.append("avatar", avatarFile);

    updateAvatarMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("Avatar updated successfully.");
        setAvatarFile(null);
        setAvatarPreview(null);
      },
      onError: (err) => {
        toast.error(err?.message || "Failed to update avatar.");
      },
    });
  };

  const handleUploadCover = () => {
    if (!coverFile) return;
    const formData = new FormData();
    formData.append("coverImage", coverFile);

    updateCoverMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("Cover banner updated successfully.");
        setCoverFile(null);
        setCoverPreview(null);
      },
      onError: (err) => {
        toast.error(err?.message || "Failed to update cover banner.");
      },
    });
  };

  const isPending = updateAvatarMutation.isPending || updateCoverMutation.isPending;

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">

      {/* Avatar Panel */}
      <div className="rounded-xl border border-slate-800/40 bg-slate-900/10 p-6 flex flex-col relative overflow-hidden">
        {isPending && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <Loader2 className="w-8 h-8 text-brand-cyan animate-spin" />
          </div>
        )}
        <h3 className="text-sm font-semibold text-slate-200 mb-1">Avatar Image</h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">Update your channel thumbnail card photo.</p>

        <div className="flex items-center gap-4 mb-6">
          <Avatar src={avatarPreview || user?.avatar} name={user?.fullname} size="xl" />

          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-slate-500">JPG, PNG, or WebP (max 5MB)</span>
            <div className="flex gap-2">
              <label className="text-2xs px-3 py-1.5 bg-slate-800 border border-slate-700 hover:border-brand-cyan text-slate-300 rounded-lg cursor-pointer transition-colors">
                Browse
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleAvatarChange(e.target.files?.[0])}
                  disabled={isPending}
                  className="hidden"
                />
              </label>
              {avatarFile && (
                <Button variant="solid" size="sm" onClick={handleUploadAvatar} disabled={isPending}>
                  Upload
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Drag Drop Area */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleAvatarChange(e.dataTransfer.files?.[0]); }}
          className="flex-grow min-h-[96px] rounded-xl border border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/20 flex flex-col items-center justify-center p-4 text-center cursor-pointer"
        >
          <UploadCloud size={20} className="text-slate-500 mb-1" />
          <span className="text-2xs text-slate-400">Drag & drop avatar image here</span>
        </div>
      </div>

      {/* Cover Banner Panel */}
      <div className="rounded-xl border border-slate-800/40 bg-slate-900/10 p-6 flex flex-col relative overflow-hidden">
        {isPending && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <Loader2 className="w-8 h-8 text-brand-cyan animate-spin" />
          </div>
        )}
        <h3 className="text-sm font-semibold text-slate-200 mb-1">Cover Banner</h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">Update your channel top cover header banner.</p>

        <div className="flex flex-col gap-4 mb-6">
          <div className="w-full h-16 rounded overflow-hidden bg-slate-850 border border-slate-800">
            {coverPreview || user?.coverImage ? (
              <img src={coverPreview || user?.coverImage} alt="Cover Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-brand-cyan/15 to-brand-indigo/15" />
            )}
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] text-slate-500">JPG, PNG, or WebP (max 5MB)</span>
            <div className="flex gap-2">
              <label className="text-2xs px-3 py-1.5 bg-slate-800 border border-slate-700 hover:border-brand-cyan text-slate-300 rounded-lg cursor-pointer transition-colors">
                Browse
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleCoverChange(e.target.files?.[0])}
                  disabled={isPending}
                  className="hidden"
                />
              </label>
              {coverFile && (
                <Button variant="solid" size="sm" onClick={handleUploadCover} disabled={isPending}>
                  Upload
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Drag Drop Area */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleCoverChange(e.dataTransfer.files?.[0]); }}
          className="flex-grow min-h-[96px] rounded-xl border border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/20 flex flex-col items-center justify-center p-4 text-center cursor-pointer"
        >
          <UploadCloud size={20} className="text-slate-500 mb-1" />
          <span className="text-2xs text-slate-400">Drag & drop cover banner here</span>
        </div>
      </div>

    </section>
  );
};
export default SettingsPage;
