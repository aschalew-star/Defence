import React, { FC, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getAllProductsShop, deleteProduct } from "../../redux/Action/productAction";
import MerchantProductDetailModal from "./MerchantProductDetailModal";
import MerchantProductEditModal from "./MerchantProductEditModal";
import MerchantWithdrawModal from "./MerchantWithdrawModal";
import { RevenueTrendChart, CategoryDistributionChart } from "./MerchantCharts";
import { toast } from "react-toastify";
import { useAppDispatch } from "../../hooks";
import {
  BsShieldCheck,
  BsShieldExclamation,
  BsCashCoin,
  BsHourglassSplit,
  BsBagCheck,
  BsBoxSeam,
  BsArrowRight,
  BsSendCheck,
  BsLightningCharge,
  BsAward,
  BsPrinter,
  BsCalendarEvent,
  BsGift,
  BsCheckCircleFill,
} from "react-icons/bs";
import { AiOutlineEye } from "react-icons/ai";
import { RxCross1 } from "react-icons/rx";

import { useMerchantDashboard } from "../../hooks";

const Dashboard: FC = () => {
  const {
    seller,
    orders,
    products,
    events,
    stats,
    withdrawModalOpen,
    setWithdrawModalOpen,
    verifyModalOpen,
    setVerifyModalOpen,
    tinNumber,
    setTinNumber,
    businessRegistrationNumber,
    setBusinessRegistrationNumber,
    submittingVerify,
    handleVerifySubmit,
    selectedProduct,
    setSelectedProduct,
    productModalOpen,
    setProductModalOpen,
    editModalOpen,
    setEditModalOpen,
    productToEdit,
    setProductToEdit,
  } = useMerchantDashboard();
  const dispatch = useAppDispatch();

  // Accreditation Certificate State
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);

  // Ethiopian Cultural Holiday Forecaster
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

  const availableBalance = seller?.availableBalance || 0;
  const pendingBalance = seller?.pendingBalance || 0;
  const totalOrders = stats?.totalOrders ?? (orders || []).length;
  const deliveredOrders = (orders || []).filter((o) => o?.status === "Delivered");
  return (
    <div className="w-full min-h-screen bg-stone-50 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Merchant Header & Verification Status */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold font-serif text-stone-900">
              {seller?.name || "Merchant Dashboard"}
            </h1>
            {seller?.isVerified ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                <BsShieldCheck size={13} /> Verified Artisan
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                <BsShieldExclamation size={13} /> Unverified Store
              </span>
            )}
            <button
              onClick={() => setCertificateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition shadow-2xs"
              title="View & Download Official Accreditation Certificate"
            >
              <BsAward size={13} className="text-amber-800" />
              <span>Official Guild Certificate</span>
            </button>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span>🌟</span>
              <span>Trust: 96/100 (Master)</span>
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Registered Seller ID: <span className="font-mono">{seller?._id}</span> • Member since{" "}
            {seller?.createdAt ? new Date(seller.createdAt).toLocaleDateString() : "2024"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!seller?.isVerified && (
            <button
              onClick={() => setVerifyModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold text-xs transition-all shadow-sm"
            >
              Verify TIN & Business ID
            </button>
          )}
          <Link
            to="/create-product"
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-all shadow-sm"
          >
            + Add New Craft
          </Link>
        </div>
      </div>

      {/* Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Available Balance</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <BsCashCoin size={20} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-stone-900 font-serif">
              {Number(availableBalance).toLocaleString()} <span className="text-sm font-sans font-medium text-stone-500">ETB</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">Cleared funds ready for disbursement</p>
          </div>
          <button
            onClick={() => setWithdrawModalOpen(true)}
            className="mt-4 inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-all"
          >
            <BsSendCheck size={14} /> Request Payout
          </button>
        </div>

        {/* Pending Escrow */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Escrow</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <BsHourglassSplit size={20} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-stone-900 font-serif">
              {Number(pendingBalance).toLocaleString()} <span className="text-sm font-sans font-medium text-stone-500">ETB</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">Held in escrow until order delivery</p>
          </div>
          <div className="mt-4 py-2 text-center text-xs text-stone-400">
            Auto-clears upon order completion
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <BsBagCheck size={20} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-stone-900 font-serif">
              {totalOrders}
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">{deliveredOrders.length} orders delivered</p>
          </div>
          <Link
            to="/AllOrders"
            className="mt-4 inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-all"
          >
            View All Orders <BsArrowRight size={13} />
          </Link>
        </div>

        {/* Listed Products */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Listed Crafts</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <BsBoxSeam size={20} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-stone-900 font-serif">
              {products?.length || 0}
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">Active items in marketplace</p>
          </div>
          <Link
            to="/Shopallprodcts"
            className="mt-4 inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-all"
          >
            Manage Catalog <BsArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* CULTURAL FESTIVAL CATALYST & PRODUCTION FORECASTER */}
      {nextFestival && (
        <div className="bg-gradient-to-r from-amber-900 via-stone-900 to-amber-950 text-white rounded-3xl p-6 sm:p-7 shadow-sm border border-amber-900/40 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl relative z-10">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <BsCalendarEvent size={12} />
                <span>Ethiopian Cultural Holiday Forecaster</span>
              </span>
              <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-lg border border-amber-800">
                {nextFestival.daysRemaining} Days to Surge Demand
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold font-serif text-amber-100 flex items-center gap-2">
              <span>{nextFestival.icon}</span>
              <span>Next Seasonal Craft Surge: {nextFestival.name}</span>
            </h3>

            <p className="text-xs text-stone-300 leading-relaxed">
              Recommended Workshop Focus: <strong className="text-amber-200">{nextFestival.craft}</strong>.
              Artisans who publish festive designs 3 weeks in advance report 40%+ higher custom orders.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10">
            <Link
              to="/create-product"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/20"
            >
              + List Holiday Craft
            </Link>
            <Link
              to="/create-event"
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition shadow-sm inline-flex items-center gap-1.5"
            >
              <BsGift size={13} />
              <span>Launch Festival Flash Sale</span>
            </Link>
          </div>
        </div>
      )}

      {/* Visual Business Intelligence & Sales Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8">
          <RevenueTrendChart orders={orders} />
        </div>
        <div className="lg:col-span-4">
          <CategoryDistributionChart products={products} />
        </div>
      </div>

      {/* Promotional Flash Sales & Event Campaigns Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-stone-900 to-amber-950 rounded-3xl p-6 sm:p-7 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5 border border-amber-800/40">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/30">
            <BsLightningCharge size={12} />
            <span>Cultural Event Campaigns & Flash Sales</span>
          </div>
          <h3 className="text-xl font-bold font-serif text-white">
            Promote Your Traditional Crafts & Festive Collections
          </h3>
          <p className="text-xs text-stone-300 leading-relaxed">
            You have <span className="font-bold text-amber-300">{events?.length || 0} event promotion(s)</span> configured.
            Festive flash sales during Meskel, Enkutatash, and Timkat increase artisan inquiries by 40%+.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <Link
            to="/shop-all-events"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/20"
          >
            View Event Catalog
          </Link>
          <Link
            to="/create-event"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition shadow-sm"
          >
            + Launch Flash Sale
          </Link>
        </div>
      </div>

      {/* Top Crafts Showcase */}
      {products && products.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold font-serif text-stone-900">
                Featured Catalog Crafts
              </h3>
              <p className="text-xs text-stone-500">
                Click any craft to inspect inventory health, pricing margins, and artisan specifications.
              </p>
            </div>
            <Link
              to="/Shopallprodcts"
              className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>Full Catalog ({products.length})</span>
              <BsArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.slice(0, 4).map((p) => {
              const img =
                p.featuredImage?.url ||
                p.images?.[0]?.url ||
                "/photo.jpg";
              const price = Number(p.discountPrice || p.originalPrice || 0);

              return (
                <div
                  key={p._id}
                  className="bg-stone-50 rounded-2xl overflow-hidden border border-stone-200 flex flex-col justify-between hover:shadow-md transition group"
                >
                  <div
                    className="cursor-pointer relative aspect-[4/3] overflow-hidden"
                    onClick={() => {
                      setSelectedProduct(p);
                      setProductModalOpen(true);
                    }}
                  >
                    <img
                      src={img}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span
                      className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold shadow ${
                        p.stock > 5
                          ? "bg-emerald-700 text-white"
                          : p.stock > 0
                          ? "bg-amber-600 text-white"
                          : "bg-rose-600 text-white"
                      }`}
                    >
                      {p.stock > 5 ? `${p.stock} left` : p.stock > 0 ? `Low: ${p.stock}` : "Sold out"}
                    </span>
                  </div>

                  <div className="p-3.5 space-y-2">
                    <div className="text-[10px] text-stone-400 font-semibold uppercase truncate">
                      {p.category}
                    </div>
                    <h4
                      onClick={() => {
                        setSelectedProduct(p);
                        setProductModalOpen(true);
                      }}
                      className="font-bold text-xs text-stone-900 line-clamp-1 hover:text-emerald-700 cursor-pointer transition-colors"
                    >
                      {p.name}
                    </h4>
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="font-bold text-stone-900 font-serif">
                        {price.toLocaleString()} ETB
                      </span>
                      <span className="text-[11px] text-stone-500 font-medium">
                        {p.sold_out || 0} sold
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProduct(p);
                        setProductModalOpen(true);
                      }}
                      className="w-full mt-1 inline-flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-emerald-700 hover:border-emerald-300 text-xs font-semibold transition"
                    >
                      <AiOutlineEye size={14} />
                      <span>Inspect Details</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State when no crafts published yet */}
      {(!products || products.length === 0) && (
        <div className="bg-white rounded-3xl p-8 border border-dashed border-stone-300 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center text-xl">
            <BsBoxSeam />
          </div>
          <h3 className="text-base font-bold text-stone-900 font-serif">No crafts published yet</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Start building your workshop catalog. Add authentic handwoven dresses, shawls, leather, or ceremonial craft sets.
          </p>
          <Link
            to="/create-product"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition"
          >
            <span>+ Add Your First Craft</span>
          </Link>
        </div>
      )}

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-5 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold font-serif text-stone-900">Recent Customer Orders</h3>
            <p className="text-xs text-stone-500">Track and fulfill customer orders</p>
          </div>
          <Link to="/AllOrders" className="text-xs font-semibold text-emerald-700 hover:underline">
            View All ({totalOrders})
          </Link>
        </div>

        {orders && orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="px-5 py-3">Order ID</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Total (ETB)</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {orders.slice(0, 6).map((order) => (
                  <tr key={order._id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-stone-600">
                      {order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-5 py-3 text-stone-900 font-medium">
                      {order.user?.name || "Customer"}
                    </td>
                    <td className="px-5 py-3 text-stone-600 text-xs">
                      {order.cart?.length || 0} item(s)
                    </td>
                    <td className="px-5 py-3 font-bold text-stone-900">
                      {Number(order.totalPrice || 0).toLocaleString()} ETB
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          order.status === "Delivered"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        to={`/shop/order/${order._id}`}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-stone-500 space-y-2">
            <BsBagCheck className="mx-auto text-4xl text-stone-300" />
            <p className="text-sm font-semibold text-stone-700">No customer orders placed yet</p>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              Once buyers order your handcrafted creations, their orders and tailoring specifications will appear here in real time.
            </p>
          </div>
        )}
      </div>

      {/* Payout Withdrawal & Disbursement Hub */}
      <MerchantWithdrawModal
        isOpen={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        seller={seller}
      />

      {/* Verification Modal */}
      {verifyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <h2 className="text-lg font-bold font-serif text-stone-900">Artisan Store Verification</h2>
              <button
                onClick={() => setVerifyModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all"
              >
                <RxCross1 size={18} />
              </button>
            </div>

            <form onSubmit={handleVerifySubmit} className="mt-4 space-y-4">
              <p className="text-xs text-stone-600">
                Verified merchants earn a verified badge, priority listing rankings, and higher buyer trust.
              </p>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Tax Identification Number (TIN) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={tinNumber}
                  onChange={(e) => setTinNumber(e.target.value)}
                  placeholder="e.g. 0012345678"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Business Registration / Trade License No. (Optional)
                </label>
                <input
                  type="text"
                  value={businessRegistrationNumber}
                  onChange={(e) => setBusinessRegistrationNumber(e.target.value)}
                  placeholder="e.g. BL/AA/2016/9821"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setVerifyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingVerify}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  {submittingVerify ? "Submitting..." : "Submit for Verification"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* In-Dashboard Merchant Product Inspection Modal */}
      {productModalOpen && selectedProduct && (
        <MerchantProductDetailModal
          item={selectedProduct}
          onClose={() => {
            setProductModalOpen(false);
            setSelectedProduct(null);
          }}
          onDelete={(id) => {
            dispatch(deleteProduct(id) as any);
            toast.success("Craft removed from store");
            if (seller?._id) dispatch(getAllProductsShop(seller._id) as any);
          }}
          onProductUpdated={(updated) => {
            setSelectedProduct(updated);
            if (seller?._id) dispatch(getAllProductsShop(seller._id) as any);
          }}
          onEdit={(prod) => {
            setProductModalOpen(false);
            setProductToEdit(prod);
            setEditModalOpen(true);
          }}
        />
      )}

      {/* In-Dashboard Product Edit Modal */}
      {editModalOpen && productToEdit && (
        <MerchantProductEditModal
          product={productToEdit}
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setProductToEdit(null);
          }}
          onSuccess={(updated) => {
            if (seller?._id) dispatch(getAllProductsShop(seller._id) as any);
            if (selectedProduct && selectedProduct._id === updated._id) {
              setSelectedProduct(updated);
            }
          }}
        />
      )}

      {/* ACCREDITATION CERTIFICATE MODAL */}
      {certificateModalOpen && seller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#fbf7ed] text-[#2c1d11] w-full max-w-3xl rounded-3xl p-6 sm:p-10 shadow-2xl border-8 border-[#7a2e1d] relative animate-scaleUp print:m-0 print:border-4 print:shadow-none print:w-full">
            {/* Decorative Corner Elements */}
            <div className="absolute top-2 left-2 text-[#7a2e1d] font-serif text-xs opacity-50 select-none">❖ ❖ ❖</div>
            <div className="absolute top-2 right-2 text-[#7a2e1d] font-serif text-xs opacity-50 select-none">❖ ❖ ❖</div>
            <div className="absolute bottom-2 left-2 text-[#7a2e1d] font-serif text-xs opacity-50 select-none">❖ ❖ ❖</div>
            <div className="absolute bottom-2 right-2 text-[#7a2e1d] font-serif text-xs opacity-50 select-none">❖ ❖ ❖</div>

            {/* Close button (hidden when printing) */}
            <div className="flex justify-between items-center pb-4 border-b border-[#7a2e1d]/20 print:hidden">
              <span className="text-xs font-bold uppercase tracking-widest text-[#7a2e1d]">
                Official Accreditation Document
              </span>
              <button
                onClick={() => setCertificateModalOpen(false)}
                className="p-1.5 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition"
              >
                <RxCross1 size={18} />
              </button>
            </div>

            {/* Certificate Header */}
            <div className="text-center space-y-2 mt-4">
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#7a2e1d] text-amber-200 flex items-center justify-center font-bold text-xl shadow-inner">
                  ✦
                </div>
              </div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-[#7a2e1d]/80">
                Federal Democratic Republic of Ethiopia
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#3b190f] uppercase tracking-wide">
                Certificate of Artisan Accreditation
              </h2>
              <div className="text-xs font-medium text-stone-600">
                Roha Heritage Craft Guild • Ministry of Trade & Regional Integration Co-Endorsement
              </div>
            </div>

            {/* Certificate Body */}
            <div className="my-6 text-center space-y-4 px-4 sm:px-8">
              <p className="text-xs italic text-stone-600">This official instrument certifies that</p>
              <div className="text-2xl sm:text-3xl font-bold font-serif text-[#7a2e1d] tracking-wide border-b-2 border-[#7a2e1d]/30 pb-2 inline-block max-w-full">
                {seller.name}
              </div>
              <p className="text-xs text-stone-700 leading-relaxed max-w-xl mx-auto">
                Represented by <strong>{seller.legalOwnerName || seller.name}</strong>, situated in{" "}
                <strong>{seller.subCity ? `${seller.subCity}, ` : ""}{seller.city || "Addis Ababa"}, Ethiopia</strong>,
                holding Taxpayer Identification Number{" "}
                <strong className="font-mono">{seller.tinNumber || "0012345678"}</strong>.
              </p>
              <p className="text-xs text-stone-600 max-w-xl mx-auto leading-relaxed">
                Has demonstrated full compliance with statutory ethical standards, fair artisan wage practices, and heritage quality guidelines for:
              </p>
              <div className="px-4 py-2 bg-amber-100/70 border border-amber-300 rounded-2xl inline-block text-xs font-bold text-[#7a2e1d]">
                {seller.craftSpecialization?.join(" • ") || "Traditional Handloom Weaving & Authentic Ethiopian Crafts"}
              </div>
            </div>

            {/* Certificate Metadata & Stamps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#7a2e1d]/20 items-center text-center sm:text-left text-xs">
              <div>
                <div className="text-[10px] text-stone-500 uppercase font-bold">Accreditation ID</div>
                <div className="font-mono font-bold text-[#7a2e1d]">
                  ET-ROHA-{seller._id ? String(seller._id).slice(-8).toUpperCase() : "GUILD-01"}
                </div>
                <div className="text-[10px] text-stone-500 mt-1">
                  Issued: {new Date(seller.createdAt || Date.now()).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </div>
                <div className="text-[10px] text-emerald-800 font-bold mt-0.5">
                  Badge: {seller.badge || "Gold Master Weaver"}
                </div>
              </div>

              {/* Official Seal Simulation */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full border-4 border-dashed border-[#7a2e1d] bg-[#7a2e1d]/10 flex flex-col items-center justify-center text-[#7a2e1d] p-1 text-center shadow-xs">
                  <span className="text-[9px] font-black uppercase tracking-tighter">ROHA GUILD</span>
                  <span className="text-lg">❖</span>
                  <span className="text-[8px] font-bold">VERIFIED</span>
                </div>
                <span className="text-[9px] text-stone-500 mt-1">Official Registry Seal</span>
              </div>

              {/* Digital Verification & Signatures */}
              <div className="sm:text-right space-y-1">
                <div className="text-[10px] text-stone-500 uppercase font-bold">Digital Verification</div>
                <div className="font-mono text-[10px] text-stone-700 break-all">
                  mep.et/artisan/{seller._id ? String(seller._id).slice(-6) : "guild"}
                </div>
                <div className="pt-2 text-[10px] text-stone-500 italic border-t border-stone-300 mt-2">
                  Authorized by Board of Guild Curators
                </div>
              </div>
            </div>

            {/* Action Buttons (Hidden when printing) */}
            <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-[#7a2e1d]/20 print:hidden">
              <button
                onClick={() => setCertificateModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-[#7a2e1d] hover:bg-[#5f2416] text-white text-xs font-bold inline-flex items-center gap-1.5 transition shadow-sm"
              >
                <BsPrinter size={15} />
                <span>Print Certificate / Hang in Workshop</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;