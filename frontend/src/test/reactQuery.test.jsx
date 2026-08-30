import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useVideos, useVideo } from "../hooks/useVideos";
import * as videoApi from "../services/video.api";

vi.mock("../services/video.api");

describe("React Query Hooks Behavior Tests", () => {
  let queryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("1. useVideos hook fetches catalog and returns docs array", async () => {
    const mockDocs = [
      { _id: "v1", title: "Video 1" },
      { _id: "v2", title: "Video 2" },
    ];
    videoApi.getVideosApi.mockResolvedValueOnce({
      data: { docs: mockDocs },
    });

    const { result } = renderHook(() => useVideos("test"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockDocs);
    expect(videoApi.getVideosApi).toHaveBeenCalledWith("test");
  });

  it("2. useVideo hook fetches single video details by ID", async () => {
    const mockVideo = { _id: "v101", title: "Detailed Video" };
    videoApi.getVideoByIdApi.mockResolvedValueOnce({
      data: mockVideo,
    });

    const { result } = renderHook(() => useVideo("v101"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockVideo);
    expect(videoApi.getVideoByIdApi).toHaveBeenCalledWith("v101");
  });
});
