import React, { Suspense } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { useDebounce } from "../hooks/useDebounce";

// Mock a heavy lazy-loaded component
const MockLazyComponent = React.lazy(
  () =>
    new Promise((resolve) =>
      setTimeout(
        () => resolve({ default: () => <div>Heavy Loaded Module</div> }),
        100
      )
    )
);

describe("Frontend Performance & Bundle Optimization Tests", () => {
  describe("1. Route Code-Splitting & Lazy Loading", () => {
    it("renders Suspense fallback and then lazy component cleanly", async () => {
      render(
        <Suspense fallback={<div>Loading chunk...</div>}>
          <MockLazyComponent />
        </Suspense>
      );

      expect(screen.getByText("Loading chunk...")).toBeInTheDocument();

      await waitFor(() =>
        expect(screen.getByText("Heavy Loaded Module")).toBeInTheDocument()
      );
    });
  });

  describe("2. Network & Search Debounce Optimization", () => {
    it("useDebounce delays value updates to prevent duplicate rapid API requests", async () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: "re", delay: 200 } }
      );

      expect(result.current).toBe("re");

      // Rapid typing simulation
      rerender({ value: "rea", delay: 200 });
      rerender({ value: "react", delay: 200 });

      // Before delay expires, old value is preserved
      expect(result.current).toBe("re");

      // Wait for debounce delay
      await waitFor(
        () => {
          expect(result.current).toBe("react");
        },
        { timeout: 400 }
      );
    });
  });

  describe("3. TanStack Query Cache & StaleTime Configuration", () => {
    it("QueryClient reuses cached query result within staleTime window without refetching", async () => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5000, // 5s staleTime
          },
        },
      });

      const fetchFn = vi.fn().mockResolvedValue({ data: "Cached Data" });

      // Initial fetch
      await queryClient.fetchQuery({
        queryKey: ["testKey"],
        queryFn: fetchFn,
      });

      expect(fetchFn).toHaveBeenCalledTimes(1);

      // Second fetch within staleTime reuses cache
      const cached = await queryClient.fetchQuery({
        queryKey: ["testKey"],
        queryFn: fetchFn,
      });

      expect(cached).toEqual({ data: "Cached Data" });
      expect(fetchFn).toHaveBeenCalledTimes(1); // Not called second time!
    });
  });
});
