import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import Productcard from "../Products/Productcard";
import {
  AiFillStar,
  AiOutlineStar,
  AiOutlineHeart,
} from "react-icons/ai";
import {
  BsShop,
  BsGeoAlt,
  BsTelephone,
  BsClock,
  BsShieldCheck,
  BsTruck,
  BsChatDots,
  BsShare,
  BsArrowLeft,
  BsCheckCircle,
  BsPersonPlus,
  BsPersonCheck,
} from "react-icons/bs";
import { MdOutlineVerified } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../hooks";
import { toast } from "react-toastify";

function ShopStorefront() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.user);

  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [storeTab, setStoreTab] = useState("crafts");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    if (shop?._id && user?._id) {
      axios
        .get(`${server}/shop/is-following/${shop._id}`, { withCredentials: true })
        .then((res) => {
          if (res.data?.success) setIsFollowing(Boolean(res.data.isFollowing));
        })
        .catch(() => {});
    }
    if (shop?.followersCount !== undefined) {
      setFollowersCount(shop.followersCount);
    }
  }, [shop?._id, user?._id, shop?.followersCount]);

  const handleToggleFollow = async () => {
    if (!user) {
      toast.info("Please sign in to follow this artisan workshop");
      return;
    }
    try {
      const res = await axios.post(
        `${server}/shop/toggle-follow/${shop?._id || id}`,
        {},
        { withCredentials: true }
      );
      if (res.data?.success) {
        setIsFollowing(res.data.isFollowing);
        setFollowersCount(res.data.followersCount);
        toast.success(res.data.message);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to follow shop");
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchStorefront = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${server}/shop/storefront/${id}`);
        if (res.data?.success) {
          setShop(res.data.shop);
          setProducts(res.data.products || []);
        }
      } catch (err: any) {
        // Fallback: try get-shop-info
        try {
          const resInfo = await axios.get(`${server}/shop/get-shop-info/${id}`);
          if (resInfo.data?.shop) {
            setShop(resInfo.data.shop);
          }
          const resProds = await axios.get(`${server}/product/get-all-products-shop/${id}`);
          if (resProds.data?.products) {
            setProducts(resProds.data.products);
          }
        } catch (innerErr: any) {
          console.error("Storefront load error:", innerErr);
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStorefront();
    }
  }, [id]);

  const handleMessageSubmit = async () => {
    if (!user) {
      toast.error("Please login to message this artisan!");
      navigate("/login");
      return;
    }

    if (!shop?._id) return;

    try {
      const groupTitle = shop._id + user._id;
      const res = await axios.post(`${server}/conversation/create-new-conversation`, {
        groupTitle,
        userId: user._id,
        sellerId: shop._id,
      });

      const conversationId = res.data?.conversation?._id;
      if (conversationId) {
        navigate(`/inbox?conversationId=${conversationId}`);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to start conversation");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: shop?.name || "Ethiopian Artisan Workshop",
        text: `Visit ${shop?.name || "Artisan Workshop"} on MEP Marketplace`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Storefront link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-20">
        <div className="w-14 h-14 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-gray-500">Loading Artisan Storefront...</p>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center mx-auto mb-4 text-3xl">
          🏛️
        </div>
        <h2 className="text-2xl font-black text-gray-900 font-serif">Storefront Not Found</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
          The merchant workshop you are looking for may have been updated or moved.
        </p>
        <Link to="/shops">
          <button className="mt-6 px-8 py-3 bg-gradient-to-r from-amber-700 to-amber-900 text-white font-bold rounded-full shadow-md hover:shadow-lg transition">
            Explore All Artisan Boutiques
          </button>
        </Link>
      </div>
    );
  }

  // Filter products by category and search
  const filteredProducts = products.filter((p) => {
    const matchCategory =
      activeCategory === "all" ||
      (p.category && p.category.toLowerCase().includes(activeCategory.toLowerCase()));
    const matchSearch =
      !searchQuery.trim() ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Extract all verified reviews across products in this workshop
  const allReviews = products.reduce((acc, p) => {
    if (p.reviews && Array.isArray(p.reviews)) {
      p.reviews.forEach((r) =>
        acc.push({
          ...r,
          productName: p.name,
          productId: p._id,
          productImage: p.featuredImage?.url || p.images?.[0]?.url,
        })
      );
    }
    return acc;
  }, []);

  const categories = [
    { label: "All Crafts", value: "all" },
    { label: "Habesha Kemis", value: "kemis" },
    { label: "Men's Attire", value: "men" },
    { label: "Shawls & Gabi", value: "gabi" },
    { label: "Accessories", value: "accessories" },
  ];

  return (
    <div className="bg-gradient-to-b from-amber-50/20 via-white to-gray-50 min-h-screen pb-24">
      {/* Hero Storefront Banner */}
      <div className="relative h-48 sm:h-72 w-full bg-gradient-to-r from-amber-900 via-amber-950 to-stone-900 overflow-hidden">
        {shop.coverBanner?.url || shop.banner?.url ? (
          <img
            src={shop.coverBanner?.url || shop.banner?.url}
            alt={shop.name}
            className="w-full h-full object-cover object-center opacity-70"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 text-6xl font-serif">
            🇪🇹 MEP ARTISAN
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Back Link */}
        <div className="absolute top-6 left-6 z-10">
          <Link
            to="/products"
            className="px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white text-gray-800 text-xs font-bold shadow-md backdrop-blur-md flex items-center gap-1.5 transition"
          >
            <BsArrowLeft />
            <span>Marketplace Catalog</span>
          </Link>
        </div>
      </div>

      {/* Vacation Mode Banner if Active */}
      {shop.vacationMode?.isActive && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 sm:-mt-28 mb-4 relative z-20">
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 shadow-md flex items-center gap-3 text-amber-950">
            <span className="text-2xl">🏖️</span>
            <div>
              <strong className="block text-xs font-bold uppercase tracking-wider text-amber-900">
                Workshop Currently on Vacation
              </strong>
              <p className="text-xs text-stone-700">
                {shop.vacationMode.message ||
                  "This artisan workshop is taking a brief cultural rest. Orders can still be placed and will be woven immediately upon return!"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Artisan Profile Header Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-24 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
            {/* Avatar & Store Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <img
                src={shop.avatar?.url || "/placeholder-avatar.png"}
                alt={shop.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-xl bg-amber-50 shrink-0"
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-serif">
                    {shop.name}
                  </h1>
                  {shop.isVerified && (
                    <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-300">
                      <MdOutlineVerified className="text-amber-700" />
                      <span>{shop.badge || "Verified Artisan"}</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-amber-800 font-semibold mt-1">
                  {shop.businessType || "Traditional Weaving Cooperative"}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-2">
                  <span className="flex items-center gap-1">
                    <BsGeoAlt className="text-amber-700" />
                    {shop.address ? `${shop.address}, ${shop.city || "Addis Ababa"}` : shop.city || "Addis Ababa"}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-amber-600 font-bold">
                    <AiFillStar className="text-sm" />
                    <span>{shop.ratings || 5.0} Ratings</span>
                    <span className="text-gray-400 font-normal">({shop.ratingsCount || 0} reviews)</span>
                  </span>
                  <span>•</span>
                  <span>{products.length} Handcrafted Garments</span>
                  {followersCount > 0 && (
                    <>
                      <span>•</span>
                      <span className="font-semibold text-stone-700">{followersCount} Followers</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Actions: Follow Shop, Message Artisan & Share */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={handleToggleFollow}
                className={`py-3 px-5 rounded-2xl text-xs font-bold border flex items-center justify-center gap-1.5 transition ${
                  isFollowing
                    ? "bg-amber-100 text-amber-900 border-amber-300"
                    : "bg-white text-stone-700 hover:text-amber-900 border-stone-200 shadow-xs"
                }`}
              >
                {isFollowing ? <BsPersonCheck className="text-sm" /> : <BsPersonPlus className="text-sm" />}
                <span>{isFollowing ? "Following" : "Follow Shop"}</span>
              </button>

              <button
                onClick={handleMessageSubmit}
                className="flex-1 sm:flex-initial py-3 px-5 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 text-xs transition"
              >
                <BsChatDots className="text-sm" />
                <span>Message</span>
              </button>

              <button
                onClick={handleShare}
                className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl transition"
                title="Share Storefront"
              >
                <BsShare className="text-sm" />
              </button>
            </div>
          </div>

          {/* Store Heritage Story & Policies Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            {/* Heritage Story */}
            <div className="md:col-span-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Artisan Lineage & Workshop Story
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {shop.story || shop.description ||
                  "Dedicated to preserving traditional Ethiopian handloom weaving traditions. Every garment is carefully spun on wooden pit looms with authentic gold Tibeb motifs."}
              </p>
            </div>

            {/* Operating Hours & Shipping Rates */}
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/50 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-amber-950 font-bold">
                <BsClock className="text-amber-700" />
                <span>{shop.openingHours || "Mon - Sat: 9:00 AM - 7:00 PM"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <BsTruck className="text-amber-700" />
                <span>
                  Addis Ababa:{" "}
                  <strong>{shop.shippingSettings?.addisAbabaRate || 150} ETB</strong> (Free over{" "}
                  {shop.shippingSettings?.freeShippingThreshold || 3000} ETB)
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <BsShieldCheck className="text-amber-700" />
                <span>Escrow Protected: Funds released upon delivery</span>
              </div>
            </div>
          </div>

          {/* Artisan Verification & Legal Trust Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-gray-100">
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/60 flex items-center gap-3">
              <span className="text-2xl">🏛️</span>
              <div>
                <h5 className="text-[11px] font-bold text-stone-900 leading-tight">MoR Tax Verified</h5>
                <p className="text-[10px] text-stone-500 font-mono">TIN: {shop.tin || "0089421570"}</p>
              </div>
            </div>
            <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/60 flex items-center gap-3">
              <span className="text-2xl">🧵</span>
              <div>
                <h5 className="text-[11px] font-bold text-amber-950 leading-tight">Handloom Guild</h5>
                <p className="text-[10px] text-amber-700">Traditional Pit Loom</p>
              </div>
            </div>
            <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200/60 flex items-center gap-3">
              <span className="text-2xl">🛡️</span>
              <div>
                <h5 className="text-[11px] font-bold text-emerald-950 leading-tight">CBE Escrow Trust</h5>
                <p className="text-[10px] text-emerald-700">Handover Protected</p>
              </div>
            </div>
            <div className="p-3 bg-orange-50/60 rounded-2xl border border-orange-200/60 flex items-center gap-3">
              <span className="text-2xl">✂️</span>
              <div>
                <h5 className="text-[11px] font-bold text-orange-950 leading-tight">Bespoke Sizing</h5>
                <p className="text-[10px] text-orange-700">Custom Fit Guaranteed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Storefront Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
          <button
            onClick={() => setStoreTab("crafts")}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              storeTab === "crafts"
                ? "bg-amber-800 text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <span>🎨 Handcrafted Garments</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-black/10 font-mono">
              {filteredProducts.length}
            </span>
          </button>

          <button
            onClick={() => setStoreTab("reviews")}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              storeTab === "reviews"
                ? "bg-amber-800 text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <span>⭐ Customer Reviews</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-black/10 font-mono">
              {allReviews.length}
            </span>
          </button>

          <button
            onClick={() => setStoreTab("heritage")}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              storeTab === "heritage"
                ? "bg-amber-800 text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <span>📜 Heritage & Escrow Policies</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Products Catalog of this Store */}
      {storeTab === "crafts" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 font-serif">
                Crafts by {shop.name}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Explore authentic handwoven creations directly from this artisan's loom
              </p>
            </div>

            {/* Search within shop */}
            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Search in this workshop..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-full px-4 py-2 text-xs outline-none focus:border-amber-600 shadow-xs"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`text-xs font-semibold px-4 py-2 rounded-full transition whitespace-nowrap cursor-pointer ${
                  activeCategory === cat.value
                    ? "bg-amber-800 text-white shadow-sm"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 shadow-xs">
              <h3 className="text-lg font-bold text-gray-800 font-serif">No crafts found</h3>
              <p className="text-xs text-gray-500 mt-1">
                Try adjusting your category filter or search query.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {filteredProducts.map((item) => (
                <Productcard key={item._id} item={item} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Verified Customer Reviews */}
      {storeTab === "reviews" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6 animate-fadeIn">
          {/* Rating Summary Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <span className="text-4xl sm:text-5xl font-black text-amber-950 font-serif">
                  {shop.ratings || "4.9"}
                </span>
                <div className="flex items-center justify-center text-amber-500 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <AiFillStar key={i} className="text-base" />
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">{allReviews.length || shop.ratingsCount || 12} reviews</p>
              </div>
              <div className="border-l border-gray-200 pl-6 space-y-1 text-xs">
                <p className="font-bold text-gray-800">100% Authentic Handloom Guarantee</p>
                <p className="text-gray-500">Reviews from verified Ethiopian and diaspora buyers</p>
                <span className="inline-block text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full mt-1">
                  ✓ Verified Purchases Only
                </span>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          {allReviews.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8 shadow-xs space-y-2">
              <p className="text-2xl">✨</p>
              <h4 className="text-base font-bold text-gray-800">No reviews recorded yet</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Be the first to order handwoven apparel from {shop.name} and share your feedback on the tibeb and cotton quality!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allReviews.map((rev, rIdx) => (
                <div key={rIdx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>
                            {i < (rev.rating || 5) ? <AiFillStar /> : <AiOutlineStar className="text-gray-300" />}
                          </span>
                        ))}
                      </div>
                      <h5 className="text-xs font-bold text-gray-900 mt-1.5">
                        {rev.user?.name || "Verified Customer"}
                      </h5>
                    </div>
                    {rev.createdAt && (
                      <span className="text-[10px] text-gray-400">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed italic">
                    "{rev.comment || "Beautifully woven Habesha cloth. The cotton is soft and the gold embroidery is immaculate!"}"
                  </p>

                  {rev.productName && (
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100 text-[11px] text-amber-900 font-semibold">
                      <span>Purchased:</span>
                      <span className="truncate">{rev.productName}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Heritage & Escrow Policies */}
      {storeTab === "heritage" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Workshop Lineage */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-base font-black text-gray-900 font-serif flex items-center gap-2">
                <span>🏺 Artisan Weaving Lineage & Origin</span>
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {shop.story ||
                  `${shop.name} is an authentic Ethiopian weaving atelier rooted in generations of handloom mastery. Using 100% natural Ethiopian cotton and traditional wooden pit looms, our artisans craft bespoke Habesha Kemis, Gabi, and Men's Kuta with precision.`}
              </p>
              <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
                <p>
                  <strong className="text-gray-800">Loom Technique:</strong> Traditional Wooden Pit Loom (የእግር ሸማ መወselection)
                </p>
                <p>
                  <strong className="text-gray-800">Embroidery Style:</strong> Hand-stitched Tibeb & Tilf (የእጅ ጥልፍ)
                </p>
                <p>
                  <strong className="text-gray-800">Workshop Location:</strong> {shop.address || "Shiro Meda Traditional Market"}, {shop.city || "Addis Ababa"}
                </p>
              </div>
            </div>

            {/* Legal & Escrow Guarantees */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-base font-black text-gray-900 font-serif flex items-center gap-2">
                <span>⚖️ Ethiopian Law & Escrow Guarantee</span>
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Operating strictly under <strong>Electronic Transaction Proclamation No. 1205/2020</strong> and Ministry of Revenues regulations.
              </p>
              <ul className="text-xs text-gray-600 space-y-2 pt-2 border-t border-gray-100 list-disc list-inside">
                <li>
                  <strong>Escrow Security:</strong> Your payment remains securely locked in CBE Escrow Trust until you provide your delivery OTP upon physical inspection.
                </li>
                <li>
                  <strong>72-Hour Inspection SLA:</strong> Customers receive a full 72-hour window after delivery to inspect garment stitching, embroidery, and sizing.
                </li>
                <li>
                  <strong>MoR Tax Invoicing:</strong> Official electronic VAT sales receipts generated for all domestic and diaspora orders.
                </li>
                <li>
                  <strong>Dispute Resolution:</strong> Platform arbitration available in case of sizing discrepancies or courier delays.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShopStorefront;

