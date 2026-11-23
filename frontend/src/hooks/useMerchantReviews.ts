import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { server } from "../server";
import { useAppSelector } from "./redux";
import { IReview } from "../types";

export interface ReviewMetrics {
  averageRating: number;
  totalReviews: number;
  needsReplyCount: number;
  starDistribution: Record<number, number>;
}

export interface UseMerchantReviewsReturn {
  seller: any;
  reviews: IReview[];
  filteredReviews: IReview[];
  loading: boolean;
  starFilter: string;
  setStarFilter: (val: string) => void;
  search: string;
  setSearch: (val: string) => void;
  activeReplyId: string | null;
  setActiveReplyId: (val: string | null) => void;
  replyText: string;
  setReplyText: (val: string) => void;
  submittingReply: boolean;
  handleSendReply: (reviewId: string) => Promise<void>;
  lightboxImg: string | null;
  setLightboxImg: (url: string | null) => void;
  metrics: ReviewMetrics;
  fetchReviews: () => Promise<void>;
}

export const useMerchantReviews = (): UseMerchantReviewsReturn => {
  const { seller } = useAppSelector((state) => state.seller);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [starFilter, setStarFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  // Reply state
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>("");
  const [submittingReply, setSubmittingReply] = useState<boolean>(false);

  // Lightbox
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!seller?._id) return;
    setLoading(true);
    try {
      const res = await axios.get(`${server}/review/shop-reviews/${seller._id}`);
      if (res.data?.success) {
        setReviews(res.data.reviews || []);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load store reviews");
    } finally {
      setLoading(false);
    }
  }, [seller?._id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSendReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      const res = await axios.put(
        `${server}/review/merchant-reply/${reviewId}`,
        { comment: replyText.trim() },
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.success("Workshop reply posted to customer!");
        setActiveReplyId(null);
        setReplyText("");
        fetchReviews();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit workshop reply");
    } finally {
      setSubmittingReply(false);
    }
  };

  const metrics = useMemo<ReviewMetrics>(() => {
    const list = reviews || [];
    const total = list.length;
    if (total === 0) {
      return {
        averageRating: 5.0,
        totalReviews: 0,
        needsReplyCount: 0,
        starDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    let sum = 0;
    let needsReply = 0;
    const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    list.forEach((r) => {
      const score = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
      dist[score] = (dist[score] || 0) + 1;
      sum += r.rating || 5;
      if (!r.merchantReply?.comment) needsReply += 1;
    });

    return {
      averageRating: parseFloat((sum / total).toFixed(1)),
      totalReviews: total,
      needsReplyCount: needsReply,
      starDistribution: dist,
    };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    return (reviews || []).filter((r) => {
      if (starFilter === "needs_reply" && r.merchantReply?.comment) return false;
      if (starFilter !== "all" && starFilter !== "needs_reply") {
        if (Math.round(r.rating) !== Number(starFilter)) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = r.user?.name?.toLowerCase().includes(q);
        const matchComment = r.comment?.toLowerCase().includes(q);
        const matchProd = r.productRef?.name?.toLowerCase().includes(q);
        if (!matchName && !matchComment && !matchProd) return false;
      }
      return true;
    });
  }, [reviews, starFilter, search]);

  return {
    seller,
    reviews,
    filteredReviews,
    loading,
    starFilter,
    setStarFilter,
    search,
    setSearch,
    activeReplyId,
    setActiveReplyId,
    replyText,
    setReplyText,
    submittingReply,
    handleSendReply,
    lightboxImg,
    setLightboxImg,
    metrics,
    fetchReviews,
  };
};

export default useMerchantReviews;
