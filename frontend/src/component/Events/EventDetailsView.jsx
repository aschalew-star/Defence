import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { server } from "../../server";
import { addTocart } from "../../redux/Action/cartAction";
import { addToWishlist, removeFromwish } from "../../redux/Action/Wishlist";
import { toast } from "react-toastify";
import {
  AiFillStar,
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
  BsShare,
  BsScissors,
} from "react-icons/bs";
import {
  MdOutlineHighQuality,
  MdOutlineVerified,
} from "react-icons/md";
import {
  IoIosArrowBack,
  IoIosArrowForward,
} from "react-icons/io";
import {
  FiClock,
  FiCalendar,
  FiAlertCircle,
  FiPackage,
  FiArrowLeft,
} from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";

function EventDetailsView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.user);
  const { cart } = useSelector((state) => state.Cart);
  const { wish } = useSelector((state) => state.Wish);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState("M");
  const [activeTab, setActiveTab] = useState("details");
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Custom tailoring state
  const [customBust, setCustomBust] = useState("");
  const [customWaist, setCustomWaist] = useState("");
  const [customHips, setCustomHips] = useState("");
  const [customLength, setCustomLength] = useState("");
  const [customNotes, setCustomNotes] = useState("");

  // Live countdown state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  // Fetch Event Details
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${server}/event/get-event/${id}`);
        if (res.data?.event) {
          setEvent(res.data.event);
        }
      } catch (err) {
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

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20">
        <div className="w-14 h-14 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-gray-500">
          Loading cultural flash sale promotion...
        </p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-amber-50 text-amber-700 rounded-3xl flex items-center justify-center mx-auto mb-5 text-4xl">
          🎪
        </div>
        <h2 className="text-2xl font-bold font-serif text-gray-900 mb-2">
          Promotional Event Not Found
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          This cultural flash sale may have ended, expired, or been archived by the artisan.
        </p>
        <Link
          to="/event"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-800 text-white font-semibold text-xs shadow hover:bg-amber-900 transition"
        >
          <FiArrowLeft /> Browse Other Cultural Events
        </Link>
      </div>
    );
  }

  const images = event.images && event.images.length > 0
    ? event.images
    : event.featuredImage?.url
    ? [{ url: event.featuredImage.url }]
    : [{ url: "/placeholder.jpg" }];

  const isInWish = (wish || []).some((i) => i._id === event._id);
  const isInCart = (cart || []).some((i) => i._id === event._id);

  const discountPercent =
    event.originalPrice && event.discountPrice && event.originalPrice > event.discountPrice
      ? Math.round(((event.originalPrice - event.discountPrice) / event.originalPrice) * 100)
      : null;

  const currentPrice = Number(event.discountPrice || event.originalPrice || 0);
  const regularPrice = Number(event.originalPrice || event.discountPrice || 0);
  const savings = Math.max(0, regularPrice - currentPrice);

  const usdEstimate = (currentPrice / 120).toFixed(2);

  const handleWishlistToggle = () => {
    if (isInWish) {
      dispatch(removeFromwish(event));
      toast.info("Removed from your festival wishlist");
    } else {
      dispatch(addToWishlist({ ...event, isEvent: true }));
      toast.success("Saved to your festival wishlist!");
    }
  };

  const handleAddToCart = (e, instantBuy = false) => {
    if (e) e.stopPropagation();

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

    const cartItem = {
      ...event,
      qty,
      selectedSize,
      customMeasurements,
      isEvent: true,
      shopId: event.shopId || event.shop?._id,
    };

    dispatch(addTocart(cartItem));

    if (instantBuy) {
      navigate("/checkout");
    } else {
      toast.success(
        <div className="flex items-center gap-2">
          <span>Added flash deal item to bag!</span>
        </div>
      );
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: event.name,
          text: `Check out this limited-time Ethiopian promotional craft: ${event.name}`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Event link copied to clipboard!");
    }
  };

  const availableSizes =
    event.sizes && event.sizes.length > 0
      ? event.sizes
      : ["S", "M", "L", "XL", "Custom Sizing"];

  const stockRemaining = event.stock || 0;
  const soldCount = event.sold_out || 0;
  const totalAllocation = stockRemaining + soldCount;
  const progressPercent = totalAllocation > 0 ? Math.min(100, Math.round((soldCount / totalAllocation) * 100)) : 20;

  return (
    <div className="bg-gradient-to-b from-amber-50/40 via-white to-stone-50 min-h-screen pb-24">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <nav className="flex items-center gap-2 text-xs font-medium text-gray-500 overflow-x-auto whitespace-nowrap no-scrollbar">
          <Link to="/" className="hover:text-amber-800 transition">
            Home
          </Link>
          <span>/</span>
          <Link to="/event" className="hover:text-amber-800 transition">
            Cultural Events & Flash Deals
          </Link>
          <span>/</span>
          <span className="text-gray-900 truncate max-w-xs">{event.name}</span>
        </nav>
      </div>

      {/* Main Event Showcase Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-sm border border-stone-200/80 p-4 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* LEFT: Multi-Image Interactive Gallery (6 cols) */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              {/* Hero Main Image with Zoom */}
              <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-stone-50 border border-stone-100 group shadow-inner">
                <img
                  src={images[selectedImg]?.url || "/placeholder.jpg"}
                  alt={event.name}
                  onClick={() => setLightboxOpen(true)}
                  className="w-full h-full object-cover object-center cursor-zoom-in transition-transform duration-700 group-hover:scale-105"
                />

                {/* Floating Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  {discountPercent && (
                    <span className="bg-rose-600 text-white font-extrabold text-xs px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wider">
                      🔥 -{discountPercent}% FLASH DEAL
                    </span>
                  )}
                  {(selectedImg === 0 || images[selectedImg]?.isFeatured) && (
                    <span className="bg-amber-600/95 backdrop-blur-md text-white font-bold text-[11px] px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                      <AiFillStar className="text-amber-200" /> Event Cover Photo
                    </span>
                  )}
                  <span className="bg-amber-950/90 backdrop-blur-md text-amber-100 font-bold text-[11px] px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <MdOutlineHighQuality className="text-sm" /> Holiday Special
                  </span>
                </div>

                {/* Top Right: Image Counter Badge */}
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
                  <span>Zoom / Fullscreen</span>
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
                      title="Previous photo"
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
                      title="Next photo"
                    >
                      <IoIosArrowForward className="text-xl" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails Row */}
              {images.length > 1 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-stone-500 font-semibold px-0.5">
                    <span>Promotional Photography Angles ({images.length})</span>
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
                              : "border-stone-200 opacity-70 hover:opacity-100 hover:border-stone-400"
                          }`}
                        >
                          <img
                            src={img.url}
                            alt={`Angle ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {isMain && (
                            <span className="absolute bottom-1 left-1 right-1 bg-amber-950/90 text-amber-200 text-[9px] font-bold py-0.5 rounded text-center backdrop-blur-xs flex items-center justify-center gap-0.5">
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

              {/* Cultural Heritage Highlight */}
              <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-2xl shrink-0">
                  🇪🇹
                </div>
                <div className="text-xs">
                  <h4 className="font-bold text-amber-950">
                    Handmade Ethiopian Holiday Edition
                  </h4>
                  <p className="text-amber-800/80 mt-0.5">
                    Crafted specifically for cultural festivals by certified heritage weavers.
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT: Product Details, Flash Countdown & Purchase (6 cols) */}
            <div className="lg:col-span-6 flex flex-col space-y-6">
              
              {/* Event Badge & Title */}
              <div>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200">
                    <FiCalendar size={13} /> {event.category || "Holiday Flash Sale"}
                  </span>

                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition"
                    title="Share event deal"
                  >
                    <BsShare size={16} />
                  </button>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black font-serif text-stone-900 leading-tight">
                  {event.name}
                </h1>

                {/* Artisan Store Tag */}
                <div className="flex items-center gap-2 mt-2">
                  <BsShop className="text-amber-700 text-sm" />
                  <span className="text-xs text-stone-600">Offered by:</span>
                  <Link
                    to={`/shop/storefront/${event.shopId || event.shop?._id}`}
                    className="text-xs font-bold text-amber-800 hover:underline inline-flex items-center gap-1"
                  >
                    {event.shop?.name || "Artisan Workshop"}
                    <MdOutlineVerified className="text-emerald-600 text-sm" />
                  </Link>
                </div>
              </div>

              {/* LIVE FLASH COUNTDOWN BANNER */}
              <div className="bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      {timeLeft.expired ? "Promotion Ended" : "Limited-Time Flash Window"}
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400 font-mono">
                    Ends: {new Date(event.Finish_Date).toLocaleDateString()}
                  </span>
                </div>

                {timeLeft.expired ? (
                  <div className="text-center py-2 text-rose-300 font-bold text-sm">
                    This promotional flash deal has expired.
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/5">
                      <div className="text-2xl font-black font-mono text-white">{timeLeft.days}</div>
                      <div className="text-[10px] text-stone-400 uppercase font-semibold mt-0.5">Days</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/5">
                      <div className="text-2xl font-black font-mono text-white">{timeLeft.hours}</div>
                      <div className="text-[10px] text-stone-400 uppercase font-semibold mt-0.5">Hours</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/5">
                      <div className="text-2xl font-black font-mono text-white">{timeLeft.minutes}</div>
                      <div className="text-[10px] text-stone-400 uppercase font-semibold mt-0.5">Mins</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/5">
                      <div className="text-2xl font-black font-mono text-amber-400">{timeLeft.seconds}</div>
                      <div className="text-[10px] text-stone-400 uppercase font-semibold mt-0.5">Secs</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Pricing Showcase */}
              <div className="bg-stone-50/80 rounded-2xl p-4 border border-stone-200">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-stone-900 font-serif">
                    {currentPrice.toLocaleString()} ETB
                  </span>
                  {savings > 0 && (
                    <span className="text-sm text-stone-400 line-through">
                      {regularPrice.toLocaleString()} ETB
                    </span>
                  )}
                  {discountPercent && (
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      Save {savings.toLocaleString()} ETB (-{discountPercent}%)
                    </span>
                  )}
                </div>
                <div className="text-xs text-stone-500 mt-1 flex items-center gap-2">
                  <span>Diaspora USD Estimate: ~${usdEstimate} USD</span>
                  <span>•</span>
                  <span>Free Addis Ababa delivery</span>
                </div>
              </div>

              {/* Stock Allocation Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-stone-700">
                    Flash Allocation: <strong className="text-stone-900">{stockRemaining}</strong> pieces remaining
                  </span>
                  <span className="text-amber-800">{soldCount} claimed</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-600 to-rose-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Garment Sizes */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                  Select Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${
                        selectedSize === sz
                          ? "bg-amber-800 text-white border-amber-800 shadow-sm"
                          : "bg-white text-stone-700 border-stone-200 hover:border-stone-400"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Measurements Accordion (If Enabled) */}
              {event.isCustomizable && (
                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/60 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <BsScissors /> Custom Tailoring Measurements (Optional)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <input
                      type="number"
                      placeholder="Bust (cm)"
                      value={customBust}
                      onChange={(e) => setCustomBust(e.target.value)}
                      className="bg-white border border-stone-200 text-xs p-2 rounded-lg outline-none focus:border-amber-600"
                    />
                    <input
                      type="number"
                      placeholder="Waist (cm)"
                      value={customWaist}
                      onChange={(e) => setCustomWaist(e.target.value)}
                      className="bg-white border border-stone-200 text-xs p-2 rounded-lg outline-none focus:border-amber-600"
                    />
                    <input
                      type="number"
                      placeholder="Hips (cm)"
                      value={customHips}
                      onChange={(e) => setCustomHips(e.target.value)}
                      className="bg-white border border-stone-200 text-xs p-2 rounded-lg outline-none focus:border-amber-600"
                    />
                    <input
                      type="number"
                      placeholder="Length (cm)"
                      value={customLength}
                      onChange={(e) => setCustomLength(e.target.value)}
                      className="bg-white border border-stone-200 text-xs p-2 rounded-lg outline-none focus:border-amber-600"
                    />
                  </div>
                </div>
              )}

              {/* Quantity & CTA Buttons */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-4">
                  {/* Quantity selector */}
                  <div className="flex items-center border border-stone-200 rounded-xl bg-white overflow-hidden shadow-2xs">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="px-3.5 py-2 text-stone-600 hover:bg-stone-50 font-bold text-sm"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 font-bold text-xs text-stone-900 font-mono">
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty((q) => Math.min(event.stock || 10, q + 1))}
                      className="px-3.5 py-2 text-stone-600 hover:bg-stone-50 font-bold text-sm"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Wishlist Button */}
                  <button
                    onClick={handleWishlistToggle}
                    className={`p-3 rounded-xl border transition ${
                      isInWish
                        ? "bg-rose-50 border-rose-300 text-rose-600 shadow-sm"
                        : "border-stone-200 text-stone-600 hover:bg-stone-50"
                    }`}
                    title="Save to Wishlist"
                  >
                    {isInWish ? <AiFillHeart size={18} /> : <AiOutlineHeart size={18} />}
                  </button>

                  {/* Message Artisan */}
                  <Link
                    to={`/inbox?shop=${event.shopId || event.shop?._id}`}
                    className="p-3 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition"
                    title="Message Artisan about this piece"
                  >
                    <BsChatDots size={18} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={(e) => handleAddToCart(e, false)}
                    disabled={timeLeft.expired || event.stock < 1}
                    className="w-full py-3 px-5 rounded-xl border-2 border-stone-900 bg-white hover:bg-stone-50 text-stone-900 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
                  >
                    <BsBagPlus size={16} />
                    <span>Add to Bag</span>
                  </button>

                  <button
                    onClick={(e) => handleAddToCart(e, true)}
                    disabled={timeLeft.expired || event.stock < 1}
                    className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <BsLightningCharge size={16} />
                    <span>Instant Flash Checkout</span>
                  </button>
                </div>
              </div>

              {/* Trust & Guarantee Badges */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-stone-200 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <BsShieldCheck className="text-emerald-700 text-base shrink-0" />
                  <span>Escrow Safe: Payout held until delivery confirmation</span>
                </div>
                <div className="flex items-center gap-2">
                  <BsTruck className="text-amber-800 text-base shrink-0" />
                  <span>Express Holiday Delivery Across Ethiopia</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description & Campaign Narrative Tab */}
          <div className="mt-14 pt-8 border-t border-stone-200">
            <div className="flex gap-4 border-b border-stone-200 pb-3 mb-6">
              <button
                onClick={() => setActiveTab("details")}
                className={`text-sm font-bold pb-2 transition border-b-2 -mb-3.5 ${
                  activeTab === "details"
                    ? "border-amber-800 text-amber-900"
                    : "border-transparent text-stone-500 hover:text-stone-900"
                }`}
              >
                Campaign Story & Craftsmanship
              </button>
              <button
                onClick={() => setActiveTab("terms")}
                className={`text-sm font-bold pb-2 transition border-b-2 -mb-3.5 ${
                  activeTab === "terms"
                    ? "border-amber-800 text-amber-900"
                    : "border-transparent text-stone-500 hover:text-stone-900"
                }`}
              >
                Promotional Terms & Delivery
              </button>
            </div>

            {activeTab === "details" ? (
              <div className="prose prose-stone max-w-none text-xs sm:text-sm text-stone-700 leading-relaxed space-y-4">
                <p className="whitespace-pre-line">{event.description}</p>
                {event.tags && (
                  <div className="flex flex-wrap gap-1.5 pt-4">
                    {event.tags.split(",").map((tag, i) => (
                      <span
                        key={i}
                        className="bg-stone-100 text-stone-700 text-[11px] font-semibold px-2.5 py-1 rounded-md"
                      >
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-stone-600 space-y-3 max-w-2xl">
                <p>
                  • <strong>Flash Window:</strong> Valid strictly between {new Date(event.start_Date).toLocaleDateString()} and {new Date(event.Finish_Date).toLocaleDateString()}.
                </p>
                <p>
                  • <strong>Limited Allocation:</strong> Only {event.stock || "a few"} promotional garments are available at this holiday price.
                </p>
                <p>
                  • <strong>Quality Inspection:</strong> Covered by standard 72-hour buyer inspection SLA before escrow payout release.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-fadeIn">
          {/* Header */}
          <div className="w-full max-w-6xl flex items-center justify-between text-white pb-3 z-50">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">
                {selectedImg + 1} / {images.length}
              </span>
              <span className="text-sm font-semibold truncate max-w-md hidden sm:inline text-stone-300">
                {event.name}
              </span>
              {(selectedImg === 0 || images[selectedImg]?.isFeatured) && (
                <span className="bg-amber-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <AiFillStar className="text-amber-200" /> Event Cover Photo
                </span>
              )}
            </div>

            <button
              onClick={() => setLightboxOpen(false)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white text-white hover:text-stone-900 flex items-center justify-center transition text-xl"
              title="Close Fullscreen (Esc)"
            >
              <RxCross2 />
            </button>
          </div>

          {/* Main Photo & Arrows */}
          <div className="relative flex-1 w-full max-w-5xl flex items-center justify-center my-auto min-h-0">
            {images.length > 1 && (
              <button
                onClick={() =>
                  setSelectedImg((prev) =>
                    prev === 0 ? images.length - 1 : prev - 1
                  )
                }
                className="absolute left-2 sm:left-4 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white text-white hover:text-stone-900 flex items-center justify-center text-2xl transition shadow-lg backdrop-blur-xs"
                title="Previous photo"
              >
                <IoIosArrowBack />
              </button>
            )}

            <img
              src={images[selectedImg]?.url || "/placeholder.jpg"}
              alt={event.name}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
            />

            {images.length > 1 && (
              <button
                onClick={() =>
                  setSelectedImg((prev) =>
                    prev === images.length - 1 ? 0 : prev + 1
                  )
                }
                className="absolute right-2 sm:right-4 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white text-white hover:text-stone-900 flex items-center justify-center text-2xl transition shadow-lg backdrop-blur-xs"
                title="Next photo"
              >
                <IoIosArrowForward />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails */}
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
    </div>
  );
}

export default EventDetailsView;
