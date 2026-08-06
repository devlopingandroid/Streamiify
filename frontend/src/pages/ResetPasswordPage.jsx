import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AppLogo } from "../components/ui/AppLogo";
import { InputField } from "../components/ui/InputField";
import { Button } from "../components/ui/Button";
import { useResetPassword } from "../hooks/useAuth";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, Lock } from "lucide-react";

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]).+$/,
        "Must contain uppercase, lowercase, number, and special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const resetMutation = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = (data) => {
    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }

    resetMutation.mutate(
      { token, password: data.password },
      {
        onSuccess: () => {
          toast.success("Password reset successful! Please sign in with your new password.");
          navigate("/login");
        },
        onError: (err) => {
          toast.error(err?.message || "Failed to reset password. Token may be expired or invalid.");
        },
      }
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] justify-between relative overflow-hidden text-[#0F172A] light-content">
      <header className="flex justify-center items-center py-8 px-4 z-10">
        <Link to="/landing">
          <AppLogo />
        </Link>
      </header>

      <main className="flex-grow flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-[440px] rounded-2xl bg-white border border-[#E2E8F0] p-8 shadow-xl animate-fade-in text-center">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 mx-auto flex items-center justify-center text-[#0F172A] mb-3">
              <Lock size={20} />
            </div>
            <h1 className="text-2xl font-bold text-[#0F172A] mb-1 tracking-tight">Set New Password</h1>
            <p className="text-xs text-slate-600 font-medium">
              Create a new secure password for your Streamify account.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 text-left">
            <div className="relative w-full">
              <InputField
                label="New Password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                error={errors.password?.message}
                disabled={resetMutation.isPending}
                {...register("password")}
                aria-label="New password input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-slate-500 hover:text-[#0F172A] transition-colors cursor-pointer"
                disabled={resetMutation.isPending}
                aria-label={showPassword ? "Hide password text" : "Show password text"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <InputField
              label="Confirm New Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              disabled={resetMutation.isPending}
              {...register("confirmPassword")}
              aria-label="Confirm new password input"
            />

            <Button
              type="submit"
              isLoading={resetMutation.isPending}
              className="w-full mt-2"
              aria-label="Reset password"
            >
              Reset Password
            </Button>
          </form>

          <div className="text-center text-xs text-slate-600 mt-6 pt-4 border-t border-[#E2E8F0] select-none font-medium">
            Remembered your password?{" "}
            <Link to="/login" className="text-[#0F172A] hover:underline font-bold">
              Sign In Here
            </Link>
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-[10px] text-slate-500 z-10 select-none">
        <p>&copy; {new Date().getFullYear()} Streamify Inc. Enterprise Media CDN System.</p>
      </footer>
    </div>
  );
};

export default ResetPasswordPage;
