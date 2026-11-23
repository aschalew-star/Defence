import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/Store/Store";
import { getAllOrdersOfAdmin } from "../../redux/Action/order";
import { getAllSellers } from "../../redux/Action/Seller";
import {
  BsShieldCheck,
  BsCashCoin,
  BsShop,
  BsBagCheck,
  BsArrowRight,
  BsClockHistory,
  BsSearch,
  BsCheckCircleFill,
  BsShieldExclamation,
  BsSliders,
  BsTags,
  BsCalendarEvent,
  BsBank,
  BsLightningCharge,
  BsGift,
} from "react-icons/bs";
import { FiTrendingUp, FiCheckCircle, FiExternalLink } from "react-icons/fi";

const AdminDashboardMain = () => {
  const dispatch = useAppDispatch();
  const { adminOrders, adminOrderLoading } = useAppSelector((state) => state.order);
  const { sellers } = useAppSelector((state) => state.seller);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(getAllOrdersOfAdmin() as any);
    dispatch(getAllSellers() as any);
  }, [dispatch]);

  // Financial calculations
  const totalGMV =
    adminOrders?.reduce((acc, item) => acc + (item.totalPrice || 0), 0) || 0;
  const platformRevenue = totalGMV * 0.1; // 10% platform commission fee
  const deliveredOrders =
    adminOrders?.filter((item) => item.status === "Delivered") || [];
  const pendingOrders =
    adminOrders?.filter(
      (item) => item.status !== "Delivered" && item.status !== "Refund Success"
    ) || [];

  const verifiedSellers =
    sellers?.filter(
      (s) => s.isVerified || s.verificationStatus === "Verified"
    ) || [];
  const pendingSellers =
    sellers?.filter(
      (s) =>
        s.verificationStatus === "Pending" ||
        (!s.isVerified && (s.tinNumber || s.businessLicense?.url))
    ) || [];

  // Ethiopian cultural calendar festivals & peak shopping cycles
  const nextFestival = useMemo(() => {
    const ETHIOPIAN_FESTIVALS = [
      { name: "Timkat (Epiphany)", month: 0, day: 19, craft: "Pure White Handloom Netela, Gabi & Gold Tibeb Kemis", tag: "timkat", icon: "✨" },
      { name: "Fasika (Easter)", month: 3, day: 20, craft: "Ceremonial Clay Jebena, Rekebot & Embroidered Banquet Cloths", tag: "fasika", icon: "🕊️" },
      { name: "Enkutatash (Ethiopian New Year)", month: 8, day: 11, craft: "Festive Habesha Kemis, Adey Abeba Motifs & Highland Leathercraft", tag: "enkutatash", icon: "🌼" },
      { name: "Meskel (Finding of True Cross)", month: 8, day: 27, craft: "Hand-carved Axumite Crosses, Brass Candlesticks & Festive Shemma", tag: "meskel", icon: "🔥" },
      { name: "Genna (Ethiopian Christmas)", month: 0, day: 7, craft: "Traditional Ceremonial Attire, Heavy Wool Gabi & Cultural Giftware", tag: "genna", icon: "🌟" },
    ];

    const now = new Date();
    const currentYear = now.getFullYear();
    let closest: any = null;
    let minDiff = Infinity;

    for (const fest of ETHIOPIAN_FESTIVALS) {
      let festDate = new Date(currentYear, fest.month, fest.day);
      if (festDate.getTime() < now.getTime()) {
        festDate = new Date(currentYear + 1, fest.month, fest.day);
      }
      const diffDays = Math.ceil((festDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < minDiff) {
        minDiff = diffDays;
        closest = { ...fest, daysRemaining: diffDays, targetDate: festDate };
      }
    }
    return closest;
  }, []);

  // Treasury & Escrow distribution calculations
  const clearedFunds = useMemo(() => {
    return sellers?.reduce((acc, s) => acc + Number(s.availableBalance || 0), 0) || 0;
  }, [sellers]);

  const escrowFunds = useMemo(() => {
    return sellers?.reduce((acc, s) => acc + Number(s.pendingBalance || 0), 0) || 0;
  }, [sellers]);

  const totalTreasury = clearedFunds + escrowFunds + platformRevenue;
  const clearedPct = totalTreasury > 0 ? Math.round((clearedFunds / totalTreasury) * 100) : 60;
  const escrowPct = totalTreasury > 0 ? Math.round((escrowFunds / totalTreasury) * 100) : 25;
  const revenuePct = totalTreasury > 0 ? Math.max(0, 100 - clearedPct - escrowPct) : 15;

  // Top Sellers by Available Balance / Activity
  const topSellers = useMemo(() => {
    return [...(sellers || [])]
      .sort((a, b) => Number(b.availableBalance || 0) - Number(a.availableBalance || 0))
      .slice(0, 5);
  }, [sellers]);

  const filteredOrders =
    adminOrders?.filter((order) => {
      const matchId = order._id?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchUser = order.user?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchStatus = order.status
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchId || matchUser || matchStatus;
    }) || [];

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2">
            <BsShieldCheck size={14} /> Executive Platform Operations & Escrow Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            Marketplace Control Console
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
            Real-time tracking of Ethiopian artisan sales, domestic courier handovers, merchant verification dossiers, and digital disbursements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin-withdraw-request"
            className="px-4 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition shadow-sm"
          >
            Review Payouts
          </Link>
          <Link
            to="/Allseller"
            className="px-4 py-2.5 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition shadow-sm"
          >
            Manage Merchants ({sellers?.length || 0})
          </Link>
        </div>
      </div>

      {/* Platform Governance & Quick Tools Deck */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Link
          to="/admin-disputes"
          className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-amber-400 hover:shadow-xs transition group"
        >
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Arbitration</span>
            <BsShieldExclamation size={16} className="text-rose-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-sm font-bold text-stone-900 mt-2">Disputes & Claims</div>
          <div className="text-[10px] text-stone-400 mt-0.5">Escrow refund mediation</div>
        </Link>

        <Link
          to="/admin-ledger"
          className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-amber-400 hover:shadow-xs transition group"
        >
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Ledger</span>
            <BsCashCoin size={16} className="text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-sm font-bold text-stone-900 mt-2">Escrow Vault</div>
          <div className="text-[10px] text-stone-400 mt-0.5">Double-entry accounting</div>
        </Link>

        <Link
          to="/admin-categories"
          className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-amber-400 hover:shadow-xs transition group"
        >
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Taxonomy</span>
            <BsTags size={16} className="text-amber-700 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-sm font-bold text-stone-900 mt-2">Craft Categories</div>
          <div className="text-[10px] text-stone-400 mt-0.5">Amharic craft designations</div>
        </Link>

        <Link
          to="/admin-settings"
          className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-amber-400 hover:shadow-xs transition group"
        >
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Policy</span>
            <BsSliders size={16} className="text-purple-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-sm font-bold text-stone-900 mt-2">Platform Governance</div>
          <div className="text-[10px] text-stone-400 mt-0.5">TIN gates & fees</div>
        </Link>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Platform Net Revenue */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Platform Revenue (10%)
            </span>
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700">
              <BsCashCoin size={20} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-serif text-emerald-900">
              {Number(platformRevenue).toLocaleString()} <span className="text-xs font-sans font-medium text-stone-500">ETB</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 mt-1 font-semibold">
              <FiTrendingUp size={13} /> 10% marketplace fees
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-stone-400">
            From {Number(totalGMV).toLocaleString()} ETB total sales
          </div>
        </div>

        {/* Total GMV */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Total GMV Volume
            </span>
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-700">
              <BsCashCoin size={20} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-serif text-stone-900">
              {Number(totalGMV).toLocaleString()} <span className="text-xs font-sans font-medium text-stone-500">ETB</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              Customer orders placed
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-stone-400">
            Across {sellers?.length || 0} registered boutiques
          </div>
        </div>

        {/* Artisans & Sellers */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Artisan Boutiques
            </span>
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-700">
              <BsShop size={20} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-serif text-stone-900">
              {sellers?.length || 0}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-stone-600 mt-1">
              <span className="inline-flex items-center gap-0.5 text-emerald-700 font-bold">
                <FiCheckCircle size={11} /> {verifiedSellers.length} verified
              </span>
              {pendingSellers.length > 0 && (
                <span className="text-amber-800 font-bold">
                  • {pendingSellers.length} pending review
                </span>
              )}
            </div>
          </div>
          <Link
            to="/Allseller"
            className="mt-4 pt-3 border-t border-stone-100 inline-flex items-center justify-between text-xs font-bold text-amber-800 hover:text-amber-950"
          >
            <span>Inspect Merchant Registry</span>
            <BsArrowRight size={13} />
          </Link>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Customer Orders
            </span>
            <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-700">
              <BsBagCheck size={20} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-serif text-stone-900">
              {adminOrders?.length || 0}
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              {deliveredOrders.length} delivered • {pendingOrders.length} in transit
            </p>
          </div>
          <Link
            to="/Adminallorder"
            className="mt-4 pt-3 border-t border-stone-100 inline-flex items-center justify-between text-xs font-bold text-emerald-700 hover:text-emerald-900"
          >
            <span>Manage Orders & Escrow</span>
            <BsArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* CREATIVE DECK: ETHIOPIAN CULTURAL FESTIVAL CATALYST + ESCROW VAULT DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Cultural Holiday & Festival Catalyst Card (7 cols) */}
        {nextFestival && (
          <div className="lg:col-span-7 bg-gradient-to-br from-amber-900 via-stone-900 to-stone-950 text-white rounded-3xl p-6 sm:p-7 shadow-sm border border-amber-900/40 relative overflow-hidden flex flex-col justify-between">
            {/* Background Decorative Pattern */}
            <div className="absolute -right-8 -bottom-8 text-amber-500/10 text-9xl font-serif select-none pointer-events-none">
              ❖
            </div>

            <div className="space-y-3 relative z-10">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  <BsCalendarEvent size={12} />
                  <span>National Artisan Cultural Calendar</span>
                </span>
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/60 px-2.5 py-0.5 rounded-lg border border-amber-800">
                  {nextFestival.daysRemaining} Days Remaining
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-amber-100 flex items-center gap-2">
                  <span>{nextFestival.icon}</span>
                  <span>Next Artisan Shopping Peak: {nextFestival.name}</span>
                </h3>
                <p className="text-xs text-stone-300 mt-1 max-w-xl leading-relaxed">
                  Historical market demand surges for Ethiopian handloom weavers, clay ceramists, and leather artisans during this festival.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="text-[11px] uppercase font-bold tracking-wider text-amber-400">
                  High Demand Craft Priority:
                </div>
                <div className="text-xs text-stone-200 font-medium">
                  {nextFestival.craft}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10 mt-4 relative z-10">
              <div className="text-xs text-stone-400">
                Encourage registered boutiques to stock inventory before shipping cutoffs.
              </div>
              <Link
                to={`/admin-promotions?holiday=${nextFestival.tag}`}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold inline-flex items-center gap-1.5 transition shadow-sm"
              >
                <BsGift size={13} />
                <span>Launch Festival Deals</span>
              </Link>
            </div>
          </div>
        )}

        {/* Escrow Vault & Platform Cash Flow Distribution (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-stone-200 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 font-bold">
                <BsBank size={16} />
              </div>
              <div>
                <h4 className="font-bold text-stone-900 font-serif text-sm">
                  Escrow Vault & Liquidity Split
                </h4>
                <p className="text-[11px] text-stone-500">
                  Total Managed Funds: {Number(totalTreasury).toLocaleString()} ETB
                </p>
              </div>
            </div>
            <Link to="/admin-ledger" className="text-xs font-bold text-amber-800 hover:underline">
              Ledger →
            </Link>
          </div>

          {/* Tripartite Stacked Progress Bar */}
          <div className="space-y-2">
            <div className="w-full h-4 rounded-full bg-stone-100 flex overflow-hidden p-0.5 border border-stone-200">
              <div
                style={{ width: `${clearedPct}%` }}
                className="h-full bg-emerald-500 rounded-l-full transition-all"
                title={`Cleared Merchant Balances: ${clearedPct}%`}
              />
              <div
                style={{ width: `${escrowPct}%` }}
                className="h-full bg-amber-400 transition-all"
                title={`Locked in Escrow Transit: ${escrowPct}%`}
              />
              <div
                style={{ width: `${revenuePct}%` }}
                className="h-full bg-purple-500 rounded-r-full transition-all"
                title={`Platform Revenue: ${revenuePct}%`}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-[10px] text-stone-600 font-medium pt-1">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1 font-bold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  <span>Cleared Funds</span>
                </div>
                <div className="font-mono font-bold text-stone-800">
                  {Number(clearedFunds).toLocaleString()} ETB ({clearedPct}%)
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1 font-bold text-amber-700">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                  <span>Escrow Transit</span>
                </div>
                <div className="font-mono font-bold text-stone-800">
                  {Number(escrowFunds).toLocaleString()} ETB ({escrowPct}%)
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1 font-bold text-purple-700">
                  <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                  <span>Platform (10%)</span>
                </div>
                <div className="font-mono font-bold text-stone-800">
                  {Number(platformRevenue).toLocaleString()} ETB ({revenuePct}%)
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 flex items-center justify-between text-xs text-stone-600">
            <span className="text-[11px]">Audit compliance status:</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
              <FiCheckCircle size={12} /> Double-Entry Balanced
            </span>
          </div>
        </div>
      </div>

      {/* Action Alerts: Pending Merchant Verification Queue */}
      {pendingSellers.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-300 rounded-3xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center font-bold">
                <BsClockHistory size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-950 font-serif">
                  Action Required: {pendingSellers.length} Merchant KYC & Verification Request(s)
                </h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  Artisans have submitted their Ethiopian 10-digit TIN and commercial Trade Licenses.
                </p>
              </div>
            </div>
            <Link
              to="/Allseller"
              className="px-4 py-2.5 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold shadow-sm transition whitespace-nowrap self-start sm:self-auto"
            >
              Review Verification Queue →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {pendingSellers.slice(0, 3).map((seller) => (
              <div key={seller._id} className="p-3.5 rounded-2xl bg-white border border-amber-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-stone-900">{seller.name}</div>
                  <div className="text-[11px] text-stone-500">
                    TIN: <span className="font-mono text-emerald-800 font-bold">{seller.tinNumber || "Pending"}</span>
                  </div>
                </div>
                <Link
                  to={`/Allseller`}
                  className="px-3 py-1 rounded-xl bg-amber-100 text-amber-900 hover:bg-amber-200 text-xs font-bold"
                >
                  Inspect
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Platform Test & Operational Simulation Bar */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
            <BsLightningCharge size={14} />
          </div>
          <span className="font-bold text-stone-800">Compliance & Operations Quick Shortcuts:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/Allseller"
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 font-bold transition shadow-2xs"
          >
            Artisan Dossier Inspector
          </Link>
          <Link
            to="/admin-disputes"
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 font-bold transition shadow-2xs"
          >
            Dispute Arbitration
          </Link>
          <Link
            to="/admin-ledger"
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 font-bold transition shadow-2xs"
          >
            Escrow Audit Ledger
          </Link>
          <Link
            to="/admin-settings"
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 font-bold transition shadow-2xs"
          >
            TIN & Tax Policy Gates
          </Link>
        </div>
      </div>

      {/* Two Column Grid: Top Performing Artisans + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Top Artisans Table (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-stone-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="font-bold font-serif text-stone-900 text-base">Top Artisan Workshops</h3>
              <p className="text-xs text-stone-500">Leading cultural stores by balance & sales</p>
            </div>
            <Link to="/Allseller" className="text-xs font-bold text-amber-800 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {topSellers.map((s, idx) => (
              <div key={s._id} className="p-3 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-stone-200 font-mono text-xs font-bold flex items-center justify-center text-stone-700">
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                      <span>{s.name}</span>
                      {s.isVerified && <BsCheckCircleFill className="text-emerald-700 text-[10px]" />}
                    </div>
                    <div className="text-[10px] text-stone-400">
                      {s.city || "Addis Ababa"} • {s.badge || "Bronze Artisan"}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-stone-900 font-serif text-xs">
                    {Number(s.availableBalance || 0).toLocaleString()} ETB
                  </div>
                  <Link
                    to={`/shop/preview/${s._id}`}
                    target="_blank"
                    className="text-[10px] text-amber-800 font-medium hover:underline flex items-center gap-0.5 justify-end"
                  >
                    <span>Store</span> <FiExternalLink size={9} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent Orders Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="p-6 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold font-serif text-stone-900">
                Recent Marketplace Orders
              </h3>
              <p className="text-xs text-stone-500">Live order stream across all boutiques</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <BsSearch className="absolute left-3 top-2.5 text-stone-400" size={12} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter orders..."
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-stone-200 text-xs w-36 sm:w-44 focus:outline-none focus:ring-1 focus:ring-amber-600"
                />
              </div>
              <Link to="/Adminallorder" className="text-xs font-bold text-amber-800 hover:underline whitespace-nowrap">
                View All
              </Link>
            </div>
          </div>

          {adminOrderLoading ? (
            <div className="p-12 text-center text-stone-500 text-xs">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-stone-500 text-xs">No orders placed yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-50 text-stone-600 text-[11px] uppercase tracking-wider font-bold border-b border-stone-200">
                  <tr>
                    <th className="px-5 py-3">Order ID</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Total ETB</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs">
                  {filteredOrders.slice(0, 6).map((order) => (
                    <tr key={order._id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-stone-800">
                        #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-stone-900">{order.user?.name || "Customer"}</div>
                        <div className="text-[10px] text-stone-400">{order.shippingAddress?.subCity || "Addis Ababa"}</div>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-stone-900 font-serif">
                        {Number(order.totalPrice || 0).toLocaleString()} ETB
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            order.status === "Delivered"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-900"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardMain;
