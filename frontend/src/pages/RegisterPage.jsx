import React from "react";
import { Link } from "react-router-dom";
import { AppLogo } from "../components/ui/AppLogo";
import { RegisterForm } from "../components/auth/RegisterForm";

export const RegisterPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] justify-between relative overflow-hidden text-[#0F172A] light-content">
      <header className="flex justify-center items-center py-8 px-4 z-10">
        <Link to="/landing">
          <AppLogo />
        </Link>
      </header>

      <main className="flex-grow flex items-center justify-center p-4 z-10 my-4">
        <div className="w-full max-w-[500px] rounded-2xl bg-white border border-[#E2E8F0] p-8 shadow-xl animate-fade-in">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[#0F172A] mb-1 tracking-tight">Create Account</h1>
            <p className="text-xs text-slate-600 font-medium">Join our enterprise video CDN network</p>
          </div>

          <RegisterForm />

          <div className="text-center text-xs text-slate-600 mt-6 pt-4 border-t border-[#E2E8F0] select-none font-medium">
            Already have an account?{" "}
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
export default RegisterPage;
