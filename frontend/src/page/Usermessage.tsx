import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import socketIO from "socket.io-client";
import { format } from "timeago.js";
import axios from "axios";
import { toast } from "react-toastify";
import { server, socketServer } from "../server";
import { useAppDispatch, useAppSelector } from "../hooks";
import { getAllOrdersOfUser } from "../redux/Action/order";
import Navbar from "../component/Layout/Navbar";
import {
  AiOutlineSend,
  AiOutlineArrowLeft,
  AiOutlineSearch,
  AiOutlineEye,
  AiOutlineAudio,
} from "react-icons/ai";
import {
  FiImage,
  FiShoppingBag,
  FiScissors,
  FiTruck,
  FiExternalLink,
  FiInfo,
  FiX,
  FiCheck,
  FiDollarSign,
  FiPackage,
  FiTag,
  FiTrash2,
} from "react-icons/fi";
import {
  BsChatDots,
  BsShieldCheck,
  BsShop,
  BsGeoAlt,
  BsLightningCharge,
  BsCheck2All,
  BsBookmarkStar,
} from "react-icons/bs";
import { RxCross1, RxReload } from "react-icons/rx";

const ENDPOINT = socketServer;
const socketId = socketIO(ENDPOINT, { transports: ["websocket", "polling"], withCredentials: true });

const CULTURAL_QUICK_PROMPTS = [
  { label: "📏 Custom Sizing", text: "Hello! Can you tailor this piece according to my custom measurements?" },
  { label: "🧵 Tibeb Motifs", text: "Greetings, what color and pattern variations do you have for the Tibeb embroidery?" },
  { label: "🚚 Delivery SLA", text: "How many business days will it take to weave and dispatch this within Addis Ababa?" },
  { label: "✈️ Diaspora DHL", text: "Do you support DHL Express delivery for international orders to the US/Europe?" },
  { label: "☕ Ceremonial Sets", text: "Does this cultural set include the matching Rekebot tray and Sini cups?" },
  { label: "💎 Silver Hallmarking", text: "Are your silver jewelry and filigree crosses 925 certified by the artisan guild?" },
  { label: "📦 Order Update", text: "Greetings master artisan, could you kindly give me an update on my active order?" },
];

