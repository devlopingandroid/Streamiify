import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AppLogo } from "../components/ui/AppLogo";
import { Button } from "../components/ui/Button";
import { InputField } from "../components/ui/InputField";
import { PageLoader } from "../components/ui/PageLoader";
import { useVerifyEmail, useResendVerification } from "../hooks/useAuth";
import { toast } from "react-hot-toast";
import { CheckCircle2, AlertOctagon, Clock, ArrowLeft, RefreshCw } from "lucide-react";

export const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const resendMutation = useResendVerification();

  const { isLoading, isError, error } = useVerifyEmail(token);

  const [resendEmail, setResendEmail] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Determine error type (expired vs failed)
  const isExpired = (() => {
    if (!isError) return false;
    const errMsg = (error?.message || "").toLowerCase();
    const status = error?.status || error?.originalError?.response?.status;
    return status === 410 || errMsg.includes("expire");
  })();

  const handleResend = (e) => {
    if (e) e.preventDefault();

    if (!resendEmail) {
      setShowEmailInput(true);
      toast.error("Please enter your email address to receive a new link.");
      return;
    }

    resendMutation.mutate(
      { email: resendEmail },
      {
        onSuccess: (resData) => {
          toast.success(resData?.message || "Verification link sent! Please check your email.");
          setCooldown(60);
        },
        onError: (resErr) => {
          toast.error(resErr?.message || "Failed to resend verification email.");
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
        <div className="w-full max-w-[480px] rounded-2xl bg-white border border-[#E2E8F0] p-8 shadow-xl animate-fade-in text-center flex flex-col items-center">
          {isLoading ? (
            <div className="py-8 w-full flex flex-col items-center justify-center">
              <PageLoader message="Verifying email token..." />
            </div>
          ) : isError ? (
            isExpired ? (
              /* ================= EXPIRED STATE ================= */
              <div className="w-full flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 mb-5 shadow-sm">
                  <Clock size={32} />
                </div>

                <h1 className="text-2xl font-bold text-[#0F172A] mb-2 tracking-tight">
                  Verification Link Expired
                </h1>

                <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-sm mb-6">
                  Verification links expire after <span className="font-bold text-[#0F172A]">30 minutes</span>.
                </p>

                {showEmailInput && (
                  <form onSubmit={handleResend} className="w-full mb-4 text-left">
                    <InputField
                      label="Email Address"
                      type="email"
                      placeholder="Enter registered email address"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      disabled={resendMutation.isPending || cooldown > 0}
                    />
                  </form>
                )}

                <div className="w-full flex flex-col gap-3">
                  <Button
                    type="button"
                    variant="solid"
                    size="md"
                    className="w-full gap-2 text-sm font-semibold"
                    onClick={handleResend}
                    isLoading={resendMutation.isPending}
                    disabled={cooldown > 0 || resendMutation.isPending}
                  >
                    <RefreshCw size={16} className={resendMutation.isPending ? "animate-spin" : ""} />
                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Verification Email"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    className="w-full gap-2 text-xs font-semibold"
                    onClick={() => navigate("/login")}
                  >
                    <ArrowLeft size={14} />
                    Back to Login
                  </Button>
                </div>
              </div>
            ) : (
              /* ================= FAILED STATE ================= */
              <div className="w-full flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-500 mb-5 shadow-sm">
                  <AlertOctagon size={32} />
                </div>

                <h1 className="text-2xl font-bold text-[#0F172A] mb-2 tracking-tight">
                  Verification Failed
                </h1>

                <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-sm mb-6">
                  {error?.message || "The verification link is invalid or has already been used."}
                </p>

                {showEmailInput && (
                  <form onSubmit={handleResend} className="w-full mb-4 text-left">
                    <InputField
                      label="Email Address"
                      type="email"
                      placeholder="Enter registered email address"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      disabled={resendMutation.isPending || cooldown > 0}
                    />
                  </form>
                )}

                <div className="w-full flex flex-col gap-3">
                  <Button
                    type="button"
                    variant="solid"
                    size="md"
                    className="w-full gap-2 text-sm font-semibold"
                    onClick={handleResend}
                    isLoading={resendMutation.isPending}
                    disabled={cooldown > 0 || resendMutation.isPending}
                  >
                    <RefreshCw size={16} className={resendMutation.isPending ? "animate-spin" : ""} />
                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Verification Email"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    className="w-full gap-2 text-xs font-semibold"
                    onClick={() => navigate("/login")}
                  >
                    <ArrowLeft size={14} />
                    Back to Login
                  </Button>
                </div>
              </div>
            )
          ) : (
            /* ================= SUCCESS STATE ================= */
            <div className="w-full flex flex-col items-center">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-500 mb-5 shadow-sm"
              >
                <CheckCircle2 size={36} strokeWidth={2.2} />
              </motion.div>

              <h1 className="text-2xl font-bold text-[#0F172A] mb-2 tracking-tight">
                Email Verified Successfully
              </h1>

              <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-sm mb-6">
                Your account has been verified. Continue to Login.
              </p>

              <Button
                type="button"
                variant="solid"
                size="md"
                className="w-full font-semibold text-sm"
                onClick={() => navigate("/login")}
              >
                Go to Login
              </Button>
            </div>
          )}
        </div>
      </main>

      <footer className="text-center py-6 text-[10px] text-slate-500 z-10 select-none">
        <p>&copy; {new Date().getFullYear()} Streamify Inc. Enterprise Media CDN System.</p>
      </footer>
    </div>
  );
};

export default VerifyEmailPage;
