import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
} from "react-icons/bs";
import { FiTrendingUp, FiCheckCircle } from "react-icons/fi";

const AdminDashboardMain = () => {
  const dispatch = useDispatch();
  const { adminOrders, adminOrderLoading } = useSelector((state) => state.order);
  const { sellers } = useSelector((state) => state.seller);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(getAllOrdersOfAdmin());
    dispatch(getAllSellers());
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
    sellers?.filter((s) => s.verificationStatus === "Pending") || [];

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
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2">
            <BsShieldCheck size={14} /> Executive Admin Overview
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-serif text-stone-900">
            Marketplace Control Center
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time tracking of Ethiopian artisan sales, merchant settlements, and platform performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin-withdraw-request"
            className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-all shadow-sm"
          >
            Review Payouts
          </Link>
          <Link
            to="/Allseller"
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-all shadow-sm"
          >
            Manage Artisans
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Platform Net Revenue */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Platform Revenue (10%)
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <BsCashCoin size={20} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-serif text-emerald-800">
              {Number(platformRevenue).toLocaleString()} <span className="text-xs font-sans font-medium text-stone-500">ETB</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 mt-1 font-medium">
              <FiTrendingUp size={13} /> 10% platform commission fee
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-stone-400">
            From {Number(totalGMV).toLocaleString()} ETB total GMV
          </div>
        </div>

        {/* Total GMV */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total GMV Sales
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <BsCashCoin size={20} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-serif text-stone-900">
              {Number(totalGMV).toLocaleString()} <span className="text-xs font-sans font-medium text-stone-500">ETB</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              Gross merchandise volume transacted
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-stone-400">
            Across all active sellers
          </div>
        </div>

        {/* Artisans & Sellers */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Artisans & Boutiques
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <BsShop size={20} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-serif text-stone-900">
              {sellers?.length || 0}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-stone-600 mt-1">
              <span className="inline-flex items-center gap-0.5 text-emerald-700 font-semibold">
                <FiCheckCircle size={11} /> {verifiedSellers.length} verified
              </span>
              {pendingSellers.length > 0 && (
                <span className="text-amber-700 font-semibold">
                  • {pendingSellers.length} pending
                </span>
              )}
            </div>
          </div>
          <Link
            to="/Allseller"
            className="mt-4 pt-3 border-t border-stone-100 inline-flex items-center justify-between text-xs font-semibold text-emerald-700 hover:text-emerald-900"
          >
            <span>View All Sellers</span>
            <BsArrowRight size={13} />
          </Link>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Customer Orders
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <BsBagCheck size={20} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-serif text-stone-900">
              {adminOrders?.length || 0}
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              {deliveredOrders.length} delivered • {pendingOrders.length} in progress
            </p>
          </div>
          <Link
            to="/Adminallorder"
            className="mt-4 pt-3 border-t border-stone-100 inline-flex items-center justify-between text-xs font-semibold text-emerald-700 hover:text-emerald-900"
          >
            <span>Manage Orders</span>
            <BsArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Action Alerts / Prompts */}
      {pendingSellers.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-200/60 text-amber-900">
              <BsClockHistory size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                Action Required: {pendingSellers.length} Merchant Verification Pending
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                New artisans have submitted their Ethiopian TIN and Trade Licenses for store approval.
              </p>
            </div>
          </div>
          <Link
            to="/Allseller"
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold transition-all whitespace-nowrap"
          >
            Review Submissions →
          </Link>
        </div>
      )}

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-5 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold font-serif text-stone-900">
              Recent Marketplace Transactions
            </h3>
            <p className="text-xs text-stone-500">Live feed of orders placed across all boutiques</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <BsSearch className="absolute left-3 top-2.5 text-stone-400" size={13} />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <Link
              to="/Adminallorder"
              className="text-xs font-semibold text-emerald-700 hover:underline whitespace-nowrap"
            >
              View All ({adminOrders?.length || 0})
            </Link>
          </div>
        </div>

        {adminOrderLoading ? (
          <div className="p-12 text-center text-stone-500 text-xs">Loading marketplace data...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-stone-500 text-xs">
            No orders found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="px-5 py-3.5">Order ID</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Items</th>
                  <th className="px-5 py-3.5">Total (ETB)</th>
                  <th className="px-5 py-3.5">Platform Fee (10%)</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredOrders.slice(0, 8).map((order) => {
                  const itemsCount =
                    order.cart?.reduce((acc, i) => acc + (i.qty || 1), 0) || 0;
                  const fee = (order.totalPrice || 0) * 0.1;
                  return (
                    <tr key={order._id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs text-stone-600">
                        #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-stone-900">
                          {order.user?.name || "Customer"}
                        </div>
                        <div className="text-[11px] text-stone-400">
                          {order.user?.email || ""}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-stone-600">
                        {itemsCount} item(s)
                      </td>
                      <td className="px-5 py-3.5 font-bold text-stone-900">
                        {Number(order.totalPrice || 0).toLocaleString()} ETB
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-emerald-800 text-xs">
                        +{Number(fee).toLocaleString()} ETB
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            order.status === "Delivered"
                              ? "bg-emerald-100 text-emerald-800"
                              : order.status === "Processing refund" ||
                                order.status === "Refund Success"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-stone-500">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardMain;
