const mongoose = require("mongoose");

const messagesSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    text: {
      type: String,
      default: "",
    },
    sender: {
      type: String,
      required: true,
      index: true,
    },
    senderType: {
      type: String,
      enum: ["User", "Seller"],
      default: "User",
    },
    images: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Messages", messagesSchema);
