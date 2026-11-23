import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { server } from "../server";
import { useAppDispatch, useAppSelector } from "./redux";
import { useCurrency } from "./useCurrency";
import { addTocart } from "../redux/Action/cartAction";
import { addToWishlist, removeFromwish } from "../redux/Action/Wishlist";
import { IEvent } from "../types";

export interface TimeLeftState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

export const useEventDetails = (eventId?: string) => {
  const routeParams = useParams<{ id: string }>();
  const id = eventId || routeParams.id;
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { formatPrice } = useCurrency();

  const { user } = useAppSelector((state) => state.user);
  const { cart } = useAppSelector((state) => state.Cart);
  const { wish } = useAppSelector((state) => state.Wish);

  const [event, setEvent] = useState<IEvent | any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImg, setSelectedImg] = useState<number>(0);
  const [qty, setQty] = useState<number>(1);
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [activeTab, setActiveTab] = useState<string>("details");
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);

  // Custom tailoring state
  const [customBust, setCustomBust] = useState<string>("");
  const [customWaist, setCustomWaist] = useState<string>("");
  const [customHips, setCustomHips] = useState<string>("");
  const [customLength, setCustomLength] = useState<string>("");
  const [customNotes, setCustomNotes] = useState<string>("");

  // Live countdown state
  const [timeLeft, setTimeLeft] = useState<TimeLeftState>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  const handleAutofillMeasurements = useCallback(() => {
    if (!user?.customMeasurements || (!user.customMeasurements.bust && !user.customMeasurements.waist)) {
      toast.info("No saved sizing profile found in your account!");
      return;
    }
    const cm = user.customMeasurements;
    setCustomBust(cm.bust || "");
    setCustomWaist(cm.waist || "");
    setCustomHips(cm.hips || "");
    setCustomLength(cm.length || cm.height || "");
    setCustomNotes(cm.notes || "");
    toast.success("Autofilled from your saved traditional sizing profile!");
  }, [user]);

  // Fetch Event Details
  useEffect(() => {
    if (!id) return;
    window.scrollTo({ top: 0, behavior: "smooth" });

    const fetchEvent = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${server}/event/get-event/${id}`);
        if (res.data?.event) {
          setEvent(res.data.event);
        }
      } catch (err: any) {
        console.error("Failed to load event:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  // Live Countdown Timer calculation
  useEffect(() => {
    if (!event?.Finish_Date) return;

    const target = new Date(event.Finish_Date).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds, expired: false });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [event?.Finish_Date]);

  const images = useMemo(() => {
    if (event?.images && event.images.length > 0) return event.images;
    if (event?.featuredImage?.url) return [{ url: event.featuredImage.url }];
    return [{ url: "/placeholder.jpg" }];
  }, [event]);

  const isInWish = useMemo(() => {
    return (wish || []).some((i: any) => i._id === event?._id);
  }, [wish, event?._id]);

  const isInCart = useMemo(() => {
    return (cart || []).some((i: any) => i._id === event?._id);
  }, [cart, event?._id]);

  const currentPrice = Number(event?.discountPrice || event?.originalPrice || 0);
  const regularPrice = Number(event?.originalPrice || event?.discountPrice || 0);
  const savings = Math.max(0, regularPrice - currentPrice);
  const hasDiscount = regularPrice > currentPrice && currentPrice > 0;
  const discountPercent = hasDiscount ? Math.round(((regularPrice - currentPrice) / regularPrice) * 100) : null;
  const usdEstimate = (currentPrice / 120).toFixed(2);

  const nextImage = useCallback(() => {
    setSelectedImg((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const prevImage = useCallback(() => {
    setSelectedImg((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleWishlistToggle = useCallback(() => {
    if (!event) return;
    if (isInWish) {
      dispatch(removeFromwish(event));
      toast.info("Removed from your festival wishlist");
    } else {
      dispatch(addToWishlist({ ...event, isEvent: true }));
      toast.success("Saved to your festival wishlist!");
    }
  }, [event, isInWish, dispatch]);

  const handleAddToCart = useCallback(
    (e?: React.SyntheticEvent, instantBuy = false) => {
      if (e) e.stopPropagation();
      if (!event) return;

      if (timeLeft.expired) {
        toast.error("This promotional event has concluded!");
        return;
      }

      if (event.stock < 1) {
        toast.error("This promotional allocation is completely sold out!");
        return;
      }

      const customMeasurements =
        event.isCustomizable && (customBust || customWaist || customHips || customLength)
          ? {
              bust: customBust,
              waist: customWaist,
              hips: customHips,
              length: customLength,
              notes: customNotes,
            }
          : null;

      const itemPayload = {
        ...event,
        qty,
        selectedSize: event.isCustomizable ? selectedSize : undefined,
        customMeasurements,
        isEventDeal: true,
      };

      dispatch(addTocart(itemPayload));
      toast.success(
        instantBuy
          ? "Redirecting to priority checkout..."
          : `Added promotional item (${qty}) to cart!`
      );

      if (instantBuy) {
        navigate("/checkout");
      }
    },
    [event, timeLeft.expired, customBust, customWaist, customHips, customLength, customNotes, qty, selectedSize, dispatch, navigate]
  );

  const handleMessageSubmit = useCallback(async () => {
    if (!user) {
      toast.error("Please login to message the artisan shop!");
      navigate("/login");
      return;
    }
    if (!event) return;

    const sellerId = event.shop?._id || event.shopId || event.shop;
    if (!sellerId) {
      toast.error("Artisan shop information is currently unavailable.");
      return;
    }

    const groupTitle = event._id + user._id;
    const userId = user._id;

    try {
      const res = await axios.post(`${server}/conversation/create-new-conversation`, {
        groupTitle,
        userId,
        sellerId,
      });

      const conversationId = res.data?.conversation?._id;
      if (conversationId) {
        navigate(`/inbox?conversationId=${conversationId}`);
      } else {
        toast.error("Could not start conversation.");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to start conversation");
    }
  }, [user, event, navigate]);

  const handleShare = useCallback(() => {
    if (!event) return;
    if (navigator.share) {
      navigator
        .share({
          title: event.name,
          text: `Check out this limited-time cultural event discount on ${event.name}!`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Event promotion link copied to clipboard!");
    }
  }, [event]);

  return {
    event,
    loading,
    images,
    selectedImg,
    setSelectedImg,
    nextImage,
    prevImage,
    qty,
    setQty,
    selectedSize,
    setSelectedSize,
    activeTab,
    setActiveTab,
    lightboxOpen,
    setLightboxOpen,
    // Custom tailoring
    customBust,
    setCustomBust,
    customWaist,
    setCustomWaist,
    customHips,
    setCustomHips,
    customLength,
    setCustomLength,
    customNotes,
    setCustomNotes,
    handleAutofillMeasurements,
    // Timer
    timeLeft,
    // Pricing
    currentPrice,
    regularPrice,
    savings,
    hasDiscount,
    discountPercent,
    usdEstimate,
    formattedCurrentPrice: formatPrice(currentPrice),
    formattedRegularPrice: formatPrice(regularPrice),
    formattedSavings: formatPrice(savings),
    // Actions & Flags
    isInWish,
    isInCart,
    handleWishlistToggle,
    handleAddToCart,
    handleMessageSubmit,
    handleShare,
    navigate,
    user,
  };
};

export default useEventDetails;
