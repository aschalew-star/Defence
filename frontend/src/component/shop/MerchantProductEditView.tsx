import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
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
  BsArrowLeft,
  BsCheckCircleFill,
  BsLightningChargeFill,
  BsInfoCircle,
} from "react-icons/bs";
import { FiSave, FiImage, FiExternalLink } from "react-icons/fi";
import { AiFillStar } from "react-icons/ai";

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
  "Custom Tailored",
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

const SHEMMA_GRADES = [
  "Fine 100% Handspun Cotton (Finest Netela & Royal Kemis)",
  "Medium Weight Shemma (Classic Daily & Holiday Kemis)",
  "Heavy Triple-Layer Gabi Weave (Warm Traditional Blanket)",
  "Hand-Dyed Organic Saba Silk Blend",
];

const TIBEB_PATTERNS = [
  "Royal Diamond Cross Motif (Classic Habesha)",
  "Gondar Crown Geometric Border",
  "Axumite Cross Embroidery",
  "Modern Minimalist Gold Trim",
  "Multicolor Floral Needlework",
  "Custom Artisan Pattern",
];

const MerchantProductEditView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
    "specs" | "craft" | "pricing" | "gallery" | "preview" | "analytics"
  >("specs");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [productData, setProductData] = useState<any>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(ETHIOPIAN_CATEGORIES[0]);
  const [tags, setTags] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [stock, setStock] = useState("10");
  const [sku, setSku] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["M", "L"]);
  const [materials, setMaterials] = useState("Handspun Cotton (Shemma)");
  const [craftOrigin, setCraftOrigin] = useState("Addis Ababa (Shiro Meda Hub)");
  const [shemmaGrade, setShemmaGrade] = useState(SHEMMA_GRADES[0]);
  const [tibebPattern, setTibebPattern] = useState(TIBEB_PATTERNS[0]);
  const [isCustomizable, setIsCustomizable] = useState(false);
  const [productionTime, setProductionTime] = useState(5);
  const [customBust, setCustomBust] = useState(true);
  const [customWaist, setCustomWaist] = useState(true);
  const [customLength, setCustomLength] = useState(true);

  // Image Management
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [newImages, setNewImages] = useState<string[]>([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  // Fetch product details
  useEffect(() => {
    if (!id) return;
    setFetching(true);
    axios
      .get(`${server}/product/product/${id}`)
      .then((res) => {
        if (res.data?.product) {
          const item = res.data.product;
          setProductData(item);
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
          const featIdx = imgs.findIndex((img: any) => img.isFeatured);
          setFeaturedIndex(featIdx >= 0 ? featIdx : 0);
        }
      })
      .catch((err) => {
        toast.error("Failed to load product details: " + (err.response?.data?.message || err.message));
      })
      .finally(() => setFetching(false));
  }, [id]);

  const handleToggleSize = (size: string) => {
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

  const handleAddTag = (tag: string) => {
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
    if (featuredIndex >= updated.length) {
      setFeaturedIndex(0);
    }
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Pricing & Net Escrow Calculations
  const origP = Number(originalPrice) || 0;
  const discP = Number(discountPrice) || 0;
  const sellingPrice = discP > 0 ? discP : origP;
  const platformFee = Math.round(sellingPrice * 0.08); // 8% marketplace escrow fee
  const vatAmount = Math.round(sellingPrice * 0.15); // 15% VAT estimate
  const netEarnings = Math.max(0, sellingPrice - platformFee);
  const discountPercent =
    origP > 0 && discP > 0 && origP > discP
      ? Math.round(((origP - discP) / origP) * 100)
      : 0;

  // Submit Update
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
        setProductData(res.data.product);
        // refresh new images into existing
        if (res.data.product?.images) {
          setExistingImages(res.data.product.images);
          setNewImages([]);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update craft");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-12 text-stone-600 space-y-4">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
        <p className="font-serif text-lg font-semibold text-stone-800">
          Loading Artisan Craft Details...
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
                to="/shop-all-products"
                className="hover:text-amber-800 flex items-center gap-1 transition"
              >
                <BsArrowLeft /> Back to Catalog
              </Link>
              <span>/</span>
              <span className="text-amber-900 font-bold">Edit Craft Details</span>
              <span>/</span>
              <span className="font-mono text-stone-400">ID: {id?.slice(-8)}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-stone-900">
              {name || "Untitled Habesha Craft"}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600">
              Fine-tune weaving specifications, pricing, inventory allotment, and Ethiopian artisan heritage metadata.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/product/${id}`}
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
              <span>{loading ? "Saving Craft..." : "Save Changes"}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 pt-4 overflow-x-auto no-scrollbar">
          {[
            { id: "specs", label: "Basic Details", icon: BsBoxSeam },
            { id: "craft", label: "Artisan & Sizing Specs", icon: BsScissors },
            { id: "pricing", label: "Pricing & Escrow", icon: BsCashCoin },
            { id: "gallery", label: "Media Gallery", icon: FiImage },
            { id: "preview", label: "Live Card Preview", icon: BsEye },
            { id: "analytics", label: "Product Performance", icon: BsLightningChargeFill },
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

      {/* Main Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* TAB 1: BASIC SPECS */}
          {activeTab === "specs" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-5 animate-in fade-in duration-200">
              <h2 className="text-lg font-bold font-serif text-stone-900 pb-3 border-b border-stone-100">
                Craft Identity & Category
              </h2>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Craft Name / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Royal Shiro Meda Habesha Kemis with Gold Tibeb"
                  className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700 font-serif"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    Artisan Weaving Region / Hub
                  </label>
                  <select
                    value={craftOrigin}
                    onChange={(e) => setCraftOrigin(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-2xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
                  >
                    {WEAVING_REGIONS.map((reg) => (
                      <option key={reg} value={reg}>
                        {reg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Detailed Craft Description & Cultural Backstory
                </label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the weaving technique, handloom heritage, motifs, Shemma cotton quality, and styling instructions..."
                  className="w-full p-4 rounded-2xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Marketplace Search Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Habesha Kemis, Tibeb, Handloom, Cotton"
                  className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
                />
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  <span className="text-[11px] font-semibold text-stone-400 self-center">
                    Quick suggestions:
                  </span>
                  {SUGGESTED_TAGS.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleAddTag(st)}
                      className="px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-600 text-xs font-medium transition"
                    >
                      + {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ARTISAN & SIZING SPECS */}
          {activeTab === "craft" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6 animate-in fade-in duration-200">
              <h2 className="text-lg font-bold font-serif text-stone-900 pb-3 border-b border-stone-100">
                Artisan Specifications & Sizing
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Shemma Cotton Grade & Weave
                  </label>
                  <select
                    value={shemmaGrade}
                    onChange={(e) => setShemmaGrade(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-2xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
                  >
                    {SHEMMA_GRADES.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Tibeb Motif & Embroidery Style
                  </label>
                  <select
                    value={tibebPattern}
                    onChange={(e) => setTibebPattern(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-2xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
                  >
                    {TIBEB_PATTERNS.map((pattern) => (
                      <option key={pattern} value={pattern}>
                        {pattern}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Materials Used
                </label>
                <input
                  type="text"
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                  placeholder="e.g. 100% Handspun Shemma Cotton, Rayon Thread, Metallic Gold Yarn"
                  className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Available Sizing Matrix
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {AVAILABLE_SIZES.map((sz) => {
                    const sel = selectedSizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => handleToggleSize(sz)}
                        className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 ${
                          sel
                            ? "bg-amber-800 text-white shadow-sm"
                            : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                        }`}
                      >
                        {sel && <BsCheckCircleFill size={12} />}
                        <span>{sz}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">
                      Made-to-Measure Custom Tailoring
                    </h3>
                    <p className="text-xs text-stone-500">
                      Enable buyers to provide personal tailoring measurements upon checkout
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCustomizable}
                      onChange={(e) => setIsCustomizable(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-800"></div>
                  </label>
                </div>

                {isCustomizable && (
                  <div className="pt-3 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="flex items-center gap-2 text-xs font-medium text-stone-700">
                      <input
                        type="checkbox"
                        checked={customBust}
                        onChange={(e) => setCustomBust(e.target.checked)}
                        className="rounded text-amber-800 focus:ring-amber-700"
                      />
                      <span>Bust / Chest (cm)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-medium text-stone-700">
                      <input
                        type="checkbox"
                        checked={customWaist}
                        onChange={(e) => setCustomWaist(e.target.checked)}
                        className="rounded text-amber-800 focus:ring-amber-700"
                      />
                      <span>Waist & Hips (cm)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-medium text-stone-700">
                      <input
                        type="checkbox"
                        checked={customLength}
                        onChange={(e) => setCustomLength(e.target.checked)}
                        className="rounded text-amber-800 focus:ring-amber-700"
                      />
                      <span>Dress Length (cm)</span>
                    </label>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Production / Handloom Turnaround (Days)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={productionTime}
                    onChange={(e) => setProductionTime(Number(e.target.value))}
                    className="w-32 px-4 py-2.5 rounded-2xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
                  />
                  <span className="text-xs text-stone-500">
                    Days needed to handcraft and inspect before dispatching to courier
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRICING & ESCROW */}
          {activeTab === "pricing" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6 animate-in fade-in duration-200">
              <h2 className="text-lg font-bold font-serif text-stone-900 pb-3 border-b border-stone-100">
                Pricing, Inventory & Net Escrow Calculator
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
                    placeholder="e.g. 8500"
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Discount / Promo Price (ETB)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    placeholder="e.g. 7200"
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700 font-bold text-emerald-800"
                  />
                  {discountPercent > 0 && (
                    <span className="text-[11px] font-bold text-emerald-700 mt-1 inline-block">
                      {discountPercent}% promotional markdown
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    In-Stock Units <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="10"
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Artisan SKU / Reference Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. HK-SHIRO-2024-001"
                    className="flex-1 px-4 py-2.5 rounded-2xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setSku(`ET-${category.slice(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`)
                    }
                    className="px-4 py-2 rounded-2xl border border-stone-300 hover:bg-stone-50 text-xs font-bold text-stone-700"
                  >
                    Auto-Generate
                  </button>
                </div>
              </div>

              {/* Ethiopian Escrow Payout Breakdown Card */}
              <div className="bg-stone-50 rounded-3xl p-6 border border-stone-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <div className="flex items-center gap-2">
                    <BsCashCoin className="text-amber-800" size={18} />
                    <h3 className="text-sm font-bold text-stone-900 font-serif">
                      Estimated Artisan Escrow Settlement
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                    Protected Payout
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Customer Retail Selling Price:</span>
                    <span className="font-bold text-stone-900">{sellingPrice.toLocaleString()} ETB</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Marketplace Escrow & Infrastructure Fee (8%):</span>
                    <span className="font-semibold text-rose-600">-{platformFee.toLocaleString()} ETB</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Included 15% VAT Value (approx):</span>
                    <span className="font-mono text-stone-500">~{vatAmount.toLocaleString()} ETB</span>
                  </div>
                  <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-stone-900">
                      Your Net Disbursable Take-Home:
                    </span>
                    <span className="text-2xl font-black text-emerald-800 font-serif">
                      {netEarnings.toLocaleString()} ETB
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-stone-500 flex items-center gap-1.5 pt-1">
                  <BsShieldCheck className="text-emerald-700 shrink-0" />
                  <span>
                    Disbursed directly into your Telebirr / CBE account upon customer receipt verification.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MEDIA GALLERY */}
          {activeTab === "gallery" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h2 className="text-lg font-bold font-serif text-stone-900">
                    Garment Photography & Gallery
                  </h2>
                  <p className="text-xs text-stone-500">
                    High-resolution photographs highlight Shemma thread detail and Tibeb embroidery. Max 8MB per file.
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

              {/* Gallery Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Existing Images */}
                {existingImages.map((img, idx) => {
                  const isFeat = idx === featuredIndex;
                  return (
                    <div
                      key={`existing-${idx}`}
                      className={`group relative rounded-2xl overflow-hidden border-2 transition ${
                        isFeat ? "border-amber-700 ring-2 ring-amber-700/20" : "border-stone-200"
                      }`}
                    >
                      <img
                        src={img.url || img}
                        alt="craft"
                        className="w-full h-36 object-cover bg-stone-100"
                      />
                      <div className="absolute top-2 left-2">
                        <button
                          type="button"
                          onClick={() => setFeaturedIndex(idx)}
                          className={`p-1.5 rounded-full shadow text-xs ${
                            isFeat ? "bg-amber-700 text-white" : "bg-white/80 text-stone-600 hover:bg-white"
                          }`}
                          title={isFeat ? "Primary Showcase Image" : "Make Primary Showcase"}
                        >
                          <BsStarFill />
                        </button>
                      </div>
                      <div className="absolute top-2 right-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(idx)}
                          className="p-1.5 rounded-full bg-rose-600 text-white shadow hover:bg-rose-700 text-xs"
                          title="Remove Photo"
                        >
                          <BsTrash />
                        </button>
                      </div>
                      {isFeat && (
                        <div className="absolute bottom-0 inset-x-0 bg-amber-800/90 text-white text-[10px] font-bold py-0.5 text-center">
                          Featured Photo
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* New Uploads Preview */}
                {newImages.map((imgUrl, idx) => (
                  <div
                    key={`new-${idx}`}
                    className="relative rounded-2xl overflow-hidden border-2 border-dashed border-amber-600 bg-amber-50"
                  >
                    <img
                      src={imgUrl}
                      alt="new upload"
                      className="w-full h-36 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(idx)}
                        className="p-1.5 rounded-full bg-rose-600 text-white shadow hover:bg-rose-700 text-xs"
                      >
                        <BsTrash />
                      </button>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 bg-stone-900/80 text-amber-300 text-[10px] font-bold py-0.5 text-center">
                      New Upload
                    </div>
                  </div>
                ))}

                {existingImages.length === 0 && newImages.length === 0 && (
                  <div className="col-span-full py-12 text-center border-2 border-dashed border-stone-200 rounded-3xl p-6">
                    <FiImage className="mx-auto text-stone-300 text-4xl mb-2" />
                    <p className="text-sm font-semibold text-stone-600">No images uploaded yet</p>
                    <p className="text-xs text-stone-400 mt-1">
                      Upload high quality photographs of your Ethiopian craft creation.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: LIVE CARD PREVIEW */}
          {activeTab === "preview" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6 animate-in fade-in duration-200">
              <div className="pb-3 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold font-serif text-stone-900">
                    Live Marketplace Card Preview
                  </h2>
                  <p className="text-xs text-stone-500">
                    Real-time rendering of how customers in Addis Ababa and globally will view your item.
                  </p>
                </div>
              </div>

              <div className="max-w-xs mx-auto bg-white rounded-3xl border border-stone-200 shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="relative aspect-[4/5] bg-stone-100 overflow-hidden">
                  <img
                    src={
                      existingImages[featuredIndex]?.url ||
                      existingImages[0]?.url ||
                      newImages[0] ||
                      "/placeholder.jpg"
                    }
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {discountPercent > 0 && (
                      <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white font-black text-[10px] shadow">
                        -{discountPercent}%
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-sm text-amber-300 font-bold text-[10px] shadow">
                      {craftOrigin.split("(")[0].trim()}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow ${
                        Number(stock) > 0 ? "bg-emerald-700 text-white" : "bg-rose-700 text-white"
                      }`}
                    >
                      {Number(stock) > 0 ? `${stock} In Stock` : "Made-to-Order"}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                    {category}
                  </p>
                  <h4 className="font-bold text-stone-900 text-sm line-clamp-1 font-serif">
                    {name || "Habesha Artisan Kemis"}
                  </h4>

                  <div className="flex items-center gap-1 text-xs text-amber-500">
                    <AiFillStar />
                    <AiFillStar />
                    <AiFillStar />
                    <AiFillStar />
                    <AiFillStar />
                    <span className="text-stone-400 font-medium ml-1">(5.0)</span>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-baseline justify-between">
                    <div>
                      <span className="text-lg font-black text-stone-900 font-serif">
                        {sellingPrice.toLocaleString()} ETB
                      </span>
                      {origP > sellingPrice && (
                        <span className="text-xs text-stone-400 line-through ml-2 font-mono">
                          {origP.toLocaleString()} ETB
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ANALYTICS & PERFORMANCE */}
          {activeTab === "analytics" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6 animate-in fade-in duration-200">
              <h2 className="text-lg font-bold font-serif text-stone-900 pb-3 border-b border-stone-100">
                Craft Sales & Escrow Statistics
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60">
                  <p className="text-xs text-stone-500">Units Sold</p>
                  <p className="text-2xl font-black text-amber-900 font-serif mt-1">
                    {productData?.sold_out || 0}
                  </p>
                  <span className="text-[10px] text-amber-700 font-medium">Completed orders</span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/60">
                  <p className="text-xs text-stone-500">Gross Sales</p>
                  <p className="text-2xl font-black text-emerald-900 font-serif mt-1">
                    {(Number(productData?.sold_out || 0) * sellingPrice).toLocaleString()} ETB
                  </p>
                  <span className="text-[10px] text-emerald-700 font-medium">Customer volume</span>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <p className="text-xs text-stone-500">Customer Rating</p>
                  <p className="text-2xl font-black text-stone-900 font-serif mt-1">
                    {productData?.ratings || 5.0} ★
                  </p>
                  <span className="text-[10px] text-stone-500 font-medium">Verified buyer reviews</span>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/60">
                  <p className="text-xs text-stone-500">Dispute Rate</p>
                  <p className="text-2xl font-black text-blue-900 font-serif mt-1">0.0%</p>
                  <span className="text-[10px] text-blue-700 font-medium">Flawless escrow record</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600 flex items-start gap-2.5">
                <BsInfoCircle className="text-amber-800 shrink-0 mt-0.5" />
                <p>
                  Artisan payouts for this craft are held in escrow and released within 24 hours of customer delivery acceptance. Keep your stock and turnaround times accurate to maintain high marketplace seller rankings.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Summary Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-700 pb-3 border-b border-stone-100">
              Quick Craft Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">Status:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Active in Catalog
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Category:</span>
                <span className="font-semibold text-stone-900 truncate max-w-[160px] text-right">
                  {category}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Region:</span>
                <span className="font-semibold text-stone-900">{craftOrigin.split("(")[0]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Available Stock:</span>
                <span className="font-bold text-stone-900">{stock} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Tailoring Time:</span>
                <span className="font-semibold text-stone-900">{productionTime} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Sizes Available:</span>
                <span className="font-mono text-stone-900 font-bold">
                  {selectedSizes.join(", ") || "None"}
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
                <span>{loading ? "Saving Changes..." : "Save Craft Details"}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/shop-all-products")}
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

export default MerchantProductEditView;
