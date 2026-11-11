import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import { AiFillStar, AiOutlineSearch } from "react-icons/ai";
import { BsShop, BsGeoAlt, BsCheckCircleFill, BsArrowRight } from "react-icons/bs";
import { MdOutlineVerified } from "react-icons/md";

function ArtisanDirectory() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRegion, setFilterRegion] = useState("all");

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchShops = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${server}/shop/all-shops`);
        if (res.data?.success) {
          setShops(res.data.shops || []);
        }
      } catch (err) {
        console.error("Failed to load artisan directory:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  const filteredShops = shops.filter((shop) => {
    const matchSearch =
      !search.trim() ||
      shop.name?.toLowerCase().includes(search.toLowerCase()) ||
      shop.description?.toLowerCase().includes(search.toLowerCase()) ||
      shop.city?.toLowerCase().includes(search.toLowerCase());

    const matchRegion =
      filterRegion === "all" ||
      (shop.city && shop.city.toLowerCase().includes(filterRegion.toLowerCase()));

    return matchSearch && matchRegion;
  });

  const regions = [
    { label: "All Regions", value: "all" },
    { label: "Addis Ababa (Shiro Meda / Piazza)", value: "addis" },
    { label: "Gondar", value: "gondar" },
    { label: "Bahir Dar", value: "bahir" },
    { label: "Harar", value: "harar" },
    { label: "Hawassa", value: "hawassa" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-950 to-stone-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl mb-10 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="text-amber-400 font-bold uppercase tracking-widest text-xs flex items-center gap-1.5 mb-2">
            🇪🇹 MEP Verified Artisan Directory
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-serif leading-tight">
            Discover Master Ethiopian Weavers & Boutiques
          </h1>
          <p className="text-amber-100/80 text-sm sm:text-base mt-3 leading-relaxed">
            Support local craftsmen, family-owned workshops, and weaving cooperatives directly from the historic handloom capitals of Ethiopia.
          </p>
        </div>
        <div className="absolute right-4 bottom-4 text-white/5 text-9xl font-serif pointer-events-none select-none hidden md:block">
          ሸማ
        </div>
      </div>

      {/* Search & Region Filter Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <AiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            placeholder="Search by workshop name, artisan, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-xs sm:text-sm outline-none focus:border-amber-600 focus:bg-white transition"
          />
        </div>

        {/* Region Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 no-scrollbar">
          {regions.map((reg) => (
            <button
              key={reg.value}
              onClick={() => setFilterRegion(reg.value)}
              className={`text-xs font-semibold px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
                filterRegion === reg.value
                  ? "bg-amber-800 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {reg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Content */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-gray-500 font-medium">Gathering certified artisans across Ethiopia...</p>
        </div>
      ) : filteredShops.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center mx-auto mb-3 text-2xl">
            🏛️
          </div>
          <h3 className="text-lg font-bold text-gray-800 font-serif">No artisan workshops matched your search</h3>
          <p className="text-xs text-gray-500 mt-1">Try resetting the region filter or searching with different keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShops.map((shop) => (
            <div
              key={shop._id}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              {/* Cover Banner */}
              <div className="relative h-28 bg-gradient-to-r from-amber-800 to-amber-950 overflow-hidden">
                {shop.coverBanner?.url || shop.banner?.url ? (
                  <img
                    src={shop.coverBanner?.url || shop.banner?.url}
                    alt={shop.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/10 font-serif text-3xl font-black">
                    MEP
                  </div>
                )}
                {shop.isVerified && (
                  <span className="absolute top-3 right-3 bg-white/90 text-amber-900 font-bold text-[10px] px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 backdrop-blur-xs">
                    <MdOutlineVerified className="text-amber-700" />
                    <span>{shop.badge || "Verified"}</span>
                  </span>
                )}
              </div>

              {/* Shop Body */}
              <div className="p-6 pt-0 relative flex-1 flex flex-col justify-between">
                <div>
                  {/* Avatar Overlay */}
                  <div className="-mt-12 mb-3">
                    <img
                      src={shop.avatar?.url || "/placeholder-avatar.png"}
                      alt={shop.name}
                      className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md bg-amber-50"
                    />
                  </div>

                  {/* Name & Type */}
                  <h3 className="text-lg font-bold text-gray-900 font-serif group-hover:text-amber-800 transition">
                    {shop.name}
                  </h3>
                  <p className="text-[11px] font-semibold text-amber-800 uppercase tracking-wide mt-0.5">
                    {shop.businessType || "Artisan Workshop"}
                  </p>

                  {/* Location & Rating */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                    <span className="flex items-center gap-1 truncate">
                      <BsGeoAlt className="text-amber-700 shrink-0" />
                      <span className="truncate">{shop.city || "Addis Ababa"}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-amber-600 font-bold shrink-0">
                      <AiFillStar />
                      <span>{shop.ratings || 5.0}</span>
                    </span>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-gray-600 mt-3 line-clamp-2 leading-relaxed">
                    {shop.description || shop.story || "Specialized in genuine handwoven Ethiopian traditional kemis and cultural garments."}
                  </p>
                </div>

                {/* Footer Link */}
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400 font-medium">
                    {shop.shippingSettings?.addisAbabaRate ? `Delivery from ${shop.shippingSettings.addisAbabaRate} ETB` : "Express Delivery"}
                  </span>

                  <Link to={`/shop/storefront/${shop.slug || shop._id}`}>
                    <button className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-xl text-xs flex items-center gap-1.5 transition">
                      <span>Visit Workshop</span>
                      <BsArrowRight className="text-xs" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ArtisanDirectory;

