import React, { useState } from "react";
import { Link } from "react-router-dom";
import { RxCross2 } from "react-icons/rx";
import {
  AiFillStar,
  AiOutlineStar,
  AiOutlineDelete,
  AiOutlineCopy,
  AiOutlineCheck,
} from "react-icons/ai";
import {
  FiExternalLink,
  FiPackage,
  FiTag,
  FiClock,
  FiTruck,
  FiLayers,
  FiPercent,
  FiShoppingBag,
  FiTrendingUp,
  FiEdit,
} from "react-icons/fi";
import {
  BsShieldCheck,
  BsBoxSeam,
  BsCashCoin,
  BsCurrencyDollar,
  BsGlobeAmericas,
  BsTools,
} from "react-icons/bs";
import { toast } from "react-toastify";
import axios from "axios";
import { server } from "../../server";

export interface MerchantProductDetailModalProps {
  item: any;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onProductUpdated?: (updated: any) => void;
  onEdit?: (item: any) => void;
}

const MerchantProductDetailModal: React.FC<MerchantProductDetailModalProps> = ({
  item,
  onClose,
  onDelete,
  onProductUpdated,
  onEdit,
}) => {
  const [selectedImg, setSelectedImg] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [copied, setCopied] = useState(false);

  // Quick Stock adjustment state
  const [quickStock, setQuickStock] = useState(item?.stock || 0);
  const [updatingStock, setUpdatingStock] = useState(false);

  if (!item) return null;

  const images =
    item.images && item.images.length > 0
      ? item.images
      : [{ url: item.featuredImage?.url || "/photo.jpg" }];

  const currentPrice = Number(item.discountPrice || item.originalPrice || 0);
  const originalPrice = Number(item.originalPrice || 0);
  const hasDiscount = originalPrice > 0 && currentPrice < originalPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;
  const discountSaved = hasDiscount ? originalPrice - currentPrice : 0;

  const unitsSold = Number(item.sold_out || 0);
  const estimatedRevenue = unitsSold * currentPrice;

  const ratingValue = item.ratings || 5;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/product/${item._id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Craft link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveStock = async () => {
    if (quickStock < 0) {
      toast.error("Stock cannot be negative!");
      return;
    }
    setUpdatingStock(true);
    try {
      const res = await axios.put(
        `${server}/product/update-product/${item._id}`,
        { stock: Number(quickStock) },
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.success(`Inventory stock updated to ${quickStock} units!`);
        if (onProductUpdated) {
          onProductUpdated({ ...item, stock: Number(quickStock) });
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update inventory stock");
    } finally {
      setUpdatingStock(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-stone-200 my-auto">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-2.5 py-1 rounded-md bg-stone-800 text-amber-300 font-mono text-xs font-semibold border border-stone-700">
              SKU: {item.sku || item._id.slice(-8).toUpperCase()}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-stone-800 text-stone-300 text-xs font-medium">
              {item.category || "Authentic Craft"}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                item.stock > 5
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : item.stock > 0
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
              }`}
            >
              {item.stock > 5 ? "In Stock" : item.stock > 0 ? "Low Stock Alert" : "Sold Out"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition"
              title="Copy public link"
            >
              {copied ? <AiOutlineCheck className="text-emerald-400" /> : <AiOutlineCopy />}
              <span>{copied ? "Copied" : "Share Link"}</span>
            </button>

            <Link
              to={`/product/${item._id}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition"
              title="View on buyer marketplace"
            >
              <span>Marketplace View</span>
              <FiExternalLink size={13} />
            </Link>

            <Link
              to={`/dashboard/edit-product/${item._id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs"
              title="Open full-page editor"
            >
              <FiEdit size={13} />
              <span>Edit Page</span>
            </Link>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition"
              title="Close modal"
            >
              <RxCross2 size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body: Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto flex-1">
          {/* Left Column: Visual Media Gallery (5 cols) */}
          <div className="lg:col-span-5 p-6 bg-stone-50 border-r border-stone-200 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Primary Image Viewer */}
              <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-white shadow-md border border-stone-200 group">
                <img
                  src={images[selectedImg]?.url || "/photo.jpg"}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Primary Tag */}
                {selectedImg === 0 && (
                  <span className="absolute top-3 left-3 bg-stone-900/85 backdrop-blur-sm text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                    Cover Photo
                  </span>
                )}

                {hasDiscount && (
                  <span className="absolute top-3 right-3 bg-rose-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-md">
                    -{discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImg(idx)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        selectedImg === idx
                          ? "border-amber-600 scale-105 shadow-sm"
                          : "border-stone-300 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Authenticity Badge */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-200/60 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm font-bold">
                <BsShieldCheck size={18} />
              </div>
              <div className="text-xs">
                <div className="font-bold text-amber-950">Ethiopian Heritage Craft</div>
                <div className="text-stone-600 text-[11px]">
                  Handmade by verified artisan workshops.
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Product Specs & Tabs (7 cols) */}
          <div className="lg:col-span-7 p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              {/* Product Title & Basic Stats */}
              <div>
                <h2 className="text-2xl font-bold font-serif text-stone-900 leading-snug">
                  {item.name}
                </h2>
                <div className="flex items-center gap-4 mt-2 text-xs text-stone-500">
                  <div className="flex items-center gap-1 text-amber-600">
                    <AiFillStar />
                    <span className="font-bold text-stone-800">{ratingValue}</span>
                    <span className="text-stone-400">({item.numOfReviews || 0} reviews)</span>
                  </div>
                  <span>•</span>
                  <span>Listed on {new Date(item.createdAt || Date.now()).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="font-semibold text-stone-700">{unitsSold} units sold</span>
                </div>
              </div>

              {/* Segmented Navigation Tabs */}
              <div className="flex border-b border-stone-200 gap-2">
                {[
                  { id: "overview", label: "Commercials & Stock" },
                  { id: "heritage", label: "Artisan Heritage" },
                  { id: "logistics", label: "Variants & Shipping" },
                  { id: "reviews", label: `Buyer Feedback (${item.numOfReviews || 0})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-2.5 px-2 text-xs font-bold transition-all relative ${
                      activeTab === tab.id
                        ? "text-amber-800 border-b-2 border-amber-600"
                        : "text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: OVERVIEW & INVENTORY */}
              {activeTab === "overview" && (
                <div className="space-y-5 animate-fadeIn">
                  {/* Financial & Pricing Matrix */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                      <div className="text-[11px] text-stone-500 uppercase font-semibold flex items-center gap-1">
                        <BsCashCoin className="text-emerald-700" /> Selling Price
                      </div>
                      <div className="text-xl font-bold font-serif text-stone-900 mt-1">
                        {currentPrice.toLocaleString()}{" "}
                        <span className="text-xs font-normal text-stone-500">ETB</span>
                      </div>
                      {hasDiscount && (
                        <div className="text-[11px] text-stone-400 line-through">
                          {originalPrice.toLocaleString()} ETB
                        </div>
                      )}
                    </div>

                    <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                      <div className="text-[11px] text-stone-500 uppercase font-semibold flex items-center gap-1">
                        <FiPercent className="text-amber-600" /> Margin Discount
                      </div>
                      <div className="text-xl font-bold text-amber-800 mt-1">
                        {hasDiscount ? `-${discountPercent}%` : "Standard"}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {hasDiscount ? `Save ${discountSaved.toLocaleString()} ETB` : "No discount"}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 col-span-2 sm:col-span-1">
                      <div className="text-[11px] text-stone-500 uppercase font-semibold flex items-center gap-1">
                        <BsCurrencyDollar className="text-blue-700" /> Diaspora USD Price
                      </div>
                      <div className="text-xl font-bold font-serif text-stone-900 mt-1">
                        {item.usdPrice ? `$${item.usdPrice.toLocaleString()}` : "N/A"}
                      </div>
                      <div className="text-[11px] text-stone-500">International order ready</div>
                    </div>
                  </div>

                  {/* Stock Health & Live Sales Performance */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="font-bold text-stone-900 flex items-center gap-1.5">
                        <FiTrendingUp className="text-emerald-700" /> Inventory & Revenue Summary
                      </div>
                      <div className="text-stone-500 font-mono text-[11px]">
                        Est. Revenue:{" "}
                        <span className="font-bold text-emerald-800">
                          {estimatedRevenue.toLocaleString()} ETB
                        </span>
                      </div>
                    </div>

                    {/* Stock Progress Bar */}
                    <div>
                      <div className="flex justify-between text-[11px] text-stone-600 mb-1">
                        <span>Current Stock: {item.stock} remaining</span>
                        <span>Sold: {unitsSold} units</span>
                      </div>
                      <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.stock > 5 ? "bg-emerald-600" : item.stock > 0 ? "bg-amber-500" : "bg-rose-500"
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(10, ((item.stock || 1) / ((item.stock || 1) + unitsSold)) * 100)
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Quick Restock In-Modal Stepper */}
                    <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between gap-3 flex-wrap">
                      <span className="text-xs font-semibold text-stone-700">Quick Restock:</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setQuickStock((prev) => Math.max(0, Number(prev) - 1))}
                          className="w-8 h-8 rounded-lg bg-white border border-stone-300 text-stone-700 font-bold hover:bg-stone-100 flex items-center justify-center transition"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={quickStock}
                          onChange={(e) => setQuickStock(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-16 h-8 text-center border border-stone-300 rounded-lg text-xs font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => setQuickStock((prev) => Number(prev) + 1)}
                          className="w-8 h-8 rounded-lg bg-white border border-stone-300 text-stone-700 font-bold hover:bg-stone-100 flex items-center justify-center transition"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveStock}
                          disabled={updatingStock || quickStock === item.stock}
                          className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-semibold transition"
                        >
                          {updatingStock ? "Saving..." : "Update Stock"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Description Preview */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-stone-700">Description:</span>
                    <p className="text-xs text-stone-600 leading-relaxed whitespace-pre-line max-h-32 overflow-y-auto bg-stone-50 p-3 rounded-xl border border-stone-200">
                      {item.description || "No product description provided."}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: ARTISAN HERITAGE & CRAFTSMANSHIP */}
              {activeTab === "heritage" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="text-[11px] font-semibold text-stone-500">Fabric / Shemma Type</span>
                      <div className="font-bold text-stone-900 mt-0.5">
                        {item.fabricDetails?.shemmaType || "Authentic Handspun Shemma"}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="text-[11px] font-semibold text-stone-500">Weaving Technique</span>
                      <div className="font-bold text-stone-900 mt-0.5">
                        {item.fabricDetails?.weavingTechnique || "Traditional Handloom Pit-Weave"}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="text-[11px] font-semibold text-stone-500">Tibeb Motif / Pattern</span>
                      <div className="font-bold text-stone-900 mt-0.5">
                        {item.fabricDetails?.tibebPattern || "Classical Ethiopian Geometric Embroidery"}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="text-[11px] font-semibold text-stone-500">Thread Material</span>
                      <div className="font-bold text-stone-900 mt-0.5">
                        {item.fabricDetails?.threadType || "100% Ethiopian Organic Cotton & Tilf"}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="text-[11px] font-semibold text-stone-500">Artisan Origin Region</span>
                      <div className="font-bold text-stone-900 mt-0.5">
                        {item.fabricDetails?.artisanRegion || "Addis Ababa Craft Center"}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="text-[11px] font-semibold text-stone-500">Crafting / Production Time</span>
                      <div className="font-bold text-stone-900 mt-0.5">
                        {item.customizationOptions?.estimatedProductionDays || 3} days made-to-order
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs space-y-1">
                    <span className="font-bold text-amber-900">Customization & Bespoke Sizing:</span>
                    <p className="text-stone-700">
                      {item.customizationOptions?.isCustomizable
                        ? "✓ This craft accepts personalized bespoke tailoring and customer measurements."
                        : "Standard ready-to-wear sizing specifications."}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: VARIANTS & LOGISTICS */}
              {activeTab === "logistics" && (
                <div className="space-y-4 animate-fadeIn text-xs">
                  {/* Shipping Parameters */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="text-[11px] text-stone-500 font-semibold flex items-center gap-1">
                        <FiPackage /> Package Weight
                      </span>
                      <div className="font-bold text-stone-900 mt-1">
                        {item.shippingDetails?.weightKg || 0.8} kg
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="text-[11px] text-stone-500 font-semibold flex items-center gap-1">
                        <BsBoxSeam /> Handling
                      </span>
                      <div className="font-bold text-stone-900 mt-1">
                        {item.shippingDetails?.isFragile ? "Fragile Packaging" : "Standard Care"}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="text-[11px] text-stone-500 font-semibold flex items-center gap-1">
                        <FiTruck /> Local Express
                      </span>
                      <div className="font-bold text-stone-900 mt-1">
                        {item.shippingDetails?.localExpressAvailable ? "Supported" : "Standard Route"}
                      </div>
                    </div>
                  </div>

                  {/* Multi-variant Matrix */}
                  <div className="space-y-2">
                    <span className="font-bold text-stone-800">Product Variants:</span>
                    {item.variants && item.variants.length > 0 ? (
                      <div className="overflow-x-auto rounded-xl border border-stone-200">
                        <table className="min-w-full text-left text-xs divide-y divide-stone-200">
                          <thead className="bg-stone-50 text-stone-600">
                            <tr>
                              <th className="py-2 px-3">Variant Title</th>
                              <th className="py-2 px-3">Size</th>
                              <th className="py-2 px-3">Color</th>
                              <th className="py-2 px-3">Price (ETB)</th>
                              <th className="py-2 px-3">Stock</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100 bg-white">
                            {item.variants.map((v, i) => (
                              <tr key={i}>
                                <td className="py-2 px-3 font-semibold text-stone-900">{v.title || "Default"}</td>
                                <td className="py-2 px-3 text-stone-600">{v.size || "-"}</td>
                                <td className="py-2 px-3 text-stone-600">{v.color || "-"}</td>
                                <td className="py-2 px-3 font-bold text-stone-900">
                                  {v.price ? Number(v.price).toLocaleString() : currentPrice.toLocaleString()}
                                </td>
                                <td className="py-2 px-3">{v.stock || 0}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-stone-500 bg-stone-50 rounded-xl border border-stone-200">
                        No specific variant matrix registered. Sold as standard catalog item.
                      </div>
                    )}
                  </div>

                  {/* Search Tags */}
                  {item.tags && (
                    <div className="space-y-1.5">
                      <span className="font-bold text-stone-800 flex items-center gap-1">
                        <FiTag /> Search & Discovery Tags:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.tags.split(",").map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[11px] font-medium"
                          >
                            #{t.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: REVIEWS & FEEDBACK */}
              {activeTab === "reviews" && (
                <div className="space-y-4 animate-fadeIn text-xs">
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold font-serif text-stone-900">
                        {ratingValue} <span className="text-base font-normal text-stone-400">/ 5</span>
                      </div>
                      <div className="flex items-center text-amber-500 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <AiFillStar
                            key={star}
                            className={star <= Math.round(ratingValue) ? "text-amber-500" : "text-stone-300"}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-right text-stone-500">
                      <div className="font-bold text-stone-900">{item.numOfReviews || 0} Ratings</div>
                      <div className="text-[11px]">Direct verified buyer feedback</div>
                    </div>
                  </div>

                  {item.reviews && item.reviews.length > 0 ? (
                    <div className="space-y-2.5 max-h-48 overflow-y-auto">
                      {item.reviews.map((rev, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-white border border-stone-200 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-stone-900">{rev.user?.name || "Verified Customer"}</span>
                            <div className="flex text-amber-500 text-xs">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <AiFillStar
                                  key={s}
                                  className={s <= rev.rating ? "text-amber-500" : "text-stone-200"}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-stone-600 text-[11px]">{rev.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-stone-500 bg-stone-50 rounded-2xl border border-stone-200">
                      <p className="font-semibold text-stone-700">No customer reviews yet</p>
                      <p className="text-[11px] text-stone-400 mt-1">
                        Reviews from happy buyers will appear here automatically as orders complete.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Action Bar */}
            <div className="pt-4 border-t border-stone-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  if (onDelete) onDelete(item._id);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold transition"
              >
                <AiOutlineDelete size={16} />
                <span>Delete Craft</span>
              </button>

              <div className="flex items-center gap-2">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition inline-flex items-center gap-1.5"
                  >
                    <FiEdit size={13} />
                    <span>Edit Specifications</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition"
                >
                  Close Preview
                </button>
                <Link
                  to={`/product/${item._id}`}
                  target="_blank"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition inline-flex items-center gap-1.5"
                >
                  <span>Open Public Page</span>
                  <FiExternalLink size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MerchantProductDetailModal;
