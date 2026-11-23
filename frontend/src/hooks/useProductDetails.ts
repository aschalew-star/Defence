import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { server } from "../server";
import { useAppDispatch, useAppSelector } from "./redux";
import { useCurrency } from "./useCurrency";
import { addTocart } from "../redux/Action/cartAction";
import { addToWishlist, removeFromwish } from "../redux/Action/Wishlist";
import { IProduct, IReview } from "../types";

export interface CustomTailoringMeasurements {
  bust: string;
  waist: string;
  hips: string;
  heightOrLength: string;
  shoulderToShoulder: string;
  additionalInstructions: string;
}

export interface UseProductDetailsOptions {
  productId?: string;
  initialProduct?: IProduct | null;
}

export const useProductDetails = (options?: UseProductDetailsOptions) => {
  const routeParams = useParams<{ id: string }>();
  const id = options?.productId || routeParams.id;
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { formatPrice } = useCurrency();

  const { allProducts } = useAppSelector((state) => state.products);
  const { user } = useAppSelector((state) => state.user);
  const { cart } = useAppSelector((state) => state.Cart);
  const { wish } = useAppSelector((state) => state.Wish);

  // Core product state
  const [product, setProduct] = useState<IProduct | any | null>(options?.initialProduct || null);
  const [loading, setLoading] = useState<boolean>(!options?.initialProduct);
  const [selectedImg, setSelectedImg] = useState<number>(0);
  const [qty, setQty] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<string>("reviews");
  const [relatedProducts, setRelatedProducts] = useState<IProduct[]>([]);

  // Sizing & Custom Habesha Tailoring
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [selectedColor, setSelectedColor] = useState<string>("Traditional White");
  const [showCustomTailoring, setShowCustomTailoring] = useState<boolean>(false);
  const [customMeasurements, setCustomMeasurements] = useState<CustomTailoringMeasurements>({
    bust: "",
    waist: "",
    hips: "",
    heightOrLength: "",
    shoulderToShoulder: "",
    additionalInstructions: "",
  });

  // Reviews state
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState<boolean>(false);
  const [canReview, setCanReview] = useState<boolean>(false);
  const [canReviewLoading, setCanReviewLoading] = useState<boolean>(false);
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>("");
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  // Check Review Eligibility (Verified Purchase Gate)
  useEffect(() => {
    if (!product?._id || !user?._id) {
      setCanReview(false);
      return;
    }

    const checkEligibility = async () => {
      setCanReviewLoading(true);
      try {
        const res = await axios.get(`${server}/review/can-review/${product._id}`, {
          withCredentials: true,
        });
        if (res.data?.success) {
          setCanReview(Boolean(res.data.canReview));
          if (res.data.existingReview) {
            setNewRating(res.data.existingReview.rating || 5);
            setNewComment(res.data.existingReview.comment || "");
          }
        }
      } catch (err) {
        setCanReview(false);
      } finally {
        setCanReviewLoading(false);
      }
    };

    checkEligibility();
  }, [product?._id, user?._id]);

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);

  // Autofill user's saved traditional sizing profile
  const handleAutofillMeasurements = useCallback(() => {
    if (!user?.customMeasurements || (!user.customMeasurements.bust && !user.customMeasurements.waist)) {
      toast.info("No saved sizing profile found in your account!");
      return;
    }
    const cm = user.customMeasurements;
    setCustomMeasurements({
      bust: cm.bust || "",
      waist: cm.waist || "",
      hips: cm.hips || "",
      heightOrLength: cm.length || cm.height || "",
      shoulderToShoulder: cm.shoulders || "",
      additionalInstructions: cm.notes || "",
    });
    setShowCustomTailoring(true);
    toast.success("Autofilled from your saved traditional sizing profile!");
  }, [user]);

  const updateMeasurement = useCallback((field: keyof CustomTailoringMeasurements, val: string) => {
    setCustomMeasurements((prev) => ({ ...prev, [field]: val }));
  }, []);

  // Fetch product data
  useEffect(() => {
    if (!id && !options?.initialProduct) return;
    if (options?.initialProduct) {
      setProduct(options.initialProduct);
      setLoading(false);
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });

    // Try finding in Redux store first
    if (allProducts && allProducts.length > 0) {
      const found = allProducts.find((p: any) => p._id === id || p.slug === id);
      if (found) {
        setProduct(found);
        setLoading(false);
      }
    }

    // Always fetch latest product details from server
    const fetchSingleProduct = async () => {
      try {
        const res = await axios.get(`${server}/product/product/${id}`);
        if (res.data?.product) {
          setProduct(res.data.product);
        }
      } catch (err: any) {
        console.error("Failed to load product details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSingleProduct();
  }, [id, allProducts, options?.initialProduct]);

  // Fetch reviews
  useEffect(() => {
    if (!product?._id) return;

    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const res = await axios.get(`${server}/review/product-reviews/${product._id}`);
        if (res.data?.reviews) {
          setReviews(res.data.reviews);
        }
      } catch (err: any) {
        console.error("Failed to load reviews:", err);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [product?._id]);

  // Fetch related products
  useEffect(() => {
    if (!product?._id) return;
    const fetchRelated = async () => {
      try {
        const cat = product.category || "";
        const res = await axios.get(
          `${server}/product/get-all-products?category=${encodeURIComponent(cat)}&limit=6`
        );
        const filtered = (res.data?.products || [])
          .filter((p: any) => p._id !== product._id)
          .slice(0, 5);
        setRelatedProducts(filtered);
      } catch (err: any) {
        console.error("Failed to load related products:", err);
      }
    };
    fetchRelated();
  }, [product?._id, product?.category]);

  // Computed Values
  const images = useMemo(() => {
    if (product?.images && product.images.length > 0) return product.images;
    return [{ url: "/placeholder.jpg" }];
  }, [product?.images]);

  const isInWish = useMemo(() => {
    return (wish || []).some((i: any) => i._id === product?._id);
  }, [wish, product?._id]);

  const isInCart = useMemo(() => {
    return (cart || []).some((i: any) => i._id === product?._id);
  }, [cart, product?._id]);

  const currentPrice = Number(product?.discountPrice || product?.originalPrice || 0);
  const originalPrice = Number(product?.originalPrice || 0);
  const hasDiscount = originalPrice > currentPrice && currentPrice > 0;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;
  const ratingValue = Number(product?.ratings || 5);
  const usdEstimate = Math.round(currentPrice / 125);

  // Gallery Navigation
  const nextImage = useCallback(() => {
    setSelectedImg((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const prevImage = useCallback(() => {
    setSelectedImg((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  // Quantity controls
  const incrementQty = useCallback(() => {
    setQty((prev) => (product?.stock && prev < product.stock ? prev + 1 : prev));
  }, [product?.stock]);

  const decrementQty = useCallback(() => {
    setQty((prev) => Math.max(1, prev - 1));
  }, []);

  // Cart & Wishlist Actions
  const handleAddToCart = useCallback(
    (e?: React.SyntheticEvent, redirect = false) => {
      if (e) e.preventDefault();
      if (!product) return;

      if (product.stock < qty) {
        toast.error("Requested quantity exceeds available stock!");
        return;
      }

      const itemPayload = {
        ...product,
        qty,
        selectedSize,
        selectedColor,
        customMeasurements: showCustomTailoring ? customMeasurements : {},
      };

      dispatch(addTocart(itemPayload));
      toast.success(`Added ${qty > 1 ? `(${qty})` : ""} to shopping bag!`);

      if (redirect) {
        navigate("/checkout");
      }
    },
    [product, qty, selectedSize, selectedColor, showCustomTailoring, customMeasurements, dispatch, navigate]
  );

  const handleBuyNow = useCallback(() => {
    handleAddToCart(undefined, true);
  }, [handleAddToCart]);

  const handleToggleWish = useCallback(() => {
    if (!product) return;
    if (isInWish) {
      dispatch(removeFromwish(product));
      toast.info("Removed from wishlist");
    } else {
      dispatch(addToWishlist({ ...product, qty: 1 }));
      toast.success("Saved to wishlist!");
    }
  }, [product, isInWish, dispatch]);

  // Merchant Messaging
  const handleMessageSubmit = useCallback(async () => {
    if (!user) {
      toast.error("Please login first to chat with the artisan!");
      navigate("/login");
      return;
    }
    if (!product) return;

    const sellerId =
      product.shopId || product.shopRef?._id || product.shop?._id || product.shop;

    if (!sellerId) {
      toast.error("Artisan shop information is not available.");
      return;
    }

    const groupTitle = product._id + user._id;
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
  }, [user, product, navigate]);

  // Review Submission
  const handleSubmitReview = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) {
        toast.error("Please login to write a review!");
        navigate("/login");
        return;
      }

      if (!newComment.trim()) {
        toast.error("Please write a comment for your review!");
        return;
      }

      if (!product?._id) return;

      setSubmittingReview(true);
      try {
        const res = await axios.post(
          `${server}/review/create-review`,
          {
            productId: product._id,
            rating: newRating,
            comment: newComment,
          },
          { withCredentials: true }
        );

        if (res.data?.success) {
          toast.success("Thank you! Your review has been submitted.");
          setNewComment("");
          const refresh = await axios.get(`${server}/review/product-reviews/${product._id}`);
          if (refresh.data?.reviews) {
            setReviews(refresh.data.reviews);
          }
        }
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to submit review");
      } finally {
        setSubmittingReview(false);
      }
    },
    [user, product?._id, newRating, newComment, navigate]
  );

  // Share
  const handleShare = useCallback(() => {
    if (!product) return;
    if (navigator.share) {
      navigator
        .share({
          title: product.name,
          text: `Check out this authentic handcrafted Ethiopian garment: ${product.name}`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied to clipboard!");
    }
  }, [product]);

  return {
    // Core data
    product,
    loading,
    images,
    relatedProducts,
    // Gallery & Lightbox
    selectedImg,
    setSelectedImg,
    nextImage,
    prevImage,
    lightboxOpen,
    setLightboxOpen,
    // Quantity
    qty,
    setQty,
    incrementQty,
    decrementQty,
    // Sizing & Custom tailoring
    selectedSize,
    setSelectedSize,
    selectedColor,
    setSelectedColor,
    showCustomTailoring,
    setShowCustomTailoring,
    customMeasurements,
    updateMeasurement,
    handleAutofillMeasurements,
    // Tabs
    activeTab,
    setActiveTab,
    // Reviews
    reviews,
    reviewsLoading,
    canReview,
    canReviewLoading,
    newRating,
    setNewRating,
    newComment,
    setNewComment,
    submittingReview,
    handleSubmitReview,
    // Pricing
    currentPrice,
    originalPrice,
    hasDiscount,
    discountPercent,
    ratingValue,
    usdEstimate,
    formattedCurrentPrice: formatPrice(currentPrice),
    formattedOriginalPrice: formatPrice(originalPrice),
    // Status & Actions
    isInWish,
    isInCart,
    handleAddToCart,
    handleBuyNow,
    handleToggleWish,
    handleMessageSubmit,
    handleShare,
    navigate,
    user,
  };
};

export default useProductDetails;
