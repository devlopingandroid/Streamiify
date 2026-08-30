import { describe, it, expect, beforeEach, vi } from "vitest";
import { apiClient, parseError } from "../services/apiClient";
import { getVideosApi } from "../services/video.api";

vi.mock("axios", async () => {
  const actual = await vi.importActual("axios");
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return {
    default: {
      ...actual.default,
      create: vi.fn(() => mockAxiosInstance),
      post: vi.fn(),
    },
  };
});

describe("Frontend API Client & Services Hardening Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getVideosApi Serialization & Parameter Handling", () => {
    it("1. getVideosApi with string query parameter passes query string correctly", async () => {
      const mockResponse = { data: { success: true, data: { docs: [] } } };
      apiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await getVideosApi("react");

      expect(apiClient.get).toHaveBeenCalledWith("/videos", {
        params: { query: "react" },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it("2. getVideosApi with object query parameter passes params object and NEVER generates /videos?query=[object Object]", async () => {
      const mockResponse = { data: { success: true, data: { docs: [] } } };
      apiClient.get.mockResolvedValueOnce(mockResponse);

      const paramsObj = {
        page: 1,
        limit: 10,
        query: "system design",
        sortBy: "createdAt",
        sortType: "desc",
        userId: "user_123",
      };

      const result = await getVideosApi(paramsObj);

      expect(apiClient.get).toHaveBeenCalledWith("/videos", {
        params: paramsObj,
      });

      const calledUrl = apiClient.get.mock.calls[0][0];
      const calledParams = apiClient.get.mock.calls[0][1].params;

      expect(calledUrl).toBe("/videos");
      expect(calledParams).not.toEqual("[object Object]");
      expect(typeof calledParams).toBe("object");
      expect(calledParams.query).toBe("system design");
      expect(result).toEqual(mockResponse.data);
    });

    it("3. getVideosApi with empty default parameter defaults to empty string query object", async () => {
      const mockResponse = { data: { success: true, data: { docs: [] } } };
      apiClient.get.mockResolvedValueOnce(mockResponse);

      await getVideosApi();

      expect(apiClient.get).toHaveBeenCalledWith("/videos", {
        params: { query: "" },
      });
    });
  });

  describe("API Error Parsing & HTTP Status Code Handling", () => {
    it("4. parseError normalizes backend 400 Bad Request error payload", () => {
      const mockError = {
        response: {
          status: 400,
          data: {
            success: false,
            message: "Bad request payload",
          },
        },
      };

      const parsed = parseError(mockError);
      expect(parsed.status).toBe(400);
      expect(parsed.statusCode).toBe(400);
      expect(parsed.message).toBe("Bad request payload");
    });

    it("5. parseError normalizes 422 Unprocessable Entity with error arrays and isValidationError flag", () => {
      const mockError = {
        response: {
          status: 422,
          data: {
            success: false,
            message: "Validation failed",
            errors: [{ field: "email", message: "Invalid email" }],
          },
        },
      };

      const parsed = parseError(mockError);
      expect(parsed.status).toBe(422);
      expect(parsed.isValidationError).toBe(true);
      expect(parsed.message).toBe("Validation failed");
      expect(parsed.errors).toHaveLength(1);
    });

    it("6. parseError handles ECONNABORTED connection timeout cleanly as status 408 with isNetworkError flag", () => {
      const mockError = {
        code: "ECONNABORTED",
        response: undefined,
      };

      const parsed = parseError(mockError);
      expect(parsed.status).toBe(408);
      expect(parsed.isNetworkError).toBe(true);
      expect(parsed.message).toContain("Connection timed out");
    });

    it("7. parseError handles network failure gracefully as status 0 with isNetworkError flag", () => {
      const mockError = {
        code: "ERR_NETWORK",
        response: undefined,
      };

      const parsed = parseError(mockError);
      expect(parsed.status).toBe(0);
      expect(parsed.isNetworkError).toBe(true);
      expect(parsed.message).toContain("Network connection failure");
    });

    it("8. parseError identifies 401 and 403 authorization errors via isAuthError flag", () => {
      const authError = parseError({ response: { status: 401, data: { message: "Unauthorized" } } });
      const forbiddenError = parseError({ response: { status: 403, data: { message: "Forbidden" } } });

      expect(authError.isAuthError).toBe(true);
      expect(forbiddenError.isAuthError).toBe(true);
    });

    it("9. parseError identifies 404 not found, 409 conflict, 429 rate limit, and 500 server errors", () => {
      const notFound = parseError({ response: { status: 404, data: { message: "Not found" } } });
      const conflict = parseError({ response: { status: 409, data: { message: "Duplicate record" } } });
      const rateLimit = parseError({ response: { status: 429, data: { message: "Too many requests" } } });
      const serverError = parseError({ response: { status: 500, data: { message: "Internal server error" } } });

      expect(notFound.isNotFound).toBe(true);
      expect(conflict.isConflict).toBe(true);
      expect(rateLimit.isRateLimited).toBe(true);
      expect(serverError.isServerError).toBe(true);
    });
  });
});
