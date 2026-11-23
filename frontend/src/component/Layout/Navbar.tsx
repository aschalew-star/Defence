import React, { useState, useEffect, useRef, useMemo, FC, ChangeEvent, KeyboardEvent } from "react";
import { IoMdSearch, IoMdClose } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import { BsCart3, BsHeart, BsBagCheck, BsShop, BsCoin, BsWallet2, BsGift, BsScissors } from "react-icons/bs";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useNavbarLogic } from "../../hooks";
import axios from "axios";
import { server } from "../../server";
import { IProduct } from "../../types";
import NotificationCenter from "./NotificationCenter";
import { useLanguage } from "../../hooks/useLanguage";
import LanguageSwitcher from "./LanguageSwitcher";

export interface NavbarProps {
  active?: number;
  show?: boolean;
}

const Navbar: FC<NavbarProps> = ({ active, show }) => {
  const {
    user,
    seller,
    totalCartCount,
    totalWishCount,
    search,
    setSearch,
    searchData,
    setSearchData,
    searchRef,
    userDropdownRef,
    mobileMenuOpen,
    setMobileMenuOpen,
    mobileSearchOpen,
    setMobileSearchOpen,
    userDropdownOpen,
    setUserDropdownOpen,
    currency,
    toggleCurrency,
    handleSearch,
    handleSearchKeyDown,
    handleLogout,
    navigate,
    pathname,
  } = useNavbarLogic();
  const { t } = useLanguage();

  const categories = [
    { name: t("nav.home", "Home"), path: "/" },
    { name: t("nav.allProducts", "All Products"), path: "/products" },
    { name: t("nav.artisansBoutiques", "Artisans & Boutiques"), path: "/shops" },
    { name: t("nav.habeshaKemis", "Habesha Kemis"), path: "/product/category/Habesha Kemis" },
    { name: t("nav.mensAttire", "Men's Attire"), path: "/product/category/Men's Attire" },
    { name: t("nav.kidsCollection", "Kids Collection"), path: "/product/category/Kids Collection" },
    { name: t("nav.culturalEvents", "Cultural Events"), path: "/event" },
    { name: t("nav.faq", "FAQ"), path: "/faq" },
  ];
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-amber-100/60 transition-all">
      {/* Top Banner with Currency Switcher, Language Switcher & Heritage Brand */}
      <div className="bg-gradient-to-r from-amber-900 via-stone-900 to-amber-950 text-amber-100 text-xs py-1.5 px-4 hidden sm:block tracking-wide">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>🇪🇹</span>
            <span className="font-bold text-amber-200">{t("banner.heritageTag", "የኢትዮጵያ ባህላዊ አልባሳት")}</span>
            <span className="text-stone-400">• {t("banner.loomMotto", "Authentic Pit Loom Crafts")}</span>
          </div>

          <div className="text-amber-200/90 text-[11px] hidden md:block">
            {t("banner.deliveryGuarantee", "Free Delivery in Addis Ababa over 3,000 ETB")} • {t("banner.escrowNote", "CBE & Telebirr Escrow Protected")}
          </div>

          <div className="flex items-center gap-2.5">
            {/* Language Switcher */}
            <LanguageSwitcher variant="compact" />

            {/* Currency Switcher */}
            <button
              onClick={toggleCurrency}
              className="px-2.5 py-0.5 rounded-full bg-amber-800/80 hover:bg-amber-700 text-amber-100 text-[11px] font-bold border border-amber-600/60 transition flex items-center gap-1 cursor-pointer"
              title={t("banner.currencyToggleTitle", "Switch Currency between ETB and USD")}
            >
              <span>{currency === "ETB" ? "🇪🇹 ETB (ብር)" : "🇺🇸 USD ($)"}</span>
              <span className="text-[9px] text-amber-300">⇄</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white font-extrabold text-2xl shadow-md group-hover:scale-105 transition transform">
              M
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-gray-900 font-serif leading-none">
                MEP<span className="text-amber-600">.</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-amber-800 font-semibold mt-0.5">
                Habesha Fashion
              </span>
            </div>
          </Link>

          {/* Search Bar with live autocomplete */}
          <div className="relative flex-1 max-w-xl mx-2 hidden sm:block" ref={searchRef}>
            <div className="relative flex items-center">
              <input
                type="text"
                value={search}
                onChange={handleSearch}
                onKeyDown={handleSearchKeyDown}
                placeholder={t("header.searchPlaceholder", "Search handwoven kemis, suits, gabi, tibeb...")}
                className="w-full bg-gray-50 hover:bg-gray-100/80 focus:bg-white text-gray-900 pl-11 pr-10 py-2.5 rounded-full border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm outline-none transition duration-200"
              />
              <IoMdSearch className="absolute left-4 text-xl text-gray-400 pointer-events-none" />
              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    setSearchData([]);
                  }}
                  className="absolute right-3.5 text-gray-400 hover:text-gray-600"
                >
                  <IoMdClose className="text-lg" />
                </button>
              )}
            </div>

            {/* Autocomplete Results Dropdown */}
            {searchData.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 max-h-96 overflow-y-auto z-50 p-2 animate-fadeIn">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1.5">
                  {t("header.searchProductsCount", "Products ({count})", { count: searchData.length })}
                </div>
                {searchData.map((item) => (
                  <Link
                    key={item._id}
                    to={`/product/${item._id}`}
                    onClick={() => {
                      setSearch("");
                      setSearchData([]);
                    }}
                    className="flex items-center gap-3 p-2 hover:bg-amber-50/60 rounded-xl transition duration-150"
                  >
                    <img
                      src={item.images?.[0]?.url || "/placeholder.jpg"}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg border border-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-amber-700 font-semibold">
                        {item.discountPrice || item.originalPrice} ETB
                      </p>
                    </div>
                    {item.category && (
                      <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                        {item.category}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Habesha Loyalty Coins Counter Pill for Logged-in User */}
            {user && (
              <Link
                to="/profile"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-yellow-500/10 border border-amber-300 text-amber-950 rounded-full text-xs font-black shadow-xs hover:shadow transition transform hover:scale-[1.02]"
                title="Habesha Loyalty Coins - Redeem at checkout!"
              >
                <span className="text-sm">🪙</span>
                <span className="tracking-tight">{t("header.coinsCount", "{count} Coins", { count: user.loyaltyCoins ?? 100 })}</span>
              </Link>
            )}

            {/* Orders Icon */}
            <Link
              to="/order"
              className="hidden lg:flex items-center gap-1.5 text-gray-700 hover:text-amber-700 font-medium text-sm transition px-2 py-1.5 rounded-lg hover:bg-gray-100/70"
              title={t("header.orders", "My Orders")}
            >
              <BsBagCheck className="text-lg" />
              <span>{t("header.orders", "Orders")}</span>
            </Link>

            {/* Real-time Notification Center */}
            <NotificationCenter />

            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="relative p-2 text-gray-700 hover:text-amber-700 transition rounded-full hover:bg-gray-100/80"
              title={t("header.wishlist", "Wishlist")}
            >
              <BsHeart className="text-xl" />
              {totalWishCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {totalWishCount}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 p-2 sm:px-3 sm:py-2 bg-amber-50 hover:bg-amber-100/80 text-amber-900 font-semibold text-sm rounded-full transition border border-amber-200/50"
              title={t("header.cart", "Shopping Cart")}
            >
              <BsCart3 className="text-xl text-amber-700" />
              <span className="hidden sm:inline">{t("header.cart", "Cart")}</span>
              <span className="bg-amber-700 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-5 text-center">
                {totalCartCount}
              </span>
            </Link>

            {/* User Account / Profile */}
            {user ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition focus:outline-none"
                >
                  {user.avatar?.url ? (
                    <img
                      src={user.avatar.url}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-amber-500 shadow-xs"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                  <span className="text-sm font-bold text-gray-800 hidden md:inline max-w-[95px] truncate">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-gray-400 hidden md:inline">▼</span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-stone-200 py-1.5 z-50 animate-fadeIn">
                    <div className="px-4 py-2.5 border-b border-stone-100 bg-stone-50/70 rounded-t-2xl">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-stone-900 truncate">{user.name}</p>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                          🪙 {user.loyaltyCoins ?? 100}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 truncate mt-0.5">{user.email}</p>
                      {user.role && user.role !== "user" && (
                        <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          {user.role}
                        </span>
                      )}
                    </div>

                    {(user.role === "admin" || user.role === "Admin" || user.role === "superadmin") && (
                      <Link
                        to="/Admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition"
                      >
                        <span>🛡️</span>
                        <span>{t("header.adminConsole", "Admin Console")}</span>
                      </Link>
                    )}

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-amber-50 hover:text-amber-800 transition"
                      >
                        <span className="text-stone-400">👤</span>
                        <span>{t("header.sizingProfile", "My Profile & Sizing Info")}</span>
                      </Link>
                      <Link
                        to="/order"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-amber-50 hover:text-amber-800 transition"
                      >
                        <span className="text-stone-400">📦</span>
                        <span>{t("order.myOrdersTitle", "My Orders & Tracking")}</span>
                      </Link>
                      <Link
                        to="/inbox"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-amber-50 hover:text-amber-800 transition"
                      >
                        <span className="text-stone-400">💬</span>
                        <span>{t("header.artisanMessages", "Artisan Messages")}</span>
                      </Link>
                      <Link
                        to="/rewards"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-amber-900 bg-amber-50/70 hover:bg-amber-100 transition"
                      >
                        <span className="text-amber-600">🪙</span>
                        <span className="font-bold">Habesha Rewards & Wallet</span>
                      </Link>
                      <Link
                        to="/resolution-center"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-amber-50 hover:text-amber-800 transition"
                      >
                        <span className="text-stone-400">🛡️</span>
                        <span>Resolution Center & Returns</span>
                      </Link>
                      <Link
                        to="/wishlist"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-amber-50 hover:text-amber-800 transition"
                      >
                        <span className="text-stone-400">❤️</span>
                        <span>{t("header.wishlist", "Wishlist")} ({totalWishCount})</span>
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-amber-900 bg-amber-50/50 hover:bg-amber-100/60 transition"
                      >
                        <span className="text-amber-600">🎁</span>
                        <span className="font-bold">{t("header.referFriendsBanner", "Refer Friends & Earn +150 Coins")}</span>
                      </Link>
                    </div>

                    <div className="border-t border-stone-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-2 transition"
                      >
                        <span>🚪</span>
                        <span>{t("header.signOut", "Sign Out")}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-amber-800 transition px-3 py-2 rounded-lg hover:bg-gray-100/70"
              >
                <CgProfile className="text-xl" />
                <span className="hidden sm:inline">{t("header.signIn", "Sign In")}</span>
              </Link>
            )}

            {/* Seller Shortcut or Become a Seller */}
            {seller ? (
              <Link
                to="/dashboard"
                className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs font-semibold px-3.5 py-2 rounded-full shadow hover:shadow-md hover:from-emerald-700 hover:to-teal-800 transition"
              >
                <BsShop className="text-sm" />
                <span>{t("header.shopDashboard", "Shop Dashboard")}</span>
              </Link>
            ) : (
              <Link
                to="/shop-create"
                className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-amber-800 text-white text-xs font-semibold px-4 py-2 rounded-full shadow hover:shadow-md hover:from-amber-700 hover:to-amber-900 transition"
              >
                <BsShop className="text-sm" />
                <span>{t("header.sellOnMep", "Sell on MEP")}</span>
              </Link>
            )}

            {/* Mobile Quick Search Button */}
            <button
              onClick={() => setMobileSearchOpen((prev: boolean) => !prev)}
              className="sm:hidden p-2 text-gray-700 hover:text-amber-800 rounded-lg transition"
              title={t("header.quickSearch", "Quick Search")}
            >
              <IoMdSearch className="text-2xl" />
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 text-gray-700 hover:text-black rounded-lg"
            >
              {mobileMenuOpen ? <HiOutlineX className="text-2xl" /> : <HiOutlineMenu className="text-2xl" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-down Search Bar */}
      {mobileSearchOpen && (
        <div className="sm:hidden bg-stone-50 border-t border-b border-stone-200 px-4 py-2.5 shadow-inner animate-fadeIn">
          <div className="relative flex items-center">
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              onKeyDown={handleSearchKeyDown}
              placeholder={t("header.searchPlaceholder", "Search habesha kemis, suits, gabi...")}
              className="w-full bg-white text-gray-900 pl-10 pr-9 py-2 rounded-xl border border-stone-300 focus:border-amber-600 text-sm outline-none shadow-xs"
              autoFocus
            />
            <IoMdSearch className="absolute left-3 text-lg text-stone-400 pointer-events-none" />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setSearchData([]);
                }}
                className="absolute right-3 text-stone-400 hover:text-stone-700"
              >
                <IoMdClose className="text-lg" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Categories Sub-Navbar Bar */}
      <div className="bg-gray-50/90 border-t border-gray-100 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-1 sm:space-x-4 py-2 overflow-x-auto no-scrollbar">
            {categories.map((cat, idx) => {
              const isActive = pathname === cat.path;
              return (
                <Link
                  key={idx}
                  to={cat.path}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap transition duration-150 ${
                    isActive
                      ? "bg-amber-700 text-white shadow-sm"
                      : "text-gray-600 hover:text-amber-800 hover:bg-gray-100"
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-t border-gray-100 px-4 pt-3 pb-6 shadow-xl animate-fadeIn">
          {/* Mobile Search */}
          <div className="mb-4">
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              onKeyDown={handleSearchKeyDown}
              placeholder={t("header.searchPlaceholder", "Search traditional cloth...")}
              className="w-full bg-gray-50 text-gray-900 px-4 py-2 rounded-lg border border-gray-200 text-sm outline-none"
            />
          </div>

          <div className="flex flex-col space-y-2">
            {categories.map((cat, idx) => (
              <Link
                key={idx}
                to={cat.path}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-gray-800 px-3 py-2 rounded-lg hover:bg-amber-50 hover:text-amber-800"
              >
                {cat.name}
              </Link>
            ))}

            {/* Mobile Language Switcher */}
            <LanguageSwitcher variant="menu" className="mt-3 pt-3 border-t border-gray-100" />

            <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
              {(user?.role === "admin" || user?.role === "Admin" || user?.role === "superadmin") && (
                <Link
                  to="/Admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-bold text-emerald-800 bg-emerald-50 px-3 py-2 rounded-lg flex items-center gap-2"
                >
                  <span>🛡️</span>
                  <span>{t("header.adminConsole", "Admin Console")}</span>
                </Link>
              )}
              <Link
                to="/order"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-gray-800 px-3 py-2 rounded-lg hover:bg-amber-50"
              >
                {t("header.orders", "My Orders")}
              </Link>
              <Link
                to={seller ? "/dashboard" : "/shop-create"}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-center text-white bg-amber-700 px-4 py-2 rounded-lg shadow"
              >
                {seller ? t("header.shopDashboard", "Seller Dashboard") : t("header.sellOnMep", "Sell on MEP")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;