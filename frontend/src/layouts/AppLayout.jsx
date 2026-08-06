import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useLogout } from "../hooks/useAuth";
import { toggleSidebar } from "../store/uiSlice";
import { useDebounce } from "../hooks/useDebounce";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { NotificationBell } from "../components/notification/NotificationBell";
import { AppLogo } from "../components/ui/AppLogo";
import { Avatar } from "../components/ui/Avatar";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Menu,
  Home,
  LogOut,
  Search,
  ChevronDown,
  X,
  User,
  Settings,
  Clock,
  Bookmark,
  ThumbsUp,
  UserCheck,
  PlaySquare,
  Upload,
  Flame,
  BarChart3,
  Plus
} from "lucide-react";

export const AppLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const { sidebarExpanded } = useSelector((state) => state.ui);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(null, {
      onSuccess: () => {
        toast.success("Successfully logged out.");
        navigate("/landing");
      },
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-800 dark:text-slate-100 relative transition-colors duration-200">
      {/* Top Navbar */}
      <TopNavbar
        user={user}
        onToggleSidebar={() => dispatch(toggleSidebar())}
        onOpenMobile={() => setMobileOpen(true)}
        dropdownOpen={dropdownOpen}
        onToggleDropdown={() => setDropdownOpen(!dropdownOpen)}
        onCloseDropdown={() => setDropdownOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Body */}
      <div className="flex flex-grow relative bg-slate-50 dark:bg-[#090D16]" style={{ marginTop: "72px" }}>
        {/* Collapsible Sidebar for Desktop */}
        <DesktopSidebar sidebarExpanded={sidebarExpanded} />

        {/* Off-canvas mobile drawer with Framer Motion */}
        <AnimatePresence>
          {mobileOpen && (
            <MobileDrawer
              onClose={() => setMobileOpen(false)}
              onLogout={handleLogout}
            />
          )}
        </AnimatePresence>

        {/* Content Panel */}
        <main
          className="flex-grow min-h-[calc(100vh-72px)] bg-slate-50 dark:bg-[#090D16] p-6 md:p-8 transition-all duration-300 max-[768px]:!ml-0"
          style={{ marginLeft: sidebarExpanded ? "256px" : "80px" }}
        >
          <div className="w-full max-w-[1400px] mx-auto">
            {/* Framer motion page transition wrapper */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full"
            >
              <Outlet />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

// ==========================================
// Sub Component: TopNavbar
// ==========================================
const TopNavbar = ({
  user,
  onToggleSidebar,
  onOpenMobile,
  dropdownOpen,
  onToggleDropdown,
  onCloseDropdown,
  onLogout,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") || "";

  const [searchValue, setSearchValue] = useState(urlQuery);
  const debouncedSearch = useDebounce(searchValue, 300);
  const inputRef = React.useRef(null);

  // Synchronize search input state when URL query parameter changes (e.g., Back/Forward navigation)
  useEffect(() => {
    setSearchValue(urlQuery);
  }, [urlQuery]);

  // Synchronize debounced search input with navigation/URL
  useEffect(() => {
    const trimmedInput = searchValue.trim();
    const trimmedDebounced = debouncedSearch.trim();
    const trimmedUrl = urlQuery.trim();

    // Only sync auto-search navigation when currently on the /search page
    if (location.pathname === "/search") {
      if (trimmedInput === trimmedDebounced && trimmedDebounced !== trimmedUrl) {
        if (trimmedDebounced) {
          navigate(`/search?q=${encodeURIComponent(trimmedDebounced)}`, { replace: true });
        } else if (trimmedUrl) {
          navigate("/search", { replace: true });
        }
      }
    }
  }, [debouncedSearch, searchValue, urlQuery, location.pathname, navigate]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const trimmedQuery = searchValue.trim();
    if (trimmedQuery) {
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    } else if (location.pathname === "/search") {
      navigate("/search");
    }
  };

  const handleClear = () => {
    setSearchValue("");
    if (location.pathname === "/search") {
      navigate("/search");
    }
    inputRef.current?.focus();
  };

  return (
    <header className="flex h-[72px] items-center justify-between px-4 sm:px-6 fixed top-0 left-0 right-0 z-[1000] bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800/80 gap-2 transition-colors duration-200">
      <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobile}
          className="md:hidden w-10 h-10 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Open navigation drawer"
        >
          <Menu size={20} />
        </button>

        {/* Desktop sidebar trigger */}
        <button
          onClick={onToggleSidebar}
          className="hidden md:flex w-10 h-10 rounded-full items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Toggle sidebar panel"
        >
          <Menu size={20} />
        </button>

        <Link to="/" className="flex items-center">
          <AppLogo showText={true} />
        </Link>
      </div>

      {/* Responsive Search Pill */}
      <form
        onSubmit={handleSearch}
        className="flex items-center w-full max-w-[180px] xs:max-w-[260px] sm:max-w-[420px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus-within:border-slate-400 dark:focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-slate-100 dark:focus-within:ring-cyan-500/20 rounded-full px-3 sm:px-4 py-2 transition-all select-none mx-1 sm:mx-2"
      >
        <button
          type="submit"
          className="bg-transparent border-none p-0 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mr-2 flex-shrink-0 cursor-pointer focus:outline-none flex items-center justify-center"
          aria-label="Submit search"
        >
          <Search size={16} />
        </button>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search Streamify library..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="bg-transparent text-xs text-slate-900 dark:text-slate-100 w-full focus:outline-none placeholder-slate-400 dark:placeholder-slate-500"
          aria-label="Search field input"
        />
        {!searchValue && (
          <span className="hidden sm:inline-block text-[10px] text-slate-400 dark:text-slate-500 bg-slate-200/60 dark:bg-slate-700/50 px-2 py-0.5 rounded border border-slate-300/60 dark:border-slate-600/50 font-mono select-none flex-shrink-0">
            ⌘ K
          </span>
        )}
        {searchValue && (
          <button
            type="button"
            onClick={handleClear}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer animate-fade-in p-0.5"
            aria-label="Clear search field"
          >
            <X size={14} />
          </button>
        )}
      </form>

      {/* Controls / Avatar dropdown */}
      <div className="flex items-center gap-3">
        <Link
          to="/upload"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-xs font-semibold cursor-pointer shadow-xs active:scale-95"
          title="Upload Video"
        >
          <Plus size={16} className="text-slate-900 dark:text-slate-100 stroke-[2.5]" />
          <span>Create</span>
        </Link>

        <ThemeToggle />

        <NotificationBell />

        <div className="relative">
          <button
            onClick={onToggleDropdown}
            className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            aria-label="User profile settings menu"
          >
            <Avatar src={user?.avatar} name={user?.fullname || "User"} size="sm" />
            <ChevronDown size={14} className="text-slate-500 dark:text-slate-400 mr-0.5" />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-[99]" onClick={onCloseDropdown} />
              <div className="absolute right-0 top-[calc(100%+8px)] w-[220px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-1.5 shadow-2xl z-[100] animate-fade-in text-slate-800 dark:text-slate-100">
                <div className="px-3 py-2 text-left">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.fullname}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">@{user?.username}</p>
                </div>
                <hr className="border-slate-200 dark:border-slate-800 my-1" />

                <Link
                  to="/"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                  onClick={onCloseDropdown}
                >
                  <Home size={15} />
                  <span>My Dashboard</span>
                </Link>

                <Link
                  to="/analytics"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                  onClick={onCloseDropdown}
                >
                  <BarChart3 size={15} />
                  <span>Creator Analytics</span>
                </Link>

                <Link
                  to={`/c/${user?.username}`}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                  onClick={onCloseDropdown}
                >
                  <User size={15} />
                  <span>My Channel</span>
                </Link>

                <Link
                  to="/settings"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                  onClick={onCloseDropdown}
                >
                  <Settings size={15} />
                  <span>Account Settings</span>
                </Link>

                <Link
                  to="/upload"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                  onClick={onCloseDropdown}
                >
                  <Upload size={15} />
                  <span>Upload Video</span>
                </Link>

                <hr className="border-slate-200 dark:border-slate-800 my-1" />
                <button
                  onClick={() => {
                    onCloseDropdown();
                    onLogout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

// ==========================================
// Sub Component: DesktopSidebar
// ==========================================
const DesktopSidebar = ({ sidebarExpanded }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `flex items-center gap-4 pl-5 pr-4 py-2.5 rounded-[12px] transition-all duration-200 ease-in-out active:scale-95 h-12 relative group ${
      isActive(path)
        ? "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 font-bold"
        : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 font-medium"
    }`;

  const iconClass = (path) =>
    `transition-transform duration-200 ${
      isActive(path)
        ? "scale-110 text-cyan-600 dark:text-cyan-400"
        : "text-slate-500 dark:text-slate-400 group-hover:scale-110 group-hover:text-slate-900 dark:group-hover:text-white"
    }`;

  return (
    <aside
      className="bg-white dark:bg-[#0F172A] fixed bottom-0 left-0 z-[998] py-6 transition-all duration-300 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800/80 max-[768px]:-translate-x-full shadow-xs"
      style={{ top: "72px", width: sidebarExpanded ? "256px" : "80px" }}
    >
      <nav className="flex flex-col gap-1.5 px-3">
        <Link to="/" className={linkClass("/")} title="Home Feed">
          {isActive("/") && <span className="absolute left-0 top-2 bottom-2 w-1 bg-cyan-500 rounded-r-full animate-fade-in" />}
          <Home size={20} className={iconClass("/")} />
          {sidebarExpanded && <span className="text-xs">Home Feed</span>}
        </Link>

        <Link to="/analytics" className={linkClass("/analytics")} title="Creator Analytics">
          {isActive("/analytics") && <span className="absolute left-0 top-2 bottom-2 w-1 bg-cyan-500 rounded-r-full animate-fade-in" />}
          <BarChart3 size={20} className={iconClass("/analytics")} />
          {sidebarExpanded && <span className="text-xs">Creator Analytics</span>}
        </Link>

        <Link to="/trending" className={linkClass("/trending")} title="Trending">
          {isActive("/trending") && <span className="absolute left-0 top-2 bottom-2 w-1 bg-cyan-500 rounded-r-full animate-fade-in" />}
          <Flame size={20} className={iconClass("/trending")} />
          {sidebarExpanded && <span className="text-xs">Trending</span>}
        </Link>

        <Link to="/feed/subscriptions" className={linkClass("/feed/subscriptions")} title="Subscriptions">
          {isActive("/feed/subscriptions") && <span className="absolute left-0 top-2 bottom-2 w-1 bg-cyan-500 rounded-r-full animate-fade-in" />}
          <UserCheck size={20} className={iconClass("/feed/subscriptions")} />
          {sidebarExpanded && <span className="text-xs">Subscriptions</span>}
        </Link>

        <Link to="/playlists" className={linkClass("/playlists")} title="Playlists">
          {isActive("/playlists") && <span className="absolute left-0 top-2 bottom-2 w-1 bg-cyan-500 rounded-r-full animate-fade-in" />}
          <PlaySquare size={20} className={iconClass("/playlists")} />
          {sidebarExpanded && <span className="text-xs">Playlists</span>}
        </Link>

        <Link to="/history" className={linkClass("/history")} title="Watch History">
          {isActive("/history") && <span className="absolute left-0 top-2 bottom-2 w-1 bg-cyan-500 rounded-r-full animate-fade-in" />}
          <Clock size={20} className={iconClass("/history")} />
          {sidebarExpanded && <span className="text-xs">History</span>}
        </Link>

        <Link to="/watch-later" className={linkClass("/watch-later")} title="Watch Later">
          {isActive("/watch-later") && <span className="absolute left-0 top-2 bottom-2 w-1 bg-cyan-500 rounded-r-full animate-fade-in" />}
          <Bookmark size={20} className={iconClass("/watch-later")} />
          {sidebarExpanded && <span className="text-xs">Watch Later</span>}
        </Link>

        <Link to="/liked-videos" className={linkClass("/liked-videos")} title="Liked Videos">
          {isActive("/liked-videos") && <span className="absolute left-0 top-2 bottom-2 w-1 bg-cyan-500 rounded-r-full animate-fade-in" />}
          <ThumbsUp size={20} className={iconClass("/liked-videos")} />
          {sidebarExpanded && <span className="text-xs">Liked Videos</span>}
        </Link>
      </nav>

      {sidebarExpanded && (
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 text-left select-none">
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Streamify Corp &copy; {new Date().getFullYear()}</p>
        </div>
      )}
    </aside>
  );
};

// ==========================================
// Sub Component: MobileDrawer
// ==========================================
const MobileDrawer = ({ onClose, onLogout }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `flex items-center gap-4 px-4 py-3 rounded-[12px] transition-all relative ${
      isActive(path)
        ? "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 font-bold"
        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
    }`;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 z-[1998] bg-slate-950/40 backdrop-blur-sm"
      />

      {/* Drawer Card */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
        className="fixed bottom-0 left-0 w-[280px] bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-800 z-[1999] p-6 flex flex-col justify-between"
        style={{ top: "72px" }}
      >
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <AppLogo />
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
              aria-label="Close drawer"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            <Link to="/" onClick={onClose} className={linkClass("/")}>
              {isActive("/") && <span className="absolute left-0 top-2 bottom-2 w-1 bg-slate-900 dark:bg-cyan-400 rounded-r-full" />}
              <Home size={20} />
              <span className="text-xs font-semibold">Home Feed</span>
            </Link>

            <Link to="/analytics" onClick={onClose} className={linkClass("/analytics")}>
              {isActive("/analytics") && <span className="absolute left-0 top-2 bottom-2 w-1 bg-slate-900 dark:bg-cyan-400 rounded-r-full" />}
              <BarChart3 size={20} />
              <span className="text-xs font-semibold">Creator Analytics</span>
            </Link>

            <Link to="/trending" onClick={onClose} className={linkClass("/trending")}>
              {isActive("/trending") && <span className="absolute left-0 top-2 bottom-2 w-1 bg-slate-900 dark:bg-cyan-400 rounded-r-full" />}
              <Flame size={20} />
              <span className="text-xs font-semibold">Trending</span>
            </Link>

            <Link to="/feed/subscriptions" onClick={onClose} className={linkClass("/feed/subscriptions")}>
              {isActive("/feed/subscriptions") && <span className="absolute left-0 top-2 bottom-2 w-1 bg-slate-900 dark:bg-cyan-400 rounded-r-full" />}
              <UserCheck size={20} />
              <span className="text-xs font-semibold">Subscriptions</span>
            </Link>

            <Link to="/playlists" onClick={onClose} className={linkClass("/playlists")}>
              {isActive("/playlists") && <span className="absolute left-0 top-2 bottom-2 w-1 bg-slate-900 dark:bg-cyan-400 rounded-r-full" />}
              <PlaySquare size={20} />
              <span className="text-xs font-semibold">Playlists</span>
            </Link>

            <Link to="/history" onClick={onClose} className={linkClass("/history")}>
              {isActive("/history") && <span className="absolute left-0 top-2 bottom-2 w-1 bg-slate-900 dark:bg-cyan-400 rounded-r-full" />}
              <Clock size={20} />
              <span className="text-xs font-semibold">History</span>
            </Link>

            <Link to="/watch-later" onClick={onClose} className={linkClass("/watch-later")}>
              {isActive("/watch-later") && <span className="absolute left-0 top-2 bottom-2 w-1 bg-slate-900 dark:bg-cyan-400 rounded-r-full" />}
              <Bookmark size={20} />
              <span className="text-xs font-semibold">Watch Later</span>
            </Link>

            <Link to="/liked-videos" onClick={onClose} className={linkClass("/liked-videos")}>
              {isActive("/liked-videos") && <span className="absolute left-0 top-2 bottom-2 w-1 bg-slate-900 dark:bg-cyan-400 rounded-r-full" />}
              <ThumbsUp size={20} />
              <span className="text-xs font-semibold">Liked Videos</span>
            </Link>
          </nav>
        </div>

        <button
          onClick={() => {
            onClose();
            onLogout();
          }}
          className="w-full flex items-center gap-4 px-3 py-3 rounded-[12px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
        >
          <LogOut size={20} />
          <span className="text-xs font-semibold">Sign Out</span>
        </button>
      </motion.div>
    </>
  );
};

export default AppLayout;
