import React, { useEffect, useState } from "react";
import {
  AiOutlinePlusCircle,
  AiOutlineDelete,
  AiOutlineCheck,
  AiFillStar,
  AiOutlineStar,
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
} from "react-icons/ai";
import {
  FiUploadCloud,
  FiCalendar,
  FiTag,
  FiPackage,
  FiScissors,
  FiEye,
  FiClock,
  FiPercent,
  FiLayers,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createevent } from "../../redux/Action/event";

const AVAILABLE_SIZES = ["S", "M", "L", "XL", "XXL", "Custom Sizing"];
const ETHIOPIAN_CATEGORIES = [
  "Ethiopian Traditional Dresses (Habesha Kemis)",
  "Men's Traditional Attire (Yebahl Libs)",
  "Traditional Shawls & Blankets (Netela & Gabi)",
  "Handcrafted Footwear & Leather",
  "Traditional Jewelry & Accessories",
  "Handwoven Textiles & Home Decor",
  "Cultural Crafts & Mesob",
];

const PHOTO_SUGGESTIONS = [
  { label: "1. Festival Front View", desc: "Full silhouette & hemline embroidery" },
  { label: "2. Gold Tilf Detail", desc: "Close-up of metallic threads & cross motifs" },
  { label: "3. Back & Netela Drape", desc: "Show shawl styling & drape" },
  { label: "4. Handloom Weave", desc: "Authentic Shemma cotton texture" },
];

