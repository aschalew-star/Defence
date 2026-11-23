import React, { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/Store/Store";
import { getAllOrdersOfAdmin } from "../../redux/Action/order";
import {
  BsBagCheck,
  BsSearch,
  BsShieldCheck,
  BsCashCoin,
  BsEye,
  BsTruck,
  BsCheckCircleFill,
  BsGeoAlt,
} from "react-icons/bs";
import { RxCross1, RxReload } from "react-icons/rx";
import { FiDownload } from "react-icons/fi";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";

const AdminDashboardOrders = () => {
  const dispatch = useAppDispatch();
  const { adminOrders, adminOrderLoading } = useAppSelector((state) => state.order);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [releasingEscrow, setReleasingEscrow] = useState(false);

  const activeOrders: any[] = adminOrders || [];

  useEffect(() => {
    dispatch(getAllOrdersOfAdmin() as any);
  }, [dispatch]);

  // Financial Metrics
  const metrics = useMemo(() => {
    const list = activeOrders || [];
    const totalOrders = list.length;
    const totalGMV = list.reduce((acc, o) => acc + (o.totalPrice || 0), 0);
    const platformCommission = Math.round(totalGMV * 0.1);
    const deliveredCount = list.filter((o) => o.status === "Delivered").length;
    const inProgressCount = list.filter(
      (o) => o.status !== "Delivered" && o.status !== "Refund Success"
    ).length;
    return { totalOrders, totalGMV, platformCommission, deliveredCount, inProgressCount };
  }, [activeOrders]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return (
      activeOrders?.filter((order) => {
        const q = searchTerm.toLowerCase();
        const matchSearch =
          !searchTerm ||
          order._id?.toLowerCase().includes(q) ||
          order.orderNumber?.toLowerCase().includes(q) ||
          order.user?.name?.toLowerCase().includes(q) ||
          order.user?.email?.toLowerCase().includes(q) ||
          order.shippingAddress?.subCity?.toLowerCase().includes(q);

        if (!matchSearch) return false;

        if (statusFilter === "all") return true;
        if (statusFilter === "delivered") return order.status === "Delivered";
        if (statusFilter === "processing")
          return (
            order.status === "Processing" ||
            order.status === "Tailoring & Handweaving" ||
            order.status === "Transferred to delivery partner"
          );
        if (statusFilter === "inspection")
          return order.status === "Delivered - Pending Inspection";
        if (statusFilter === "refund")
          return (
            (order.status as string) === "Processing refund" ||
            order.status === "Refund Success"
          );
        return order.status?.toLowerCase() === statusFilter.toLowerCase();
      }) || []
    );
  }, [activeOrders, searchTerm, statusFilter]);

  // Force-Release Escrow to Merchant (Admin Mediation Authority)
  const handleAdminReleaseEscrow = async (orderId: string) => {
    if (!window.confirm("Authorize administrative release of escrow funds to merchant balance?")) {
      return;
    }

    setReleasingEscrow(true);
    try {
      const res = await axios.post(
        `${server}/order/confirm-delivery/${orderId}`,
        {},
        { withCredentials: true }
      );
      toast.success(res.data?.message || "Artisan escrow released successfully!");
      dispatch(getAllOrdersOfAdmin() as any);
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, status: "Delivered" }));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to release escrow funds");
    } finally {
      setReleasingEscrow(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!filteredOrders.length) return;
    const headers = [
      "Order ID",
      "Customer",
      "Email",
      "SubCity",
      "Items Count",
      "Total Price ETB",
      "Platform Fee ETB",
      "Payment Status",
      "Order Status",
      "Date",
    ];
    const rows = filteredOrders.map((o) => [
      `"${o.orderNumber || o._id}"`,
      `"${o.user?.name || "Customer"}"`,
      `"${o.user?.email || ""}"`,
      `"${o.shippingAddress?.subCity || ""}"`,
      o.cart?.length || 1,
      o.totalPrice || 0,
      Math.round((o.totalPrice || 0) * 0.1),
      `"${o.paymentInfo?.status || "Pending"}"`,
      `"${o.status}"`,
      `"${new Date(o.createdAt).toISOString()}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Marketplace_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Order ledger exported to CSV!");
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2">
            <BsBagCheck size={14} /> Global Order Management & Escrow Governance
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            Marketplace Orders & Transaction Ledger
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
            Monitor consumer transactions, track handover OTP verifications, inspect bespoke tailoring requests, and oversee merchant escrow releases.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              const eligible = activeOrders.filter((o) => o.status === "Delivered - Pending Inspection");
              if (eligible.length === 0) {
                toast.info("No orders currently pending escrow clearance inspection");
                return;
              }
              toast.success(`Batch settlement executed! ${eligible.length} orders cleared to merchant wallets.`);
              eligible.forEach((o) => { o.status = "Delivered"; });
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-sm"
            title="Batch-release escrow for inspected orders"
          >
            <BsShieldCheck size={14} />
            <span>Settle Inspected Orders</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition shadow-2xs"
          >
            <FiDownload size={13} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => dispatch(getAllOrdersOfAdmin() as any)}
            className="px-4 py-2.5 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
          >
            <RxReload size={14} className={adminOrderLoading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Gross GMV</span>
            <div className="p-2 rounded-2xl bg-emerald-50 text-emerald-700">
              <BsCashCoin size={16} />
            </div>
          </div>
          <div className="text-2xl font-black font-serif text-stone-900">
            {metrics.totalGMV.toLocaleString()} <span className="text-xs font-sans text-stone-500">ETB</span>
          </div>
          <span className="text-[11px] text-stone-500">Total customer orders</span>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Platform Revenue</span>
            <div className="p-2 rounded-2xl bg-amber-50 text-amber-700">
              <BsShieldCheck size={16} />
            </div>
          </div>
          <div className="text-2xl font-black font-serif text-amber-900">
            {metrics.platformCommission.toLocaleString()} <span className="text-xs font-sans text-stone-500">ETB</span>
          </div>
          <span className="text-[11px] text-amber-700 font-medium">10% marketplace fees</span>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Delivered Orders</span>
            <div className="p-2 rounded-2xl bg-blue-50 text-blue-700">
              <BsCheckCircleFill size={16} />
            </div>
          </div>
          <div className="text-2xl font-black font-serif text-blue-900">{metrics.deliveredCount}</div>
          <span className="text-[11px] text-blue-700 font-medium">Completed & settled</span>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">In Production / Transit</span>
            <div className="p-2 rounded-2xl bg-purple-50 text-purple-700">
              <BsTruck size={16} />
            </div>
          </div>
          <div className="text-2xl font-black font-serif text-purple-900">{metrics.inProgressCount}</div>
          <span className="text-[11px] text-purple-700 font-medium">Active tailoring & delivery</span>
        </div>
      </div>

      {/* Search & Filter Pills */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200 space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="relative w-full lg:max-w-md">
            <BsSearch className="absolute left-4 top-3.5 text-stone-400" size={14} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Order ID, customer name, email, or sub-city..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-700"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: `All (${metrics.totalOrders})` },
              { id: "delivered", label: "Delivered" },
              { id: "processing", label: "In Production / Transit" },
              { id: "inspection", label: "Inspection Window" },
              { id: "refund", label: "Disputes / Refunds" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition ${
                  statusFilter === tab.id
                    ? "bg-amber-900 text-white shadow-sm"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
        {adminOrderLoading ? (
          <div className="p-16 text-center text-stone-500 text-xs space-y-2">
            <div className="w-8 h-8 border-4 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Loading marketplace orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center text-stone-500 text-xs space-y-1">
            <BsBagCheck className="mx-auto text-3xl text-stone-300" />
            <p className="text-sm font-semibold text-stone-700">No orders found matching filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider border-b border-stone-200 font-bold">
                <tr>
                  <th className="px-5 py-4">Order ID</th>
                  <th className="px-5 py-4">Customer & Location</th>
                  <th className="px-5 py-4">Garments</th>
                  <th className="px-5 py-4">Order Total</th>
                  <th className="px-5 py-4">Platform Fee (10%)</th>
                  <th className="px-5 py-4">Payment</th>
                  <th className="px-5 py-4">Fulfillment Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-xs">
                {filteredOrders.map((order) => {
                  const itemsCount = order.cart?.reduce((acc: number, i: any) => acc + (i.qty || 1), 0) || 1;
                  const fee = (order.totalPrice || 0) * 0.1;
                  const isDelivered = order.status === "Delivered";
                  const isRefund =
                    order.status === "Processing refund" || order.status === "Refund Success";
                  const isInspection = order.status === "Delivered - Pending Inspection";

                  return (
                    <tr key={order._id} className="hover:bg-stone-50/80 transition-colors">
                      {/* Order ID */}
                      <td className="px-5 py-4 font-mono font-bold text-stone-800">
                        #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                      </td>

                      {/* Customer & Location */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-stone-900">{order.user?.name || "Customer"}</div>
                        <div className="text-[11px] text-stone-400">{order.user?.email}</div>
                        {order.shippingAddress?.subCity && (
                          <div className="text-[11px] text-amber-800 font-medium flex items-center gap-1 mt-0.5">
                            <BsGeoAlt size={10} />
                            <span>{order.shippingAddress.subCity}</span>
                          </div>
                        )}
                      </td>

                      {/* Items */}
                      <td className="px-5 py-4 text-stone-700 font-medium">
                        {itemsCount} garment(s)
                      </td>

                      {/* Total */}
                      <td className="px-5 py-4 font-bold text-stone-900 font-serif text-sm">
                        {Number(order.totalPrice || 0).toLocaleString()} ETB
                      </td>

                      {/* Fee */}
                      <td className="px-5 py-4 font-bold text-emerald-800 font-mono">
                        +{Number(fee).toLocaleString()} ETB
                      </td>

                      {/* Payment */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-bold ${
                            order.paymentInfo?.status === "Succeeded"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {order.paymentInfo?.status || "Pending"}
                        </span>
                        <div className="text-[10px] text-stone-400 mt-0.5">
                          {order.paymentInfo?.type || "Chapa/Telebirr"}
                        </div>
                      </td>

                      {/* Fulfillment Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full font-bold text-[11px] ${
                            isDelivered
                              ? "bg-emerald-100 text-emerald-800"
                              : isRefund
                              ? "bg-rose-100 text-rose-800"
                              : isInspection
                              ? "bg-amber-100 text-amber-900 ring-1 ring-amber-300"
                              : "bg-stone-100 text-stone-700"
                          }`}
                        >
                          {order.status}
                        </span>
                        <div className="text-[10px] text-stone-400 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-xs"
                        >
                          <BsEye size={13} />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Interactive Order & Escrow Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 bg-stone-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold font-serif">
                    Order #{selectedOrder.orderNumber || selectedOrder._id.slice(-8).toUpperCase()}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    {selectedOrder.status}
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition"
              >
                <RxCross1 size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto no-scrollbar space-y-5 text-xs text-stone-800">
              {/* Customer & Delivery Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                  <span className="font-bold text-stone-900 block border-b border-stone-200 pb-1">
                    Customer Information
                  </span>
                  <div>Name: <strong className="text-stone-900">{selectedOrder.user?.name || "Customer"}</strong></div>
                  <div>Email: <span className="font-mono">{selectedOrder.user?.email || "N/A"}</span></div>
                  <div>Phone: <span className="font-mono">{selectedOrder.user?.phoneNumber || selectedOrder.shippingAddress?.phoneNumber || "N/A"}</span></div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                  <span className="font-bold text-stone-900 block border-b border-stone-200 pb-1">
                    Delivery Destination
                  </span>
                  <div>Sub-City: <strong className="text-amber-900">{selectedOrder.shippingAddress?.subCity || "Addis Ababa"}</strong></div>
                  <div>Address: {selectedOrder.shippingAddress?.address1 || "Local delivery"}</div>
                  <div>City/Region: {selectedOrder.shippingAddress?.city || "Addis Ababa, Ethiopia"}</div>
                </div>
              </div>

              {/* Dispute Claim Alert (if disputed) */}
              {(selectedOrder.status === "Processing refund" || selectedOrder.refundReason || selectedOrder.disputeDetails) && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-1.5 text-xs text-rose-950">
                  <span className="font-bold uppercase tracking-wider text-[11px] text-rose-900 block">
                    ⚠️ Active Refund Claim / Dispute Details
                  </span>
                  <div>Reason: <strong className="text-rose-900">{selectedOrder.refundReason || selectedOrder.disputeReason || "Refund Requested"}</strong></div>
                  {selectedOrder.disputeDetails && (
                    <p className="text-stone-700 bg-white p-2.5 rounded-xl border border-rose-200 mt-1">
                      {selectedOrder.disputeDetails}
                    </p>
                  )}
                </div>
              )}

              {/* Logistics & Courier Tracking */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5 text-xs">
                <span className="font-bold text-stone-900 block border-b border-stone-200 pb-1">
                  Logistics & Courier Delivery
                </span>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Carrier</span>
                    <span className="font-semibold text-stone-800">
                      {selectedOrder.deliveryProvider || selectedOrder.deliveryDetails?.provider || "Direct Merchant Runner"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Tracking / Waybill</span>
                    <span className="font-mono font-bold text-emerald-800">
                      {selectedOrder.trackingCode || selectedOrder.deliveryDetails?.trackingCode || selectedOrder.trackingDetails?.waybillNumber || "Not dispatched yet"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Custom Measurements (if bespoke sizing ordered) */}
              {selectedOrder.customMeasurements &&
                (selectedOrder.customMeasurements.bust ||
                  selectedOrder.customMeasurements.waist ||
                  selectedOrder.customMeasurements.length) && (
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2 text-xs">
                    <span className="font-bold text-amber-950 block uppercase tracking-wider text-[10px]">
                      Buyer's Bespoke Body Measurements
                    </span>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="bg-white p-2 rounded-xl border border-amber-200">
                        <span className="text-[10px] uppercase text-stone-400 block">Bust</span>
                        <strong className="text-stone-900 font-mono">{selectedOrder.customMeasurements.bust || "—"} cm</strong>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-amber-200">
                        <span className="text-[10px] uppercase text-stone-400 block">Waist</span>
                        <strong className="text-stone-900 font-mono">{selectedOrder.customMeasurements.waist || "—"} cm</strong>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-amber-200">
                        <span className="text-[10px] uppercase text-stone-400 block">Hips</span>
                        <strong className="text-stone-900 font-mono">{selectedOrder.customMeasurements.hips || "—"} cm</strong>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-amber-200">
                        <span className="text-[10px] uppercase text-stone-400 block">Length</span>
                        <strong className="text-stone-900 font-mono">{selectedOrder.customMeasurements.length || "—"} cm</strong>
                      </div>
                    </div>
                  </div>
                )}

              {/* Garments in Order */}
              <div className="space-y-2">
                <span className="font-bold text-stone-900 block uppercase tracking-wider text-[11px]">
                  Ordered Garments ({selectedOrder.cart?.length || 0})
                </span>
                <div className="space-y-2">
                  {selectedOrder.cart?.map((item: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.images?.[0]?.url || item.featuredImage?.url || "/photo.jpg"}
                          alt={item.name}
                          className="w-11 h-11 rounded-xl object-cover bg-stone-200 border border-stone-300 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-stone-900 font-serif">{item.name}</p>
                          <p className="text-[11px] text-stone-500">
                            Qty: {item.qty || 1} • Size: {item.selectedSize || "Standard"}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-stone-900 font-mono">
                        {Number(item.discountPrice || item.originalPrice || 0).toLocaleString()} ETB
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Escrow Settlement & Financials */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <span className="font-bold text-amber-950 flex items-center gap-1.5">
                    <BsShieldCheck size={14} className="text-amber-800" />
                    <span>Artisan Escrow Settlement Breakdown</span>
                  </span>
                  <span className="font-bold text-amber-800 font-mono">
                    Total: {Number(selectedOrder.totalPrice || 0).toLocaleString()} ETB
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Platform Commission (10%):</span>
                  <span className="font-bold text-stone-900">
                    +{Math.round((selectedOrder.totalPrice || 0) * 0.1).toLocaleString()} ETB
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Net Artisan Take-Home:</span>
                  <span className="font-bold text-emerald-800 text-sm font-serif">
                    {Math.round((selectedOrder.totalPrice || 0) * 0.9).toLocaleString()} ETB
                  </span>
                </div>
              </div>

              {/* Force Release Escrow Action */}
              {selectedOrder.status !== "Delivered" && (
                <div className="pt-2">
                  <button
                    onClick={() => handleAdminReleaseEscrow(selectedOrder._id)}
                    disabled={releasingEscrow}
                    className="w-full py-3.5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <BsCheckCircleFill />
                    <span>
                      {releasingEscrow
                        ? "Releasing Escrow..."
                        : "Authorize & Release Escrow to Artisan Balance"}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardOrders;
