import { apiClient } from "./apiClient";

export const getSubscriptionsApi = async () => {
  const response = await apiClient.get("/subscriptions");
  return response.data;
};

export const toggleSubscriptionApi = async (channelId) => {
  const response = await apiClient.post(`/subscriptions/${channelId}`);
  return response.data;
};

export const getSubscriptionStatusApi = async (channelId) => {
  const response = await apiClient.get(`/subscriptions/${channelId}/status`);
  return response.data;
};

export const getSubscribedChannelsApi = async () => {
  const response = await apiClient.get("/subscriptions/channels");
  return response.data;
};

export const getSubscriptionsFeedApi = async (page = 1, limit = 10) => {
  const response = await apiClient.get("/subscriptions/feed", {
    params: { page, limit },
  });
  return response.data;
};

export const getChannelSubscribersApi = async (channelId) => {
  const response = await apiClient.get(`/subscriptions/${channelId}/subscribers`);
  return response.data;
};


