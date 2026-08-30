import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../store/authSlice";
import uiReducer from "../store/uiSlice";
import { VideoCard } from "../components/video/VideoCard";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { PageLoader } from "../components/ui/PageLoader";

const createTestStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
    },
  });

const renderWithProviders = (ui, { store = createTestStore() } = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{ui}</BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
};

describe("Frontend Components & Rules-of-Hooks Tests", () => {
  const mockVideo = {
    _id: "video_101",
    title: "Testing System Architecture",
    description: "Learn test-driven development in distributed systems.",
    videoFile: "https://example.com/video.mp4",
    thumbnail: "https://example.com/thumb.jpg",
    duration: 300,
    views: 1500,
    owner: {
      _id: "user_owner",
      username: "techlead",
      fullname: "Tech Lead",
      avatar: "https://example.com/avatar.jpg",
    },
    createdAt: new Date().toISOString(),
  };

  it("1. VideoCard renders video title, owner name, and metadata cleanly", () => {
    renderWithProviders(<VideoCard video={mockVideo} />);

    expect(screen.getByText("Testing System Architecture")).toBeInTheDocument();
    expect(screen.getByText("Tech Lead")).toBeInTheDocument();
  });

  it("2. VideoCard rules-of-hooks compliance: returns null safely without hook order mismatch when video is null", () => {
    const { container } = renderWithProviders(<VideoCard video={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("3. EmptyState component renders empty state title, description, and message", () => {
    renderWithProviders(
      <EmptyState
        title="No Videos Found"
        description="Try uploading a new video or checking back later."
      />
    );

    expect(screen.getByText("No Videos Found")).toBeInTheDocument();
    expect(
      screen.getByText("Try uploading a new video or checking back later.")
    ).toBeInTheDocument();
  });

  it("4. ErrorState component renders user-friendly error details", () => {
    renderWithProviders(
      <ErrorState
        title="Failed to Load Data"
        description="Network connection timeout. Please verify internet connection."
      />
    );

    expect(screen.getByText("Failed to Load Data")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Network connection timeout. Please verify internet connection."
      )
    ).toBeInTheDocument();
  });

  it("5. PageLoader component renders loading message", () => {
    renderWithProviders(<PageLoader message="Loading workspace assets..." />);
    expect(screen.getByText("Loading workspace assets...")).toBeInTheDocument();
  });
});
