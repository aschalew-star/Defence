import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  BsShieldCheck,
  BsBell,
  BsSearch,
  BsArrowRight,
  BsBoxArrowRight,
  BsPerson,
  BsCheckCircleFill,
} from "react-icons/bs";
import { FiExternalLink } from "react-icons/fi";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";

const AdminNavbar = () => {
  const { user } = useSelector((state) => state.user || {});
  const { sellers } = useSelector((state) => state.seller || {});
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const pendingSellers =
    sellers?.filter((s) => s.verificationStatus === "Pending") || [];

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/Allseller`);
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${server}/user/logout`, { withCredentials: true });
      toast.success("Admin logged out successfully");
      navigate("/login");
      window.location.reload();
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-stone-900 border-b border-stone-800 px-4 sm:px-6 flex items-center justify-between text-white select-none">
      {/* Left: Brand & Portal Badge */}
      <div className="flex items-center gap-3">
        <Link to="/AdminDashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center font-serif font-black text-base shadow-md group-hover:scale-105 transition-transform">
            M
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold text-base tracking-wide text-white">
                MEP Console
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                Admin
              </span>
            </div>
            <div className="text-[10px] text-stone-400 font-medium hidden sm:block">
              Marketplace Operations & Governance
            </div>
          </div>
        </Link>
      </div>

      {/* Center: Quick Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
        <form onSubmit={handleSearch} className="w-full relative">
          <BsSearch className="absolute left-3.5 top-2.5 text-stone-500" size={13} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search artisans, TIN numbers, or orders..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-stone-800/80 border border-stone-700 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </form>
      </div>

      {/* Right: Operational Status, Alerts & Admin Profile */}
      <div className="flex items-center gap-3">
        {/* System Health Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-800 border border-stone-700 text-[11px] text-stone-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-mono text-[10px] text-stone-400">API:</span> Operational
        </div>

        {/* Pending Verification Alerts Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-all relative"
            title="Admin Alerts"
          >
            <BsBell size={16} />
            {pendingSellers.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold flex items-center justify-center">
                {pendingSellers.length}
              </span>
            )}
          </button>

          {/* Notifications Flyout */}
          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl p-3 space-y-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800 text-stone-300 font-semibold">
                <span>Admin Alerts</span>
                <span className="text-[10px] text-stone-500 font-mono">Live</span>
              </div>
              {pendingSellers.length > 0 ? (
                <Link
                  to="/Allseller"
                  onClick={() => setNotificationOpen(false)}
                  className="block p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/40 text-amber-200 hover:bg-amber-900/50 transition-colors"
                >
                  <div className="font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    {pendingSellers.length} Merchant TIN Submissions
                  </div>
                  <div className="text-[11px] text-amber-300/80 mt-0.5">
                    New Ethiopian artisans require store approval.
                  </div>
                </Link>
              ) : (
                <div className="py-4 text-center text-stone-500 text-xs">
                  All merchant approvals are up to date!
                </div>
              )}
              <Link
                to="/admin-withdraw-request"
                onClick={() => setNotificationOpen(false)}
                className="block p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors text-center text-[11px]"
              >
                View Payout Requests →
              </Link>
            </div>
          )}
        </div>

        {/* View Customer Marketplace Link */}
        <Link
          to="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold transition-all border border-stone-700"
        >
          <span>Marketplace</span>
          <FiExternalLink size={12} />
        </Link>

        {/* Admin Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-stone-800 transition-all border border-transparent hover:border-stone-700"
          >
            {user?.avatar?.url ? (
              <img
                src={user.avatar.url}
                alt="Admin"
                className="w-8 h-8 rounded-lg object-cover border border-stone-700"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                A
              </div>
            )}
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-white leading-tight">
                {user?.name || "Administrator"}
              </div>
              <div className="text-[10px] text-emerald-400 font-mono">Super Admin</div>
            </div>
          </button>

          {/* User Menu Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl p-2 space-y-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-stone-800">
                <div className="font-semibold text-white truncate">{user?.name || "Admin"}</div>
                <div className="text-[11px] text-stone-400 truncate">{user?.email}</div>
              </div>
              <Link
                to="/AdminDashboard"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
              >
                <BsShieldCheck className="text-emerald-400" size={14} />
                <span>Dashboard Overview</span>
              </Link>
              <Link
                to="/Allseller"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
              >
                <BsPerson size={14} />
                <span>Manage Artisans</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors text-left"
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

export default AdminNavbar;
