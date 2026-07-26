import axios from "axios";
import Constants from "expo-constants";
import { getDonationToken } from "../services/auth";

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_DONATION_API_BASE_URL) return process.env.EXPO_PUBLIC_DONATION_API_BASE_URL;
  if (__DEV__) {
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      return `http://${hostUri.split(':')[0]}:3000`;
    }
  }
  return "http://10.0.2.2:3000";
};

const donationApi = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
});

donationApi.interceptors.request.use(async (config) => {
  const token = await getDonationToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

donationApi.interceptors.response.use(
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

export default donationApi;
