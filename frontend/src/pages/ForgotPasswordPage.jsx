import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AppLogo } from "../components/ui/AppLogo";
import { InputField } from "../components/ui/InputField";
import { Button } from "../components/ui/Button";
import { useForgotPassword } from "../hooks/useAuth";
import { toast } from "react-hot-toast";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

const forgotSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

export const ForgotPasswordPage = () => {
  const [submittedEmail, setSubmittedEmail] = useState(null);
  const forgotMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (data) => {
    forgotMutation.mutate(data.email, {
      onSuccess: () => {
        setSubmittedEmail(data.email);
        toast.success("Password reset instructions sent to your email!");
      },
      onError: (err) => {
        toast.error(err?.message || "Failed to send reset email. Please try again.");
      },
    });
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
          {submittedEmail ? (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <CheckCircle2 size={24} />
              </div>
              <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">Check your email</h1>
              <p className="text-xs text-slate-600 leading-relaxed">
                We sent a password reset link to{" "}
                <span className="font-semibold text-[#0F172A]">{submittedEmail}</span>. Please check your inbox or spam folder.
              </p>
              <div className="mt-4 pt-4 border-t border-[#E2E8F0] w-full">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#0F172A] hover:underline"
                >
                  <ArrowLeft size={14} />
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-[#0F172A] mb-1 tracking-tight">Forgot Password</h1>
                <p className="text-xs text-slate-600 font-medium">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 text-left">
                <InputField
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  error={errors.email?.message}
                  disabled={forgotMutation.isPending}
                  {...register("email")}
                  aria-label="Email address input for password reset"
                />

                <Button
                  type="submit"
                  isLoading={forgotMutation.isPending}
                  className="w-full mt-2"
                  aria-label="Send password reset link"
                >
                  Send Reset Link
                </Button>
              </form>

              <div className="text-center text-xs text-slate-600 mt-6 pt-4 border-t border-[#E2E8F0] select-none font-medium">
                Remember your password?{" "}
                <Link to="/login" className="text-[#0F172A] hover:underline font-bold">
                  Sign In Here
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="text-center py-6 text-[10px] text-slate-500 z-10 select-none">
        <p>&copy; {new Date().getFullYear()} Streamify Inc. Enterprise Media CDN System.</p>
      </footer>
    </div>
  );
};

export default ForgotPasswordPage;
