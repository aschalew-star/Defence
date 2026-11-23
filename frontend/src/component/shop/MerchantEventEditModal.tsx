import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import {
  BsLightningChargeFill,
  BsClockHistory,
  BsCashCoin,
  BsUpload,
  BsTrash,
  BsStarFill,
  BsEye,
  BsTag,
} from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
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

export interface MerchantEventEditModalProps {
  event?: any;
  eventId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updated: any) => void;
}

const MerchantEventEditModal: React.FC<MerchantEventEditModalProps> = ({
  event,
  eventId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState("campaign"); // "campaign", "pricing", "schedule", "gallery", "preview"
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Form Fields
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [occasion, setOccasion] = useState(CULTURAL_OCCASIONS[0]);
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [stock, setStock] = useState("");
  const [start_Date, setStartDate] = useState("");
  const [Finish_Date, setFinishDate] = useState("");

  // Gallery
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  // Sync event prop or fetch by ID
  useEffect(() => {
    if (!isOpen) return;

    if (event && event._id) {
      populateFields(event);
    } else if (eventId) {
      setFetching(true);
      axios
        .get(`${server}/event/get-event/${eventId}`)
        .then((res) => {
          if (res.data?.event) {
            populateFields(res.data.event);
          }
        })
        .catch(() => {
          toast.error("Failed to load event details");
        })
        .finally(() => setFetching(false));
    }
  }, [isOpen, event, eventId]);

  const populateFields = (item) => {
    setId(item._id || "");
    setName(item.name || "");
    setDescription(item.description || "");
    setCategory(item.category || ETHIOPIAN_CATEGORIES[0]);
    setTags(item.tags || "");
    setOriginalPrice(item.originalPrice ? String(item.originalPrice) : "");
    setDiscountPrice(item.discountPrice ? String(item.discountPrice) : "");
    setStock(item.stock !== undefined ? String(item.stock) : "5");

    // Format dates for datetime-local or date input
    if (item.start_Date) {
      const s = new Date(item.start_Date);
      setStartDate(!isNaN(s.getTime()) ? s.toISOString().slice(0, 10) : "");
    }
    if (item.Finish_Date) {
      const e = new Date(item.Finish_Date);
      setFinishDate(!isNaN(e.getTime()) ? e.toISOString().slice(0, 10) : "");
    }

    const imgs = Array.isArray(item.images) ? item.images : [];
    setExistingImages(imgs);
    setNewImages([]);
    const featIdx = imgs.findIndex((img) => img.isFeatured);
    setFeaturedIndex(featIdx >= 0 ? featIdx : 0);
  };

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
        if (reader.readyState === 2) {
          setNewImages((prev) => [...prev, reader.result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveExistingImage = (index) => {
    const updated = existingImages.filter((_, i) => i !== index);
    setExistingImages(updated);
    if (featuredIndex >= updated.length) setFeaturedIndex(0);
  };

  const handleRemoveNewImage = (index) => {
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

  // Schedule status calculation
  const now = new Date();
  const startD = start_Date ? new Date(start_Date) : null;
  const endD = Finish_Date ? new Date(Finish_Date) : null;
  const isLive = startD && endD && now >= startD && now <= endD;
  const isScheduled = startD && now < startD;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!name.trim()) {
      toast.error("Please provide an event campaign title");
      return;
    }
    if (!sellingPrice || sellingPrice <= 0) {
      toast.error("Please provide a valid promotional price");
      return;
    }
    if (!start_Date || !Finish_Date) {
      toast.error("Please set start and end dates for the flash promotion");
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
        if (onSuccess) onSuccess(res.data.event);
        if (onClose) onClose();
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update event promotion"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/30 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold">
              <BsLightningChargeFill size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-serif">Edit Flash Sale Event</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isLive
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : isScheduled
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  }`}
                >
                  {isLive ? "LIVE NOW" : isScheduled ? "SCHEDULED" : "COMPLETED / EXPIRED"}
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">
                {name || "Configure promotional discounts, timing, and quota"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {id && (
              <Link
                to={`/dashboard/edit-event/${id}`}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 font-semibold text-xs border border-stone-700 transition"
              >
                <span>Full Page Editor</span>
                <FiExternalLink size={12} />
              </Link>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition"
            >
              <RxCross1 size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-stone-200 bg-stone-50 px-6 gap-2 text-xs font-bold overflow-x-auto">
          {[
            { id: "campaign", label: "1. Campaign Details", icon: <BsTag /> },
            { id: "pricing", label: "2. Promo Pricing & Quota", icon: <BsCashCoin /> },
            { id: "schedule", label: "3. Schedule & Countdown", icon: <FiClock /> },
            { id: "gallery", label: `4. Visuals (${existingImages.length + newImages.length})`, icon: <FiImage /> },
            { id: "preview", label: "5. Live Spotlight Preview", icon: <BsEye /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3.5 px-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-amber-600 text-amber-800 font-bold"
                  : "border-transparent text-stone-500 hover:text-stone-900"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-stone-800">
          {fetching ? (
            <div className="p-16 text-center text-stone-400">Loading event promotion...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* TAB 1: CAMPAIGN DETAILS */}
              {activeTab === "campaign" && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Event Campaign Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Meskel Handwoven Gabi & Netela Flash Showcase"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 font-serif"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Artisan Craft Category *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-semibold text-xs"
                      >
                        {ETHIOPIAN_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Cultural Festival / Occasion
                      </label>
                      <select
                        value={occasion}
                        onChange={(e) => setOccasion(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-semibold text-xs"
                      >
                        {CULTURAL_OCCASIONS.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Event Promotion Description
                    </label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Explain the limited-time discount, cultural occasion, artisan backstory, and delivery timeline..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Campaign Tags & Search Keywords
                    </label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="e.g. Flash Sale, Meskel, 30% OFF, Limited Edition"
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: PROMO PRICING & QUOTA */}
              {activeTab === "pricing" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Original Catalog Price (ETB) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        placeholder="e.g. 6000"
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-300 font-mono text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Flash Sale Discount Price (ETB) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={discountPrice}
                        onChange={(e) => setDiscountPrice(e.target.value)}
                        placeholder="e.g. 4200"
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-300 font-mono text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Event Stock Quota (Units) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        placeholder="e.g. 10"
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-300 font-mono text-sm"
                      />
                    </div>
                  </div>

                  {/* Promo Badge & Savings Callout */}
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-amber-950 text-sm block">
                        Promotional Savings Rate
                      </span>
                      <span className="text-[11px] text-amber-800">
                        Buyers save {(origP - discP).toLocaleString()} ETB per craft purchase
                      </span>
                    </div>

                    <div className="px-3.5 py-1.5 rounded-2xl bg-amber-600 text-white font-black text-sm font-mono shadow-xs">
                      {discountPercent > 0 ? `${discountPercent}% DISCOUNT` : "NO DISCOUNT"}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SCHEDULE & COUNTDOWN */}
              {activeTab === "schedule" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Campaign Start Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={start_Date}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Campaign Expiration / End Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={Finish_Date}
                        onChange={(e) => setFinishDate(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  {/* Schedule Indicator Card */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                    <span className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
                      <BsClockHistory className="text-amber-700" /> Active Schedule Window
                    </span>
                    <div className="grid grid-cols-2 gap-3 text-stone-700">
                      <div>
                        <span className="text-stone-400 block text-[10px]">Launch Date:</span>
                        <span className="font-semibold">{start_Date || "Not configured"}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px]">End Date:</span>
                        <span className="font-semibold">{Finish_Date || "Not configured"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: VISUALS & GALLERY */}
              {activeTab === "gallery" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                        Flash Sale Banners & Images
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        Upload high-resolution event imagery or holiday campaign photos.
                      </p>
                    </div>

                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer transition shadow-xs">
                      <BsUpload size={13} />
                      <span>Upload Banner Photos</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleNewImagesUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2">
                    {existingImages.map((img, i) => {
                      const isMain = featuredIndex === i;
                      return (
                        <div
                          key={`exist-${i}`}
                          className={`relative rounded-2xl overflow-hidden border-2 aspect-[4/3] bg-stone-100 group shadow-xs ${
                            isMain ? "border-amber-600 ring-2 ring-amber-400" : "border-stone-200"
                          }`}
                        >
                          <img
                            src={img.url}
                            alt={`Event ${i}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setFeaturedIndex(i)}
                            className={`absolute top-2 left-2 p-1.5 rounded-lg backdrop-blur-xs transition ${
                              isMain
                                ? "bg-amber-600 text-white"
                                : "bg-black/50 text-white hover:bg-amber-600"
                            }`}
                          >
                            <BsStarFill size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(i)}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 hover:bg-rose-600 text-white transition"
                          >
                            <BsTrash size={12} />
                          </button>
                        </div>
                      );
                    })}

                    {newImages.map((imgStr, i) => (
                      <div
                        key={`new-${i}`}
                        className="relative rounded-2xl overflow-hidden border-2 border-emerald-400 aspect-[4/3] bg-stone-100 group shadow-xs"
                      >
                        <img
                          src={imgStr}
                          alt={`New event upload ${i}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveNewImage(i)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 hover:bg-rose-600 text-white transition"
                        >
                          <BsTrash size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: LIVE SPOTLIGHT PREVIEW */}
              {activeTab === "preview" && (
                <div className="space-y-4 animate-fadeIn flex flex-col items-center">
                  <div className="text-center max-w-md">
                    <h4 className="font-bold text-stone-900 text-sm font-serif">
                      Flash Event Spotlight Banner
                    </h4>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      How this holiday campaign appears in the events catalog and flash sale carousel.
                    </p>
                  </div>

                  <div className="max-w-md w-full bg-stone-900 text-white rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl mt-2 relative">
                    <div className="relative aspect-[16/9] bg-stone-950 overflow-hidden">
                      <img
                        src={
                          existingImages[featuredIndex]?.url ||
                          existingImages[0]?.url ||
                          newImages[0] ||
                          "/photo.jpg"
                        }
                        alt="Event Banner Preview"
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-black/40" />

                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-600 text-white text-[10px] font-bold shadow-lg flex items-center gap-1">
                        <BsLightningChargeFill /> {discountPercent}% OFF FLASH SALE
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <div className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                        {occasion} • {category}
                      </div>
                      <h3 className="font-bold text-lg font-serif">{name || "Flash Sale Title"}</h3>

                      <div className="flex items-baseline justify-between pt-2 border-t border-stone-800">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-bold font-serif text-amber-300">
                            {sellingPrice.toLocaleString()} ETB
                          </span>
                          {discP > 0 && origP > discP && (
                            <span className="text-xs text-stone-400 line-through">
                              {origP.toLocaleString()} ETB
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-emerald-400 font-semibold font-mono">
                          {stock} pieces left in quota
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-200 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition"
          >
            <FiSave size={14} />
            <span>{loading ? "Saving..." : "Save Flash Event Changes"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default MerchantEventEditModal;
