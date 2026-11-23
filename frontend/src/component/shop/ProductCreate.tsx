import React, { useEffect, useState } from "react";
import {
  AiOutlineDelete,
  AiOutlineCheck,
  AiFillStar,
  AiOutlineStar,
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
} from "react-icons/ai";
import {
  FiUploadCloud,
  FiPackage,
  FiScissors,
  FiEye,
} from "react-icons/fi";
import { useNavigate, Link } from "react-router-dom";
import { createProduct } from "../../redux/Action/productAction";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../hooks";

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
  { label: "1. Full Front View", desc: "Show complete silhouette & hemline" },
  { label: "2. Tibeb Detail", desc: "Close-up of gold or color embroidery" },
  { label: "3. Back & Shawl", desc: "Show drape of Netela or back cut" },
  { label: "4. Shemma Texture", desc: "Close handloom weave cotton grain" },
];

const CreateProduct: React.FC = () => {
  const { seller } = useAppSelector((state) => state.seller);
  const { success, error, isLoading } = useAppSelector((state) => state.products);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

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
  const [sku, setSku] = useState("");
  const [selectedSizes, setSelectedSizes] = useState(["M", "L"]);
  const [colors, setColors] = useState("");
  const [materials, setMaterials] = useState("Handspun Cotton (Shemma)");
  const [isCustomizable, setIsCustomizable] = useState(false);
  const [productionTime, setProductionTime] = useState(5);

  // Real Logistics & Craft Provenance
  const [weightKg, setWeightKg] = useState("0.8");
  const [dimensions, setDimensions] = useState("35 x 25 x 6");
  const [craftRegion, setCraftRegion] = useState("Shiro Meda (Addis Ababa)");
  const [craftTechnique, setCraftTechnique] = useState("Double-shed Handloom with Gold Tibeb");

  // AliExpress-Grade Wholesale & Flash Deal Controls
  const [enableBulkDiscount, setEnableBulkDiscount] = useState(true);
  const [bulkDiscount3to5, setBulkDiscount3to5] = useState("5");
  const [bulkDiscount6Plus, setBulkDiscount6Plus] = useState("10");
  const [enableFlashSale, setEnableFlashSale] = useState(false);
  const [flashSalePrice, setFlashSalePrice] = useState("");
  const [supportDhlDiaspora, setSupportDhlDiaspora] = useState(true);

  useEffect(() => {
    if (error) {
      toast.error(typeof error === "string" ? error : "Failed to create product");
    }
    if (success) {
      toast.success("Artisan product published successfully to marketplace!");
      navigate("/Shopallprodcts");
    }
  }, [dispatch, error, success, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = (e.target.files ? Array.from(e.target.files) : []) as File[];
    if (!files.length) return;

    files.forEach((file: File) => {
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
    toast.info(`Photo #${idx + 1} set as main cover photo!`, { autoClose: 1500 });
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const effectiveSellerId = seller?._id || "64a000000000000000000001";

    if (!category || category === "Choose a category") {
      toast.error("Please select a product category");
      return;
    }

    if (images.length === 0) {
      toast.error("Please upload at least one image of your craft/garment");
      return;
    }

    // Rearrange images so featured image is explicitly at index 0
    const reorderedImages = [...images];
    if (featuredIndex > 0 && featuredIndex < reorderedImages.length) {
      const [featured] = reorderedImages.splice(featuredIndex, 1);
      reorderedImages.unshift(featured);
    }

    const payload = {
      name,
      description,
      category,
      tags,
      originalPrice: Number(originalPrice),
      discountPrice: discountPrice ? Number(discountPrice) : Number(originalPrice),
      stock: Number(stock),
      sku: sku || `ET-CRF-${Date.now().toString().slice(-6)}`,
      sizes: selectedSizes,
      colors: colors ? colors.split(",").map((c) => c.trim()) : [],
      materials,
      isCustomizable,
      productionTime: Number(productionTime),
      packageWeight: Number(weightKg) || 0.8,
      packageDimensions: dimensions,
      craftRegion,
      craftTechnique,
      shopId: effectiveSellerId,
      bulkPricing: enableBulkDiscount
        ? [
            { minQty: 3, discountPercentage: Number(bulkDiscount3to5) || 5 },
            { minQty: 6, discountPercentage: Number(bulkDiscount6Plus) || 10 },
          ]
        : [],
      flashSale: enableFlashSale
        ? {
            isActive: true,
            discountPrice: Number(flashSalePrice) || Number(discountPrice || originalPrice),
            endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          }
        : { isActive: false },
      buyerProtection: {
        returnWindowDays: 15,
        moneyBackGuaranteed: true,
        onTimeDeliveryDays: 7,
      },
      shippingTiers: [
        { provider: "Standard Domestic Delivery", estimatedDays: "3-5 Days", rateETB: 150 },
        { provider: "Express Intra-City (Tikus / Deliver Addis)", estimatedDays: "24 Hours", rateETB: 280 },
        ...(supportDhlDiaspora ? [{ provider: "Diaspora International Express (DHL)", estimatedDays: "3-7 Days", rateETB: 1850 }] : []),
      ],
      images: reorderedImages,
      featuredImageIndex: 0,
    };

    dispatch(createProduct(payload));
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-stone-200 p-6 md:p-10 mb-16">
      {/* Header */}
      <div className="border-b border-stone-200 pb-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold mb-2">
            <FiPackage size={14} /> Artisan Catalog Management
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-serif text-stone-900">
            List a New Artisan Product
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Publish your authentic Ethiopian handwoven garments, leatherwork, or cultural crafts for buyers worldwide.
          </p>
        </div>

        <Link
          to="/Shopallprodcts"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold text-xs transition shrink-0"
        >
          <span>View Craft Catalog</span>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Details */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-stone-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center">1</span>
            Basic Information
          </h2>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Product Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Royal Gold Tilf Habesha Kemis with Netela"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Description & Craftsmanship Story <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the weaving technique, fabric weight, cultural significance, and care instructions..."
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="">Choose a cultural category</option>
                {ETHIOPIAN_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Tags / Search Keywords
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. kemis, tilf, shemma, wedding, addis"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] text-stone-500 font-semibold">Suggested:</span>
                {["HabeshaKemis", "Tilf", "Shemma", "Handwoven", "Bespoke", "Tibeb", "TraditionalDress"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      const current = tags ? tags.split(",").map((s) => s.trim()) : [];
                      if (!current.includes(t)) {
                        setTags(current.length > 0 ? `${tags}, ${t}` : t);
                      }
                    }}
                    className="text-[10px] bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-stone-700 px-2 py-0.5 rounded-md border border-stone-200 transition"
                  >
                    +{t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="space-y-4 pt-4 border-t border-stone-200">
          <h2 className="text-base font-semibold text-stone-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center">2</span>
            Pricing & Inventory (in ETB Birr)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Original Price (ETB) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="e.g. 4500"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Discounted Price (ETB)
              </label>
              <input
                type="number"
                min="1"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                placeholder="e.g. 3800"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Available Stock <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="e.g. 15"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                  Merchant SKU
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const prefix = category ? category.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, "CRF") : "ETH";
                    setSku(`ET-${prefix}-${Math.floor(100 + Math.random() * 900)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`);
                    toast.info("Unique inventory SKU auto-generated!");
                  }}
                  className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold transition flex items-center gap-1"
                >
                  <span>✨ Auto-Generate</span>
                </button>
              </div>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. ET-KEM-492-A7X"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Shipping Logistics: Package Weight & Dimensions */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <FiPackage className="text-stone-600" /> Package Shipping Specifications (for Courier Rates)
              </span>
              <span className="text-[11px] text-stone-500 font-medium">Addis & National EMS Calculation</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Estimated Package Weight (kg)
                </label>
                <input
                  type="text"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="e.g. 0.85"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Package Dimensions (L x W x H cm)
                </label>
                <input
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  placeholder="e.g. 35 x 25 x 6"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>
            <div className="text-[11px] text-emerald-800 bg-emerald-50/80 p-2 rounded-lg border border-emerald-200 flex items-center justify-between">
              <span>Estimated Delivery Fee: ~150 ETB (Addis Ababa) • ~350 ETB (Regional EMS)</span>
              <span className="font-bold">Standard Tier</span>
            </div>
          </div>

          {/* Craft Provenance & Regional Lineage */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block">
              🏛️ Ethiopian Cultural Heritage & Origin Authenticity
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-amber-950 mb-1">
                  Artisan Provenance Region
                </label>
                <select
                  value={craftRegion}
                  onChange={(e) => setCraftRegion(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-amber-300 text-xs bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-600"
                >
                  <option value="Shiro Meda (Addis Ababa)">Shiro Meda (Addis Ababa - Central Handloom)</option>
                  <option value="Dorze Highlands (Gamo Chencha)">Dorze Highlands (Chencha Cotton Masters)</option>
                  <option value="Harar Jugol (Eastern Citadel)">Harar Historic (Intricate Basketry & Silver)</option>
                  <option value="Axum & Tigray (Northern Heritage)">Axum / Tigray (Cross Carving & Fine Shemma)</option>
                  <option value="Gonder (Fasilides Lineage)">Gonder Imperial (Royal Gold Embroidery)</option>
                  <option value="Wollo & Kemise (Highland Weave)">Wollo (Traditional Heavy Cotton)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-amber-950 mb-1">
                  Traditional Weaving / Craft Technique
                </label>
                <select
                  value={craftTechnique}
                  onChange={(e) => setCraftTechnique(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-amber-300 text-xs bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-600"
                >
                  <option value="Double-shed Handloom with Gold Tibeb">Double-shed Handloom with Gold Tibeb</option>
                  <option value="Single-shed Light Cotton Shemma">Single-shed Light Cotton Shemma</option>
                  <option value="Hand-embroidered Tilf Patterns">Hand-embroidered Tilf Patterns</option>
                  <option value="Natural Vegetable-dyed Organic Yarn">Natural Vegetable-dyed Organic Yarn</option>
                  <option value="Hand-thrown Pit-fired Black Clay">Hand-thrown Pit-fired Black Clay</option>
                  <option value="Hand-coiled Sweetgrass & Leather Mesob">Hand-coiled Sweetgrass & Leather Mesob</option>
                </select>
              </div>
            </div>
          </div>

          {/* Live Pricing Breakdown & Net Revenue Card */}
          {Number(discountPrice || originalPrice) > 0 && (() => {
            const listPrice = Number(discountPrice || originalPrice);
            const platformFee = Math.round(listPrice * 0.1);
            const netArtisan = listPrice - platformFee;

            return (
              <div className="p-4 rounded-2xl bg-stone-900 text-white border border-stone-800 space-y-2 mt-4">
                <div className="flex justify-between items-center text-xs border-b border-stone-800 pb-2">
                  <span className="text-stone-400">Customer Checkout Price:</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {listPrice.toLocaleString()} ETB
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-amber-400">
                  <span>Roha Marketplace Platform Fee (10%):</span>
                  <span className="font-mono font-bold">-{platformFee.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-1 border-t border-stone-800">
                  <span className="text-stone-300 font-bold uppercase tracking-wider text-[11px]">
                    Net Artisan Payout (Auto-credited to Wallet upon Delivery):
                  </span>
                  <span className="font-mono font-bold text-emerald-400 text-base">
                    {netArtisan.toLocaleString()} ETB
                  </span>
                </div>
              </div>
            );
          })()}

          {/* AliExpress Feature: Wholesale Volume Discounts & Flash Deal Controls */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                🏷️ Wholesale Volume Tiers & Promotional Deals
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                AliExpress Features
              </span>
            </div>

            {/* Bulk Volume Discount Toggle */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableBulkDiscount}
                  onChange={(e) => setEnableBulkDiscount(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600"
                />
                <span className="text-xs font-bold text-stone-900">
                  Enable Automated Wholesale / Bulk Volume Discounts
                </span>
              </label>

              {enableBulkDiscount && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Tier 1: 3 - 5 Pieces Discount (%)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={bulkDiscount3to5}
                      onChange={(e) => setBulkDiscount3to5(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Tier 2: 6+ Pieces Wholesale Discount (%)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={70}
                      value={bulkDiscount6Plus}
                      onChange={(e) => setBulkDiscount6Plus(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Flash Deal Toggle */}
            <div className="pt-2 border-t border-stone-200 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableFlashSale}
                  onChange={(e) => setEnableFlashSale(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600"
                />
                <span className="text-xs font-bold text-stone-900">
                  Activate Limited-Time Flash Deal (Countdown Banner)
                </span>
              </label>

              {enableFlashSale && (
                <div className="pl-6 max-w-xs">
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Flash Deal Price in ETB
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 3900"
                    value={flashSalePrice}
                    onChange={(e) => setFlashSalePrice(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              )}
            </div>

            {/* Diaspora DHL Shipping Support */}
            <div className="pt-2 border-t border-stone-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={supportDhlDiaspora}
                  onChange={(e) => setSupportDhlDiaspora(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600"
                />
                <span className="text-xs font-bold text-stone-900">
                  Enable Diaspora Worldwide Delivery via DHL Express (3-7 Days)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Traditional Apparel & Custom Sizing */}
        <div className="space-y-4 pt-4 border-t border-stone-200">
          <h2 className="text-base font-semibold text-stone-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center">3</span>
            Garment Specifications & Custom Tailoring
          </h2>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Available Sizes
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
                        ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Primary Materials / Weave
              </label>
              <input
                type="text"
                value={materials}
                onChange={(e) => setMaterials(e.target.value)}
                placeholder="e.g. Handspun Shemma, 100% Cotton, Raw Silk"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Tibeb Patterns / Color Accents
              </label>
              <input
                type="text"
                value={colors}
                onChange={(e) => setColors(e.target.value)}
                placeholder="e.g. Gold, Royal Blue, Green-Yellow-Red"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Custom Tailoring Toggle */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <FiScissors className="text-amber-800 mt-0.5" size={20} />
              <div>
                <h4 className="text-sm font-semibold text-stone-900">
                  Enable Custom Tailoring / Made-to-Order Measurements
                </h4>
                <p className="text-xs text-stone-600 mt-0.5">
                  Allows buyers to submit custom body measurements (bust, waist, hips, dress length) during checkout.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isCustomizable"
                checked={isCustomizable}
                onChange={(e) => setIsCustomizable(e.target.checked)}
                className="w-5 h-5 accent-emerald-700 cursor-pointer"
              />
              <label htmlFor="isCustomizable" className="text-xs font-semibold text-stone-800 cursor-pointer">
                {isCustomizable ? "Custom Tailoring Enabled" : "Off"}
              </label>
            </div>
          </div>

          {isCustomizable && (
            <div className="w-full md:w-1/2">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Tailoring Lead Time (Days)
              </label>
              <input
                type="number"
                min="1"
                value={productionTime}
                onChange={(e) => setProductionTime(e.target.value)}
                placeholder="e.g. 5"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          )}
        </div>

        {/* Section 4: Multi-Image Photography & Cover Selector */}
        <div className="space-y-5 pt-4 border-t border-stone-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center">4</span>
                Product Photography & Cover Selection <span className="text-rose-500">*</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Upload multiple angles. Designate one photo as the <strong>Cover / Main Showcase</strong> image shown on search cards.
              </p>
            </div>

            <span className="text-xs font-bold px-3 py-1 bg-stone-100 text-stone-700 rounded-full self-start sm:self-auto border border-stone-200">
              {images.length} photo{images.length !== 1 ? "s" : ""} selected
            </span>
          </div>

          {/* Photography Tips for Habesha Crafts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200/50 text-xs text-amber-950">
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
              id="upload"
              className="hidden"
              multiple
              accept="image/*"
              onChange={handleImageChange}
            />
            <label htmlFor="upload" className="cursor-pointer flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-100/70 text-amber-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FiUploadCloud size={28} />
              </div>
              <span className="text-sm font-bold text-stone-900">
                Click to browse or drag and drop photos
              </span>
              <span className="text-xs text-stone-500 mt-1 max-w-sm">
                Upload high-resolution images (PNG, JPG, WEBP). You can upload multiple files at once.
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
                    alt="Current Cover"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 left-1 bg-amber-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                    COVER
                  </div>
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-white px-2.5 py-1 rounded-full border border-amber-200 shadow-2xs mb-1">
                    <AiFillStar className="text-amber-500" /> Active Catalog Showcase Cover
                  </div>
                  <h4 className="text-sm font-bold text-stone-900">
                    Photo #{featuredIndex + 1} will represent your craft across the marketplace
                  </h4>
                  <p className="text-xs text-stone-600 mt-0.5">
                    This primary image will be displayed on the home page, search catalog, and shopping cart. Click "Set as Main" on any other thumbnail below to change it.
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
                            title="Set as catalog thumbnail"
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
        <div className="pt-6 border-t border-stone-200 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="px-5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-7 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
          >
            {isLoading ? "Publishing Craft to Marketplace..." : "Publish Product with Multiple Photos"}
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

export default CreateProduct;