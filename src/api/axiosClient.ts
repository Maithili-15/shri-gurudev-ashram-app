import axios from "axios";
import { getAuthToken } from "../services/auth";
import { getBaseUrl } from "../utils/config";

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 404) {
      return Promise.resolve({
        data: null,
        status: 404,
        statusText: "Not Found",
        headers: {},
        config: error.config,
      });
    }
    return Promise.reject(error);
  }
);

export default api;
