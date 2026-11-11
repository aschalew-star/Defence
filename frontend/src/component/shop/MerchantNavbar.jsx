import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  BsShieldCheck,
  BsShieldExclamation,
  BsCashCoin,
  BsPlusLg,
  BsChatDots,
  BsShop,
  BsBoxArrowRight,
  BsGear,
} from "react-icons/bs";
import { FiExternalLink } from "react-icons/fi";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";

const MerchantNavbar = () => {
  const { seller } = useSelector((state) => state.seller || {});
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const availableBalance = seller?.availableBalance || 0;
  const isVerified = seller?.isVerified || seller?.verificationStatus === "Verified";

  const handleLogout = async () => {
    try {
      await axios.get(`${server}/shop/logout`, { withCredentials: true });
      toast.success("Logged out from artisan portal");
      navigate("/shop-login");
      window.location.reload();
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-stone-200 px-4 sm:px-6 flex items-center justify-between select-none shadow-sm">
      {/* Left: Artisan Store Identity */}
      <div className="flex items-center gap-3">
        <Link to="/Dashboard" className="flex items-center gap-2.5 group">
          {seller?.avatar?.url ? (
            <img
              src={seller.avatar.url}
              alt={seller.name}
              className="w-9 h-9 rounded-xl object-cover border border-amber-300 shadow-sm"
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-500 text-white flex items-center justify-center font-serif font-black text-base shadow-sm">
              {seller?.name ? seller.name.charAt(0).toUpperCase() : "A"}
            </div>
          )}

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold text-base text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-1">
                {seller?.name || "Artisan Workshop"}
              </span>
              {isVerified ? (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  <BsShieldCheck size={11} /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  <BsShieldExclamation size={11} /> Unverified
                </span>
              )}
            </div>
            <div className="text-[10px] text-stone-500 font-medium hidden sm:block">
              {seller?.businessType || "Artisan Workshop"} • Addis Ababa
            </div>
          </div>
        </Link>
      </div>

      {/* Right: Available Balance, Actions & Store Dropdown */}
      <div className="flex items-center gap-3">
        {/* Live Available Balance Pill */}
        <Link
          to="/Dashboard"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 hover:bg-emerald-100 transition-all text-xs"
          title="Cleared funds available for withdrawal"
        >
          <BsCashCoin size={15} className="text-emerald-700" />
          <span className="font-bold">
            {Number(availableBalance).toLocaleString()}{" "}
            <span className="text-[10px] font-normal text-emerald-700">ETB</span>
          </span>
        </Link>

        {/* Quick Add Product Button */}
        <Link
          to="/create-product"
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <BsPlusLg size={12} />
          <span>New Craft</span>
        </Link>

        {/* Messages Shortcut */}
        <Link
          to="/Message"
          className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-all relative"
          title="Customer Messages"
        >
          <BsChatDots size={16} />
        </Link>

        {/* Public Storefront Link */}
        {seller?._id && (
          <Link
            to={`/`}
            target="_blank"
            className="hidden lg:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-medium transition-all"
          >
            <span>View Marketplace</span>
            <FiExternalLink size={12} />
          </Link>
        )}

        {/* Merchant Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-stone-100 transition-all border border-transparent hover:border-stone-200"
          >
            {seller?.avatar?.url ? (
              <img
                src={seller.avatar.url}
                alt={seller.name}
                className="w-8 h-8 rounded-lg object-cover border border-stone-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-stone-800 text-white flex items-center justify-center font-bold text-xs">
                {seller?.name ? seller.name.charAt(0).toUpperCase() : "M"}
              </div>
            )}
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-stone-900 leading-tight">
                {seller?.name || "Merchant"}
              </div>
              <div className="text-[10px] text-stone-500">Store Manager</div>
            </div>
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-stone-200 rounded-2xl shadow-xl p-2 space-y-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-stone-100">
                <div className="font-semibold text-stone-900 truncate">
                  {seller?.name || "Merchant Store"}
                </div>
                <div className="text-[11px] text-stone-500 truncate">{seller?.email}</div>
              </div>

              <Link
                to="/Dashboard"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors"
              >
                <BsShop size={14} className="text-stone-500" />
                <span>Store Dashboard</span>
              </Link>
              <Link
                to="/Shopallprodcts"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors"
              >
                <BsGear size={14} className="text-stone-500" />
                <span>Manage Catalog</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors text-left"
              >
                <BsBoxArrowRight size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default MerchantNavbar;
