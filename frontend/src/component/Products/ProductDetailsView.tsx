import React from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { server } from "../../server";
import { useProductDetails } from "../../hooks";
import { useLanguage } from "../../hooks/useLanguage";
import Productcard from "./Productcard";
import ProductQASection from "./ProductQASection";
import BundleDealsSection from "./BundleDealsSection";
import RecentlyViewed from "./RecentlyViewed";
import {
  AiFillStar,
  AiOutlineStar,
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineCheck,
} from "react-icons/ai";
import {
  BsBagPlus,
  BsLightningCharge,
  BsChatDots,
  BsShop,
  BsShieldCheck,
  BsTruck,
  BsArrowRepeat,
  BsScissors,
  BsGeoAlt,
  BsShare,
  BsStarHalf,
  BsPersonPlus,
  BsPersonCheck,
} from "react-icons/bs";
import {
  MdOutlineVerified,
  MdOutlineHighQuality,
  MdOutlineDryCleaning,
  MdOutlineWash,
} from "react-icons/md";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { FiCheckCircle, FiClock, FiTag, FiShield, FiPackage } from "react-icons/fi";

const ProductDetailsView: React.FC = () => {
  const {
    product,
    loading,
    images,
    relatedProducts,
    selectedImg,
    setSelectedImg,
    nextImage,
    prevImage,
    lightboxOpen,
    setLightboxOpen,
    qty,
    setQty,
    incrementQty,
    decrementQty,
    selectedSize,
    setSelectedSize,
    selectedColor,
    setSelectedColor,
    showCustomTailoring,
    setShowCustomTailoring,
    customMeasurements,
    updateMeasurement,
    handleAutofillMeasurements,
    activeTab,
    setActiveTab,
    reviews,
    reviewsLoading,
    canReview,
    newRating,
    setNewRating,
    newComment,
    setNewComment,
    submittingReview,
    handleSubmitReview,
    currentPrice,
    originalPrice,
    hasDiscount,
    discountPercent,
    ratingValue,
    usdEstimate,
    formattedCurrentPrice,
    formattedOriginalPrice,
    isInWish,
    isInCart,
    handleAddToCart,
    handleBuyNow,
    handleToggleWish,
    handleMessageSubmit,
    handleShare,
    user,
  } = useProductDetails();
  const { t } = useLanguage();

  // AliExpress Advanced Features & Hooks (Declared unconditionally at component top)
  const [isFollowing, setIsFollowing] = React.useState<boolean>(false);
  const [followersCount, setFollowersCount] = React.useState<number>(0);
  const [zoomLens, setZoomLens] = React.useState<{ show: boolean; x: number; y: number }>({
    show: false,
    x: 0,
    y: 0,
  });
  const [showStickyBar, setShowStickyBar] = React.useState<boolean>(false);
  const [escrowModalOpen, setEscrowModalOpen] = React.useState<boolean>(false);
  const [copiedLink, setCopiedLink] = React.useState<boolean>(false);
  const [shippingCity, setShippingCity] = React.useState<string>("Addis Ababa");

  // Track scroll position for AliExpress sticky bottom purchase bar
  React.useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 550);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track recently viewed product
  React.useEffect(() => {
    if (product?._id && user?._id) {
      axios
        .post(
          `${server}/user/track-recently-viewed`,
          { productId: product._id },
          { withCredentials: true }
        )
        .catch(() => {});
    }
  }, [product?._id, user?._id]);

  // Sync follow status
  React.useEffect(() => {
    const shopId = product?.shopRef?._id || product?.shopRef || product?.shopId;
    if (shopId && user?._id) {
      axios
        .get(`${server}/shop/is-following/${shopId}`, { withCredentials: true })
        .then((res) => {
          if (res.data?.success) setIsFollowing(Boolean(res.data.isFollowing));
        })
        .catch(() => {});
    }
  }, [product?.shopRef, product?.shopId, user?._id]);

  // Sync followers count when product changes
  React.useEffect(() => {
    const count =
      product?.shop?.followersCount ?? product?.shopRef?.followersCount ?? 0;
    setFollowersCount(count);
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20">
        <div className="w-14 h-14 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-gray-500">
          Loading handcrafted Ethiopian masterpiece...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center mx-auto mb-4 text-3xl">
          🧶
        </div>
        <h2 className="text-2xl font-black text-gray-900 font-serif">
          Garment Not Found
        </h2>
        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
          The traditional garment you are looking for may have been archived or
          sold out.
        </p>
        <Link to="/products">
          <button className="mt-6 px-8 py-3 bg-gradient-to-r from-amber-700 to-amber-900 text-white font-bold rounded-full shadow-md hover:shadow-lg transition">
            Explore All Traditional Crafts
          </button>
        </Link>
      </div>
    );
  }

  const availableSizes =
    product.sizes && product.sizes.length > 0
      ? product.sizes
      : ["S", "M", "L", "XL", "Custom Tailored"];

  const availableColors =
    product.colors && product.colors.length > 0
      ? product.colors
      : ["Traditional White", "Gold Tibeb", "Silver Accent"];

  const artisanShop = product.shopRef || product.shop || {};

  const handleToggleFollow = async () => {
    const shopId = artisanShop._id || product.shopId;
    if (!user) {
      toast.info("Please sign in to follow this artisan workshop");
      return;
    }
    try {
      const res = await axios.post(
        `${server}/shop/toggle-follow/${shopId}`,
        {},
        { withCredentials: true }
      );
      if (res.data?.success) {
        setIsFollowing(res.data.isFollowing);
        setFollowersCount(res.data.followersCount);
        toast.success(res.data.message);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update follow");
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomLens({ show: true, x, y });
  };

  // AliExpress-Grade Bulk Wholesale Pricing Calculation
  const bulkTiers = product.bulkPricing && product.bulkPricing.length > 0
    ? product.bulkPricing
    : [
        { minQty: 1, discountPercentage: 0 },
        { minQty: 3, discountPercentage: 5 },
        { minQty: 6, discountPercentage: 10 },
      ];

  const activeBulkTier = [...bulkTiers]
    .sort((a, b) => b.minQty - a.minQty)
    .find((tier) => qty >= tier.minQty) || bulkTiers[0];

  const bulkEffectiveUnitPrice = Math.round(
    currentPrice * (1 - (activeBulkTier.discountPercentage || 0) / 100)
  );

  const isFlashSale = Boolean(
    product.flashSale?.isActive || (hasDiscount && (originalPrice || 0) > currentPrice)
  );

  return (
    <div className="bg-gradient-to-b from-amber-50/30 via-white to-gray-50 min-h-screen pb-24">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <nav className="flex items-center gap-2 text-xs font-medium text-gray-500 overflow-x-auto whitespace-nowrap no-scrollbar">
          <Link to="/" className="hover:text-amber-800 transition">
            {t("productDetails.home", "Home")}
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-amber-800 transition">
            {t("productDetails.collections", "Collections")}
          </Link>
          <span>/</span>
          <Link
            to={`/product/category/${product.category}`}
            className="hover:text-amber-800 transition text-amber-900 font-semibold"
          >
            {product.category || "Traditional Apparel"}
          </Link>
          <span>/</span>
          <span className="text-gray-900 truncate max-w-xs">{product.name}</span>
        </nav>
      </div>

      {/* Main Product Showcase Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* LEFT: Multi-Image Interactive Gallery (5 cols) */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              {/* Hero Main Image with Zoom Lens */}
              <div
                onMouseEnter={() => setZoomLens((prev) => ({ ...prev, show: true }))}
                onMouseLeave={() => setZoomLens((prev) => ({ ...prev, show: false }))}
                onMouseMove={handleMouseMove}
                className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 group shadow-inner"
              >
                <img
                  src={images[selectedImg]?.url || "/placeholder.jpg"}
                  alt={product.name}
                  onClick={() => setLightboxOpen(true)}
                  style={
                    zoomLens.show
                      ? {
                          transformOrigin: `${zoomLens.x}% ${zoomLens.y}%`,
                          transform: "scale(1.9)",
                        }
                      : undefined
                  }
                  className={`w-full h-full object-cover object-center cursor-zoom-in transition-transform duration-150 ${
                    !zoomLens.show ? "group-hover:scale-105" : ""
                  }`}
                />

                {/* Floating Microscopic Weave Lens Indicator */}
                {zoomLens.show && (
                  <span className="absolute bottom-4 left-4 bg-stone-950/85 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-xs pointer-events-none border border-amber-400/30 shadow-lg z-20">
                    🔍 {t("productDetails.handloomWeaveLens", "1.9× Handloom Weave Lens")}
                  </span>
                )}

                {/* Floating Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  {hasDiscount && (
                    <span className="bg-rose-600 text-white font-extrabold text-xs px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wider">
                      -{discountPercent}% OFF
                    </span>
                  )}
                  {(selectedImg === 0 || images[selectedImg]?.isFeatured) && (
                    <span className="bg-amber-600/95 backdrop-blur-md text-white font-bold text-[11px] px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                      <AiFillStar className="text-amber-200" /> {t("productDetails.featuredCoverPhoto", "Featured Cover Photo")}
                    </span>
                  )}
                  <span className="bg-amber-900/90 backdrop-blur-md text-amber-100 font-bold text-[11px] px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <MdOutlineHighQuality className="text-sm" /> {t("productDetails.handloom100", "100% Handloom")}
                  </span>
                </div>

                {/* Top Right: Image Count Badge */}
                {images.length > 1 && (
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow">
                    {selectedImg + 1} / {images.length}
                  </div>
                )}

                {/* Lightbox / Expand Trigger */}
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-md backdrop-blur-md flex items-center gap-1 transition"
                >
                  <span>{t("productDetails.zoomFullscreen", "Zoom / Fullscreen")}</span>
                </button>

                {/* Navigation Arrows for Multiple Images */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setSelectedImg((prev) =>
                          prev === 0 ? images.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-gray-800 flex items-center justify-center shadow-md backdrop-blur-sm transition opacity-0 group-hover:opacity-100 hover:scale-105"
                      title="Previous angle"
                    >
                      <IoIosArrowBack className="text-xl" />
                    </button>
                    <button
                      onClick={() =>
                        setSelectedImg((prev) =>
                          prev === images.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-gray-800 flex items-center justify-center shadow-md backdrop-blur-sm transition opacity-0 group-hover:opacity-100 hover:scale-105"
                      title="Next angle"
                    >
                      <IoIosArrowForward className="text-xl" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails Row */}
              {images.length > 1 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold px-0.5">
                    <span>Artisan Gallery Angles ({images.length})</span>
                    <span>Click angle to preview</span>
                  </div>
                  <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                    {images.map((img, idx) => {
                      const isMain = idx === 0 || img.isFeatured;
                      const isSelected = selectedImg === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedImg(idx)}
                          className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition shrink-0 ${
                            isSelected
                              ? "border-amber-700 ring-2 ring-amber-500/30 shadow-md scale-105"
                              : "border-gray-200 opacity-70 hover:opacity-100 hover:border-gray-400"
                          }`}
                        >
                          <img
                            src={img.url}
                            alt={`Angle ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {isMain && (
                            <span className="absolute bottom-1 left-1 right-1 bg-amber-900/90 text-amber-200 text-[9px] font-bold py-0.5 rounded text-center backdrop-blur-xs flex items-center justify-center gap-0.5">
                              <AiFillStar size={8} /> Cover
                            </span>
                          )}
                          {isSelected && (
                            <div className="absolute inset-0 bg-amber-900/10 pointer-events-none" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Artisan Heritage Highlight Badge */}
              <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-2xl shrink-0">
                  🇪🇹
                </div>
                <div className="text-xs">
                  <h4 className="font-bold text-amber-950">
                    {t("productDetails.shemmaHeritage", "Handwoven Ethiopian Shemma Heritage")}
                  </h4>
                  <p className="text-amber-800/80 mt-0.5 leading-snug">
                    {t("productDetails.shemmaHeritageDesc", "Spun with 100% genuine local cotton on traditional pit looms (Shemma Woger) by certified artisan weavers.")}
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT: Garment Details, Pricing, Custom Measurements & Actions (7 cols) */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              <div>
                {/* Artisan Store Tag & Share */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-amber-100/70 text-amber-900 font-bold text-xs uppercase tracking-wider rounded-lg">
                      {product.category || "Habesha Kemis"}
                    </span>
                    {product.sku && (
                      <span className="text-xs text-gray-400 font-mono">
                        SKU: {product.sku}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition flex items-center gap-1.5 text-xs font-semibold"
                    title="Share this craft"
                  >
                    <BsShare className="text-sm" />
                    <span>{t("productDetails.share", "Share")}</span>
                  </button>
                </div>

                {/* Garment Title */}
                <h1 className="text-2xl sm:text-4xl font-black text-gray-950 font-serif leading-tight mt-3">
                  {product.name}
                </h1>

                {/* Ratings & Sold Status Row */}
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) =>
                      ratingValue >= star ? (
                        <AiFillStar key={star} className="text-base" />
                      ) : (
                        <AiOutlineStar key={star} className="text-base" />
                      )
                    )}
                    <span className="ml-1 text-xs font-bold text-gray-900">
                      {ratingValue.toFixed(1)}
                    </span>
                  </div>

                  <span className="text-gray-300">•</span>

                  <button
                    onClick={() => {
                      setActiveTab("reviews");
                      const el = document.getElementById("product-tabs-section");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-xs font-semibold text-amber-800 hover:underline"
                  >
                    {t("productDetails.reviews", undefined, { count: reviews.length })}
                  </button>

                  <span className="text-gray-300">•</span>

                  <span className="text-xs text-gray-500 font-medium">
                    {t("productDetails.piecesDelivered", undefined, { count: product.sold_out || 0 })}
                  </span>

                  <span className="text-gray-300">•</span>

                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      product.stock > 0
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {product.stock > 0
                      ? t("productDetails.inStock", undefined, { count: product.stock })
                      : t("productDetails.outOfStock", "Out of Stock")}
                  </span>
                </div>

                {/* Price Display */}
                <div className="mt-5 p-4 rounded-2xl bg-amber-50/40 border border-amber-100/70 flex flex-wrap items-baseline justify-between gap-4">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl sm:text-4xl font-black text-amber-950 font-serif">
                      {activeBulkTier.discountPercentage > 0 ? (
                        <>
                          {(bulkEffectiveUnitPrice * qty).toLocaleString()} ETB
                          <span className="text-xs font-normal text-stone-500 ml-2">
                            {t("productDetails.bulkTier", undefined, { price: bulkEffectiveUnitPrice.toLocaleString(), percent: activeBulkTier.discountPercentage })}
                          </span>
                        </>
                      ) : (
                        formattedCurrentPrice
                      )}
                    </span>
                    {hasDiscount && (
                      <span className="text-base sm:text-lg text-gray-400 line-through">
                        {formattedOriginalPrice}
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold text-amber-900/80 bg-white px-2.5 py-1 rounded-md border border-amber-200/50 shadow-xs">
                      {t("productDetails.diasporaUsd", undefined, { usd: usdEstimate })}
                    </span>
                  </div>
                </div>

                {/* AliExpress Feature 1: Flash Deal Countdown Strip */}
                {isFlashSale && (
                  <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-amber-950 via-stone-900 to-rose-950 text-white flex items-center justify-between text-xs shadow-xs border border-amber-800/40">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500 text-stone-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-xs">
                        <FiClock size={11} /> {t("productDetails.flashDeal", "FLASH DEAL")}
                      </span>
                      <span className="font-semibold text-amber-200 text-[11px] hidden sm:inline">
                        Platform Escrow Protected
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-amber-200">
                      <span>{t("productDetails.limitedLoom", "Limited Loom Allocation")}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                  </div>
                )}

                {/* AliExpress Feature 2: Tiered Bulk Volume Pricing Matrix */}
                <div className="mt-3.5 p-3.5 rounded-2xl bg-stone-50/90 border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-800 flex items-center gap-1.5">
                      <FiTag className="text-amber-800" />
                      <span>{t("productDetails.wholesaleTitle", "Wholesale & Bulk Volume Discounts")}</span>
                    </span>
                    <span className="text-[11px] text-stone-500 font-medium">
                      {t("productDetails.autoAppliedBag", "Auto-applied in Bag")}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {bulkTiers.map((tier, i) => {
                      const tierPrice = Math.round(currentPrice * (1 - tier.discountPercentage / 100));
                      const isSelected = activeBulkTier.minQty === tier.minQty;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setQty(tier.minQty)}
                          className={`p-2.5 rounded-xl text-left border transition cursor-pointer shadow-2xs ${
                            isSelected
                              ? "bg-amber-100/70 border-amber-800 ring-1 ring-amber-800"
                              : "bg-white border-stone-200 hover:border-amber-400"
                          }`}
                        >
                          <span className="block text-[11px] font-bold text-stone-900">
                            {tier.minQty === 1 ? "1 - 2 Pcs" : tier.minQty === 3 ? "3 - 5 Pcs" : "6+ Pcs"}
                          </span>
                          <span className="block text-[10px] text-stone-600 font-serif font-bold">
                            {tierPrice.toLocaleString()} ETB
                          </span>
                          {tier.discountPercentage > 0 ? (
                            <span className="inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                              {tier.discountPercentage}% OFF
                            </span>
                          ) : (
                            <span className="inline-block mt-0.5 text-[9px] text-stone-400">
                              Standard
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Short Description */}
                <div className="mt-4">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Size Selector */}
                <div className="mt-6 pt-5 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                      {t("productDetails.selectSize", "Select Standard Size")}
                    </span>
                    <button
                      onClick={() => setShowCustomTailoring(!showCustomTailoring)}
                      className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1"
                    >
                      <BsScissors />
                      <span>
                        {showCustomTailoring
                          ? t("productDetails.hideCustomMeasurements", "Hide Custom Measurements")
                          : t("productDetails.needCustomSizing", "Need Custom Body Sizing?")}
                      </span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                          selectedSize === sz
                            ? "bg-amber-800 text-white shadow-sm scale-105"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Body Tailoring Drawer (Accordion) */}
                {showCustomTailoring && (
                  <div className="mt-4 p-5 rounded-2xl bg-amber-50/50 border border-amber-200 animate-fadeIn space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-amber-200/60">
                      <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
                        <BsScissors className="text-amber-700 text-base" />
                        <span>{t("productDetails.customMeasurementsTitle", "Custom Tailored Kemis Body Measurements (Optional)")}</span>
                      </div>
                      {user?.customMeasurements && (user.customMeasurements.bust || user.customMeasurements.waist) && (
                        <button
                          type="button"
                          onClick={handleAutofillMeasurements}
                          className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold rounded-xl border border-amber-300 transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                        >
                          <span>{t("productDetails.autofillSizing", "⚡ Autofill from My Sizing Profile")}</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-amber-900/80">
                      {t("productDetails.measurementsDesc", "Our master weavers will tailor your Kemis precisely to your body. Provide your measurements in centimeters or inches:")}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-gray-600">
                          {t("productDetails.bustChest", "Bust / Chest")}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 92 cm"
                          value={customMeasurements.bust}
                          onChange={(e) => updateMeasurement("bust", e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-amber-600"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-gray-600">
                          {t("productDetails.waist", "Waist")}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 74 cm"
                          value={customMeasurements.waist}
                          onChange={(e) => updateMeasurement("waist", e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-amber-600"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-gray-600">
                          {t("productDetails.hips", "Hips")}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 98 cm"
                          value={customMeasurements.hips}
                          onChange={(e) => updateMeasurement("hips", e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-amber-600"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-gray-600">
                          {t("productDetails.heightLength", "Height / Length")}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 140 cm"
                          value={customMeasurements.heightOrLength}
                          onChange={(e) => updateMeasurement("heightOrLength", e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-amber-600"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-gray-600">
                          {t("productDetails.shoulderWidth", "Shoulder Width")}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 38 cm"
                          value={customMeasurements.shoulderToShoulder}
                          onChange={(e) => updateMeasurement("shoulderToShoulder", e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-amber-600"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-gray-600">
                          {t("productDetails.specialRequest", "Special Request")}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Extra gold tibeb"
                          value={customMeasurements.additionalInstructions}
                          onChange={(e) => updateMeasurement("additionalInstructions", e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-amber-600"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Color / Tibeb Pattern Pills */}
                <div className="mt-5">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-2">
                    {t("productDetails.fabricTrim", "Fabric & Tibeb Embroidery Trim")}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map((clr) => (
                      <button
                        key={clr}
                        onClick={() => setSelectedColor(clr)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          selectedColor === clr
                            ? "bg-amber-100 text-amber-900 border border-amber-300 font-bold"
                            : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {clr}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS & QUANTITY */}
              <div className="space-y-4 pt-6 border-t border-gray-100">
                {/* Quantity Stepper & Buttons Row */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Quantity Stepper */}
                  <div className="flex items-center justify-between border border-gray-200 rounded-2xl bg-gray-50 p-1">
                    <button
                      onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                      className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-xl font-bold transition text-base"
                    >
                      -
                    </button>
                    <span className="w-12 text-center text-sm font-extrabold text-gray-900">
                      {qty}
                    </span>
                    <button
                      onClick={() =>
                        setQty((prev) =>
                          product.stock && prev < product.stock ? prev + 1 : prev
                        )
                      }
                      className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-xl font-bold transition text-base"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Bag Button */}
                  <button
                    onClick={(e) => handleAddToCart(e, false)}
                    disabled={product.stock < 1}
                    className="flex-1 py-3.5 px-6 bg-gray-900 hover:bg-amber-900 disabled:bg-gray-300 text-white font-bold rounded-2xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition transform active:scale-95 text-sm"
                  >
                    <BsBagPlus className="text-lg" />
                    <span>{t("productDetails.addToBag", undefined, { count: qty > 1 ? `(${qty})` : "" })}</span>
                  </button>

                  {/* Buy Now Button */}
                  <button
                    onClick={(e) => handleAddToCart(e, true)}
                    disabled={product.stock < 1}
                    className="py-3.5 px-6 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 disabled:bg-gray-300 text-white font-bold rounded-2xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition transform active:scale-95 text-sm"
                  >
                    <BsLightningCharge className="text-lg" />
                    <span>{t("productDetails.instantBuy", "Instant Buy")}</span>
                  </button>

                  {/* Wishlist Button */}
                  <button
                    onClick={handleToggleWish}
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-center ${
                      isInWish
                        ? "bg-rose-50 border-rose-300 text-rose-600 shadow-sm"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-rose-600"
                    }`}
                    title={isInWish ? "Remove from wishlist" : "Save to wishlist"}
                  >
                    {isInWish ? (
                      <AiFillHeart className="text-2xl" />
                    ) : (
                      <AiOutlineHeart className="text-2xl" />
                    )}
                  </button>
                </div>

                {/* Vacation Mode Banner if Active */}
                {artisanShop.vacationMode?.isActive && (
                  <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-300 flex items-center gap-2.5 text-xs text-amber-950">
                    <span className="text-xl">🏖️</span>
                    <div>
                      <strong className="block text-[11px] font-bold uppercase tracking-wider text-amber-900">
                        {t("productDetails.vacationTitle", "Workshop On Cultural Vacation")}
                      </strong>
                      <span>
                        {artisanShop.vacationMode.message ||
                          t("productDetails.vacationDefault", "Orders placed will be handwoven and fulfilled immediately upon our return!")}
                      </span>
                    </div>
                  </div>
                )}

                {/* Artisan Information Card & Message Seller Button */}
                <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        artisanShop.avatar?.url ||
                        product.shop?.avatar?.url ||
                        "/placeholder-avatar.png"
                      }
                      alt={artisanShop.name || "Artisan"}
                      className="w-12 h-12 rounded-xl object-cover border border-amber-200 shadow-xs"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-gray-900 text-sm">
                          {artisanShop.name || product.shop?.name || "Habesha Artisan"}
                        </h4>
                        {(artisanShop.isVerified || product.shop?.isVerified) && (
                          <MdOutlineVerified
                            className="text-amber-700 text-sm"
                            title="Verified Ethiopian Artisan"
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <span className="flex items-center gap-0.5">
                          <BsGeoAlt className="text-amber-700" />
                          {artisanShop.city || product.shop?.city || "Addis Ababa"}
                        </span>
                        <span>•</span>
                        <span className="text-amber-700 font-semibold">
                          ★ {artisanShop.ratings || 5.0} Artisan Rating
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Follow Shop & Message Artisan */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleToggleFollow}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition ${
                        isFollowing
                          ? "bg-amber-100 text-amber-900 border-amber-300"
                          : "bg-white text-stone-700 hover:text-amber-900 border-stone-200"
                      }`}
                      title={isFollowing ? "Unfollow store" : "Follow artisan store"}
                    >
                      {isFollowing ? <BsPersonCheck /> : <BsPersonPlus />}
                      <span>{isFollowing ? t("productDetails.following", "Following") : t("productDetails.follow", "Follow")}</span>
                      {followersCount > 0 && (
                        <span className="text-[10px] text-stone-400">({followersCount})</span>
                      )}
                    </button>

                    <button
                      onClick={handleMessageSubmit}
                      className="py-2 px-3.5 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <BsChatDots className="text-xs" />
                      <span>{t("productDetails.messageArtisan", "Message")}</span>
                    </button>
                  </div>
                </div>

                {/* AliExpress Feature 3: Buyer Protection & Tiered Delivery Guarantee */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-center">
                  <div
                    onClick={() => setEscrowModalOpen(true)}
                    className="p-3 rounded-2xl bg-stone-50 hover:bg-amber-50/70 border border-stone-200 hover:border-amber-300 transition cursor-pointer flex flex-col items-center group/prot"
                    title="Click to view 15-day escrow terms"
                  >
                    <BsShieldCheck className="text-emerald-700 text-lg mb-1 group-hover/prot:scale-110 transition" />
                    <span className="text-[11px] font-bold text-stone-900 flex items-center gap-1">
                      {t("productDetails.protection15Day", "15-Day Protection")} <span className="text-[9px] text-amber-800 underline">ℹ</span>
                    </span>
                    <span className="text-[10px] text-stone-500 leading-tight">
                      {t("productDetails.protection15DayDesc", "Full refund guarantee if item is defective")}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col items-center">
                    <BsTruck className="text-amber-800 text-lg mb-1" />
                    <span className="text-[11px] font-bold text-stone-900">
                      {t("productDetails.expressDelivery", "Zonal & DHL Express")}
                    </span>
                    <span className="text-[10px] text-stone-500 leading-tight">
                      {t("productDetails.expressDeliveryDesc", "Door-to-door delivery with live waybill")}
                    </span>
                  </div>
                  <div
                    onClick={() => setEscrowModalOpen(true)}
                    className="p-3 rounded-2xl bg-stone-50 hover:bg-amber-50/70 border border-stone-200 hover:border-amber-300 transition cursor-pointer flex flex-col items-center group/esc"
                    title="Click to view CBE / Telebirr Escrow details"
                  >
                    <BsArrowRepeat className="text-amber-800 text-lg mb-1 group-hover/esc:scale-110 transition" />
                    <span className="text-[11px] font-bold text-stone-900 flex items-center gap-1">
                      {t("productDetails.escrowVault", "CBE & Telebirr Escrow")} <span className="text-[9px] text-amber-800 underline">ℹ</span>
                    </span>
                    <span className="text-[10px] text-stone-500 leading-tight">
                      {t("productDetails.escrowVaultDesc", "Funds safely held until you approve")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AliExpress Frequently Bought Together Bundle */}
      {relatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <BundleDealsSection
            currentProduct={product}
            bundleItems={relatedProducts}
          />
        </div>
      )}

      {/* IN-DEPTH TABS: Heritage Specifications, Reviews & Ratings, Shipping (Max-W 7xl) */}
      <div id="product-tabs-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Tab Navigation Header */}
          <div className="flex border-b border-gray-100 bg-gray-50/50 overflow-x-auto no-scrollbar">
            {[
              { id: "details", label: t("productDetails.tabCraft", "Craft & Fabric Details") },
              { id: "reviews", label: t("productDetails.tabReviews", undefined, { count: reviews.length }) },
              { id: "qa", label: t("productDetails.tabQa", undefined, { count: product.questionsCount || 0 }) },
              { id: "shipping", label: t("productDetails.tabShipping", "Shipping & Escrow Policy") },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 text-sm font-bold transition border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-amber-800 text-amber-900 bg-white"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: CRAFT & FABRIC DETAILS */}
          {activeTab === "details" && (
            <div className="p-6 sm:p-10 animate-fadeIn space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Traditional Garment Specs */}
                <div>
                  <h3 className="text-lg font-black text-gray-900 font-serif mb-4 flex items-center gap-2">
                    <span>Authentic Ethiopian Weaving Profile</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-100 text-sm">
                      <span className="text-gray-500">{t("productDetails.weaveType", "Shemma Weave Type")}:</span>
                      <span className="font-semibold text-gray-900">
                        {product.fabricDetails?.shemmaType || "2-fold Medium Shemma"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100 text-sm">
                      <span className="text-gray-500">{t("productDetails.tibebStyle", "Tibeb Pattern Style")}:</span>
                      <span className="font-semibold text-gray-900">
                        {product.fabricDetails?.tibebPattern || "Traditional Meskel Gold Embroidery"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100 text-sm">
                      <span className="text-gray-500">{t("productDetails.craftingTechnique", "Crafting Technique")}:</span>
                      <span className="font-semibold text-gray-900">
                        {product.fabricDetails?.craftingTechnique || "Traditional Pit Loom (Shemma Woger)"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100 text-sm">
                      <span className="text-gray-500">{t("productDetails.cottonMaterial", "Cotton Material")}:</span>
                      <span className="font-semibold text-gray-900">
                        100% Ethiopian Hand-Spun Pure Cotton
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100 text-sm">
                      <span className="text-gray-500">{t("productDetails.originWorkshop", "Origin Workshop")}:</span>
                      <span className="font-semibold text-gray-900">
                        {artisanShop.city || "Addis Ababa"}, Ethiopia
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Care & Maintenance Instructions */}
                <div>
                  <h3 className="text-lg font-black text-gray-900 font-serif mb-4 flex items-center gap-2">
                    <span>{t("productDetails.careGuide", "Care & Preservation Guide")}</span>
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    {t("productDetails.careDesc", "Authentic handspun Shemma garments are delicate heritage pieces. Follow these traditional care recommendations to preserve the brightness of the Tibeb gold thread:")}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-2.5">
                      <MdOutlineDryCleaning className="text-amber-800 text-xl shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">{t("productDetails.dryClean", "Dry Clean Preferred")}</h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {t("productDetails.dryCleanDesc", "Professional dry clean preserves metallic embroidery.")}
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-2.5">
                      <MdOutlineWash className="text-amber-800 text-xl shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">{t("productDetails.handWash", "Cold Water Hand Wash")}</h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {t("productDetails.handWashDesc", "Gentle swirl with mild baby shampoo if dry cleaning is unavailable.")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Description & Cultural Heritage Story */}
              <div className="pt-6 border-t border-gray-100">
                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">
                  {t("productDetails.biography", "Garment Biography & Artisan Lineage")}
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: DETAILED CUSTOMER RATINGS & REVIEWS */}
          {activeTab === "reviews" && (
            <div className="p-6 sm:p-10 animate-fadeIn space-y-10">
              {/* Overall Ratings Breakdown Header */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-amber-50/40 p-6 rounded-2xl border border-amber-100/70">
                {/* Left: Overall Score */}
                <div className="md:col-span-4 text-center border-b md:border-b-0 md:border-r border-amber-200/50 pb-6 md:pb-0">
                  <div className="text-5xl font-black text-amber-950 font-serif">
                    {ratingValue.toFixed(1)}
                  </div>
                  <div className="flex justify-center text-amber-500 text-lg my-2">
                    {[1, 2, 3, 4, 5].map((star) =>
                      ratingValue >= star ? (
                        <AiFillStar key={star} />
                      ) : (
                        <AiOutlineStar key={star} />
                      )
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Based on {reviews.length} authentic customer ratings
                  </p>
                </div>

                {/* Right: Star Bar Progress Breakdown */}
                <div className="md:col-span-8 space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
                    const percent = reviews.length > 0 ? (count / reviews.length) * 100 : star === 5 ? 85 : 5;
                    return (
                      <div key={star} className="flex items-center gap-3 text-xs">
                        <span className="w-12 font-bold text-gray-700 flex items-center gap-1">
                          {star} <AiFillStar className="text-amber-500" />
                        </span>
                        <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-600 to-amber-800 rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-gray-500 font-medium">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review Submission Form with Strict Verified Buyer Protection */}
              {!user ? (
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-center space-y-2">
                  <h4 className="font-serif font-bold text-stone-900 text-base">
                    Own this Handcrafted Piece?
                  </h4>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Please sign in with your customer account to submit a verified rating and review.
                  </p>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs transition shadow-2xs mt-1"
                  >
                    <span>Sign In to Review</span>
                  </Link>
                </div>
              ) : !canReview ? (
                <div className="bg-amber-50/70 p-6 rounded-2xl border border-amber-200 space-y-3">
                  <div className="flex items-center gap-2 text-amber-950 font-bold text-sm font-serif">
                    <BsShieldCheck size={18} className="text-emerald-700 shrink-0" />
                    <span>Verified Buyer Reviews Only</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed max-w-xl">
                    To protect our artisan weaving guilds from fake feedback and competitor manipulation, only customers who have ordered and received this piece (<span className="font-semibold text-stone-900">Delivered</span> status) are eligible to leave ratings.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <Link
                      to="/profile"
                      className="px-3.5 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs transition shadow-2xs"
                    >
                      Check Delivered Orders in Profile
                    </Link>
                    <span className="text-[11px] text-stone-400">
                      Already ordered? Once delivered, your review option will unlock automatically.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 mb-1">
                        <BsShieldCheck className="text-emerald-700" />
                        <span>Verified Buyer Review</span>
                      </div>
                      <h3 className="text-base font-bold text-gray-900 font-serif">
                        Review Your Handcrafted Piece
                      </h3>
                    </div>
                  </div>

                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold uppercase text-gray-600 block mb-1">
                        Your Rating
                      </label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setNewRating(star)}
                            className="text-2xl text-amber-500 hover:scale-125 transition transform"
                          >
                            {newRating >= star ? <AiFillStar /> : <AiOutlineStar />}
                          </button>
                        ))}
                        <span className="text-xs font-bold text-amber-900 ml-2 font-mono">
                          {newRating} / 5 Stars
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-gray-600 block mb-1">
                        Review Comments
                      </label>
                      <textarea
                        rows={3}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="How does the Kemis fit? What did you think of the handwoven Tibeb embroidery?"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-amber-600 focus:bg-white transition"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="py-2.5 px-6 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-xl text-xs shadow-md transition disabled:bg-gray-300"
                    >
                      {submittingReview ? "Submitting Review..." : "Submit Verified Review"}
                    </button>
                  </form>
                </div>
              )}

              {/* List of Reviews */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 font-serif">
                  Customer Feedback ({reviews.length})
                </h3>

                {reviewsLoading ? (
                  <p className="text-xs text-gray-400 py-6">Loading verified customer reviews...</p>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-sm font-semibold text-gray-600">
                      Be the first to review this traditional masterpiece!
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Share your thoughts on the tailoring and fabric quality.
                    </p>
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev._id}
                      className="p-5 rounded-2xl bg-white border border-gray-100 shadow-xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-sm">
                            {rev.userData?.name?.[0] || rev.user?.name?.[0] || "C"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-gray-900">
                                {rev.userData?.name || rev.user?.name || "Verified Customer"}
                              </h4>
                              {rev.isVerifiedPurchase && (
                                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <FiCheckCircle className="text-xs" /> Verified Buyer
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-gray-400">
                              {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : "Recent"}
                            </span>
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="flex text-amber-500 text-xs">
                          {[1, 2, 3, 4, 5].map((s) =>
                            rev.rating >= s ? <AiFillStar key={s} /> : <AiOutlineStar key={s} />
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 leading-relaxed pl-13">
                        {rev.comment}
                      </p>

                      {/* Merchant Reply if present */}
                      {rev.merchantReply?.comment && (
                        <div className="mt-3 ml-6 p-3 rounded-xl bg-amber-50/80 border border-amber-200/60 text-xs text-amber-950">
                          <span className="font-bold block text-amber-900 mb-0.5 flex items-center gap-1">
                            <BsShop className="text-xs" /> Response from Artisan:
                          </span>
                          <p>{rev.merchantReply.comment}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: QUESTIONS & ANSWERS (Q&A) */}
          {activeTab === "qa" && (
            <div className="p-6 sm:p-10 animate-fadeIn">
              <ProductQASection
                productId={product._id}
                artisanShopName={artisanShop.name}
              />
            </div>
          )}

          {/* TAB 4: SHIPPING, DISPUTE & ESCROW POLICY */}
          {activeTab === "shipping" && (
            <div className="p-6 sm:p-10 animate-fadeIn space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl">
                    <BsTruck />
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm">Addis Ababa Express</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Local courier delivery directly from the workshop to your doorstep within 1-2 business days. Flat 150 ETB (Free on orders over 3,000 ETB).
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl">
                    <BsGeoAlt />
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm">Regional Ethiopian Cities</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Delivery to Hawassa, Bahir Dar, Gondar, Dire Dawa, Mekelle, and Adama within 2-4 business days via regional partners. Flat 300 ETB.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl">
                    <BsShieldCheck />
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm">Platform Escrow Protection</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Your Telebirr or CBE Birr payment is safely held in platform escrow until you confirm satisfactory delivery and tailoring quality.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AliExpress Recently Viewed Products History */}
      <RecentlyViewed />

      {/* RELATED & RECOMMENDED CRAFTS CAROUSEL */}
      {relatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
                You May Also Admire
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-serif">
                Related Traditional Pieces
              </h2>
            </div>
            <Link
              to={`/product/category/${product.category}`}
              className="text-xs font-bold text-amber-800 hover:text-amber-950"
            >
              View All {product.category} →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {relatedProducts.map((rel) => (
              <Productcard key={rel._id} item={rel} />
            ))}
          </div>
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-fadeIn">
          {/* Lightbox Header Bar */}
          <div className="w-full max-w-6xl flex items-center justify-between text-white pb-3 z-50">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">
                {selectedImg + 1} / {images.length}
              </span>
              <span className="text-sm font-semibold truncate max-w-md hidden sm:inline text-gray-300">
                {product.name}
              </span>
              {(selectedImg === 0 || images[selectedImg]?.isFeatured) && (
                <span className="bg-amber-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <AiFillStar className="text-amber-200" /> Cover Photo
                </span>
              )}
            </div>

            <button
              onClick={() => setLightboxOpen(false)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white text-white hover:text-gray-900 flex items-center justify-center transition text-xl"
              title="Close Fullscreen (Esc)"
            >
              <RxCross2 />
            </button>
          </div>

          {/* Lightbox Main Image & Navigation Arrows */}
          <div className="relative flex-1 w-full max-w-5xl flex items-center justify-center my-auto min-h-0">
            {images.length > 1 && (
              <button
                onClick={() =>
                  setSelectedImg((prev) =>
                    prev === 0 ? images.length - 1 : prev - 1
                  )
                }
                className="absolute left-2 sm:left-4 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white text-white hover:text-gray-900 flex items-center justify-center text-2xl transition shadow-lg backdrop-blur-xs"
                title="Previous photo"
              >
                <IoIosArrowBack />
              </button>
            )}

            <img
              src={images[selectedImg]?.url || "/placeholder.jpg"}
              alt={product.name}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
            />

            {images.length > 1 && (
              <button
                onClick={() =>
                  setSelectedImg((prev) =>
                    prev === images.length - 1 ? 0 : prev + 1
                  )
                }
                className="absolute right-2 sm:right-4 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white text-white hover:text-gray-900 flex items-center justify-center text-2xl transition shadow-lg backdrop-blur-xs"
                title="Next photo"
              >
                <IoIosArrowForward />
              </button>
            )}
          </div>

          {/* Lightbox Bottom Thumbnail Strip */}
          {images.length > 1 && (
            <div className="w-full max-w-3xl flex items-center justify-center gap-2 pt-3 overflow-x-auto no-scrollbar z-50">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImg(idx)}
                  className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                    selectedImg === idx
                      ? "border-amber-500 ring-2 ring-amber-400 scale-105"
                      : "border-white/20 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {(idx === 0 || img.isFeatured) && (
                    <div className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-amber-400 shadow" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AliExpress Desktop & Mobile Floating Sticky Purchase Dock */}
      {showStickyBar && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 py-2.5 px-4 sm:px-8 shadow-2xl flex items-center justify-between gap-4 animate-slideUp">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={images[0]?.url || "/placeholder.jpg"}
              alt=""
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover shrink-0 border border-stone-200"
            />
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                {product.name}
              </h4>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-black text-amber-950 font-serif">
                  {formattedCurrentPrice}
                </span>
                <span className="text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.2 rounded font-medium">
                  Size: {selectedSize}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleAddToCart}
              disabled={product.stock < 1}
              className={`py-2 px-3.5 sm:px-5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                isInCart
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-stone-900 hover:bg-amber-800 text-white shadow-md active:scale-95 disabled:bg-stone-200"
              }`}
            >
              <BsBagPlus className="text-sm" />
              <span>{isInCart ? t("productDetails.inBag", "In Bag") : t("card.add", "Add to Bag")}</span>
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock < 1}
              className="py-2 px-4 sm:px-6 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95 disabled:bg-stone-200"
            >
              {t("productDetails.instantBuy", "Buy Now")}
            </button>
          </div>
        </div>
      )}

      {/* AliExpress 15-Day Escrow & Buyer Protection Modal */}
      {escrowModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-fadeIn border border-stone-200 relative">
            <button
              onClick={() => setEscrowModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
            >
              <RxCross2 className="text-xl" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-2xl border border-emerald-200">
                <BsShieldCheck />
              </div>
              <div>
                <h3 className="font-serif font-bold text-stone-900 text-lg">
                  {t("productDetails.buyerProtectionModalTitle", "AliExpress-Grade Buyer Protection")}
                </h3>
                <p className="text-xs text-stone-500">
                  {t("productDetails.buyerProtectionModalSubtitle", "Backed by Ethiopian CBE & Telebirr Secure Escrow Vault")}
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-stone-700">
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-3">
                <span className="text-xl shrink-0">🏛️</span>
                <div>
                  <strong className="block text-stone-900 font-bold mb-0.5">
                    {t("productDetails.escrowPillar1", "1. 100% Escrow Security")}
                  </strong>
                  <span>
                    {t("productDetails.escrowPillar1Desc", "When you pay via Chapa (Telebirr or CBE), your funds are not sent directly to the artisan. They are secured in platform escrow until you receive and verify the garment.")}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-3">
                <span className="text-xl shrink-0">🔐</span>
                <div>
                  <strong className="block text-stone-900 font-bold mb-0.5">
                    {t("productDetails.escrowPillar2", "2. 6-Digit Handover OTP Verification")}
                  </strong>
                  <span>
                    {t("productDetails.escrowPillar2Desc", "The courier cannot mark the delivery complete without your personal 6-digit confirmation code, guaranteeing physical handover.")}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-3">
                <span className="text-xl shrink-0">✨</span>
                <div>
                  <strong className="block text-stone-900 font-bold mb-0.5">
                    {t("productDetails.escrowPillar3", "3. 15-Day Sizing & Quality Guarantee")}
                  </strong>
                  <span>
                    {t("productDetails.escrowPillar3Desc", "If the custom tailoring sizing does not match your provided measurements or the fabric has handloom defects, open a dispute for immediate re-tailoring or 100% refund.")}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setEscrowModalOpen(false)}
                className="py-2.5 px-6 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-xl text-xs shadow-md transition"
              >
                {t("productDetails.understoodClose", "Understood & Protected")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetailsView;

