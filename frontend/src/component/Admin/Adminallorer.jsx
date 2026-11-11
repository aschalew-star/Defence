import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfAdmin } from "../../redux/Action/order";
import {
  BsShoppingBag,
  BsSearch,
  BsClockHistory,
  BsCheckCircle,
} from "react-icons/bs";

const AdminDashboardOrders = () => {
  const dispatch = useDispatch();
  const { adminOrders, adminOrderLoading } = useSelector((state) => state.order || {});

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    dispatch(getAllOrdersOfAdmin());
  }, [dispatch]);

  const filteredOrders =
    adminOrders?.filter((order) => {
      const matchSearch =
        order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;

      if (statusFilter === "all") return true;
      if (statusFilter === "delivered") return order.status === "Delivered";
      if (statusFilter === "processing")
        return order.status === "Processing" || order.status === "Tailoring & Handweaving";
      if (statusFilter === "refund")
        return order.status === "Processing refund" || order.status === "Refund Success";
      return order.status?.toLowerCase() === statusFilter.toLowerCase();
    }) || [];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2">
            <BsShoppingBag size={14} /> Global Order Management
          </div>
          <h1 className="text-2xl font-bold font-serif text-stone-900">
            All Marketplace Orders & Transactions
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Complete transaction ledger across all Ethiopian boutiques, custom tailoring orders, and delivery timelines.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: `All (${adminOrders?.length || 0})` },
            { id: "delivered", label: "Delivered" },
            { id: "processing", label: "In Production / Transit" },
            { id: "refund", label: "Refunds" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === tab.id
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <BsSearch className="absolute left-3.5 top-3 text-stone-400" size={14} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order ID, customer name, or email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <button
          onClick={() => dispatch(getAllOrdersOfAdmin())}
          className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-all whitespace-nowrap"
        >
          Refresh Orders
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        {adminOrderLoading ? (
          <div className="p-12 text-center text-stone-500 text-xs">Loading orders...</div>
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
                  <th className="px-5 py-3.5">Order Total (ETB)</th>
                  <th className="px-5 py-3.5">Platform Fee (10%)</th>
                  <th className="px-5 py-3.5">Payment</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredOrders.map((order) => {
                  const itemsCount =
                    order.cart?.reduce((acc, i) => acc + (i.qty || 1), 0) || 0;
                  const platformFee = (order.totalPrice || 0) * 0.1;

                  return (
                    <tr key={order._id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs text-stone-700">
                        #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-stone-900">
                          {order.user?.name || "Customer"}
                        </div>
                        <div className="text-xs text-stone-500">{order.user?.email || ""}</div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-stone-600">
                        {itemsCount} item(s)
                      </td>
                      <td className="px-5 py-3.5 font-bold text-stone-900">
                        {Number(order.totalPrice || 0).toLocaleString()} ETB
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-emerald-800 text-xs">
                        +{Number(platformFee).toLocaleString()} ETB
                      </td>
                      <td className="px-5 py-3.5 text-xs">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-medium ${
                            order.paymentInfo?.status === "Succeeded"
                              ? "bg-emerald-50 text-emerald-800"
                              : "bg-stone-100 text-stone-700"
                          }`}
                        >
                          {order.paymentInfo?.status || "Pending"}
                        </span>
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

export default AdminDashboardOrders;
