export const CACHE_KEYS = {
  ANALYTICS: (userId) => `analytics:${userId}`,

  PROFILE: (username) => `profile:${username}`,

  TRENDING: "videos:trending",

  FEED: (userId) => `feed:${userId}`,

  RECOMMENDATIONS: (userId) => `recommendations:${userId}`,
};
