import { apiClient } from "./apiClient";

const MOCK_VIDEOS = [
  {
    _id: "vid-101",
    videoFile: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnail: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=640&auto=format&fit=crop",
    title: "Advanced System Architecture: Designing Scale-out Distributed Services",
    description: "An in-depth session detailing clustering, global caching layers (Redis/Memcached), and dynamic rate-limiting algorithms to support 100k+ concurrent requests. We examine real-world failures, database sharding partitions, and custom reverse-proxy balancing mechanisms.",
    duration: 596,
    views: 124500,
    isPublished: true,
    owner: {
      _id: "user-arch",
      username: "systemarch",
      fullname: "Tech Architecture Labs",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=150&auto=format&fit=crop",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    _id: "vid-102",
    videoFile: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=640&auto=format&fit=crop",
    title: "Exploring React 19 Server Actions & Global State Compilers",
    description: "Reviewing the new compilation engine in React 19, detailing automated memoization hooks, and server-side action handlers. Learn how to optimize component re-renders without manually typing useMemo and useCallback hooks across large dashboards.",
    duration: 653,
    views: 89300,
    isPublished: true,
    owner: {
      _id: "user-code",
      username: "codecraft",
      fullname: "CodeCraft Academy",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    _id: "vid-103",
    videoFile: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=640&auto=format&fit=crop",
    title: "Complete Guide to Database Optimizations & Query Indexings",
    description: "Learn how to diagnose slow database transactions in PostgreSQL and MongoDB. We cover B-Tree indexes, compound index keys, explain-analyze plans, and optimal schema design strategies for massive data reporting tools.",
    duration: 902,
    views: 245000,
    isPublished: true,
    owner: {
      _id: "user-db",
      username: "dbguru",
      fullname: "Database Masterclass",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
  },
  {
    _id: "vid-104",
    videoFile: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnail: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=640&auto=format&fit=crop",
    title: "Building Enterprise UI/UX Libraries from Scratch using CSS Variables",
    description: "A deep dive into variables customization, modular design structures, and accessible screen-reader component structures. We review keyboard navigation binds, color contrast tools, and theme switching controls.",
    duration: 412,
    views: 45200,
    isPublished: true,
    owner: {
      _id: "user-design",
      username: "pixelsmith",
      fullname: "Pixel Smith Designs",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    _id: "vid-105",
    videoFile: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=640&auto=format&fit=crop",
    title: "Security Fundamentals: Safeguarding REST APIs & Defending OWASP Risks",
    description: "Learn how to defend against JWT manipulation, Cross-Site Scripting (XSS), SQL Injections, and authentication bypasses. Understand proper security configurations (HttpOnly flags, CSP rules, sanitizers).",
    duration: 780,
    views: 67100,
    isPublished: true,
    owner: {
      _id: "user-sec",
      username: "secguard",
      fullname: "Cyber Security Core",
      avatar: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?q=80&w=150&auto=format&fit=crop",
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
];

export const getVideosApi = async (query = "") => {
  try {
    const response = await apiClient.get(
      `/videos?query=${encodeURIComponent(query)}`
    );

    console.log("VIDEOS API");
    console.log(response.data);

    return response.data;
  } catch (error) {
    console.log("VIDEOS API ERROR");
    console.log(error);

    throw error;
  }
};

export const getTrendingVideosApi = async () => {
  try {
    const response = await apiClient.get(
      "/videos?sortBy=views&sortType=desc"
    );

    console.log("TRENDING API");
    console.log(response.data);

    return response.data;
  } catch (error) {
    console.log("TRENDING ERROR");
    console.log(error);

    throw error;
  }
};

export const getVideoByIdApi = async (id) => {
  try {
    const response = await apiClient.get(`/videos/${id}`);
    return response.data;
  } catch (_error) {
    // Return mock data single find fallback for stability
    const video = MOCK_VIDEOS.find((v) => v._id === id);
    if (!video) throw _error;
    return { data: video };
  }
};

export const uploadVideoApi = async (formData, onUploadProgress) => {
  const response = await apiClient.post("/videos", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
  });
  return response.data;
};

export const deleteVideoApi = async (videoId) => {
  const response = await apiClient.delete(`/videos/${videoId}`);
  return response.data;
};

export const toggleVideoStatusApi = async (videoId) => {
  const response = await apiClient.patch(`/videos/${videoId}/toggle-publish`);
  return response.data;
};