const Usermessage: React.FC = () => {
  const { user } = useAppSelector((state) => state.user);
  const { orders } = useAppSelector((state) => state.order);
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Conversations & Chat
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentChat, setCurrentChat] = useState<any | null>(null);
  const [activeShopData, setActiveShopData] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [arrivalMessage, setArrivalMessage] = useState<any | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterTab, setFilterTab] = useState<"all" | "active" | "custom">("all");
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [showShopDrawer, setShowShopDrawer] = useState<boolean>(false);
  const [previewModalImg, setPreviewModalImg] = useState<string | null>(null);
  const [loadingConversations, setLoadingConversations] = useState<boolean>(true);
  const [showOrderContext, setShowOrderContext] = useState<boolean>(true);

  // Creative Tools Modals
  const [showSizingModal, setShowSizingModal] = useState<boolean>(false);
  const [showOfferModal, setShowOfferModal] = useState<boolean>(false);

  // Bespoke Sizing Form State
  const [sizingGarment, setSizingGarment] = useState<string>("Habesha Kemis / Traditional Dress");
  const [sizingBust, setSizingBust] = useState<string>("");
  const [sizingWaist, setSizingWaist] = useState<string>("");
  const [sizingHips, setSizingHips] = useState<string>("");
  const [sizingLength, setSizingLength] = useState<string>("");
  const [sizingSleeve, setSizingSleeve] = useState<string>("");
  const [sizingCottonPly, setSizingCottonPly] = useState<string>("Classic 2-ply Menen");
  const [sizingTibebMotif, setSizingTibebMotif] = useState<string>("Gold & Emerald Tilf Geometric");
  const [sizingUrgency, setSizingUrgency] = useState<string>("Standard (7-14 Days)");
  const [sizingSpecialNotes, setSizingSpecialNotes] = useState<string>("");

  // Price Offer Form State
  const [offerItemName, setOfferItemName] = useState<string>("");
  const [offerQuantity, setOfferQuantity] = useState<number>(1);
  const [offerAmountETB, setOfferAmountETB] = useState<string>("");
  const [offerNotes, setOfferNotes] = useState<string>("");

  // Simulated Voice Note State
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [voiceSeconds, setVoiceSeconds] = useState<number>(0);
  const voiceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Fetch Buyer's Orders on load
  useEffect(() => {
    if (user?._id) {
      dispatch(getAllOrdersOfUser(user._id));
    }
  }, [dispatch, user?._id]);

  // Socket: Incoming Messages
  useEffect(() => {
    socketId.on("getMessage", (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        images: data.images,
        createdAt: Date.now(),
      });
    });

    return () => {
      socketId.off("getMessage");
    };
  }, []);

  // Append arrival message if belonging to current chat
  useEffect(() => {
    if (arrivalMessage && currentChat?.members.includes(arrivalMessage.sender)) {
      setMessages((prev) => [...prev, arrivalMessage]);
    }
  }, [arrivalMessage, currentChat]);

  // Socket: User online presence
  useEffect(() => {
    if (user?._id) {
      socketId.emit("addUser", user._id);
      socketId.on("getUsers", (data) => {
        setOnlineUsers(data);
      });
    }
  }, [user]);

  // Load all user conversations
  const fetchConversations = useCallback(async () => {
    if (!user?._id) {
      setLoadingConversations(false);
      return;
    }
    setLoadingConversations(true);
    try {
      const res = await axios.get(
        `${server}/conversation/get-all-conversation-user/${user._id}`,
        { withCredentials: true }
      );
      if (res.data?.success) {
        const chatList = res.data.conversations || [];
        setConversations(chatList);

        // If URL has query param for a specific conversation ID, select it
        const queryChatId = searchParams.get("conversationId") || window.location.search.replace("?", "");
        if (queryChatId && chatList.length > 0) {
          const match = chatList.find((c: any) => c._id === queryChatId);
          if (match) setCurrentChat(match);
        }
      }
    } catch (err: any) {
      console.log("Error loading user conversations", err);
    } finally {
      setLoadingConversations(false);
    }
  }, [searchParams, user?._id]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Load messages when active chat changes
  useEffect(() => {
    if (!currentChat?._id) return;
    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `${server}/message/get-all-messages/${currentChat._id}`
        );
        if (res.data?.success) {
          setMessages(res.data.messages || []);
        }
      } catch (err) {
        console.log("Error fetching messages", err);
      }
    };
    fetchMessages();
  }, [currentChat]);

  // Load active artisan shop info when current chat changes
  useEffect(() => {
    if (!currentChat) {
      setActiveShopData(null);
      return;
    }
    const otherId = currentChat.members.find((m: string) => m !== user?._id);
    if (!otherId) return;

    const fetchShop = async () => {
      try {
        const res = await axios.get(`${server}/shop/get-shop-info/${otherId}`);
        if (res.data?.shop) {
          setActiveShopData(res.data.shop);
        }
      } catch (err) {
        console.log("Error loading shop data", err);
      }
    };
    fetchShop();
  }, [currentChat, user?._id]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check if artisan partner is online
  const isArtisanOnline = useMemo(() => {
    if (!currentChat || !user?._id) return false;
    const partnerId = currentChat.members.find((m: string) => m !== user._id);
    return onlineUsers.some((u: any) => u.userId === partnerId);
  }, [currentChat, onlineUsers, user]);

  // Find relevant active order from user's order history with this artisan
  const matchingOrder = useMemo(() => {
    if (!orders || !currentChat || !user?._id) return null;
    const partnerId = currentChat.members.find((m: string) => m !== user._id);
    if (!partnerId) return null;

    // Look for orders where cart items or shop match this artisan
    return (
      orders.find((ord: any) => {
        if (ord.shop?._id === partnerId || ord.shopId === partnerId) return true;
        if (Array.isArray(ord.cart)) {
          return ord.cart.some((item: any) => item.shopId === partnerId || item.shop?._id === partnerId);
        }
        return false;
      }) || null
    );
  }, [orders, currentChat, user]);

  // Filtered Conversations List
  const filteredConversations = useMemo(() => {
    let list = [...conversations];

    if (filterTab === "active") {
      list = list.filter((c) => {
        const partnerId = c.members.find((m: string) => m !== user?._id);
        return onlineUsers.some((u) => u.userId === partnerId);
      });
    } else if (filterTab === "custom") {
      list = list.filter((c) =>
        c.lastMessage?.toLowerCase().includes("sizing") ||
        c.lastMessage?.toLowerCase().includes("bespoke") ||
        c.lastMessage?.toLowerCase().includes("quote") ||
        c.lastMessage?.toLowerCase().includes("custom")
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.lastMessage?.toLowerCase().includes(q) ||
          c._id?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [conversations, filterTab, searchQuery, user, onlineUsers]);

  // Core Send Message Handler
  const sendMessageDirect = async (textPayload: string, imagePayload?: string | null) => {
    if (!textPayload.trim() && !imagePayload) return;
    if (!currentChat?._id || !user?._id) {
      toast.info("Please select an active conversation to send messages.");
      return;
    }

    const receiverId = currentChat.members.find((m: string) => m !== user._id);
    const textToSend = textPayload.trim();

    // Socket real-time emit
    socketId.emit("sendMessage", {
      senderId: user._id,
      receiverId,
      text: textToSend,
      images: imagePayload || undefined,
    });

    const payload: any = {
      sender: user._id,
      text: textToSend,
      conversationId: currentChat._id,
    };

    if (imagePayload) {
      payload.images = imagePayload;
    }

    try {
      const res = await axios.post(`${server}/message/create-new-message`, payload);
      if (res.data?.success) {
        setMessages((prev) => [...prev, res.data.message]);
        setNewMessage("");
        setImageFile(null);

        // Update last message on conversation
        await axios.put(`${server}/conversation/update-last-message/${currentChat._id}`, {
          lastMessage: textToSend || "📷 Photo Reference",
          lastMessageId: user._id,
        });

        // Update local list
        setConversations((prev) =>
          prev.map((c) =>
            c._id === currentChat._id
              ? {
                  ...c,
                  lastMessage: textToSend || "📷 Photo Reference",
                  lastMessageId: user._id,
                  updatedAt: new Date().toISOString(),
                }
              : c
          )
        );
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to deliver message");
    }
  };

  // Send Text Form Submit
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await sendMessageDirect(newMessage, imageFile);
  };

  // Photo Reference Upload
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image file must be under 8MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2 && typeof reader.result === "string") {
        setImageFile(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit Bespoke Sizing Card into Chat
  const handleSendBespokeSizing = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedSpec = [
      `📏 [BESPOKE TAILORING SPECIFICATION]`,
      `• Garment: ${sizingGarment}`,
      sizingBust ? `• Bust/Chest: ${sizingBust} cm` : null,
      sizingWaist ? `• Waist: ${sizingWaist} cm` : null,
      sizingHips ? `• Hips: ${sizingHips} cm` : null,
      sizingLength ? `• Full Length: ${sizingLength} cm` : null,
      sizingSleeve ? `• Shoulder/Sleeve: ${sizingSleeve} cm` : null,
      `• Fabric & Ply: ${sizingCottonPly}`,
      `• Tibeb Motif: ${sizingTibebMotif}`,
      `• Timeline: ${sizingUrgency}`,
      sizingSpecialNotes ? `• Notes: ${sizingSpecialNotes}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    await sendMessageDirect(formattedSpec, imageFile);
    setShowSizingModal(false);
    toast.success("Bespoke tailoring specification delivered to artisan!");
  };

  // Submit Price Offer / Bulk Inquiry into Chat
  const handleSendPriceOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerItemName.trim() || !offerAmountETB.trim()) {
      toast.error("Please enter item name and offer amount");
      return;
    }

    const formattedOffer = [
      `🏷️ [COMMERCIAL PRICE OFFER / BULK INQUIRY]`,
      `• Item: ${offerItemName}`,
      `• Quantity: ${offerQuantity} unit(s)`,
      `• Proposed Offer: ${offerAmountETB} ETB total`,
      offerNotes ? `• Details: ${offerNotes}` : null,
      `• Buyer Request: Kindly review and let me know if this quote works for your workshop.`,
    ]
      .filter(Boolean)
      .join("\n");

    await sendMessageDirect(formattedOffer);
    setShowOfferModal(false);
    setOfferItemName("");
    setOfferAmountETB("");
    setOfferNotes("");
    toast.success("Custom offer proposal delivered to artisan!");
  };

  // Simulated Voice Note
  const startVoiceRecording = () => {
    setIsRecordingVoice(true);
    setVoiceSeconds(0);
    voiceTimerRef.current = setInterval(() => {
      setVoiceSeconds((sec) => sec + 1);
    }, 1000);
  };

  const cancelVoiceRecording = () => {
    if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    setIsRecordingVoice(false);
    setVoiceSeconds(0);
  };

  const sendVoiceMemo = async () => {
    if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    const recordedDuration = voiceSeconds;
    setIsRecordingVoice(false);
    setVoiceSeconds(0);

    const voiceNoteText = `🎙️ [Voice Memo Note • ${recordedDuration}s audio inquiry: "Buyer inquiry regarding custom embroidery and delivery SLA"]`;
    await sendMessageDirect(voiceNoteText);
  };

  return (
    <div className="w-full min-h-screen pt-32 sm:pt-36 md:pt-40 bg-[#FDFBF7] flex flex-col select-none">
      <Navbar show={7} />

      {/* Main Studio Viewport */}
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 flex-1 flex flex-col">
        
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 mb-3 shadow-xs border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-1 border border-emerald-200">
              <BsShieldCheck size={13} className="text-emerald-700" />
              <span>Certified Artisan Communications Studio</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tracking-tight">
              Artisan Messages & Bespoke Tailoring Studio
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Direct dialog with master Ethiopian weavers, clay potters, leathercrafters, and filigree jewelers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/artisans"
              className="px-4 py-2 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
            >
              <BsShop size={13} />
              <span>Artisan Guild Directory</span>
            </Link>

            <button
              onClick={fetchConversations}
              className="p-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
              title="Refresh conversations"
            >
              <RxReload size={14} />
            </button>
          </div>
        </div>

        {/* Messenger Split-Pane Studio Card */}
        <div className="w-full flex-1 bg-white rounded-3xl border border-stone-200 shadow-sm flex overflow-hidden min-h-[660px] max-h-[82vh]">
          
          {/* ============================================================
              LEFT COLUMN: Conversation List & Filter Tabs
             ============================================================ */}
          <div
            className={`w-full md:w-[320px] lg:w-[360px] shrink-0 border-r border-stone-200 flex flex-col bg-[#FAF9F5] ${
              currentChat ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Header, Search & Filter Tabs */}
            <div className="p-4 border-b border-stone-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                  <BsChatDots className="text-amber-800" size={17} />
                  <span>Artisan Dialogues</span>
                </h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                  {conversations.length}
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <AiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
                <input
                  type="text"
                  placeholder="Search artisan or conversation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-600 focus:bg-white transition"
                />
              </div>

              {/* Filter Tabs */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-stone-100 rounded-xl text-[11px] font-bold text-stone-600">
                <button
                  type="button"
                  onClick={() => setFilterTab("all")}
                  className={`py-1 rounded-lg transition ${
                    filterTab === "all" ? "bg-white text-stone-900 shadow-2xs font-extrabold" : "hover:text-stone-900"
                  }`}
                >
                  All ({conversations.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("active")}
                  className={`py-1 rounded-lg transition ${
                    filterTab === "active" ? "bg-white text-emerald-800 shadow-2xs font-extrabold" : "hover:text-stone-900"
                  }`}
                >
                  Online
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab("custom")}
                  className={`py-1 rounded-lg transition ${
                    filterTab === "custom" ? "bg-white text-amber-900 shadow-2xs font-extrabold" : "hover:text-stone-900"
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>

            {/* Conversation Items List */}
            <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
              {loadingConversations ? (
                <div className="p-8 text-center text-stone-400 space-y-2">
                  <div className="w-6 h-6 border-2 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs">Loading artisan dialogues...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-stone-500 space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center text-xl shadow-xs">
                    <FiShoppingBag />
                  </div>
                  <h4 className="text-xs font-bold text-stone-800">No Conversations Found</h4>
                  <p className="text-[11px] text-stone-400 max-w-[200px] mx-auto">
                    {searchQuery
                      ? "No conversations match your search query."
                      : "When you contact an artisan workshop from any craft listing, your direct thread will appear here."}
                  </p>
                  <Link
                    to="/artisans"
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-[11px] shadow-xs transition"
                  >
                    <span>Explore Artisans</span>
                    <FiExternalLink size={11} />
                  </Link>
                </div>
              ) : (
                filteredConversations.map((chat) => {
                  const partnerId = chat.members.find((m: string) => m !== user?._id);
                  const isOnline = onlineUsers.some((u) => u.userId === partnerId);
                  const isSelected = currentChat?._id === chat._id;
                  const isLastMsgMine = chat.lastMessageId === user?._id;

                  return (
                    <ConversationItem
                      key={chat._id}
                      chat={chat}
                      partnerId={partnerId}
                      isSelected={isSelected}
                      isOnline={isOnline}
                      isLastMsgMine={isLastMsgMine}
                      onClick={() => {
                        setCurrentChat(chat);
                        navigate(`/inbox?conversationId=${chat._id}`, { replace: true });
                      }}
                    />
                  );
                })
              )}
            </div>
          </div>

          {/* ============================================================
              CENTER COLUMN: Active Chat Thread & Creative Toolbars
             ============================================================ */}
          <div
            className={`flex-1 flex flex-col bg-white overflow-hidden ${
              !currentChat ? "hidden md:flex" : "flex"
            }`}
          >
            {currentChat ? (
              <>
                {/* Chat Header */}
                <div className="p-3.5 sm:p-4 border-b border-stone-200 bg-white flex items-center justify-between gap-3 shadow-2xs z-10">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Back Button (Mobile) */}
                    <button
                      type="button"
                      onClick={() => setCurrentChat(null)}
                      className="md:hidden p-2 rounded-xl text-stone-600 hover:bg-stone-100 transition shrink-0"
                    >
                      <AiOutlineArrowLeft size={18} />
                    </button>

                    {/* Partner Avatar with Green Online Status */}
                    <div className="relative shrink-0">
                      {activeShopData?.avatar?.url ? (
                        <img
                          src={activeShopData.avatar.url}
                          alt=""
                          className="w-10 h-10 rounded-2xl object-cover border border-stone-200 shadow-2xs"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-2xl bg-amber-800 text-amber-100 font-bold flex items-center justify-center text-sm font-serif">
                          {(activeShopData?.name || "A").slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                          isArtisanOnline ? "bg-emerald-500" : "bg-stone-300"
                        }`}
                      />
                    </div>

                    {/* Partner Name, Verification & Location */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-sm text-stone-900 truncate font-serif">
                          {activeShopData?.name || "Artisan Workshop"}
                        </h3>
                        <BsShieldCheck className="text-emerald-700 shrink-0" size={14} title="Verified Artisan Guild" />
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-stone-500">
                        <span className={isArtisanOnline ? "text-emerald-700 font-semibold" : "text-stone-400"}>
                          {isArtisanOnline ? "Active Now" : "Offline"}
                        </span>
                        {activeShopData?.address && (
                          <span className="hidden sm:inline-flex items-center gap-0.5 text-stone-400 truncate">
                            • <BsGeoAlt size={10} /> {activeShopData.address}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Header Fast Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Bespoke Sizing Modal Trigger */}
                    <button
                      type="button"
                      onClick={() => setShowSizingModal(true)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition shadow-2xs"
                      title="Send Custom Sizing Specification"
                    >
                      <FiScissors size={12} className="text-amber-800" />
                      <span className="hidden sm:inline">Bespoke Sizing</span>
                    </button>

                    {/* Make Price Offer Trigger */}
                    <button
                      type="button"
                      onClick={() => setShowOfferModal(true)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 text-xs font-bold transition shadow-2xs"
                      title="Propose Wholesale or Custom Price Quote"
                    >
                      <FiDollarSign size={12} className="text-stone-700" />
                      <span className="hidden sm:inline">Make Offer</span>
                    </button>

                    {/* Storefront Link */}
                    {activeShopData?._id && (
                      <Link
                        to={`/shop/preview/${activeShopData._id}`}
                        target="_blank"
                        className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition"
                      >
                        <BsShop size={12} />
                        <span>Store</span>
                      </Link>
                    )}

                    {/* Drawer Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowShopDrawer((prev) => !prev)}
                      className={`p-2 rounded-xl transition ${
                        showShopDrawer
                          ? "bg-amber-100 text-amber-900"
                          : "text-stone-500 hover:bg-stone-100 hover:text-stone-800"
                      }`}
                      title="Artisan Workshop Profile & Trust Stats"
                    >
                      <FiInfo size={18} />
                    </button>
                  </div>
                </div>

                {/* Creative Feature: Active Order Context Banner */}
                {matchingOrder && showOrderContext && (
                  <div className="px-4 py-2.5 bg-amber-50/90 border-b border-amber-200 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <FiPackage className="text-amber-800 shrink-0" size={15} />
                      <span className="font-bold text-amber-950 truncate">
                        Active Order #{matchingOrder._id?.slice(-6).toUpperCase()}:
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-white border border-amber-300 text-amber-900 font-semibold text-[11px]">
                        {matchingOrder.status || "Processing"}
                      </span>
                      <span className="text-amber-800 font-medium hidden sm:inline">
                        • {matchingOrder.totalPrice?.toLocaleString()} ETB
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setNewMessage(
                            `Hello master artisan, regarding Order #${matchingOrder._id?.slice(-6).toUpperCase()}: could you kindly share an update on the weaving progress?`
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-amber-800 hover:bg-amber-900 text-white font-bold text-[11px] transition"
                      >
                        Inquire Status
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowOrderContext(false)}
                        className="text-amber-700 hover:text-amber-950 p-1"
                        title="Dismiss order banner"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Cultural Quick-Inquiry Shortcuts */}
                <div className="px-4 py-2 bg-[#FAF9F5] border-b border-stone-200 overflow-x-auto flex items-center gap-2 shrink-0 no-scrollbar">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 shrink-0 flex items-center gap-1">
                    <BsLightningCharge className="text-amber-700" /> Fast Prompts:
                  </span>
                  {CULTURAL_QUICK_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setNewMessage(prompt.text)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 hover:border-amber-400 hover:bg-amber-50 text-[11px] text-stone-700 hover:text-amber-900 transition whitespace-nowrap shadow-2xs font-medium"
                    >
                      {prompt.label}
                    </button>
                  ))}
                </div>

                {/* Message Stream */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FAF9F5]/40">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                      <div className="w-14 h-14 rounded-3xl bg-amber-50 text-amber-900 flex items-center justify-center text-2xl shadow-xs">
                        <BsChatDots />
                      </div>
                      <h4 className="font-serif font-bold text-stone-900 text-sm">
                        Start Your Dialogue with {activeShopData?.name || "this Artisan"}
                      </h4>
                      <p className="text-xs text-stone-500 max-w-sm">
                        Inquire about customized sizing, choice of Tibeb embroidery motifs, pure cotton thread weights, or expedited delivery.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowSizingModal(true)}
                          className="px-3 py-1.5 rounded-xl bg-white border border-stone-300 hover:border-amber-500 text-stone-800 text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                        >
                          <FiScissors size={12} className="text-amber-800" />
                          <span>Fill Bespoke Sizing Form</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowOfferModal(true)}
                          className="px-3 py-1.5 rounded-xl bg-white border border-stone-300 hover:border-amber-500 text-stone-800 text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                        >
                          <FiTag size={12} className="text-amber-800" />
                          <span>Submit Custom Offer</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMe = msg.sender === user?._id;
                      const isStructuredSpec = msg.text?.includes("[BESPOKE TAILORING SPECIFICATION]");
                      const isPriceOffer = msg.text?.includes("[COMMERCIAL PRICE OFFER");
                      const isVoiceMemo = msg.text?.includes("🎙️ [Voice Memo Note");

                      return (
                        <div
                          key={msg._id || idx}
                          className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                        >
                          <div
                            className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl shadow-2xs space-y-2 ${
                              isMe
                                ? "bg-stone-900 text-white rounded-br-xs"
                                : "bg-white border border-stone-200 text-stone-900 rounded-bl-xs"
                            }`}
                          >
                            {/* Message Photo Attachment */}
                            {msg.images && (
                              <div
                                className="relative rounded-xl overflow-hidden cursor-pointer group"
                                onClick={() => setPreviewModalImg(msg.images.url || msg.images)}
                              >
                                <img
                                  src={msg.images.url || msg.images}
                                  alt="Attachment"
                                  className="w-full max-h-64 object-cover rounded-xl group-hover:scale-102 transition"
                                />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                                  <AiOutlineEye size={20} />
                                </div>
                              </div>
                            )}

                            {/* Stylized Message Cards */}
                            {isStructuredSpec ? (
                              <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                                isMe ? "bg-stone-800/80 border-amber-500/40 text-stone-100" : "bg-amber-50/80 border-amber-200 text-stone-900"
                              }`}>
                                <div className="flex items-center gap-1.5 font-bold text-amber-400">
                                  <FiScissors size={14} />
                                  <span>Bespoke Tailoring Specification</span>
                                </div>
                                <div className="text-[11px] leading-relaxed whitespace-pre-line font-mono">
                                  {msg.text.replace("📏 [BESPOKE TAILORING SPECIFICATION]", "").trim()}
                                </div>
                              </div>
                            ) : isPriceOffer ? (
                              <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                                isMe ? "bg-stone-800/80 border-emerald-500/40 text-stone-100" : "bg-emerald-50/80 border-emerald-200 text-stone-900"
                              }`}>
                                <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                                  <FiTag size={14} />
                                  <span>Commercial Price Proposal</span>
                                </div>
                                <div className="text-[11px] leading-relaxed whitespace-pre-line">
                                  {msg.text.replace("🏷️ [COMMERCIAL PRICE OFFER / BULK INQUIRY]", "").trim()}
                                </div>
                              </div>
                            ) : isVoiceMemo ? (
                              <div className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs ${
                                isMe ? "bg-stone-800 border-stone-700 text-stone-200" : "bg-stone-50 border-stone-200 text-stone-800"
                              }`}>
                                <div className="w-8 h-8 rounded-full bg-amber-800 text-white flex items-center justify-center shrink-0">
                                  <AiOutlineAudio size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1">
                                    <div className="h-1.5 bg-amber-600 rounded-full w-24 animate-pulse" />
                                    <span className="text-[10px] text-stone-400 font-mono">Recorded Inquiry</span>
                                  </div>
                                  <p className="text-[11px] truncate text-stone-300">Voice Memo Delivered</p>
                                </div>
                              </div>
                            ) : (
                              msg.text && (
                                <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                                  {msg.text}
                                </p>
                              )
                            )}

                            {/* Timestamp & Status */}
                            <div
                              className={`flex items-center justify-end gap-1 text-[10px] ${
                                isMe ? "text-stone-400" : "text-stone-400"
                              }`}
                            >
                              <span>{format(msg.createdAt)}</span>
                              {isMe && <BsCheck2All size={13} className="text-emerald-400" />}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={scrollRef} />
                </div>

                {/* Photo Upload Thumbnail Dock */}
                {imageFile && (
                  <div className="p-3 bg-stone-100 border-t border-stone-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={imageFile}
                          alt="Preview"
                          className="w-14 h-14 rounded-xl object-cover border border-stone-300 shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => setImageFile(null)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs shadow-sm hover:bg-rose-600 transition"
                        >
                          <RxCross1 size={10} />
                        </button>
                      </div>
                      <div className="text-xs text-stone-600">
                        <span className="font-bold block">Photo Reference Attached</span>
                        <span className="text-[11px] text-stone-400">Will be sent with your next message</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setImageFile(null)}
                      className="text-stone-400 hover:text-rose-600 text-xs font-bold flex items-center gap-1 transition"
                    >
                      <FiTrash2 size={13} />
                      <span>Remove</span>
                    </button>
                  </div>
                )}

                {/* Simulated Voice Recording Active Bar */}
                {isRecordingVoice && (
                  <div className="p-3 bg-rose-50 border-t border-rose-200 flex items-center justify-between gap-3 animate-in fade-in">
                    <div className="flex items-center gap-2 text-rose-700 text-xs font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                      <span>Recording Voice Memo ({voiceSeconds}s)...</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={cancelVoiceRecording}
                        className="px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={sendVoiceMemo}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
                      >
                        <AiOutlineSend size={13} />
                        <span>Send Memo</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Message Input Dock */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 sm:p-4 bg-white border-t border-stone-200 flex items-center gap-2"
                >
                  {/* File / Image Attachment Button */}
                  <div>
                    <input
                      type="file"
                      id="buyer-chat-file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                    <label
                      htmlFor="buyer-chat-file"
                      className="p-2.5 rounded-xl border border-stone-200 hover:border-amber-500 hover:bg-amber-50 text-stone-600 hover:text-amber-900 transition cursor-pointer flex items-center justify-center shadow-2xs"
                      title="Attach photo reference or tailoring sketch"
                    >
                      <FiImage size={17} />
                    </label>
                  </div>

                  {/* Simulated Voice Recording Trigger */}
                  <button
                    type="button"
                    onClick={startVoiceRecording}
                    className="p-2.5 rounded-xl border border-stone-200 hover:border-amber-500 hover:bg-amber-50 text-stone-600 hover:text-amber-900 transition flex items-center justify-center shadow-2xs"
                    title="Record voice inquiry memo"
                  >
                    <AiOutlineAudio size={17} />
                  </button>

                  {/* Text Input */}
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message, tailoring request, or inquiry to the artisan..."
                      className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-300 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-700 focus:bg-white transition"
                    />
                  </div>

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!newMessage.trim() && !imageFile}
                    className={`p-3 rounded-2xl font-bold transition flex items-center justify-center shadow-xs ${
                      newMessage.trim() || imageFile
                        ? "bg-amber-800 hover:bg-amber-900 text-white"
                        : "bg-stone-200 text-stone-400 cursor-not-allowed"
                    }`}
                    title="Send message"
                  >
                    <AiOutlineSend size={16} />
                  </button>
                </form>
              </>
            ) : (
              /* No Active Chat Selected State */
              <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-900 flex items-center justify-center text-3xl shadow-xs">
                  <BsChatDots />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-900">
                    Artisan Conversation Studio
                  </h3>
                  <p className="text-xs text-stone-500 max-w-sm mt-1">
                    Select an active dialogue from the list on the left, or visit any artisan's shop to inquire about custom orders.
                  </p>
                </div>
                <Link
                  to="/artisans"
                  className="px-5 py-2.5 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
                >
                  <BsShop size={13} />
                  <span>Discover Ethiopian Artisans</span>
                </Link>
              </div>
            )}
          </div>

          {/* ============================================================
              RIGHT DRAWER: Artisan Workshop Profile (Collapsible)
             ============================================================ */}
          {currentChat && showShopDrawer && (
            <div className="w-72 lg:w-80 shrink-0 border-l border-stone-200 bg-[#FAF9F5] p-5 overflow-y-auto space-y-5 animate-in slide-in-from-right duration-200 hidden lg:block">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-stone-700">
                  Artisan Workshop Profile
                </h4>
                <button
                  type="button"
                  onClick={() => setShowShopDrawer(false)}
                  className="text-stone-400 hover:text-stone-700"
                >
                  <FiX size={16} />
                </button>
              </div>

              {/* Workshop Card */}
              <div className="text-center space-y-2">
                {activeShopData?.avatar?.url ? (
                  <img
                    src={activeShopData.avatar.url}
                    alt=""
                    className="w-16 h-16 rounded-3xl mx-auto object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-3xl bg-amber-800 text-amber-100 font-bold flex items-center justify-center text-xl font-serif mx-auto shadow-sm">
                    {(activeShopData?.name || "A").slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-serif font-bold text-stone-900 text-sm">
                    {activeShopData?.name || "Artisan Workshop"}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    {activeShopData?.businessType || "Master Artisan Guild"}
                  </p>
                </div>
              </div>

              {/* Verified Trust Badges */}
              <div className="p-3.5 rounded-2xl bg-white border border-stone-200 space-y-2 text-xs shadow-2xs">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                  <BsShieldCheck size={16} className="text-emerald-700 shrink-0" />
                  <span>Ministry of Trade Verified</span>
                </div>
                <div className="flex items-center gap-2 text-stone-600 text-[11px]">
                  <FiScissors size={14} className="text-amber-800 shrink-0" />
                  <span>Bespoke Tailoring Accepted</span>
                </div>
                <div className="flex items-center gap-2 text-stone-600 text-[11px]">
                  <FiTruck size={14} className="text-blue-700 shrink-0" />
                  <span>Domestic & DHL Dispatch</span>
                </div>
                <div className="flex items-center gap-2 text-stone-600 text-[11px]">
                  <BsBookmarkStar size={14} className="text-amber-700 shrink-0" />
                  <span>Authentic Handcrafted Guild</span>
                </div>
              </div>

              {/* Bio & Heritage Story */}
              {activeShopData?.description && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Heritage Story</span>
                  <p className="text-xs text-stone-600 leading-relaxed bg-white p-3 rounded-2xl border border-stone-200">
                    {activeShopData.description}
                  </p>
                </div>
              )}

              {/* Location & Contact */}
              <div className="space-y-2 text-xs text-stone-600">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Workshop Location</span>
                <p className="flex items-start gap-1.5 text-[11px]">
                  <BsGeoAlt className="text-stone-400 mt-0.5 shrink-0" />
                  <span>{activeShopData?.address || "Addis Ababa, Ethiopia"}</span>
                </p>
              </div>

              {/* Direct Actions */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSizingModal(true)}
                  className="w-full py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <FiScissors size={13} />
                  <span>Request Custom Tailoring</span>
                </button>

                {activeShopData?._id && (
                  <Link
                    to={`/shop/preview/${activeShopData._id}`}
                    className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <BsShop size={13} />
                    <span>Browse Workshop Crafts</span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================
          MODAL 1: Bespoke Tailoring & Sizing Card Builder
         ============================================================ */}
      {showSizingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center">
                  <FiScissors size={18} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-stone-900">
                    Bespoke Tailoring Sizing Form
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Deliver custom body measurements directly to this workshop
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSizingModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSendBespokeSizing} className="space-y-3.5 text-xs">
              {/* Garment Type */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">Craft / Garment Type</label>
                <select
                  value={sizingGarment}
                  onChange={(e) => setSizingGarment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-700"
                >
                  <option>Habesha Kemis / Traditional Dress</option>
                  <option>Men's Kaftan / Gabi</option>
                  <option>Handmade Leather Boots / Footwear</option>
                  <option>Bespoke Leather Belt / Bag</option>
                  <option>Traditional Silver Filigree Cross / Ring</option>
                  <option>Hand-Carved Jimma Stool / Pottery</option>
                </select>
              </div>

              {/* Measurements Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">Bust/Chest (cm)</label>
                  <input
                    type="number"
                    placeholder="e.g. 96"
                    value={sizingBust}
                    onChange={(e) => setSizingBust(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">Waist (cm)</label>
                  <input
                    type="number"
                    placeholder="e.g. 78"
                    value={sizingWaist}
                    onChange={(e) => setSizingWaist(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">Hips (cm)</label>
                  <input
                    type="number"
                    placeholder="e.g. 102"
                    value={sizingHips}
                    onChange={(e) => setSizingHips(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">Full Length (cm)</label>
                  <input
                    type="number"
                    placeholder="e.g. 142"
                    value={sizingLength}
                    onChange={(e) => setSizingLength(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">Shoulder/Sleeve (cm)</label>
                  <input
                    type="number"
                    placeholder="e.g. 58"
                    value={sizingSleeve}
                    onChange={(e) => setSizingSleeve(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">Timeline SLA</label>
                  <select
                    value={sizingUrgency}
                    onChange={(e) => setSizingUrgency(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-xl bg-stone-50 border border-stone-300 text-[11px] text-stone-900 focus:outline-none"
                  >
                    <option>Standard (7-14 Days)</option>
                    <option>Rush (3-5 Days)</option>
                    <option>Diaspora DHL Express</option>
                  </select>
                </div>
              </div>

              {/* Cotton Ply & Tibeb Motif */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">Cotton Ply</label>
                  <select
                    value={sizingCottonPly}
                    onChange={(e) => setSizingCottonPly(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none"
                  >
                    <option>Classic 2-ply Menen</option>
                    <option>Lightweight 1-ply Shemma</option>
                    <option>Heavy 4-ply Warm Gabi</option>
                    <option>Organic Raw Cotton</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">Embroidery / Tilf Motif</label>
                  <select
                    value={sizingTibebMotif}
                    onChange={(e) => setSizingTibebMotif(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none"
                  >
                    <option>Gold & Emerald Tilf Geometric</option>
                    <option>Royal Blue & Yellow Border</option>
                    <option>Harari Red Diamond Pattern</option>
                    <option>Subtle Monochromatic White</option>
                  </select>
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">Special Notes / Lining Preferences</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Include matching Netela shawl with identical border; double lining inside."
                  value={sizingSpecialNotes}
                  onChange={(e) => setSizingSpecialNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-700"
                />
              </div>

              {/* Submit CTA */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSizingModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <FiCheck size={14} />
                  <span>Insert Specification into Dialogue</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL 2: Price Offer & Wholesale / Wedding Package Generator
         ============================================================ */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                  <FiTag size={18} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-stone-900">
                    Propose Custom Price Offer
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Submit a commercial quote for weddings, bundles, or custom orders
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOfferModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSendPriceOffer} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Item Title / Package Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5x Bridal Party Habesha Kemis Sets"
                  value={offerItemName}
                  onChange={(e) => setOfferItemName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={offerQuantity}
                    onChange={(e) => setOfferQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Offer Total (ETB) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 35000"
                    value={offerAmountETB}
                    onChange={(e) => setOfferAmountETB(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Proposal Details / Deadline</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Ordering for wedding on Tikimt 12. Can pick up directly at your Shiro Meda workshop."
                  value={offerNotes}
                  onChange={(e) => setOfferNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <FiCheck size={14} />
                  <span>Send Offer to Artisan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Image Preview Modal */}
      {previewModalImg && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewModalImg(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl">
            <img
              src={previewModalImg}
              alt="Enlarged Reference"
              className="w-full h-full object-contain rounded-3xl"
            />
            <button
              onClick={() => setPreviewModalImg(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black transition"
            >
              <RxCross1 size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// Helper Sub-Component: Conversation List Item
// ============================================================
interface ConversationItemProps {
  chat: any;
  partnerId: string;
  isSelected: boolean;
  isOnline: boolean;
  isLastMsgMine: boolean;
  onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  chat,
  partnerId,
  isSelected,
  isOnline,
  isLastMsgMine,
  onClick,
}) => {
  const [partnerShop, setPartnerShop] = useState<any | null>(null);

  useEffect(() => {
    if (!partnerId) return;
    let isMounted = true;
    axios
      .get(`${server}/shop/get-shop-info/${partnerId}`)
      .then((res) => {
        if (isMounted && res.data?.shop) {
          setPartnerShop(res.data.shop);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [partnerId]);

  const displayName = partnerShop?.name || "Artisan Workshop";
  const avatarUrl = partnerShop?.avatar?.url;

  return (
    <div
      onClick={onClick}
      className={`p-3.5 flex items-center gap-3 cursor-pointer transition ${
        isSelected
          ? "bg-amber-100/60 border-l-4 border-amber-800"
          : "hover:bg-stone-100/80"
      }`}
    >
      {/* Avatar with Online Dot */}
      <div className="relative shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="w-11 h-11 rounded-2xl object-cover border border-stone-200"
          />
        ) : (
          <div className="w-11 h-11 rounded-2xl bg-amber-800 text-amber-100 font-bold flex items-center justify-center text-sm font-serif">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
        )}
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
            isOnline ? "bg-emerald-500" : "bg-stone-300"
          }`}
        />
      </div>

      {/* Information */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <h4 className="font-bold text-xs text-stone-900 truncate font-serif">
            {displayName}
          </h4>
          <span className="text-[10px] text-stone-400 shrink-0 font-medium">
            {chat.updatedAt ? format(chat.updatedAt) : ""}
          </span>
        </div>

        <p className="text-[11px] text-stone-500 truncate">
          {isLastMsgMine && <span className="font-semibold text-stone-700">You: </span>}
          {chat.lastMessage || "Started discussion"}
        </p>
      </div>
    </div>
  );
};

export default Usermessage;
