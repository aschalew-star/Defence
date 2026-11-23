import React from "react";
import { Link } from "react-router-dom";
import { BsShop, BsArrowRight } from "react-icons/bs";
import { FiArrowLeft } from "react-icons/fi";

const ShopHeader = ({ isLogin = false }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-stone-900 border-b border-stone-800 px-4 sm:px-8 flex items-center justify-between text-white select-none">
      {/* Brand */}
      <Link to="/" className="flex items-center gap-2.5 group">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-500 text-white flex items-center justify-center font-serif font-black text-base shadow-sm group-hover:scale-105 transition-transform">
          A
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-serif font-bold text-base text-white tracking-wide">
              MEP Artisan Hub
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
              Merchant
            </span>
          </div>
          <div className="text-[10px] text-stone-400 font-medium hidden sm:block">
            Ethiopian Heritage Crafts & Boutiques
          </div>
        </div>
      </Link>

      {/* Right Controls */}
      <div className="flex items-center gap-3 text-xs">
        {isLogin ? (
          <div className="flex items-center gap-2">
            <span className="text-stone-400 hidden sm:inline">Don't have a shop?</span>
            <Link
              to="/shop-create"
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-sm transition-all flex items-center gap-1"
            >
              <span>Open an Artisan Store</span>
              <BsArrowRight size={13} />
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-stone-400 hidden sm:inline">Already registered?</span>
            <Link
              to="/shop-login"
              className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 font-semibold transition-all"
            >
              Merchant Login
            </Link>
          </div>
        )}

        <Link
          to="/"
          className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-xl text-stone-400 hover:text-white transition-colors"
        >
          <FiArrowLeft size={14} />
          <span>Marketplace</span>
        </Link>
      </div>
    </header>
  );
};

export default ShopHeader;
