import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import {
  BsShieldCheck,
  BsBoxSeam,
  BsCashCoin,
  BsScissors,
  BsUpload,
  BsTrash,
  BsStarFill,
  BsEye,
} from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import { FiImage, FiSave, FiExternalLink } from "react-icons/fi";

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

const SUGGESTED_TAGS = [
  "Habesha Kemis",
  "Tibeb",
  "Shemma Handloom",
  "Pure Cotton",
  "Ethiopian Leather",
  "Mesob",
  "Dorze Weave",
  "Gondar Traditional",
  "Enkutatash Holiday",
  "Timkat Feast",
  "Handmade Ethiopia",
];

const WEAVING_REGIONS = [
  "Addis Ababa (Shiro Meda Hub)",
  "Dorze / Gamo Highlands (Master Weavers)",
  "Gondar Heritage Atelier",
  "Wollo / Lalibela Region",
  "Harar Cultural Center",
  "Tigray Traditional Weave",
  "Oromia Cultural Crafts",
];

export interface MerchantProductEditModalProps {
  product?: any;
  productId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updated: any) => void;
}

const MerchantProductEditModal: React.FC<MerchantProductEditModalProps> = ({
  product,
  productId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState("specs"); // "specs", "pricing", "gallery", "preview"
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Form Fields
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [stock, setStock] = useState("");
  const [sku, setSku] = useState("");
  const [selectedSizes, setSelectedSizes] = useState(["M", "L"]);
  const [materials, setMaterials] = useState("Handspun Cotton (Shemma)");
  const [craftOrigin, setCraftOrigin] = useState("Addis Ababa (Shiro Meda Hub)");
  const [isCustomizable, setIsCustomizable] = useState(false);
  const [productionTime, setProductionTime] = useState(5);

  // Image Management
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  // Fetch product if only productId provided or sync with product prop
  useEffect(() => {
    if (!isOpen) return;

    if (product && product._id) {
      populateFields(product);
    } else if (productId) {
      setFetching(true);
      axios
        .get(`${server}/product/product/${productId}`)
        .then((res) => {
          if (res.data?.product) {
            populateFields(res.data.product);
          }
        })
        .catch(() => {
          toast.error("Failed to load product details");
        })
        .finally(() => setFetching(false));
    }
  }, [isOpen, product, productId]);

  const populateFields = (item) => {
    setId(item._id || "");
    setName(item.name || "");
    setDescription(item.description || "");
    setCategory(item.category || ETHIOPIAN_CATEGORIES[0]);
    setTags(item.tags || "");
    setOriginalPrice(item.originalPrice ? String(item.originalPrice) : "");
    setDiscountPrice(item.discountPrice ? String(item.discountPrice) : "");
    setStock(item.stock !== undefined ? String(item.stock) : "10");
    setSku(item.sku || "");
    setSelectedSizes(
      Array.isArray(item.sizes) && item.sizes.length > 0
        ? item.sizes
        : ["M", "L", "Custom Sizing"]
    );
    setMaterials(item.materials || "Handspun Cotton (Shemma)");
    setCraftOrigin(item.craftOrigin || "Addis Ababa (Shiro Meda Hub)");
    setIsCustomizable(Boolean(item.isCustomizable));
    setProductionTime(item.productionTime || 5);

    const imgs = Array.isArray(item.images) ? item.images : [];
    setExistingImages(imgs);
    setNewImages([]);
    const featIdx = imgs.findIndex((img) => img.isFeatured);
    setFeaturedIndex(featIdx >= 0 ? featIdx : 0);
  };

  const handleToggleSize = (size) => {
    if (selectedSizes.includes(size)) {
      if (selectedSizes.length > 1) {
        setSelectedSizes(selectedSizes.filter((s) => s !== size));
      } else {
        toast.info("Select at least one sizing option");
      }
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const handleAddTag = (tag) => {
    const current = tags
      ? tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];
    if (!current.includes(tag)) {
      setTags([...current, tag].join(", "));
    }
  };

  // Image Uploads Handler
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
    if (featuredIndex >= updated.length) {
      setFeaturedIndex(0);
    }
  };

  const handleRemoveNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Pricing & Net Escrow Earnings Calculations
  const origP = Number(originalPrice) || 0;
  const discP = Number(discountPrice) || 0;
  const sellingPrice = discP > 0 ? discP : origP;
  const commissionPercent = 8; // standard 8% artisan commission
  const platformFee = Math.round(sellingPrice * (commissionPercent / 100));
  const netEarnings = Math.max(0, sellingPrice - platformFee);
  const discountPercent =
    origP > 0 && discP > 0 && origP > discP
      ? Math.round(((origP - discP) / origP) * 100)
      : 0;

  // Submit Update
  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!name.trim()) {
      toast.error("Please provide a craft title");
      return;
    }
    if (!sellingPrice || sellingPrice <= 0) {
      toast.error("Please provide a valid product price");
      return;
    }

    setLoading(true);

    try {
      // Combine existing images (objects) with new images (base64)
      const combinedImages = [...existingImages, ...newImages];

      const payload = {
        name: name.trim(),
        description: description.trim(),
        category,
        tags: tags.trim(),
        originalPrice: origP,
        discountPrice: discP || origP,
        stock: Number(stock) || 0,
        sku: sku.trim(),
        sizes: selectedSizes,
        materials: materials.trim(),
        craftOrigin,
        isCustomizable,
        productionTime: Number(productionTime) || 3,
        images: combinedImages.length > 0 ? combinedImages : undefined,
        featuredImageIndex: featuredIndex,
      };

      const res = await axios.put(
        `${server}/product/update-product/${id}`,
        payload,
        { withCredentials: true }
      );

      if (res.data?.success) {
        toast.success(res.data.message || "Craft updated successfully!");
        if (onSuccess) onSuccess(res.data.product);
        if (onClose) onClose();
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update product"
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
            <div className="w-10 h-10 rounded-2xl bg-amber-600/30 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold">
              <BsBoxSeam size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-serif">Edit Artisan Craft</h2>
                {sku && (
                  <span className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 text-[10px] font-mono">
                    SKU: {sku}
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">
                {name || "Modify specifications, pricing, gallery and sizing"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {id && (
              <Link
                to={`/dashboard/edit-product/${id}`}
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
            { id: "specs", label: "1. Specifications & Heritage", icon: <BsScissors /> },
            { id: "pricing", label: "2. Pricing, Stock & Escrow", icon: <BsCashCoin /> },
            { id: "gallery", label: `3. Gallery (${existingImages.length + newImages.length})`, icon: <FiImage /> },
            { id: "preview", label: "4. Live Customer Preview", icon: <BsEye /> },
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
            <div className="p-16 text-center text-stone-400">Loading craft details...</div>
          ) : (
            <form id="productEditForm" onSubmit={handleSubmit} className="space-y-5">
              {/* TAB 1: SPECS & HERITAGE */}
              {activeTab === "specs" && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Craft Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Royal Menze Pure Cotton Habesha Kemis with Gold Tilf"
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
                        Regional Craft Origin / Lineage
                      </label>
                      <select
                        value={craftOrigin}
                        onChange={(e) => setCraftOrigin(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-semibold text-xs"
                      >
                        {WEAVING_REGIONS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Traditional Materials & Composition
                    </label>
                    <input
                      type="text"
                      value={materials}
                      onChange={(e) => setMaterials(e.target.value)}
                      placeholder="e.g. 100% Handspun Cotton (Shemma), Pure Silk Threads, Metallic Gold Embroidery"
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Heritage Story & Craft Description
                    </label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the weaving technique, cultural symbolism of the Tibeb patterns, drape of the Netela, and tailoring details..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs leading-relaxed"
                    />
                  </div>

                  {/* Suggested Tag Chips */}
                  <div>
                    <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Discovery Tags & Keywords
                    </label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="Comma-separated keywords for search discovery"
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs mb-2"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTED_TAGS.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => handleAddTag(t)}
                          className="px-2 py-0.5 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-600 hover:text-amber-900 text-[10px] font-semibold transition"
                        >
                          + {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PRICING, STOCK & ESCROW */}
              {activeTab === "pricing" && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Prices */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Regular Price (ETB) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        placeholder="e.g. 5500"
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-300 font-mono text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Discount / Selling Price (ETB)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={discountPrice}
                        onChange={(e) => setDiscountPrice(e.target.value)}
                        placeholder="e.g. 4800 (Leave empty if none)"
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-300 font-mono text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Available Stock (Units) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        placeholder="e.g. 12"
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-300 font-mono text-sm"
                      />
                    </div>
                  </div>

                  {/* Net Escrow Earnings Breakdown Card */}
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                    <span className="font-bold text-emerald-950 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <BsCashCoin className="text-emerald-700" /> Transparent Escrow Settlement Breakdown
                      </span>
                      {discountPercent > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] font-bold">
                          {discountPercent}% OFF Buyer Promo
                        </span>
                      )}
                    </span>

                    <div className="grid grid-cols-3 gap-3 pt-1 text-center">
                      <div className="p-2.5 rounded-xl bg-white border border-emerald-100">
                        <span className="text-[10px] text-stone-500 uppercase font-bold block">
                          Buyer Price
                        </span>
                        <div className="font-mono font-bold text-sm text-stone-900 mt-0.5">
                          {sellingPrice.toLocaleString()} ETB
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-emerald-100">
                        <span className="text-[10px] text-stone-500 uppercase font-bold block">
                          Platform Fee (8%)
                        </span>
                        <div className="font-mono font-bold text-sm text-stone-600 mt-0.5">
                          -{platformFee.toLocaleString()} ETB
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-emerald-100/70 border border-emerald-300">
                        <span className="text-[10px] text-emerald-900 uppercase font-bold block">
                          Net Artisan Payout
                        </span>
                        <div className="font-mono font-bold text-sm text-emerald-900 mt-0.5">
                          {netEarnings.toLocaleString()} ETB
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sizing & Tailoring Options */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                    <label className="block font-bold text-stone-800 uppercase tracking-wider text-xs">
                      Available Sizing & Bespoke Tailoring:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_SIZES.map((size) => {
                        const isSelected = selectedSizes.includes(size);
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => handleToggleSize(size)}
                            className={`px-3 py-1.5 rounded-xl font-bold transition text-xs ${
                              isSelected
                                ? "bg-amber-600 text-white shadow-xs"
                                : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-100"
                            }`}
                          >
                            {isSelected ? "✓ " : "+ "}
                            {size}
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-stone-200">
                      <div>
                        <span className="font-bold text-stone-900 block">
                          Custom Tailoring & Made-to-Measure
                        </span>
                        <span className="text-[10px] text-stone-500">
                          Allow buyers to submit bespoke chest, waist, and hemline measurements
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isCustomizable}
                        onChange={(e) => setIsCustomizable(e.target.checked)}
                        className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: GALLERY & VISUALS */}
              {activeTab === "gallery" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                        Product Gallery Images
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        Click on a star to set the primary featured image displayed across the marketplace.
                      </p>
                    </div>

                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer transition shadow-xs">
                      <BsUpload size={13} />
                      <span>Upload More Photos</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleNewImagesUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Existing & New Images Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2">
                    {/* Existing Images */}
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
                            alt={`Product ${i}`}
                            className="w-full h-full object-cover"
                          />

                          {/* Star featured button */}
                          <button
                            type="button"
                            onClick={() => setFeaturedIndex(i)}
                            className={`absolute top-2 left-2 p-1.5 rounded-lg backdrop-blur-xs transition ${
                              isMain
                                ? "bg-amber-600 text-white"
                                : "bg-black/50 text-white hover:bg-amber-600"
                            }`}
                            title={isMain ? "Main Photo" : "Set as Main Photo"}
                          >
                            <BsStarFill size={12} />
                          </button>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(i)}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 hover:bg-rose-600 text-white transition backdrop-blur-xs"
                            title="Remove Photo"
                          >
                            <BsTrash size={12} />
                          </button>

                          {isMain && (
                            <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-amber-600 text-white text-[9px] font-bold">
                              Main Showcase
                            </span>
                          )}
                        </div>
                      );
                    })}

                    {/* Newly Added Images (Preview) */}
                    {newImages.map((imgStr, i) => (
                      <div
                        key={`new-${i}`}
                        className="relative rounded-2xl overflow-hidden border-2 border-emerald-400 aspect-[4/3] bg-stone-100 group shadow-xs"
                      >
                        <img
                          src={imgStr}
                          alt={`New upload ${i}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveNewImage(i)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 hover:bg-rose-600 text-white transition"
                        >
                          <BsTrash size={12} />
                        </button>
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-emerald-700 text-white text-[9px] font-bold">
                          New (Ready to Save)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: LIVE CUSTOMER PREVIEW */}
              {activeTab === "preview" && (
                <div className="space-y-4 animate-fadeIn flex flex-col items-center">
                  <div className="text-center max-w-md">
                    <h4 className="font-bold text-stone-900 text-sm font-serif">
                      Marketplace Showcase Preview
                    </h4>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      How this craft appears to cultural fashion collectors and shoppers.
                    </p>
                  </div>

                  <div className="max-w-sm w-full bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-xl mt-3">
                    <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                      <img
                        src={
                          existingImages[featuredIndex]?.url ||
                          existingImages[0]?.url ||
                          newImages[0] ||
                          "/photo.jpg"
                        }
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      {discountPercent > 0 && (
                        <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold shadow">
                          {discountPercent}% OFF
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-xl bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-semibold flex items-center gap-1">
                        <BsShieldCheck className="text-emerald-400" /> Authentic Handloom
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                        {category} • {craftOrigin.split("(")[0]}
                      </div>
                      <h3 className="font-bold text-stone-900 text-base font-serif line-clamp-2">
                        {name || "Untitled Artisan Creation"}
                      </h3>

                      <div className="flex items-baseline justify-between pt-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold font-serif text-stone-900">
                            {sellingPrice.toLocaleString()} ETB
                          </span>
                          {discP > 0 && origP > discP && (
                            <span className="text-xs text-stone-400 line-through">
                              {origP.toLocaleString()} ETB
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-emerald-700 font-semibold">
                          {Number(stock) > 0 ? `${stock} in stock` : "Made to order"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer Actions */}
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
            <span>{loading ? "Saving Changes..." : "Save Craft Changes"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default MerchantProductEditModal;
