import React, { useEffect, useState } from "react";
import axios from "axios";
import { server } from "../../server";
import { Link } from "react-router-dom";
import { getAllOrdersOfShop } from "../../redux/Action/order";
import { getAllProductsShop } from "../../redux/Action/productAction";
import {
  RevenueTrendChart,
  CategoryDistributionChart,
  WeeklyActivityBarChart,
} from "./MerchantCharts";
import {
  BsCashCoin,
  BsHourglassSplit,
  BsBoxSeam,
  BsShieldCheck,
  BsArrowRight,
  BsGeoAlt,
  BsCheckCircle,
} from "react-icons/bs";
import {
  FiTrendingUp,
  FiShoppingBag,
  FiCheckCircle,
  FiTruck,
  FiScissors,
} from "react-icons/fi";
import { RxReload } from "react-icons/rx";
import { toast } from "react-toastify";

import { useAppDispatch, useAppSelector } from "../../hooks";

const ShopAnalytics: React.FC = () => {
  const { seller } = useAppSelector((state) => state.seller);
  const { orders } = useAppSelector((state) => state.order);
  const { products } = useAppSelector((state) => state.products);
  const dispatch = useAppDispatch();

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState("all"); // "7d", "30d", "all"

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${server}/shop/analytics`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        setData(res.data.analytics);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load shop analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    if (seller?._id) {
      dispatch(getAllOrdersOfShop(seller._id) as any);
      dispatch(getAllProductsShop(seller._id) as any);
    }
  }, [dispatch, seller?._id]);

  const totalSales = data?.totalSales ?? (orders || []).filter((o: any) => o.status === "Delivered").reduce((acc: number, o: any) => acc + (o.totalPrice || 0), 0);
  const netEarnings = data?.netEarnings ?? Math.round(totalSales * 0.9);
  const pendingBalance = data?.pendingBalance ?? (orders || []).filter((o: any) => o.status !== "Delivered" && o.status !== "Refund Success").reduce((acc: number, o: any) => acc + (o.totalPrice || 0), 0);
  const totalWithdrawn = data?.totalWithdrawn ?? seller?.totalWithdrawn ?? 0;
  const deliveredCount = data?.deliveredOrdersCount ?? (orders || []).filter((o: any) => o.status === "Delivered").length;
  const pendingCount = data?.pendingOrdersCount ?? (orders || []).filter((o: any) => o.status !== "Delivered" && o.status !== "Refund Success").length;
  const totalProducts = data?.totalProducts ?? (products || []).length;

  return (
    <div className="w-full space-y-6 select-none">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold mb-2">
            <FiTrendingUp size={13} className="text-emerald-700" />
            <span>Artisan Business Intelligence & Sales Performance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            Store Analytics & Escrow Intel
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
            Monitor real-time gross craft volume, net escrow settlements, production velocity, and
            inventory health.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-stone-100 p-1 rounded-xl flex items-center text-xs font-semibold">
            {["7d", "30d", "all"].map((t) => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-3 py-1.5 rounded-lg uppercase transition ${
                  timeRange === t ? "bg-white text-stone-900 shadow-xs font-bold" : "text-stone-500 hover:text-stone-900"
                }`}
              >
                {t === "all" ? "Lifetime" : t}
              </button>
            ))}
          </div>

          <button
            onClick={fetchAnalytics}
            className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
            title="Refresh analytics data"
          >
            <RxReload size={15} className={loading ? "animate-spin text-amber-700" : ""} />
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Sales */}
        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Gross Volume
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <BsCashCoin size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
              {Number(totalSales).toLocaleString()}{" "}
              <span className="text-xs font-sans text-stone-500">ETB</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
              <FiTrendingUp /> <span>Delivered craft revenue</span>
            </div>
          </div>
        </div>

        {/* Net Escrow Earnings */}
        <div className="p-5 rounded-3xl bg-emerald-50/60 border border-emerald-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900">
              Net Artisan Payout
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <BsShieldCheck size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-serif text-emerald-950">
              {Number(netEarnings).toLocaleString()}{" "}
              <span className="text-xs font-sans text-emerald-800">ETB</span>
            </div>
            <div className="text-[11px] text-emerald-800 font-medium mt-1">
              After {seller?.commissionRate ?? 10}% platform commission
            </div>
          </div>
        </div>

        {/* Escrow Balance in Transit */}
        <div className="p-5 rounded-3xl bg-amber-50/60 border border-amber-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
              Held in Escrow
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center">
              <BsHourglassSplit size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-serif text-amber-950">
              {Number(pendingBalance).toLocaleString()}{" "}
              <span className="text-xs font-sans text-amber-800">ETB</span>
            </div>
            <div className="text-[11px] text-amber-800 font-medium mt-1">
              {pendingCount} order(s) in production / transit
            </div>
          </div>
        </div>

        {/* Settled Withdrawn */}
        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Total Settled Payouts
            </span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center">
              <BsCheckCircle size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
              {Number(totalWithdrawn).toLocaleString()}{" "}
              <span className="text-xs font-sans text-stone-500">ETB</span>
            </div>
            <div className="text-[11px] text-stone-500 mt-1">
              Disbursed to Telebirr / CBE
            </div>
          </div>
        </div>
      </div>

      {/* Primary Revenue & Trade Volume Graph */}
      <RevenueTrendChart orders={orders} />

      {/* Visual Intelligence: Category Allocation & Weekly Buyer Habits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-6">
          <CategoryDistributionChart products={products} />
        </div>
        <div className="lg:col-span-6">
          <WeeklyActivityBarChart orders={orders} />
        </div>
      </div>

      {/* Regional Customer Geography & Delivery Channels */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                <BsGeoAlt size={16} />
              </div>
              <div>
                <h3 className="text-base font-bold font-serif text-stone-900">
                  Regional Customer Geography & Export Reach
                </h3>
                <p className="text-[11px] text-stone-500">
                  Distribution of handwoven craft shipments across Ethiopian hubs and diaspora destinations
                </p>
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Nationwide Doorstep Delivery Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-stone-800">Addis Ababa Metro</span>
              <span className="font-mono font-bold text-amber-700">62%</span>
            </div>
            <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
              <div className="h-full bg-amber-600 rounded-full" style={{ width: "62%" }} />
            </div>
            <p className="text-[10px] text-stone-500">Bole, CMC, Piazza, Shiro Meda (Same-day)</p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-stone-800">Regional Capitals</span>
              <span className="font-mono font-bold text-emerald-700">24%</span>
            </div>
            <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full" style={{ width: "24%" }} />
            </div>
            <p className="text-[10px] text-stone-500">Hawassa, Bahir Dar, Adama, Mekelle (24-48 hrs)</p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-stone-800">Diaspora & Global</span>
              <span className="font-mono font-bold text-purple-700">10%</span>
            </div>
            <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
              <div className="h-full bg-purple-600 rounded-full" style={{ width: "10%" }} />
            </div>
            <p className="text-[10px] text-stone-500">USA, Europe, UAE (DHL & Ethiopian Cargo)</p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-stone-800">Boutique Pickups</span>
              <span className="font-mono font-bold text-sky-700">4%</span>
            </div>
            <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
              <div className="h-full bg-sky-600 rounded-full" style={{ width: "4%" }} />
            </div>
            <p className="text-[10px] text-stone-500">Artisan Workshop In-Person Handover</p>
          </div>
        </div>
      </div>

      {/* Production & Fulfillment Funnel */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6">
        <div>
          <h2 className="text-lg font-bold font-serif text-stone-900">
            Fulfillment & Delivery Pipeline
          </h2>
          <p className="text-xs text-stone-500">
            Track customer orders from loom cutting to courier delivery confirmation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
            <div className="flex items-center justify-between text-amber-900">
              <span className="font-bold text-xs uppercase">1. In Tailoring & Weaving</span>
              <FiScissors size={16} />
            </div>
            <div className="text-2xl font-bold font-serif text-stone-900">
              {pendingCount}
            </div>
            <p className="text-[10px] text-stone-500">Custom fitting & loom work</p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center justify-between text-stone-700">
              <span className="font-bold text-xs uppercase">2. Quality Checked</span>
              <FiCheckCircle size={16} />
            </div>
            <div className="text-2xl font-bold font-serif text-stone-900">
              Ready
            </div>
            <p className="text-[10px] text-stone-500">Inspection & steaming pass</p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
            <div className="flex items-center justify-between text-blue-900">
              <span className="font-bold text-xs uppercase">3. Out For Delivery</span>
              <FiTruck size={16} />
            </div>
            <div className="text-2xl font-bold font-serif text-stone-900">
              Active
            </div>
            <p className="text-[10px] text-stone-500">With local couriers</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between text-emerald-900">
              <span className="font-bold text-xs uppercase">4. Successfully Delivered</span>
              <BsShieldCheck size={16} />
            </div>
            <div className="text-2xl font-bold font-serif text-emerald-900">
              {deliveredCount}
            </div>
            <p className="text-[10px] text-stone-500">Funds released from escrow</p>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/AllOrders"
          className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-3">
              <FiShoppingBag size={20} />
            </div>
            <h3 className="font-bold text-stone-900 text-sm font-serif">
              Order Fulfillment Hub
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Print packing invoices, inspect customer sizing, and update courier tracking codes.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 mt-4">
            Manage Orders <BsArrowRight size={13} />
          </span>
        </Link>

        <Link
          to="/Shopallprodcts"
          className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold mb-3">
              <BsBoxSeam size={20} />
            </div>
            <h3 className="font-bold text-stone-900 text-sm font-serif">
              Craft Catalog ({totalProducts} Items)
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Update pricing, restock low-inventory items, and edit product specifications.
            </p>
          </div>
          <span className="text-xs font-bold text-amber-700 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 mt-4">
            View Catalog <BsArrowRight size={13} />
          </span>
        </Link>

        <Link
          to="/dashboard/ledger"
          className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-stone-100 text-stone-800 flex items-center justify-center font-bold mb-3">
              <BsCashCoin size={20} />
            </div>
            <h3 className="font-bold text-stone-900 text-sm font-serif">
              Financial Escrow & Ledger
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Request Telebirr / CBE disbursements and download monthly settlement statements.
            </p>
          </div>
          <span className="text-xs font-bold text-stone-800 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 mt-4">
            Open Ledger <BsArrowRight size={13} />
          </span>
        </Link>
      </div>
    </div>
  );
}

export default ShopAnalytics;
