import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLogin, useResendVerification } from "../../hooks/useAuth";
import { toast } from "react-hot-toast";
import { InputField } from "../ui/InputField";
import { Button } from "../ui/Button";
import { Eye, EyeOff, AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";

const loginSchema = z.object({
  identifier: z.string().min(1, "Username or Email is required"),
  password: z.string().min(1, "Password is required"),
});

export const LoginForm = () => {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const resendMutation = useResendVerification();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(false);
  
  // Unverified Email 403 State
  const [isUnverified, setIsUnverified] = useState(false);
  const [unverifiedIdentifier, setUnverifiedIdentifier] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    const isEmail = data.identifier.includes("@");
    const requestBody = {
      password: data.password,
    };
    if (isEmail) {
      requestBody.email = data.identifier;
    } else {
      requestBody.username = data.identifier;
    }

    loginMutation.mutate(requestBody, {
      onSuccess: () => {
        toast.success("Welcome back to Streamify!");
        navigate("/");
      },
      onError: (err) => {
        const status = err?.status || err?.originalError?.response?.status;
        if (status === 403) {
          setIsUnverified(true);
          setUnverifiedIdentifier(data.identifier);
        } else {
          toast.error(err?.message || "Invalid credentials provided.");
        }
      },
    });
  };

  const handleResendEmail = () => {
    if (!unverifiedIdentifier) return;

    const payload = unverifiedIdentifier.includes("@")
      ? { email: unverifiedIdentifier }
      : { username: unverifiedIdentifier };

    resendMutation.mutate(payload, {
      onSuccess: (data) => {
        toast.success(data?.message || "Verification email sent successfully!");
        setCooldown(60);
      },
      onError: (err) => {
        toast.error(err?.message || "Failed to resend verification email.");
      },
    });
  };

  const isPending = loginMutation.isPending;

  // Render Beautiful Unverified Alert if 403 status is returned
  if (isUnverified) {
    return (
      <div className="flex flex-col items-center gap-4 w-full text-center animate-fade-in py-2">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm">
          <AlertCircle size={30} />
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold text-[#0F172A]">Your email is not verified.</h2>
          <p className="text-xs text-slate-600 font-medium">
            Please verify your email address to access your Streamify account.
          </p>
          {unverifiedIdentifier && (
            <span className="text-[11px] font-semibold text-slate-500 mt-1 truncate">
              Account: {unverifiedIdentifier}
            </span>
          )}
        </div>

        <div className="w-full flex flex-col gap-2.5 mt-2">
          <Button
            type="button"
            variant="solid"
            size="md"
            className="w-full gap-2 text-sm font-semibold"
            onClick={handleResendEmail}
            isLoading={resendMutation.isPending}
            disabled={cooldown > 0 || resendMutation.isPending}
          >
            <RefreshCw size={16} className={resendMutation.isPending ? "animate-spin" : ""} />
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Email"}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="md"
            className="w-full gap-2 text-xs font-semibold"
            onClick={() => setIsUnverified(false)}
          >
            <ArrowLeft size={14} />
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full text-left">
      <InputField
        label="Username or Email"
        type="text"
        placeholder="Enter username or email address"
        error={errors.identifier?.message}
        disabled={isPending}
        {...register("identifier")}
        aria-label="Username or Email address input"
      />

      <div className="relative w-full">
        <InputField
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          error={errors.password?.message}
          disabled={isPending}
          {...register("password")}
          aria-label="Password input"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[34px] text-slate-500 hover:text-[#0F172A] transition-colors cursor-pointer"
          disabled={isPending}
          aria-label={showPassword ? "Hide password text" : "Show password text"}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      <div className="flex items-center justify-between mt-1 select-none">
        <label className="flex items-center gap-2 text-xs text-[#334155] font-semibold cursor-pointer">
          <input
            type="checkbox"
            checked={rememberSession}
            onChange={(e) => setRememberSession(e.target.checked)}
            className="rounded border-[#E2E8F0] accent-[#0F172A]"
            disabled={isPending}
          />
          <span>Remember Session</span>
        </label>
        <Link
          to="/forgot-password"
          className="text-xs text-[#0F172A] hover:underline font-bold"
        >
          Forgot Password?
        </Link>
      </div>

      <Button 
        type="submit" 
        isLoading={isPending} 
        className="w-full mt-2"
        aria-label="Submit login session"
      >
        Sign In
      </Button>
    </form>
  );
};

export default LoginForm;
