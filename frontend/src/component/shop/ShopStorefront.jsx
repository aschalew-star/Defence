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
} from "react-icons/bs";
import { MdOutlineVerified } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

function ShopStorefront() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

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
      } catch (err) {
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
        } catch (innerErr) {
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
    } catch (err) {
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
                </div>
              </div>
            </div>

            {/* Actions: Message Artisan & Share */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleMessageSubmit}
                className="flex-1 sm:flex-initial py-3 px-6 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 text-xs transition"
              >
                <BsChatDots className="text-sm" />
                <span>Message Artisan</span>
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
        </div>
      </div>

      {/* Products Catalog of this Store */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900 font-serif">
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
              className={`text-xs font-semibold px-4 py-2 rounded-full transition whitespace-nowrap ${
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
    </div>
  );
}

export default ShopStorefront;

