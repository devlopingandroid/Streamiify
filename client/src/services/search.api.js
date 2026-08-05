import { apiClient } from "./apiClient";

export const getSearchResultsApi = async (query = "") => {
  const response = await apiClient.get(`/videos?query=${encodeURIComponent(query)}`);
  return response.data;
};
export default getSearchResultsApi;
