const socketIO = require("socket.io");
const http = require("http");

let io = null;
let secondaryIO = null;
let secondaryServer = null;
let users = [];

/**
 * Register a user socket mapping
 */
const addUser = (userId, socketId, role = "user") => {
  if (!userId) return;
  const existingUserIndex = users.findIndex((user) => user.userId === userId);
  if (existingUserIndex !== -1) {
    users[existingUserIndex].socketId = socketId;
    users[existingUserIndex].role = role;
    users[existingUserIndex].lastSeen = Date.now();
  } else {
    users.push({
      userId,
      socketId,
      role,
      lastSeen: Date.now(),
      connectedAt: Date.now(),
    });
  }
};

/**
 * Remove user by socket ID
 */
const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

/**
 * Find user by ID
 */
const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

/**
 * Get all users by role (e.g. "seller", "user", "admin")
 */
const getUsersByRole = (role) => {
  return users.filter((user) => user.role === role);
};

/**
 * Standard message payload builder
 */
const createMessage = ({ senderId, receiverId, text, images, conversationId }) => ({
  senderId,
  receiverId,
  text: text || "",
  images: images || null,
  conversationId: conversationId || null,
  seen: false,
  createdAt: Date.now(),
});

/**
 * Setup common socket handlers for any Socket.IO instance
 */
const registerSocketHandlers = (instance) => {
  instance.on("connection", (socket) => {
    console.log(`⚡ [Socket.io] Real-time client connected: ${socket.id}`);

    // 1. Presence & Role Registration
    socket.on("addUser", (userId, role = "user") => {
      addUser(userId, socket.id, role);
      instance.emit("getUsers", users);
      if (io && io !== instance) io.emit("getUsers", users);
      if (secondaryIO && secondaryIO !== instance) secondaryIO.emit("getUsers", users);
      console.log(`👤 User registered: ${userId} (${role})`);
    });

    // 2. Room Subscriptions
    socket.on("joinConversation", (conversationId) => {
      if (conversationId) {
        socket.join(`conversation_${conversationId}`);
      }
    });

    socket.on("leaveConversation", (conversationId) => {
      if (conversationId) {
        socket.leave(`conversation_${conversationId}`);
      }
    });

    // 3. Direct & Room Messaging
    socket.on("sendMessage", ({ senderId, receiverId, text, images, conversationId }) => {
      const message = createMessage({ senderId, receiverId, text, images, conversationId });
      const targetUser = getUser(receiverId);

      // Deliver to recipient socket if online
      if (targetUser && targetUser.socketId) {
        instance.to(targetUser.socketId).emit("getMessage", message);
        if (io && io !== instance) io.to(targetUser.socketId).emit("getMessage", message);
      }

      // Deliver to room
      if (conversationId) {
        instance.to(`conversation_${conversationId}`).emit("getRoomMessage", message);
      }

      // Delivery receipt back to sender
      socket.emit("messageDelivered", {
        status: "delivered",
        deliveredAt: Date.now(),
        message,
      });
    });

    // 4. Real-Time Typing Indicators
    socket.on("startTyping", ({ senderId, receiverId, conversationId }) => {
      const target = getUser(receiverId);
      if (target && target.socketId) {
        instance.to(target.socketId).emit("userTyping", { senderId, conversationId });
      }
      if (conversationId) {
        socket.to(`conversation_${conversationId}`).emit("userTyping", { senderId, conversationId });
      }
    });

    socket.on("stopTyping", ({ senderId, receiverId, conversationId }) => {
      const target = getUser(receiverId);
      if (target && target.socketId) {
        instance.to(target.socketId).emit("userStoppedTyping", { senderId, conversationId });
      }
      if (conversationId) {
        socket.to(`conversation_${conversationId}`).emit("userStoppedTyping", { senderId, conversationId });
      }
    });

    // 5. Message Seen & Read Receipts
    socket.on("messageSeen", ({ senderId, receiverId, messageId }) => {
      const target = getUser(senderId);
      if (target && target.socketId) {
        instance.to(target.socketId).emit("messageSeen", {
          senderId,
          receiverId,
          messageId,
          seenAt: Date.now(),
        });
      }
    });

    // 6. Last Message Broadcast
    socket.on("updateLastMessage", ({ lastMessage, lastMessageId, conversationId }) => {
      instance.emit("getLastMessage", {
        lastMessage,
        lastMessageId,
        conversationId,
      });
    });

    // 7. Order Status Real-Time Notification
    socket.on("orderStatusUpdate", ({ orderId, status, recipientId, note }) => {
      const target = getUser(recipientId);
      if (target && target.socketId) {
        instance.to(target.socketId).emit("orderNotification", {
          type: "ORDER_STATUS_CHANGED",
          orderId,
          status,
          note,
          timestamp: Date.now(),
        });
      }
    });

    // 8. Flash Sale & Inventory Live Alerts
    socket.on("broadcastFlashSale", (data) => {
      instance.emit("newFlashSale", data);
    });

    // 9. Disconnect Cleanup
    socket.on("disconnect", () => {
      console.log(`🔌 [Socket.io] Client disconnected: ${socket.id}`);
      removeUser(socket.id);
      instance.emit("getUsers", users);
      if (io && io !== instance) io.emit("getUsers", users);
      if (secondaryIO && secondaryIO !== instance) secondaryIO.emit("getUsers", users);
    });
  });
};

/**
 * Initialize Socket.io on the primary HTTP server (e.g. port 5000)
 */
const initSocket = (server, allowedOrigins = []) => {
  io = socketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
    pingTimeout: 60000,
    transports: ["websocket", "polling"],
  });

  registerSocketHandlers(io);

  // Optionally spin up legacy port 4000 bridge if desired
  const legacyPort = Number(process.env.SOCKET_PORT || 4000);
  if (legacyPort && legacyPort !== Number(process.env.PORT || 5000)) {
    try {
      secondaryServer = http.createServer((req, res) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok", service: "MEP Dual-Port Socket Bridge" }));
      });

      secondaryIO = socketIO(secondaryServer, {
        cors: { origin: "*", credentials: true },
        pingTimeout: 60000,
        transports: ["websocket", "polling"],
      });

      registerSocketHandlers(secondaryIO);

      secondaryServer.listen(legacyPort, () => {
        console.log(`⚡ [Socket.io] Legacy port bridge active on port ${legacyPort}`);
      });

      secondaryServer.on("error", (err) => {
        console.log(`ℹ️ [Socket.io] Legacy port ${legacyPort} busy or unavailable (${err.message}). Primary socket active on main server.`);
      });
    } catch (e) {
      // Legacy port initialization is safe/optional
    }
  }

  return io;
};

/**
 * Accessor for the active Socket.IO instance
 */
const getIO = () => {
  return io || secondaryIO;
};

/**
 * Helper to emit event to specific user
 */
const notifyUser = (userId, eventName, data) => {
  const target = getUser(userId);
  if (target && target.socketId) {
    if (io) io.to(target.socketId).emit(eventName, data);
    if (secondaryIO) secondaryIO.to(target.socketId).emit(eventName, data);
    return true;
  }
  return false;
};

/**
 * Helper to broadcast event to all clients
 */
const broadcast = (eventName, data) => {
  if (io) io.emit(eventName, data);
  if (secondaryIO) secondaryIO.emit(eventName, data);
  return true;
};

module.exports = {
  initSocket,
  getIO,
  notifyUser,
  broadcast,
  getUser,
  getUsersByRole,
};
