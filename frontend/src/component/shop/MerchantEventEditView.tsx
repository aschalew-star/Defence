import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import {
  BsLightningChargeFill,
  BsCashCoin,
  BsUpload,
  BsTrash,
  BsEye,
  BsArrowLeft,
} from "react-icons/bs";
import { FiSave, FiImage, FiClock, FiExternalLink } from "react-icons/fi";

const CULTURAL_OCCASIONS = [
  "Meskel Heritage Festival Expo",
  "Enkutatash Ethiopian New Year Sale",
  "Timkat Handloom Celebration",
  "Fasika Artisan Spring Market",
  "Ganna Christmas Heritage Showcase",
  "Boutique Flash Deal (Limited Stock)",
];

const ETHIOPIAN_CATEGORIES = [
  "Ethiopian Traditional Dresses (Habesha Kemis)",
  "Men's Traditional Attire (Yebahl Libs)",
  "Traditional Shawls & Blankets (Netela & Gabi)",
  "Handcrafted Footwear & Leather",
  "Traditional Jewelry & Accessories",
  "Handwoven Textiles & Home Decor",
  "Cultural Crafts & Mesob",
];

const MerchantEventEditView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
    "campaign" | "pricing" | "schedule" | "gallery" | "preview"
  >("campaign");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [eventData, setEventData] = useState<any>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(ETHIOPIAN_CATEGORIES[0]);
  const [tags, setTags] = useState("");
  const [occasion, setOccasion] = useState(CULTURAL_OCCASIONS[0]);
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [stock, setStock] = useState("10");
  const [start_Date, setStartDate] = useState("");
  const [Finish_Date, setFinishDate] = useState("");

  // Gallery
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [newImages, setNewImages] = useState<string[]>([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!id) return;
    setFetching(true);
    axios
      .get(`${server}/event/get-event/${id}`)
      .then((res) => {
        if (res.data?.event) {
          const item = res.data.event;
          setEventData(item);
          setName(item.name || "");
          setDescription(item.description || "");
          setCategory(item.category || ETHIOPIAN_CATEGORIES[0]);
          setTags(item.tags || "");
          setOriginalPrice(item.originalPrice ? String(item.originalPrice) : "");
          setDiscountPrice(item.discountPrice ? String(item.discountPrice) : "");
          setStock(item.stock !== undefined ? String(item.stock) : "10");

          if (item.start_Date) {
            setStartDate(new Date(item.start_Date).toISOString().slice(0, 16));
          }
          if (item.Finish_Date) {
            setFinishDate(new Date(item.Finish_Date).toISOString().slice(0, 16));
          }

          const imgs = Array.isArray(item.images) ? item.images : [];
          setExistingImages(imgs);
          const featIdx = imgs.findIndex((img: any) => img.isFeatured);
          setFeaturedIndex(featIdx >= 0 ? featIdx : 0);
        }
      })
      .catch((err) => {
        toast.error("Failed to load flash event: " + (err.response?.data?.message || err.message));
      })
      .finally(() => setFetching(false));
  }, [id]);

  // Dynamic live countdown calculation
  useEffect(() => {
    if (!Finish_Date) return;
    const target = new Date(Finish_Date).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [Finish_Date]);

  // Gallery uploads
  const handleNewImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = (e.target.files ? Array.from(e.target.files) : []) as File[];
    if (!files.length) return;

    files.forEach((file: File) => {
      if (file.size > 8 * 1024 * 1024) {
        toast.error(`File ${file.name} exceeds 8MB`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2 && typeof reader.result === "string") {
          setNewImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveExistingImage = (index: number) => {
    const updated = existingImages.filter((_, i) => i !== index);
    setExistingImages(updated);
    if (featuredIndex >= updated.length) setFeaturedIndex(0);
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Pricing calculations
  const origP = Number(originalPrice) || 0;
  const discP = Number(discountPrice) || 0;
  const sellingPrice = discP > 0 ? discP : origP;
  const discountPercent =
    origP > 0 && discP > 0 && origP > discP
      ? Math.round(((origP - discP) / origP) * 100)
      : 0;

  // Status check
  const now = new Date();
  const startD = start_Date ? new Date(start_Date) : null;
  const endD = Finish_Date ? new Date(Finish_Date) : null;
  const isLive = startD && endD && now >= startD && now <= endD;
  const isScheduled = startD && now < startD;
  const isEnded = endD && now > endD;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      toast.error("Please provide an event campaign title");
      return;
    }
    if (!sellingPrice || sellingPrice <= 0) {
      toast.error("Please provide a valid promotional price");
      return;
    }
    if (!start_Date || !Finish_Date) {
      toast.error("Please set start and finish dates for the promotion");
      return;
    }
    if (new Date(Finish_Date) <= new Date(start_Date)) {
      toast.error("Finish Date must be later than Start Date");
      return;
    }

    setLoading(true);

    try {
      const combinedImages = [...existingImages, ...newImages];

      const payload = {
        name: name.trim(),
        description: description.trim(),
        category,
        tags: tags.trim(),
        originalPrice: origP,
        discountPrice: discP || origP,
        stock: Number(stock) || 0,
        start_Date,
        Finish_Date,
        images: combinedImages.length > 0 ? combinedImages : undefined,
        featuredImageIndex: featuredIndex,
      };

      const res = await axios.put(
        `${server}/event/update-event/${id}`,
        payload,
        { withCredentials: true }
      );

      if (res.data?.success) {
        toast.success(res.data.message || "Flash event updated successfully!");
        setEventData(res.data.event);
        if (res.data.event?.images) {
          setExistingImages(res.data.event.images);
          setNewImages([]);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update flash event");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-12 text-stone-600 space-y-4">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
        <p className="font-serif text-lg font-semibold text-stone-800">
          Loading Event Campaign...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
              <Link
                to="/shop-all-events"
                className="hover:text-amber-800 flex items-center gap-1 transition"
              >
                <BsArrowLeft /> Back to Flash Events
              </Link>
              <span>/</span>
              <span className="text-amber-900 font-bold">Edit Festival Promotion</span>
              <span>/</span>
              <span className="font-mono text-stone-400">ID: {id?.slice(-8)}</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black font-serif text-stone-900">
                {name || "Untitled Flash Event"}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isLive
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : isScheduled
                    ? "bg-blue-100 text-blue-800 border border-blue-300"
                    : "bg-stone-100 text-stone-600"
                }`}
              >
                {isLive ? "● LIVE PROMOTION" : isScheduled ? "SCHEDULED" : "ENDED"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-600">
              Configure promotional discounts, holiday campaign themes, countdown clocks, and allocated event inventory.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/event/${id}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-bold text-xs transition"
            >
              <FiExternalLink /> Public View
            </Link>
            <button
              onClick={() => handleSubmit()}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
            >
              <FiSave />
              <span>{loading ? "Saving Campaign..." : "Save Event Changes"}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 pt-4 overflow-x-auto no-scrollbar">
          {[
            { id: "campaign", label: "Festival & Details", icon: BsLightningChargeFill },
            { id: "pricing", label: "Promotional Pricing", icon: BsCashCoin },
            { id: "schedule", label: "Schedule & Countdown", icon: FiClock },
            { id: "gallery", label: "Promo Banners & Media", icon: FiImage },
            { id: "preview", label: "Live Event Preview", icon: BsEye },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
                  active
                    ? "bg-amber-100/70 text-amber-950 border border-amber-300/60 shadow-sm"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                }`}
              >
                <Icon size={14} className={active ? "text-amber-800" : "text-stone-400"} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* TAB 1: CAMPAIGN DETAILS */}
          {activeTab === "campaign" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-5 animate-in fade-in duration-200">
              <h2 className="text-lg font-bold font-serif text-stone-900 pb-3 border-b border-stone-100">
                Festival Campaign Identity
              </h2>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Holiday / Cultural Festival Occasion
                </label>
                <select
                  value={occasion}
                  onChange={(e) => {
                    setOccasion(e.target.value);
                    if (!name || CULTURAL_OCCASIONS.some((c) => name.includes(c))) {
                      setName(`${e.target.value} Special Showcase`);
                    }
                  }}
                  className="w-full px-3.5 py-3 rounded-2xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-700 font-semibold"
                >
                  {CULTURAL_OCCASIONS.map((occ) => (
                    <option key={occ} value={occ}>
                      {occ}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Event Campaign Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Enkutatash New Year Pure Handloom Kemis Special"
                  className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700 font-serif"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Ethiopian Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-2xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
                >
                  {ETHIOPIAN_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Campaign Description & Special Promotion Terms
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the holiday flash discount, limited stock quantities, handloom heritage, and fast delivery timelines..."
                  className="w-full p-4 rounded-2xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Search & Promo Tags
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Holiday Sale, Enkutatash, Flash Deal, Habesha Kemis"
                  className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
                />
              </div>
            </div>
          )}

          {/* TAB 2: PROMOTIONAL PRICING */}
          {activeTab === "pricing" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6 animate-in fade-in duration-200">
              <h2 className="text-lg font-bold font-serif text-stone-900 pb-3 border-b border-stone-100">
                Flash Pricing & Inventory Allotment
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Original Price (ETB) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="9000"
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Event Promo Price (ETB) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    placeholder="6500"
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700 font-bold text-rose-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Event Stock Quota <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="15"
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
                  />
                </div>
              </div>

              {discountPercent > 0 && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-rose-900">
                      Promotional Customer Savings: {discountPercent}% OFF
                    </p>
                    <p className="text-xs text-rose-700">
                      Buyers save {(origP - discP).toLocaleString()} ETB per handcrafted garment
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-rose-700 text-white font-black text-xs">
                    SAVE {discountPercent}%
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SCHEDULE & COUNTDOWN */}
          {activeTab === "schedule" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6 animate-in fade-in duration-200">
              <h2 className="text-lg font-bold font-serif text-stone-900 pb-3 border-b border-stone-100">
                Promotion Window & Live Countdown
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Campaign Start Date & Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={start_Date}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Campaign Finish Date & Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={Finish_Date}
                    onChange={(e) => setFinishDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700 font-mono"
                  />
                </div>
              </div>

              {/* Live Animated Countdown Display */}
              <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiClock className="text-amber-400" />
                    <h3 className="text-xs uppercase font-bold tracking-wider text-amber-300">
                      Live Promotion Countdown Clock
                    </h3>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isLive ? "bg-emerald-500 text-stone-950" : "bg-stone-800 text-stone-400"
                    }`}
                  >
                    {isLive ? "CLOCK TICKING" : isEnded ? "EXPIRED" : "STANDBY"}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-stone-800/80 rounded-2xl border border-stone-700">
                    <span className="block text-2xl sm:text-4xl font-mono font-black text-amber-300">
                      {String(timeLeft.days).padStart(2, "0")}
                    </span>
                    <span className="text-[10px] text-stone-400 uppercase font-bold">Days</span>
                  </div>
                  <div className="p-3 bg-stone-800/80 rounded-2xl border border-stone-700">
                    <span className="block text-2xl sm:text-4xl font-mono font-black text-amber-300">
                      {String(timeLeft.hours).padStart(2, "0")}
                    </span>
                    <span className="text-[10px] text-stone-400 uppercase font-bold">Hours</span>
                  </div>
                  <div className="p-3 bg-stone-800/80 rounded-2xl border border-stone-700">
                    <span className="block text-2xl sm:text-4xl font-mono font-black text-amber-300">
                      {String(timeLeft.minutes).padStart(2, "0")}
                    </span>
                    <span className="text-[10px] text-stone-400 uppercase font-bold">Mins</span>
                  </div>
                  <div className="p-3 bg-stone-800/80 rounded-2xl border border-stone-700">
                    <span className="block text-2xl sm:text-4xl font-mono font-black text-amber-300 animate-pulse">
                      {String(timeLeft.seconds).padStart(2, "0")}
                    </span>
                    <span className="text-[10px] text-stone-400 uppercase font-bold">Secs</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PROMO GALLERY */}
          {activeTab === "gallery" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h2 className="text-lg font-bold font-serif text-stone-900">
                    Promotion Media & Banners
                  </h2>
                  <p className="text-xs text-stone-500">
                    Showcase the promotional items with high-resolution imagery. Max 8MB per image.
                  </p>
                </div>
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs shadow transition">
                  <BsUpload />
                  <span>Upload Photos</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleNewImagesUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {existingImages.map((img, idx) => (
                  <div
                    key={`existing-${idx}`}
                    className="group relative rounded-2xl overflow-hidden border border-stone-200"
                  >
                    <img
                      src={img.url || img}
                      alt="event promo"
                      className="w-full h-36 object-cover bg-stone-100"
                    />
                    <div className="absolute top-2 right-2">
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(idx)}
                        className="p-1.5 rounded-full bg-rose-600 text-white shadow hover:bg-rose-700 text-xs"
                      >
                        <BsTrash />
                      </button>
                    </div>
                  </div>
                ))}

                {newImages.map((imgUrl, idx) => (
                  <div
                    key={`new-${idx}`}
                    className="relative rounded-2xl overflow-hidden border-2 border-dashed border-amber-600 bg-amber-50"
                  >
                    <img src={imgUrl} alt="new upload" className="w-full h-36 object-cover" />
                    <div className="absolute top-2 right-2">
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(idx)}
                        className="p-1.5 rounded-full bg-rose-600 text-white shadow hover:bg-rose-700 text-xs"
                      >
                        <BsTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: LIVE EVENT PREVIEW */}
          {activeTab === "preview" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6 animate-in fade-in duration-200">
              <h2 className="text-lg font-bold font-serif text-stone-900 pb-3 border-b border-stone-100">
                Live Flash Event Card Preview
              </h2>

              <div className="max-w-sm mx-auto bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden">
                <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                  <img
                    src={
                      existingImages[0]?.url ||
                      newImages[0] ||
                      "/placeholder.jpg"
                    }
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-black text-xs shadow flex items-center gap-1">
                      <BsLightningChargeFill /> {discountPercent}% OFF
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-stone-900/80 backdrop-blur-sm text-amber-300 font-bold text-[10px]">
                      {occasion}
                    </span>
                  </div>

                  <div className="absolute bottom-3 inset-x-3 bg-stone-950/85 backdrop-blur-md rounded-2xl p-2.5 text-white flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-300 uppercase">Ends in:</span>
                    <span className="text-xs font-mono font-bold">
                      {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                    {category}
                  </span>
                  <h3 className="font-bold text-stone-900 text-base font-serif line-clamp-1">
                    {name || "Special Holiday Flash Event"}
                  </h3>

                  <div className="flex items-baseline justify-between pt-2 border-t border-stone-100">
                    <div>
                      <span className="text-xl font-black text-stone-900 font-serif">
                        {sellingPrice.toLocaleString()} ETB
                      </span>
                      {origP > sellingPrice && (
                        <span className="text-xs text-stone-400 line-through ml-2">
                          {origP.toLocaleString()} ETB
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {stock} units left
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Summary Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-700 pb-3 border-b border-stone-100">
              Event Status Overview
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">Live Status:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-md ${
                    isLive
                      ? "text-emerald-700 bg-emerald-50"
                      : isScheduled
                      ? "text-blue-700 bg-blue-50"
                      : "text-stone-600 bg-stone-100"
                  }`}
                >
                  {isLive ? "Active Now" : isScheduled ? "Scheduled" : "Ended"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Occasion:</span>
                <span className="font-semibold text-stone-900 truncate max-w-[160px] text-right">
                  {occasion}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Event Quota:</span>
                <span className="font-bold text-stone-900">{stock} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Markdown:</span>
                <span className="font-bold text-rose-600">
                  {discountPercent > 0 ? `${discountPercent}% Discount` : "Standard Price"}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 space-y-3">
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <FiSave />
                <span>{loading ? "Saving Changes..." : "Save Event Changes"}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/shop-all-events")}
                className="w-full py-2.5 rounded-2xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-bold text-xs transition"
              >
                Cancel & Return
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantEventEditView;
