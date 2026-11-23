import React, { useState, useEffect, useRef, useCallback, ChangeEvent, FormEvent } from "react";
import socketIO, { Socket } from "socket.io-client";
import axios from "axios";
import { toast } from "react-toastify";
import { server, socketServer } from "../server";
import { useAppSelector } from "./redux";
import { IConversation, IMessage, IOnlineUser } from "../types";

export const ARTISAN_QUICK_REPLIES: string[] = [
  "Hello! Thank you for reaching out to our artisan workshop.",
  "Yes, we can customize this piece with your bespoke sizing!",
  "This craft is handwoven using 100% authentic Ethiopian Shemma cotton.",
  "Standard handloom production takes 3 to 5 business days.",
  "Local delivery across Addis Ababa takes 24-48 hours via courier.",
  "Feel free to share your specific bust, waist, and length measurements.",
];

export interface UseMerchantChatReturn {
  seller: any;
  conversations: IConversation[];
  filteredConversations: IConversation[];
  currentChat: IConversation | null;
  setCurrentChat: (chat: IConversation | null) => void;
  messages: IMessage[];
  activeUserData: any | null;
  setActiveUserData: (val: any) => void;
  newMessage: string;
  setNewMessage: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterTab: "all" | "online";
  setFilterTab: (tab: "all" | "online") => void;
  uploadingImage: boolean;
  imagePreview: string | null;
  setImagePreview: (val: string | null) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  isUserOnline: (chat: IConversation) => boolean;
  handleSendMessage: (e?: FormEvent) => Promise<void>;
  handleImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  applyQuickReply: (text: string) => void;
}

export const useMerchantChat = (): UseMerchantChatReturn => {
  const { seller } = useAppSelector((state) => state.seller);
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [arrivalMessage, setArrivalMessage] = useState<any | null>(null);
  const [currentChat, setCurrentChat] = useState<IConversation | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [activeUserData, setActiveUserData] = useState<any | null>(null);
  const [newMessage, setNewMessage] = useState<string>("");
  const [onlineUsers, setOnlineUsers] = useState<IOnlineUser[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterTab, setFilterTab] = useState<"all" | "online">("all");
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Initialize socket
  useEffect(() => {
    socketRef.current = socketIO(socketServer, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socketRef.current.on("getMessage", (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        images: data.images,
        createdAt: Date.now(),
      });
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  // Handle incoming messages
  useEffect(() => {
    if (
      arrivalMessage &&
      currentChat?.members?.includes(arrivalMessage.sender)
    ) {
      setMessages((prev) => [...prev, arrivalMessage]);
    }
  }, [arrivalMessage, currentChat]);

  // Register seller on socket
  useEffect(() => {
    if (seller?._id && socketRef.current) {
      socketRef.current.emit("addUser", seller._id);
      socketRef.current.on("getUsers", (data: IOnlineUser[]) => {
        setOnlineUsers(data);
      });
    }
  }, [seller]);

  // Load conversations
  const fetchConversations = useCallback(async () => {
    if (!seller?._id) return;
    try {
      const res = await axios.get(
        `${server}/conversation/get-all-conversation-seller/${seller._id}`,
        { withCredentials: true }
      );
      if (res.data?.success) {
        setConversations(res.data.conversations || []);
      }
    } catch (err: any) {
      console.error("Failed to fetch conversations:", err);
    }
  }, [seller?._id]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Load messages for current chat
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentChat?._id) return;
      try {
        const res = await axios.get(
          `${server}/message/get-all-messages/${currentChat._id}`
        );
        if (res.data?.success) {
          setMessages(res.data.messages || []);
        }
      } catch (err: any) {
        console.error("Failed to load messages:", err);
      }
    };
    fetchMessages();
  }, [currentChat]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, imagePreview]);

  // Send message
  const handleSendMessage = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() && !imagePreview) return;
    if (!currentChat || !seller?._id) return;

    const receiverId = currentChat.members.find((m) => m !== seller._id);
    const textToSend = newMessage.trim();

    const payload = {
      sender: seller._id,
      text: textToSend,
      conversationId: currentChat._id,
      images: imagePreview ? imagePreview : undefined,
    };

    // Emit live socket event
    socketRef.current?.emit("sendMessage", {
      senderId: seller._id,
      receiverId,
      text: textToSend,
      images: imagePreview ? { url: imagePreview } : undefined,
    });

    try {
      const res = await axios.post(`${server}/message/create-new-message`, payload);
      if (res.data?.success) {
        setMessages((prev) => [...prev, res.data.message]);
        setNewMessage("");
        setImagePreview(null);

        // Update last message on conversation
        await axios.put(
          `${server}/conversation/update-last-message/${currentChat._id}`,
          {
            lastMessage: textToSend || "Attachment",
            lastMessageId: seller._id,
          }
        );

        fetchConversations();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send message");
    }
  };

  // Image upload
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size should be less than 5MB");
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = () => {
      setUploadingImage(false);
      if (reader.readyState === 2) {
        setImagePreview(reader.result as string);
      }
    };
    reader.onerror = () => setUploadingImage(false);
    reader.readAsDataURL(file);
  };

  const isUserOnline = (chat: IConversation): boolean => {
    const otherMemberId = chat?.members?.find((m) => m !== seller?._id);
    return onlineUsers.some((u) => u.userId === otherMemberId);
  };

  const applyQuickReply = (text: string) => {
    setNewMessage((prev) => (prev ? `${prev} ${text}` : text));
  };

  const filteredConversations = conversations.filter((c) => {
    if (filterTab === "online" && !isUserOnline(c)) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const hasNameMatch = c.userData?.name?.toLowerCase().includes(q);
    const hasLastMessageMatch = c.lastMessage?.toLowerCase().includes(q);
    return hasNameMatch || hasLastMessageMatch;
  });

  return {
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
    uploadingImage,
    imagePreview,
    setImagePreview,
    scrollRef,
    isUserOnline,
    handleSendMessage,
    handleImageChange,
    applyQuickReply,
  };
};

export default useMerchantChat;
