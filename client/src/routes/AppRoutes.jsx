import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute, PublicOnlyRoute } from "./RouteGuards";
import { AppLayout } from "../layouts/AppLayout";
import { PageLoader } from "../components/ui/PageLoader";

// Lazy load Pages
const LandingPage = lazy(() => import("../pages/LandingPage").then(module => ({ default: module.LandingPage })));
const LoginPage = lazy(() => import("../pages/LoginPage").then(module => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import("../pages/RegisterPage").then(module => ({ default: module.RegisterPage })));
const ForgotPasswordPage = lazy(() => import("../pages/ForgotPasswordPage").then(module => ({ default: module.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import("../pages/ResetPasswordPage").then(module => ({ default: module.ResetPasswordPage })));
const EmailPendingPage = lazy(() => import("../pages/EmailPendingPage").then(module => ({ default: module.EmailPendingPage })));
const VerifyEmailPage = lazy(() => import("../pages/VerifyEmailPage").then(module => ({ default: module.VerifyEmailPage })));
const HomePage = lazy(() => import("../pages/HomePage").then(module => ({ default: module.HomePage })));
const WatchPage = lazy(() => import("../pages/WatchPage").then(module => ({ default: module.WatchPage })));
const ChannelPage = lazy(() => import("../pages/ChannelPage").then(module => ({ default: module.ChannelPage })));
const SettingsPage = lazy(() => import("../pages/SettingsPage").then(module => ({ default: module.SettingsPage })));
const SearchResultsPage = lazy(() => import("../pages/SearchResultsPage").then(module => ({ default: module.SearchResultsPage })));
const HistoryPage = lazy(() => import("../pages/HistoryPage").then(module => ({ default: module.HistoryPage })));
const WatchLaterPage = lazy(() => import("../pages/WatchLaterPage").then(module => ({ default: module.WatchLaterPage })));
const LikedVideosPage = lazy(() => import("../pages/LikedVideosPage").then(module => ({ default: module.LikedVideosPage })));
const SubscriptionsPage = lazy(() => import("../pages/SubscriptionsPage").then(module => ({ default: module.SubscriptionsPage })));
const SubscriptionsFeedPage = lazy(() => import("../pages/SubscriptionsFeedPage")); const PlaylistsPage = lazy(() => import("../pages/PlaylistsPage").then(module => ({ default: module.PlaylistsPage })));
const TrendingPage = lazy(() => import("../pages/TrendingPage").then(module => ({ default: module.TrendingPage })));
const PlaylistDetailsPage = lazy(() => import("../pages/PlaylistDetailsPage").then(module => ({ default: module.PlaylistDetailsPage })));
const UploadVideoPage = lazy(() => import("../pages/UploadVideoPage").then(module => ({ default: module.UploadVideoPage })));
const EditVideoPage = lazy(() => import("../pages/EditVideoPage").then(module => ({ default: module.EditVideoPage })));
const NotificationsPage = lazy(() => import("../pages/NotificationsPage").then(module => ({ default: module.NotificationsPage })));
const AnalyticsPage = lazy(() => import("../pages/AnalyticsPage").then(module => ({ default: module.AnalyticsPage })));


// Error Pages
const NotFoundPage = lazy(() => import("../pages/error/NotFoundPage").then(module => ({ default: module.NotFoundPage })));
const ForbiddenPage = lazy(() => import("../pages/error/ForbiddenPage").then(module => ({ default: module.ForbiddenPage })));
const ServerErrorPage = lazy(() => import("../pages/error/ServerErrorPage").then(module => ({ default: module.ServerErrorPage })));
const OfflinePage = lazy(() => import("../pages/error/OfflinePage").then(module => ({ default: module.OfflinePage })));
const MaintenancePage = lazy(() => import("../pages/error/MaintenancePage").then(module => ({ default: module.MaintenancePage })));

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader message="Loading page assets..." />}>
        <Routes>
          {/* Public-Only Gateway (Sign-in / Register / Forgot Password / Reset Password / Email Verification Pending / Verify Token) */}
          <Route element={<PublicOnlyRoute redirectPath="/" />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/verify-email-pending" element={<EmailPendingPage />} />
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
          </Route>

          {/* Publicly Accessible Landing Index */}
          <Route path="/landing" element={<LandingPage />} />

          {/* Secure Layout Portal Area */}
          <Route element={<ProtectedRoute redirectPath="/landing" />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/watch/:videoId" element={<WatchPage />} />
              <Route path="/c/:username" element={<ChannelPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/watch-later" element={<WatchLaterPage />} />
              <Route path="/liked-videos" element={<LikedVideosPage />} />
              <Route path="/subscriptions" element={<SubscriptionsPage />} />
              <Route path="/feed/subscriptions" element={<SubscriptionsFeedPage />} />
              <Route path="/subscriptions/feed" element={<SubscriptionsFeedPage />} />
              <Route path="/trending" element={<TrendingPage />} />
              <Route path="/playlists" element={<PlaylistsPage />} />
              <Route path="/playlists/:playlistId" element={<PlaylistDetailsPage />} />
              <Route path="/upload" element={<UploadVideoPage />} />
              <Route path="/edit-video/:videoId" element={<EditVideoPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />

            </Route>

          </Route>

          {/* Global Error Boundaries Routes */}
          <Route path="/403" element={<ForbiddenPage />} />
          <Route path="/500" element={<ServerErrorPage />} />
          <Route path="/offline" element={<OfflinePage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />

          {/* Catch-all 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
export default AppRoutes;
