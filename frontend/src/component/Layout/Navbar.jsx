import React, { useState, useEffect, useRef } from "react";
import { IoMdSearch, IoMdClose } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import { BsCart3, BsHeart, BsBagCheck, BsShop } from "react-icons/bs";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { server } from "../../server";

function Navbar({ active, show }) {
  const { allProducts } = useSelector((state) => state.products);
  const { cart } = useSelector((state) => state.Cart);
  const { wish } = useSelector((state) => state.Wish);
  const { user } = useSelector((state) => state.user);
  const { seller } = useSelector((state) => state.seller);

  const [search, setSearch] = useState("");
  const [searchData, setSearchData] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const searchRef = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);

    if (!value.trim()) {
      setSearchData([]);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const query = encodeURIComponent(value.trim());
        const { data } = await axios.get(
          `${server}/product/get-all-products?keyword=${query}&limit=6`
        );
        setSearchData(data.products || []);
      } catch (err) {
        console.error("Live search failed:", err);
      }
    }, 300);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && search.trim()) {
      e.preventDefault();
      setSearchData([]);
      setMobileMenuOpen(false);
      navigate(`/products?keyword=${encodeURIComponent(search.trim())}`);
    }
  };

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchData([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalCartCount = (cart || []).reduce((acc, item) => acc + (item.qty || 1), 0);
  const totalWishCount = (wish || []).length;

  const categories = [
    { name: "Home", path: "/" },
    { name: "All Products", path: "/products" },
    { name: "Artisans & Boutiques", path: "/shops" },
    { name: "Habesha Kemis", path: "/product/category/Habesha Kemis" },
    { name: "Men's Attire", path: "/product/category/Men's Attire" },
    { name: "Kids Collection", path: "/product/category/Kids Collection" },
    { name: "Cultural Events", path: "/event" },
    { name: "FAQ", path: "/faq" },
  ];

  const handleLogout = async () => {
    try {
      await axios.get(`${server}/user/logout`, { withCredentials: true });
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-amber-100/60 transition-all">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-800 via-amber-900 to-amber-950 text-amber-100 text-xs py-1.5 px-4 text-center font-medium hidden md:block tracking-wide">
        🇪🇹 Handcrafted Ethiopian Heritage • Free Delivery in Addis Ababa over 3,000 ETB • Secure Chapa & Telebirr Checkout
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
                placeholder="Search handwoven kemis, suits, gabi, tibeb..."
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
                  Products ({searchData.length})
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
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Orders Icon */}
            <Link
              to="/order"
              className="hidden lg:flex items-center gap-1.5 text-gray-700 hover:text-amber-700 font-medium text-sm transition px-2 py-1.5 rounded-lg hover:bg-gray-100/70"
              title="My Orders"
            >
              <BsBagCheck className="text-lg" />
              <span>Orders</span>
            </Link>

            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="relative p-2 text-gray-700 hover:text-amber-700 transition rounded-full hover:bg-gray-100/80"
              title="Wishlist"
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
              title="Shopping Cart"
            >
              <BsCart3 className="text-xl text-amber-700" />
              <span className="hidden sm:inline">Cart</span>
              <span className="bg-amber-700 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-5 text-center">
                {totalCartCount}
              </span>
            </Link>

            {/* User Account / Profile */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition focus:outline-none"
                >
                  {user.avatar?.url ? (
                    <img
                      src={user.avatar.url}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-amber-400"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-amber-700 text-white font-bold flex items-center justify-center text-sm">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-800 hidden md:inline max-w-[90px] truncate">
                    {user.name}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-[11px] text-gray-400">Signed in as</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.email}</p>
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
                        <span>Admin Console</span>
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-800"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/order"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-800"
                    >
                      My Orders
                    </Link>
                    <Link
                      to="/inbox"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-800"
                    >
                      Messages / Inbox
                    </Link>
                    <div className="border-t border-gray-100 mt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 font-medium"
                      >
                        Sign Out
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
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* Seller Shortcut or Become a Seller */}
            {seller ? (
              <Link
                to="/dashboard"
                className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs font-semibold px-3.5 py-2 rounded-full shadow hover:shadow-md hover:from-emerald-700 hover:to-teal-800 transition"
              >
                <BsShop className="text-sm" />
                <span>Shop Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/shop-create"
                className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-amber-800 text-white text-xs font-semibold px-4 py-2 rounded-full shadow hover:shadow-md hover:from-amber-700 hover:to-amber-900 transition"
              >
                <BsShop className="text-sm" />
                <span>Sell on MEP</span>
              </Link>
            )}

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

      {/* Categories Sub-Navbar Bar */}
      <div className="bg-gray-50/90 border-t border-gray-100 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-1 sm:space-x-4 py-2 overflow-x-auto no-scrollbar">
            {categories.map((cat, idx) => {
              const isActive = location.pathname === cat.path;
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
              placeholder="Search traditional cloth..."
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
            <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
              {(user?.role === "admin" || user?.role === "Admin" || user?.role === "superadmin") && (
                <Link
                  to="/Admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-bold text-emerald-800 bg-emerald-50 px-3 py-2 rounded-lg flex items-center gap-2"
                >
                  <span>🛡️</span>
                  <span>Admin Console</span>
                </Link>
              )}
              <Link
                to="/order"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-gray-800 px-3 py-2 rounded-lg hover:bg-amber-50"
              >
                My Orders
              </Link>
              <Link
                to={seller ? "/dashboard" : "/shop-create"}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-center text-white bg-amber-700 px-4 py-2 rounded-lg shadow"
              >
                {seller ? "Seller Dashboard" : "Sell on MEP"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
