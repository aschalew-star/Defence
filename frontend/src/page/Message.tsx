import React, { FC, useState, useEffect } from "react";
import axios from "axios";
import { server } from "../server";
import { format } from "timeago.js";
import {
  AiOutlineSend,
  AiOutlineArrowLeft,
  AiOutlineSearch,
} from "react-icons/ai";
import {
  FiImage,
  FiMessageSquare,
  FiZap,
} from "react-icons/fi";
import { BsChatDots, BsShieldCheck } from "react-icons/bs";
import { useMerchantChat, ARTISAN_QUICK_REPLIES } from "../hooks";

const DashboardMessages: FC = () => {
  const {
    seller,
    conversations,
    filteredConversations,
    currentChat,
    setCurrentChat,
    messages,
    activeUserData,
    setActiveUserData,
    newMessage,
    setNewMessage,
    searchQuery,
    setSearchQuery,
    filterTab,
    setFilterTab,
    imagePreview,
    setImagePreview,
    scrollRef,
    isUserOnline,
    handleSendMessage,
    handleImageChange,
    applyQuickReply,
  } = useMerchantChat();
  return (
    <div className="w-full h-[calc(100vh-110px)] bg-white rounded-3xl border border-stone-200 shadow-sm flex overflow-hidden">
      {/* LEFT PANE: CONVERSATION LIST */}
      <div
        className={`w-full md:w-[340px] lg:w-[380px] flex-shrink-0 border-r border-stone-200 flex flex-col bg-stone-50/60 ${
          currentChat ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Pane Header */}
        <div className="p-4 border-b border-stone-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
              <BsChatDots className="text-amber-600" />
              <span>Customer Inquiries</span>
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
              {conversations.length}
            </span>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <AiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
            <input
              type="text"
              placeholder="Search by buyer name or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 mt-3">
            <button
              onClick={() => setFilterTab("all")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                filterTab === "all"
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              All Messages
            </button>
            <button
              onClick={() => setFilterTab("online")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                filterTab === "online"
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Online Buyers
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-stone-100 bg-white">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-stone-500 space-y-2">
              <FiMessageSquare className="mx-auto text-3xl text-stone-300" />
              <p className="text-xs font-semibold text-stone-700">No customer messages match your filter</p>
              <p className="text-[11px] text-stone-400">
                When buyers inquire about your crafts or custom sizes, their chats will appear here.
              </p>
            </div>
          ) : (
            filteredConversations.map((chat) => (
                <ConversationCard
                  key={chat._id}
                  chat={chat}
                  sellerId={seller?._id}
                  isSelected={currentChat?._id === chat._id}
                  isOnline={isUserOnline(chat)}
                  searchQuery={searchQuery}
                  onSelect={(userData) => {
                    setCurrentChat(chat);
                    setActiveUserData(userData);
                  }}
                />
              ))
          )}
        </div>
      </div>

      {/* RIGHT PANE: ACTIVE CHAT VIEW */}
      <div
        className={`flex-1 flex flex-col bg-white overflow-hidden ${
          !currentChat ? "hidden md:flex" : "flex"
        }`}
      >
        {currentChat ? (
          <>
            {/* Active Chat Header */}
            <div className="p-3.5 sm:p-4 border-b border-stone-200 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setCurrentChat(null)}
                  className="md:hidden p-1.5 rounded-lg hover:bg-stone-100 text-stone-600 transition"
                  title="Back to conversations"
                >
                  <AiOutlineArrowLeft size={18} />
                </button>

                {/* Buyer Avatar */}
                <div className="relative">
                  {activeUserData?.avatar?.url ? (
                    <img
                      src={activeUserData.avatar.url}
                      alt={activeUserData.name}
                      className="w-10 h-10 rounded-xl object-cover border border-stone-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      {activeUserData?.name?.charAt(0).toUpperCase() || "B"}
                    </div>
                  )}
                  {isUserOnline(currentChat) && (
                    <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-0.5 -right-0.5" />
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-stone-900 text-sm leading-tight">
                    {activeUserData?.name || "Marketplace Customer"}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {isUserOnline(currentChat) ? (
                      <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active Now
                      </span>
                    ) : (
                      <span className="text-[11px] text-stone-400">Offline</span>
                    )}
                    {activeUserData?.email && (
                      <span className="text-[11px] text-stone-400 hidden sm:inline">
                        • {activeUserData.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] font-semibold">
                <BsShieldCheck className="text-emerald-700" />
                <span>Verified Buyer Connection</span>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-stone-50/50">
              {messages.length === 0 ? (
                <div className="py-20 text-center text-stone-400 text-xs">
                  No messages yet. Send a greeting to start assisting the buyer!
                </div>
              ) : (
                messages.map((m, idx) => {
                  const isMine = m.sender === seller?._id;
                  return (
                    <div
                      key={idx}
                      ref={idx === messages.length - 1 ? scrollRef : null}
                      className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-md rounded-2xl px-4 py-2.5 text-xs shadow-xs ${
                          isMine
                            ? "bg-stone-900 text-white rounded-br-none"
                            : "bg-white text-stone-800 border border-stone-200 rounded-bl-none"
                        }`}
                      >
                        {Boolean(m.images) && (
                          <div className="mb-2 rounded-xl overflow-hidden max-h-60">
                            <img
                              src={typeof m.images === "string" ? m.images : (m.images as any)?.url}
                              alt="Attachment"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        {m.text && <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>}
                      </div>
                      <span className="text-[10px] text-stone-400 mt-1 px-1">
                        {format(m.createdAt)}
                      </span>
                    </div>
                  );
                })
              )}

              {/* Image Preview before sending */}
              {imagePreview && (
                <div className="flex flex-col items-end">
                  <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500 shadow-md max-w-xs">
                    <img src={imagePreview} alt="Preview" className="max-h-48 object-cover" />
                    <button
                      type="button"
                      onClick={() => setImagePreview(null)}
                      className="absolute top-1 right-1 bg-stone-900/80 text-white rounded-full p-1 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                  <span className="text-[10px] text-amber-600 mt-1">Ready to send</span>
                </div>
              )}
            </div>

            {/* Quick Replies Strip */}
            <div className="px-4 py-2 bg-stone-100 border-t border-stone-200 overflow-x-auto whitespace-nowrap flex items-center gap-2">
              <span className="text-[11px] font-bold text-stone-500 flex items-center gap-1 shrink-0">
                <FiZap className="text-amber-600" /> Quick Replies:
              </span>
              {ARTISAN_QUICK_REPLIES.map((rep, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => applyQuickReply(rep)}
                  className="text-[11px] bg-white border border-stone-200 hover:border-amber-400 text-stone-700 px-2.5 py-1 rounded-full transition shrink-0"
                >
                  {rep.length > 40 ? rep.slice(0, 40) + "..." : rep}
                </button>
              ))}
            </div>

            {/* Message Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 sm:p-4 bg-white border-t border-stone-200 flex items-center gap-2"
            >
              {/* Image Upload Button */}
              <label
                htmlFor="message-image"
                className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 cursor-pointer transition shrink-0"
                title="Attach photo or craft preview"
              >
                <FiImage size={18} />
                <input
                  type="file"
                  id="message-image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              <input
                type="text"
                placeholder="Type your message to customer... (Press Enter to send)"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white"
              />

              <button
                type="submit"
                disabled={!newMessage.trim() && !imagePreview}
                className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm transition flex items-center gap-1.5 shrink-0"
              >
                <span className="hidden sm:inline">Send</span>
                <AiOutlineSend size={16} />
              </button>
            </form>
          </>
        ) : (
          /* Empty Chat Selected State */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-stone-50/40 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-700 flex items-center justify-center text-3xl font-bold shadow-xs">
              <BsChatDots />
            </div>
            <div>
              <h3 className="font-serif font-bold text-xl text-stone-900">
                Customer Conversation Center
              </h3>
              <p className="text-xs text-stone-500 max-w-md mt-1">
                Select an active conversation on the left to discuss tailoring, custom
                measurements, fabric details, or order shipments with buyers.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md text-left text-xs text-stone-600 pt-2">
              <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs">
                <span className="font-bold text-stone-800 block mb-0.5">⚡ Prompt Responses</span>
                Replying within 15 minutes increases artisan sales conversions by 40%.
              </div>
              <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs">
                <span className="font-bold text-stone-800 block mb-0.5">📏 Bespoke Sizing</span>
                Clarify bust, waist, and hem length before weaving custom garments.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Conversation Card Component
interface ConversationCardProps {
  chat: any;
  sellerId?: string;
  isSelected: boolean;
  isOnline: boolean;
  searchQuery: string;
  onSelect: (userData: any) => void;
}

const ConversationCard: FC<ConversationCardProps> = ({
  chat,
  sellerId,
  isSelected,
  isOnline,
  searchQuery,
  onSelect,
}) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userId = chat.members?.find((m) => m !== sellerId);
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const res = await axios.get(`${server}/user/user-info/${userId}`);
        if (res.data?.user) {
          setUser(res.data.user);
        }
      } catch (err: any) {
        // user fetch fallback
      }
    };
    fetchUser();
  }, [chat, sellerId]);

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    const matchName = user?.name?.toLowerCase().includes(q);
    const matchLast = chat?.lastMessage?.toLowerCase().includes(q);
    if (!matchName && !matchLast) return null;
  }

  const isLastMessageFromMe = chat?.lastMessageId === sellerId;

  return (
    <div
      onClick={() => onSelect(user)}
      className={`p-3.5 flex items-center gap-3 cursor-pointer transition ${
        isSelected
          ? "bg-amber-50/80 border-l-4 border-amber-600"
          : "hover:bg-stone-50"
      }`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {user?.avatar?.url ? (
          <img
            src={user.avatar.url}
            alt={user.name}
            className="w-11 h-11 rounded-xl object-cover border border-stone-200"
          />
        ) : (
          <div className="w-11 h-11 rounded-xl bg-stone-800 text-white flex items-center justify-center font-bold text-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
        )}
        {isOnline && (
          <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-0.5 -right-0.5" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-xs text-stone-900 truncate">
            {user?.name || "Customer"}
          </h4>
          <span className="text-[10px] text-stone-400">
            {chat?.updatedAt ? format(chat.updatedAt) : ""}
          </span>
        </div>
        <p className="text-[11px] text-stone-500 truncate mt-0.5">
          {isLastMessageFromMe ? "You: " : ""}
          {chat?.lastMessage || "Started a conversation"}
        </p>
      </div>
    </div>
  );
}

export default DashboardMessages;