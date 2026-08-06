import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AppLogo } from "../components/ui/AppLogo";
import { Button } from "../components/ui/Button";
import { InputField } from "../components/ui/InputField";
import { useResendVerification } from "../hooks/useAuth";
import { toast } from "react-hot-toast";
import { Mail, ExternalLink, ArrowLeft, RefreshCw } from "lucide-react";

export const EmailPendingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const resendMutation = useResendVerification();

  const initialEmail = location.state?.email || new URLSearchParams(location.search).get("email") || "";
  const [email, setEmail] = useState(initialEmail);
  const [showEmailInput, setShowEmailInput] = useState(!initialEmail);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleOpenEmailClient = () => {
    if (email && email.includes("@")) {
      const domain = email.split("@")[1]?.toLowerCase();
      if (domain === "gmail.com") {
        window.open("https://mail.google.com", "_blank");
        return;
      } else if (domain === "outlook.com" || domain === "hotmail.com") {
        window.open("https://outlook.live.com", "_blank");
        return;
      } else if (domain === "yahoo.com") {
        window.open("https://mail.yahoo.com", "_blank");
        return;
      }
    }
    window.open("mailto:", "_self");
  };

  const handleResend = (e) => {
    if (e) e.preventDefault();

    if (!email) {
      setShowEmailInput(true);
      toast.error("Please provide your email address to resend verification.");
      return;
    }

    resendMutation.mutate(
      { email },
      {
        onSuccess: (data) => {
          toast.success(data?.message || "Verification email sent successfully!");
          setCooldown(60);
        },
        onError: (err) => {
          toast.error(err?.message || "Failed to resend verification email.");
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
          {/* Large Email Icon */}
          <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#0F172A] mb-5 shadow-sm">
            <Mail size={32} strokeWidth={2} />
          </div>

          <h1 className="text-2xl font-bold text-[#0F172A] mb-2 tracking-tight">Verify your Email</h1>

          <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-sm mb-4">
            We have sent a verification link to your email. Please verify your account before logging in.
          </p>

          {email ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-[#0F172A] mb-6 max-w-full truncate">
              <span className="text-slate-500">Sent to:</span>
              <span className="truncate">{email}</span>
            </div>
          ) : null}

          {showEmailInput && (
            <form onSubmit={handleResend} className="w-full mb-4 text-left">
              <InputField
                label="Email Address"
                type="email"
                placeholder="Enter registered email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={resendMutation.isPending || cooldown > 0}
              />
            </form>
          )}

          {/* Action Buttons */}
          <div className="w-full flex flex-col gap-3">
            <Button
              type="button"
              variant="solid"
              size="md"
              className="w-full gap-2 text-sm font-semibold"
              onClick={handleOpenEmailClient}
            >
              <ExternalLink size={16} />
              Open Email
            </Button>

            <Button
              type="button"
              variant="outline"
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
              variant="ghost"
              size="md"
              className="w-full gap-2 text-xs font-semibold text-slate-600 hover:text-[#0F172A]"
              onClick={() => navigate("/login")}
            >
              <ArrowLeft size={14} />
              Back to Login
            </Button>
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-[10px] text-slate-500 z-10 select-none">
        <p>&copy; {new Date().getFullYear()} Streamify Inc. Enterprise Media CDN System.</p>
      </footer>
    </div>
  );
};

export default EmailPendingPage;