const CreateEvent = () => {
  const { seller } = useSelector((state) => state.seller);
  const { success, error, isLoading } = useSelector((state) => state.events || {});
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [images, setImages] = useState([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [previewModalImg, setPreviewModalImg] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [stock, setStock] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedSizes, setSelectedSizes] = useState(["M", "L", "Custom Sizing"]);
  const [colors, setColors] = useState("");
  const [isCustomizable, setIsCustomizable] = useState(false);
  const [productionTime, setProductionTime] = useState(3);

  const handleStartDateChange = (e) => {
    const val = e.target.value;
    setStartDate(val);
    if (endDate && new Date(val) > new Date(endDate)) {
      setEndDate("");
    }
  };

  useEffect(() => {
    if (error) {
      toast.error(typeof error === "string" ? error : "Failed to create event promotion");
    }
    if (success) {
      toast.success("Cultural promotional event launched successfully!");
      navigate("/Dashboard");
    }
  }, [dispatch, error, success, navigate]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setImages((old) => [...old, reader.result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (indexToRemove) => {
    setImages((prev) => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      if (featuredIndex >= updated.length) {
        setFeaturedIndex(Math.max(0, updated.length - 1));
      } else if (featuredIndex === indexToRemove) {
        setFeaturedIndex(0);
      } else if (featuredIndex > indexToRemove) {
        setFeaturedIndex(featuredIndex - 1);
      }
      return updated;
    });
  };

  const setAsFeatured = (idx) => {
    setFeaturedIndex(idx);
    toast.info(`Photo #${idx + 1} chosen as Promotional Cover!`, { autoClose: 1500 });
  };

  const moveImage = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= images.length) return;
    setImages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(fromIdx, 1);
      copy.splice(toIdx, 0, item);
      return copy;
    });

    if (featuredIndex === fromIdx) {
      setFeaturedIndex(toIdx);
    } else if (featuredIndex === toIdx) {
      setFeaturedIndex(fromIdx);
    }
  };

  const toggleSize = (size) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter((s) => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const discountPercent =
    originalPrice && discountPrice && Number(originalPrice) > Number(discountPrice)
      ? Math.round(((Number(originalPrice) - Number(discountPrice)) / Number(originalPrice)) * 100)
      : null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!seller?._id) {
      toast.error("Please login as a merchant to publish an event");
      return;
    }

    if (images.length === 0) {
      toast.error("Please upload at least one promotional image for the event");
      return;
    }

    if (!startDate || !endDate) {
      toast.error("Please specify both start and finish dates for the promotion");
      return;
    }

    // Rearrange images so featured image is explicitly at index 0
    const reorderedImages = [...images];
    if (featuredIndex > 0 && featuredIndex < reorderedImages.length) {
      const [featured] = reorderedImages.splice(featuredIndex, 1);
      reorderedImages.unshift(featured);
    }

    const data = {
      name,
      description,
      category,
      tags,
      originalPrice: Number(originalPrice),
      discountPrice: Number(discountPrice),
      stock: Number(stock),
      images: reorderedImages,
      featuredImageIndex: 0,
      shopId: seller._id,
      start_Date: new Date(startDate).toISOString(),
      Finish_Date: new Date(endDate).toISOString(),
      sizes: selectedSizes,
      colors: colors ? colors.split(",").map((c) => c.trim()) : [],
      isCustomizable,
      productionTime: Number(productionTime),
    };

    dispatch(createevent(data));
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-stone-200 p-6 md:p-10 mb-16">
      {/* Header */}
      <div className="border-b border-stone-200 pb-5 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold mb-2">
          <FiCalendar size={14} /> Cultural Promotion & Flash Sales
        </div>
        <h1 className="text-2xl md:text-3xl font-bold font-serif text-stone-900">
          Create Holiday & Festival Flash Sale
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Launch a limited-time cultural event for holidays like Meskel, Enkutatash, Timkat, Fasika, or seasonal boutique flash sales.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Event & Campaign Details */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-stone-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-700 text-white text-xs flex items-center justify-center">1</span>
            Campaign Information
          </h2>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Promotional Event Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Enkutatash New Year Special: Royal Golden Tilf Kemis"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Promotional Description & Holiday Context <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the special festive offer, limited edition weaving, cultural holiday significance, and estimated delivery..."
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
              >
                <option value="">Choose cultural category</option>
                {ETHIOPIAN_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Campaign Tags
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. enkutatash, holiday, discount, kemis, addis"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Promotional Pricing & Limited Allocation */}
        <div className="space-y-4 pt-4 border-t border-stone-200">
          <h2 className="text-base font-semibold text-stone-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-700 text-white text-xs flex items-center justify-center">2</span>
            Promotional Pricing & Limited Allocation
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Regular Price (ETB) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="e.g. 6000"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Flash Event Price (ETB) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                placeholder="e.g. 4500"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
              {discountPercent && (
                <span className="inline-block mt-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                  🎉 {discountPercent}% Special Discount
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Event Stock Allocation <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="e.g. 10 items reserved"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Event Duration / Window */}
        <div className="space-y-4 pt-4 border-t border-stone-200">
          <h2 className="text-base font-semibold text-stone-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-700 text-white text-xs flex items-center justify-center">3</span>
            Flash Window & Countdown Duration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Promotion Start Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={startDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={handleStartDateChange}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Promotion Finish Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                min={startDate}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Sizing & Tailoring */}
        <div className="space-y-4 pt-4 border-t border-stone-200">
          <h2 className="text-base font-semibold text-stone-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-700 text-white text-xs flex items-center justify-center">4</span>
            Garment Sizes & Tailoring Options
          </h2>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Available Sizes for Event Garment
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SIZES.map((sz) => {
                const isSelected = selectedSizes.includes(sz);
                return (
                  <button
                    type="button"
                    key={sz}
                    onClick={() => toggleSize(sz)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                      isSelected
                        ? "bg-amber-800 text-white border-amber-800 shadow-sm"
                        : "bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400"
                    }`}
                  >
                    {isSelected && <AiOutlineCheck className="inline mr-1" />}
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <FiScissors className="text-amber-800 mt-0.5" size={20} />
              <div>
                <h4 className="text-sm font-semibold text-stone-900">
                  Allow Custom Measurements on this Event Craft
                </h4>
                <p className="text-xs text-stone-600 mt-0.5">
                  Allows customers to provide custom body measurements for custom tailored kemis during the promotion.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isCustomizable"
                checked={isCustomizable}
                onChange={(e) => setIsCustomizable(e.target.checked)}
                className="w-5 h-5 accent-amber-700 cursor-pointer"
              />
              <label htmlFor="isCustomizable" className="text-xs font-semibold text-stone-800 cursor-pointer">
                {isCustomizable ? "Custom Tailoring On" : "Off"}
              </label>
            </div>
          </div>
        </div>

        {/* Section 5: Multi-Photo Photography & Cover Selector */}
        <div className="space-y-5 pt-4 border-t border-stone-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-700 text-white text-xs flex items-center justify-center">5</span>
                Event Promotional Imagery & Cover Selection <span className="text-rose-500">*</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Upload multiple photos. Designate one photo as the <strong>Cover / Main Banner</strong> image displayed on holiday flash sale cards.
              </p>
            </div>

            <span className="text-xs font-bold px-3 py-1 bg-stone-100 text-stone-700 rounded-full self-start sm:self-auto border border-stone-200">
              {images.length} photo{images.length !== 1 ? "s" : ""} selected
            </span>
          </div>

          {/* Cultural Photography Guide */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200/60 text-xs text-amber-950">
            {PHOTO_SUGGESTIONS.map((item, i) => (
              <div key={i} className="flex flex-col">
                <span className="font-bold text-amber-900">{item.label}</span>
                <span className="text-[11px] text-amber-700/80 leading-tight">{item.desc}</span>
              </div>
            ))}
          </div>

          {/* Upload Dropzone */}
          <div className="border-2 border-dashed border-stone-300 hover:border-amber-700 hover:bg-amber-50/20 rounded-2xl p-7 text-center transition-all cursor-pointer group">
            <input
              type="file"
              id="event-upload"
              className="hidden"
              multiple
              accept="image/*"
              onChange={handleImageChange}
            />
            <label htmlFor="event-upload" className="cursor-pointer flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FiUploadCloud size={28} />
              </div>
              <span className="text-sm font-bold text-stone-900">
                Click to browse or drag and drop event promotional photos
              </span>
              <span className="text-xs text-stone-500 mt-1 max-w-sm">
                Upload high-resolution images (JPEG, PNG, WEBP). Multiple images allow buyers to inspect all angles and embroidery.
              </span>
            </label>
          </div>

          {/* Interactive Multi-Image Gallery & Reordering */}
          {images.length > 0 && (
            <div className="space-y-4 pt-2">
              {/* Highlight Banner of Selected Cover */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shadow-md shrink-0 border-2 border-amber-600">
                  <img
                    src={images[featuredIndex]}
                    alt="Current Event Cover"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 left-1 bg-amber-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                    COVER
                  </div>
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-white px-2.5 py-1 rounded-full border border-amber-200 shadow-2xs mb-1">
                    <AiFillStar className="text-amber-500" /> Event Showcase Cover
                  </div>
                  <h4 className="text-sm font-bold text-stone-900">
                    Photo #{featuredIndex + 1} will represent this flash deal on the events page & countdown banner
                  </h4>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Click "Set as Main" on any thumbnail below to change which photo represents your promotional craft.
                  </p>
                </div>
              </div>

              {/* Grid of uploaded images */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((img, idx) => {
                  const isFeatured = idx === featuredIndex;
                  return (
                    <div
                      key={idx}
                      className={`relative group rounded-2xl overflow-hidden border-2 transition-all flex flex-col bg-white shadow-2xs ${
                        isFeatured
                          ? "border-amber-600 ring-4 ring-amber-500/20 shadow-md"
                          : "border-stone-200 hover:border-stone-400"
                      }`}
                    >
                      {/* Image Preview Box */}
                      <div className="relative aspect-square w-full overflow-hidden bg-stone-50">
                        <img
                          src={img}
                          alt={`Upload ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
                          {isFeatured ? (
                            <span className="inline-flex items-center gap-1 bg-amber-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">
                              <AiFillStar /> MAIN COVER
                            </span>
                          ) : (
                            <span className="bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-2xs">
                              #{idx + 1}
                            </span>
                          )}
                        </div>

                        {/* Quick View Button */}
                        <button
                          type="button"
                          onClick={() => setPreviewModalImg(img)}
                          className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-2xs"
                          title="Preview full image"
                        >
                          <FiEye size={13} />
                        </button>
                      </div>

                      {/* Card Control Toolbar */}
                      <div className="p-2 bg-stone-50/90 border-t border-stone-100 flex items-center justify-between gap-1 text-xs">
                        {/* Make Cover Button */}
                        {isFeatured ? (
                          <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1 px-1">
                            <AiFillStar /> Selected
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setAsFeatured(idx)}
                            className="text-[11px] font-bold text-stone-600 hover:text-amber-800 hover:bg-amber-100/70 px-2 py-1 rounded-lg transition flex items-center gap-1"
                            title="Set as event main banner"
                          >
                            <AiOutlineStar className="text-amber-600" /> Set as Main
                          </button>
                        )}

                        {/* Action Buttons: Left, Right, Delete */}
                        <div className="flex items-center gap-0.5">
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => moveImage(idx, idx - 1)}
                              className="p-1 hover:bg-stone-200 text-stone-600 rounded"
                              title="Move photo left"
                            >
                              <AiOutlineArrowLeft size={12} />
                            </button>
                          )}
                          {idx < images.length - 1 && (
                            <button
                              type="button"
                              onClick={() => moveImage(idx, idx + 1)}
                              className="p-1 hover:bg-stone-200 text-stone-600 rounded"
                              title="Move photo right"
                            >
                              <AiOutlineArrowRight size={12} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="p-1 hover:bg-rose-100 text-rose-600 rounded ml-1 transition"
                            title="Remove photo"
                          >
                            <AiOutlineDelete size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
          <button
            type="button"
            onClick={() => navigate("/Dashboard")}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-7 py-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
          >
            {isLoading ? "Publishing Promotional Event..." : "Launch Holiday Flash Event"}
          </button>
        </div>
      </form>

      {/* Enlarged Quick Preview Modal */}
      {previewModalImg && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-2xl max-h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2 animate-fadeIn">
            <button
              onClick={() => setPreviewModalImg(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center text-sm shadow"
            >
              ✕
            </button>
            <img
              src={previewModalImg}
              alt="Enlarged preview"
              className="max-h-[75vh] w-auto mx-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateEvent;