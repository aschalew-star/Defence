const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    groupTitle: {
      type: String,
      index: true,
    },
    members: {
      type: [String], // user IDs / seller IDs
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      index: true,
    },
    lastMessage: {
      type: String,
      default: "",
    },
    lastMessageId: {
      type: String,
      default: "",
    },
    unreadCountUser: {
      type: Number,
      default: 0,
    },
    unreadCountSeller: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);
