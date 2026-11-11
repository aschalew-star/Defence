require("dotenv").config({
  path: "./.env",
});

const http = require("http");
const express = require("express");
const cors = require("cors");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);

const clientOrigin = process.env.CLIENT_URL || "http://localhost:3000";

const io = socketIO(server, {
  cors: {
    origin: [clientOrigin, "http://localhost:3000", "http://localhost:8081"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date() });
});

app.get("/", (req, res) => {
  res.send("Hello world from socket server!");
});

let users = [];

const addUser = (userId, socketId) => {
  if (!userId) return;
  const existingUserIndex = users.findIndex((user) => user.userId === userId);
  if (existingUserIndex !== -1) {
    users[existingUserIndex].socketId = socketId;
  } else {
    users.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (receiverId) => {
  return users.find((user) => user.userId === receiverId);
};

// Define a message object with a seen property
const createMessage = ({ senderId, receiverId, text, images }) => ({
  senderId,
  receiverId,
  text,
  images,
  seen: false,
  createdAt: Date.now(),
});

io.on("connection", (socket) => {
  console.log(`Socket user connected: ${socket.id}`);

  // Take userId and socketId from user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  // Messages cache by receiverId
  const messages = {};

  socket.on("sendMessage", ({ senderId, receiverId, text, images }) => {
    const message = createMessage({ senderId, receiverId, text, images });
    const user = getUser(receiverId);

    if (!messages[receiverId]) {
      messages[receiverId] = [message];
    } else {
      messages[receiverId].push(message);
    }

    if (user && user.socketId) {
      io.to(user.socketId).emit("getMessage", message);
    }
  });

  socket.on("messageSeen", ({ senderId, receiverId, messageId }) => {
    const user = getUser(senderId);

    if (messages[senderId]) {
      const message = messages[senderId].find(
        (m) => m.receiverId === receiverId && (m.id === messageId || m._id === messageId)
      );
      if (message) {
        message.seen = true;
      }
    }

    if (user && user.socketId) {
      io.to(user.socketId).emit("messageSeen", {
        senderId,
        receiverId,
        messageId,
      });
    }
  });

  socket.on("updateLastMessage", ({ lastMessage, lastMessagesId }) => {
    io.emit("getLastMessage", {
      lastMessage,
      lastMessagesId,
    });
  });

  socket.on("disconnect", () => {
    console.log(`Socket user disconnected: ${socket.id}`);
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Socket server is running on port ${PORT}`);
});
