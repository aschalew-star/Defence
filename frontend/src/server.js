export const server =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
export const socketServer =
  process.env.REACT_APP_SOCKET_URL || "http://localhost:4000";

export default server;
