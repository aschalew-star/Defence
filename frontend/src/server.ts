import axios from "axios";

const rawBackendUrl =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
export const server: string = rawBackendUrl.replace(/\/+$/, "");

const rawSocketUrl =
  process.env.REACT_APP_SOCKET_URL ||
  process.env.REACT_APP_BACKEND_URL ||
  "http://localhost:5000";
export const socketServer: string = rawSocketUrl.replace(/\/+$/, "");

// Global Axios configuration: automatically include credentials (session cookies) across all requests
axios.defaults.withCredentials = true;

export default server;
