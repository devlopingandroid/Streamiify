import React from "react";
import { Link } from "react-router-dom";
import { AppLogo } from "../components/ui/AppLogo";
import { LoginForm } from "../components/auth/LoginForm";

export const LoginPage = () => {
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
            <h1 className="text-2xl font-bold text-[#0F172A] mb-1 tracking-tight">Sign In</h1>
            <p className="text-xs text-slate-600 font-medium">Access your enterprise video catalog</p>
          </div>

          <LoginForm />

          <div className="text-center text-xs text-slate-600 mt-6 pt-4 border-t border-[#E2E8F0] select-none font-medium">
            Don't have an account?{" "}
            <Link to="/register" className="text-[#0F172A] hover:underline font-bold">
              Create Account
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
export default LoginPage;
