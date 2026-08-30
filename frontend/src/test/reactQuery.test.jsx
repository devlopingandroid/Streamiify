import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider, useMutation } from "@tanstack/react-query";
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

  it("3. useVideos handles API query failure gracefully setting isError to true", async () => {
    videoApi.getVideosApi.mockRejectedValueOnce({
      status: 500,
      message: "Server internal error",
    });

    const { result } = renderHook(() => useVideos("error_query"), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });

  it("4. Optimistic UI mutation performs update and rolls back cache state on mutation error", async () => {
    const initialPlaylists = [{ _id: "p1", name: "Original Name" }];
    queryClient.setQueryData(["playlists"], initialPlaylists);

    const useTestOptimisticMutation = () =>
      useMutation({
        mutationFn: async () => {
          throw new Error("Mutation server failure");
        },
        onMutate: async (newValues) => {
          await queryClient.cancelQueries({ queryKey: ["playlists"] });
          const previous = queryClient.getQueryData(["playlists"]);
          queryClient.setQueryData(["playlists"], [{ _id: "p1", name: newValues.name }]);
          return { previous };
        },
        onError: (err, newValues, context) => {
          if (context?.previous) {
            queryClient.setQueryData(["playlists"], context.previous);
          }
        },
      });

    const { result } = renderHook(() => useTestOptimisticMutation(), { wrapper });

    result.current.mutate({ name: "Optimistic Name" });

    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert cache was rolled back to original state
    const currentCache = queryClient.getQueryData(["playlists"]);
    expect(currentCache).toEqual(initialPlaylists);
  });
});
