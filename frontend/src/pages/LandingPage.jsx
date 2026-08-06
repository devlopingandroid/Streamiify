import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AppLogo } from "../components/ui/AppLogo";
import {
  Shield,
  Zap,
  LayoutGrid,
  MonitorPlay,
  ArrowRight,
  Globe,
  CheckCircle2,
  Lock,
  Search,
  Bell,
  Home as HomeIcon,
  Folder,
  ListVideo,
  BarChart3,
  Server,
  Users as UsersIcon,
  Settings as SettingsIcon,
  TrendingUp,
  Cpu,
  ChevronRight,
  HardDrive,
  Activity,
  Layers,
  Sparkles,
  Terminal,
  FileText,
  Key
} from "lucide-react";

export const LandingPage = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] font-sans relative overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Background Soft Lighting & Radial Blur Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-200/30 via-indigo-100/10 to-transparent blur-3xl pointer-events-none z-0" />
      <div className="absolute top-[400px] right-[-100px] w-[600px] h-[600px] bg-indigo-100/20 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute top-[900px] left-[-100px] w-[600px] h-[600px] bg-blue-100/20 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Subtle Background Grid Pattern */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none z-0" 
      />

      {/* ========================================== */}
      {/* 1. HEADER BAR                              */}
      {/* ========================================== */}
      <header className="flex justify-between items-center py-5 px-6 md:px-12 z-[1000] border-b border-[#E2E8F0] bg-white/80 backdrop-blur-md sticky top-0">
        <Link to="/" className="flex items-center gap-2 group">
          <AppLogo showText={true} />
        </Link>

        <div className="flex items-center gap-3">
          <Link 
            to="/login"
            className="text-xs font-semibold text-[#6B7280] hover:text-[#111827] px-3.5 py-2 transition-colors"
          >
            Sign In
          </Link>
          
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span>Get Started</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* ========================================== */}
      {/* 2. HERO SECTION                            */}
      {/* ========================================== */}
      <section className="relative z-10 pt-10 md:pt-16 pb-20 px-6 max-w-[1360px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* HERO LEFT COLUMN */}
          <div className="lg:col-span-6 flex flex-col text-left">
            
            {/* Announcement Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-200/80 bg-indigo-50/80 text-xs font-semibold text-indigo-700 mb-6 w-fit shadow-xs animate-fade-in select-none">
              <Zap size={14} className="text-indigo-600 fill-indigo-600/20" />
              <span>Streamify SaaS CDN v1.0 Launch</span>
              <ChevronRight size={14} className="text-indigo-400" />
            </div>

            {/* Massive Bold Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-[60px] font-extrabold tracking-tight leading-[1.08] text-[#111827] mb-6">
              Enterprise Media Streaming Engineered for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700">
                Teams
              </span>
            </h1>

            {/* Subheading Description */}
            <p className="text-base sm:text-lg text-[#6B7280] leading-relaxed mb-8 max-w-xl font-normal">
              Deploy premium quality media assets across distributed CDNs with zero latency. Secure, accessible, and fast — built for modern teams.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <Link
                to="/register"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                <span>Create Free Account</span>
                <ArrowRight size={16} />
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-white border border-[#E5E7EB] text-[#111827] font-semibold text-sm shadow-xs hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                <LayoutGrid size={16} className="text-[#6B7280]" />
                <span>Portal Dashboard</span>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-[#6B7280] pt-4 border-t border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-indigo-600" />
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-indigo-600" />
                <span>Global CDN</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-indigo-600" />
                <span>99.99% Uptime SLA</span>
              </div>
            </div>

          </div>

          {/* HERO RIGHT COLUMN (Realistic Floating SaaS Dashboard UI Mockup) */}
          <div className="lg:col-span-6 relative">
            
            {/* Soft backdrop glow behind mockup */}
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 rounded-[32px] blur-2xl pointer-events-none" />

            {/* Main Mockup Card Container */}
            <div className="relative bg-white rounded-[24px] border border-[#E5E7EB] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden text-left transform lg:rotate-1 hover:rotate-0 transition-transform duration-500 ease-out">
              
              {/* Mock App Header */}
              <div className="h-12 bg-white border-b border-[#E5E7EB] px-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  </div>
                  <span className="text-xs font-bold text-[#111827] tracking-tight ml-2">STREAMIFY</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center bg-[#F8FAFC] border border-[#E5E7EB] rounded-md px-2.5 py-1 text-[10px] text-[#6B7280] gap-4">
                    <span>Search media, playlists...</span>
                    <span className="font-mono bg-white px-1 rounded border border-[#E5E7EB]">⌘ K</span>
                  </div>
                  <Bell size={14} className="text-[#6B7280]" />
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                    YG
                  </div>
                </div>
              </div>

              {/* Mock App Body Grid */}
              <div className="grid grid-cols-12 min-h-[360px] bg-[#F8FAFC]">
                
                {/* Mock Sidebar */}
                <div className="hidden sm:flex col-span-3 bg-white border-r border-[#E5E7EB] p-3 flex-col gap-1 text-[11px] font-medium text-[#6B7280]">
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-semibold">
                    <HomeIcon size={14} />
                    <span>Home</span>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-50">
                    <Folder size={14} />
                    <span>Media Library</span>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-50">
                    <ListVideo size={14} />
                    <span>Playlists</span>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-50">
                    <BarChart3 size={14} />
                    <span>Analytics</span>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-50">
                    <Server size={14} />
                    <span>CDN Logs</span>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-50">
                    <UsersIcon size={14} />
                    <span>Users</span>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 mt-auto">
                    <SettingsIcon size={14} />
                    <span>Settings</span>
                  </div>
                </div>

                {/* Mock Content Dashboard */}
                <div className="col-span-12 sm:col-span-9 p-4 flex flex-col gap-4">
                  
                  {/* Mock Overview KPIs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="bg-white p-2.5 rounded-xl border border-[#E5E7EB] shadow-2xs">
                      <span className="text-[9px] text-[#6B7280] font-semibold uppercase">Total Views</span>
                      <div className="flex items-baseline justify-between mt-0.5">
                        <span className="text-sm font-bold text-[#111827]">24.8M</span>
                        <span className="text-[9px] font-bold text-emerald-600">+14%</span>
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-[#E5E7EB] shadow-2xs">
                      <span className="text-[9px] text-[#6B7280] font-semibold uppercase">Bandwidth Saved</span>
                      <div className="flex items-baseline justify-between mt-0.5">
                        <span className="text-sm font-bold text-[#111827]">2.4 TB</span>
                        <span className="text-[9px] font-bold text-emerald-600">+22%</span>
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-[#E5E7EB] shadow-2xs">
                      <span className="text-[9px] text-[#6B7280] font-semibold uppercase">Active Users</span>
                      <div className="flex items-baseline justify-between mt-0.5">
                        <span className="text-sm font-bold text-[#111827]">18.6K</span>
                        <span className="text-[9px] font-bold text-emerald-600">+8%</span>
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-[#E5E7EB] shadow-2xs">
                      <span className="text-[9px] text-[#6B7280] font-semibold uppercase">Storage Used</span>
                      <div className="flex items-baseline justify-between mt-0.5">
                        <span className="text-sm font-bold text-[#111827]">1.2 TB</span>
                        <span className="text-[9px] font-bold text-indigo-600">58%</span>
                      </div>
                    </div>
                  </div>

                  {/* Mock Recent Media Cards */}
                  <div className="bg-white p-3 rounded-xl border border-[#E5E7EB] flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#111827]">Recent Media</span>
                      <span className="text-[10px] font-semibold text-indigo-600">View All →</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="border border-[#E5E7EB] rounded-lg p-2 bg-[#F8FAFC] flex flex-col gap-1">
                        <div className="w-full h-16 bg-slate-900 rounded-md relative flex items-center justify-center overflow-hidden">
                          <span className="text-[9px] text-white/70 font-mono">Product_Launch.mp4</span>
                          <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[8px] px-1 rounded">3:45</span>
                        </div>
                        <span className="text-[10px] font-semibold text-[#111827] truncate">Product Launch Event</span>
                        <span className="text-[8px] text-[#6B7280]">2.4K views • 2h ago</span>
                      </div>

                      <div className="border border-[#E5E7EB] rounded-lg p-2 bg-[#F8FAFC] flex flex-col gap-1">
                        <div className="w-full h-16 bg-indigo-950 rounded-md relative flex items-center justify-center overflow-hidden">
                          <span className="text-[9px] text-indigo-200/70 font-mono">CDN_Architecture.mp4</span>
                          <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[8px] px-1 rounded">4:12</span>
                        </div>
                        <span className="text-[10px] font-semibold text-[#111827] truncate">CDN Architecture Breakdown</span>
                        <span className="text-[8px] text-[#6B7280]">1.8K views • 5h ago</span>
                      </div>
                    </div>
                  </div>

                  {/* Mock Bandwidth Wave Chart */}
                  <div className="bg-white p-3 rounded-xl border border-[#E5E7EB] flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-[#111827]">Bandwidth Usage (GB/s)</span>
                    <div className="w-full h-12 flex items-end gap-1 pt-2">
                      {[35, 45, 30, 60, 75, 50, 65, 80, 95, 70, 85, 90, 100].map((h, i) => (
                        <div key={`wave-${i}`} className="flex-1 bg-indigo-500/20 hover:bg-indigo-600 rounded-t transition-all" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================== */}
      {/* 3. HERO FEATURE CARDS (3 Premium Cards)    */}
      {/* ========================================== */}
      <section className="relative z-10 py-12 px-6 max-w-[1360px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="bg-white rounded-[24px] border border-[#E5E7EB] p-8 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.06)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col text-left group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
              <MonitorPlay size={24} />
            </div>
            <h3 className="text-xl font-bold text-[#111827] mb-3">Custom Playback</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Native HTML5 media player featuring volume controls, progressive buffer seek, and custom keyboard binds.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-[24px] border border-[#E5E7EB] p-8 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.06)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col text-left group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
              <Shield size={24} />
            </div>
            <h3 className="text-xl font-bold text-[#111827] mb-3">HttpOnly Security</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Token refresh rotation maps and HttpOnly secure cookies shield user sessions from XSS attacks.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-[24px] border border-[#E5E7EB] p-8 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.06)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col text-left group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
              <LayoutGrid size={24} />
            </div>
            <h3 className="text-xl font-bold text-[#111827] mb-3">Responsive Grids</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Redesigned layouts optimized dynamically across breakpoints from mobile devices to 4K desktops.
            </p>
          </div>

        </div>
      </section>



      {/* ========================================== */}
      {/* 5. ALTERNATE FEATURE SHOWCASES             */}
      {/* ========================================== */}
      <section id="features" className="relative z-10 py-20 px-6 max-w-[1360px] mx-auto flex flex-col gap-24">
        
        {/* Showcase 1: Left Copy, Right Mock */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 text-left flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm mb-4">
              01
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#111827] tracking-tight leading-tight mb-4">
              Global Edge CDN with Sub-10ms Latency Deliveries
            </h2>
            <p className="text-base text-[#6B7280] leading-relaxed mb-6">
              Streamify automatically caches and transmuxes video content across 280+ POP locations globally, ensuring instant startup times and adaptive bitrate switches.
            </p>
            <ul className="flex flex-col gap-3 text-sm font-medium text-[#111827] mb-8">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                <span>Automatic HLS / DASH adaptive manifest creation</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                <span>Edge token validation & geo-fencing restrictions</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                <span>Zero bandwidth throttling on peak traffic spikes</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6 bg-white p-6 rounded-[24px] border border-[#E5E7EB] shadow-lg text-left">
            <div className="flex items-center justify-between mb-4 border-b border-[#E5E7EB] pb-3">
              <span className="text-xs font-bold text-[#111827]">Global Node Health Map</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">ALL SYSTEMS NORMAL</span>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-[#111827]">us-east (N. Virginia)</span>
                </div>
                <span className="font-mono text-[#6B7280]">4.2 ms</span>
              </div>
              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-[#111827]">eu-central (Frankfurt)</span>
                </div>
                <span className="font-mono text-[#6B7280]">8.1 ms</span>
              </div>
              <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-[#111827]">ap-southeast (Tokyo)</span>
                </div>
                <span className="font-mono text-[#6B7280]">11.4 ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Showcase 2: Right Copy, Left Mock */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1 bg-white p-6 rounded-[24px] border border-[#E5E7EB] shadow-lg text-left">
            <div className="flex items-center justify-between mb-4 border-b border-[#E5E7EB] pb-3">
              <span className="text-xs font-bold text-[#111827]">Real-time Audience Retention</span>
              <span className="text-[10px] font-semibold text-indigo-600">LIVE FEED</span>
            </div>
            <div className="h-40 flex items-end gap-2 pt-4">
              {[40, 65, 80, 70, 85, 90, 95, 88, 92, 100, 78, 85, 94].map((v, i) => (
                <div key={`ret-${i}`} className="flex-1 bg-indigo-500 rounded-t hover:bg-indigo-600 transition-colors" style={{ height: `${v}%` }} />
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#6B7280]">
              <span>Avg Watch Duration: <strong className="text-[#111827]">14m 32s</strong></span>
              <span>Completion Rate: <strong className="text-emerald-600">84.2%</strong></span>
            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 text-left flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm mb-4">
              02
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#111827] tracking-tight leading-tight mb-4">
              Deep Audience Intelligence & Retention Metrics
            </h2>
            <p className="text-base text-[#6B7280] leading-relaxed mb-6">
              Track viewer engagement drop-offs, concurrent stream playback rates, geographical traffic distributions, and device composition in real-time.
            </p>
            <ul className="flex flex-col gap-3 text-sm font-medium text-[#111827] mb-8">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                <span>Second-by-second audience retention curves</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                <span>Custom webhook alerts on traffic spikes</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                <span>Exportable CSV / JSON telemetry logs</span>
              </li>
            </ul>
          </div>
        </div>

      </section>

      {/* ========================================== */}
      {/* 6. CALL TO ACTION BANNER                   */}
      {/* ========================================== */}
      <section className="relative z-10 py-16 px-6 max-w-[1240px] mx-auto">
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-[32px] p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
              Ready to Upgrade Your Streaming Pipeline?
            </h2>
            <p className="text-sm md:text-base text-indigo-200/80 mb-8 max-w-lg">
              Start streaming video assets globally in less than 5 minutes. No credit card required for developer tier.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/register"
                className="px-8 py-4 rounded-full bg-white text-[#111827] font-bold text-sm shadow-xl hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Create Free Account
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 rounded-full bg-white/10 border border-white/20 text-white font-semibold text-sm hover:bg-white/20 transition-all"
              >
                Sign In to Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 7. MULTI-COLUMN PREMIUM FOOTER             */}
      {/* ========================================== */}
      <footer className="relative z-10 bg-white border-t border-[#E5E7EB] pt-16 pb-12 px-6">
        <div className="max-w-[1360px] mx-auto grid grid-cols-2 md:grid-cols-5 gap-10 text-left mb-16">
          
          <div className="col-span-2 flex flex-col gap-4">
            <AppLogo showText={true} />
            <p className="text-xs text-[#6B7280] max-w-xs leading-relaxed">
              Enterprise video infrastructure for modern product teams. Fast transcoding, global CDN delivery, and deep analytics.
            </p>
            <span className="text-[10px] text-slate-400 font-mono">v1.0.0 Stable Build</span>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <span className="font-bold text-[#111827] uppercase tracking-wider text-[10px]">Product</span>
            <a href="#features" className="text-[#6B7280] hover:text-[#111827] transition-colors">Video CDN</a>
            <a href="#analytics" className="text-[#6B7280] hover:text-[#111827] transition-colors">Analytics</a>
            <a href="#security" className="text-[#6B7280] hover:text-[#111827] transition-colors">Security</a>
            <a href="#pricing" className="text-[#6B7280] hover:text-[#111827] transition-colors">Pricing</a>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <span className="font-bold text-[#111827] uppercase tracking-wider text-[10px]">Developers</span>
            <a href="#api" className="text-[#6B7280] hover:text-[#111827] transition-colors">API Docs</a>
            <a href="#sdks" className="text-[#6B7280] hover:text-[#111827] transition-colors">SDKs</a>
            <a href="#status" className="text-[#6B7280] hover:text-[#111827] transition-colors">System Status</a>
            <a href="#github" className="text-[#6B7280] hover:text-[#111827] transition-colors">GitHub</a>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <span className="font-bold text-[#111827] uppercase tracking-wider text-[10px]">Company</span>
            <a href="#about" className="text-[#6B7280] hover:text-[#111827] transition-colors">About Us</a>
            <a href="#careers" className="text-[#6B7280] hover:text-[#111827] transition-colors">Careers</a>
            <a href="#privacy" className="text-[#6B7280] hover:text-[#111827] transition-colors">Privacy Policy</a>
            <a href="#terms" className="text-[#6B7280] hover:text-[#111827] transition-colors">Terms of Service</a>
          </div>

        </div>

        <div className="max-w-[1360px] mx-auto pt-8 border-t border-[#E5E7EB] flex flex-col sm:flex-row justify-between items-center text-xs text-[#6B7280] gap-4">
          <p>&copy; {new Date().getFullYear()} Streamify Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Cookies</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
