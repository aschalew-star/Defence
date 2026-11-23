import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { server } from "../server";

export const apiClient: AxiosInstance = axios.create({
  baseURL: server,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected server error occurred";
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
