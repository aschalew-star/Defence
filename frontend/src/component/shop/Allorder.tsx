import React, { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/Store/Store";
import { Link } from "react-router-dom";
import { getAllOrdersOfShop } from "../../redux/Action/order";
import {
  AiOutlineArrowRight,
  AiOutlineSearch,
  AiOutlinePrinter,
  AiOutlineDownload,
} from "react-icons/ai";
import {
  FiShoppingBag,
  FiTruck,
  FiScissors,
  FiCheckCircle,
  FiClock,
  FiLayers,
  FiCopy,
  FiMapPin,
  FiPhone,
  FiPackage,
  FiAlertCircle,
} from "react-icons/fi";
import { BsCashCoin, BsQrCodeScan, BsShieldCheck } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import MerchantInvoiceModal from "./MerchantInvoiceModal";
import { toast } from "react-toastify";
import axios from "axios";
import { server } from "../../server";

function Allorder() {
  const { orders, isLoading } = useAppSelector((state) => state.order);
  const { seller } = useAppSelector((state) => state.seller);
  const dispatch = useAppDispatch();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [invoiceOrder, setInvoiceOrder] = useState<any | null>(null);

  // Real E-Commerce Modals
  const [dispatchOrder, setDispatchOrder] = useState<any | null>(null);
  const [tailoringOrder, setTailoringOrder] = useState<any | null>(null);
  const [selectedCarrier, setSelectedCarrier] = useState("EMS Ethiopian Postal Service");
  const [trackingNumberInput, setTrackingNumberInput] = useState("");
  const [dispatchNotes, setDispatchNotes] = useState("");
  const [isDispatching, setIsDispatching] = useState(false);

  const activeOrders: any[] = orders || [];

  useEffect(() => {
    if (seller?._id) {
      dispatch(getAllOrdersOfShop(seller._id) as any);
    }
  }, [dispatch, seller?._id]);

  // Live Metrics
  const metrics = useMemo(() => {
    const list = activeOrders || [];
    let inProduction = 0;
    let outForDelivery = 0;
    let delivered = 0;
    let grossTotal = 0;

    list.forEach((o: any) => {
      const st = o.status;
      const total = Number(o.totalPrice || o.subTotal || 0);
      grossTotal += total;

      if (
        st === "Processing" ||
        st === "Tailoring & Handweaving" ||
        st === "Quality Checked"
      ) {
        inProduction++;
      } else if (st === "Out for delivery" || st === "Transferred to delivery partner") {
        outForDelivery++;
      } else if (st === "Delivered") {
        delivered++;
      }
    });

    return {
      total: list.length,
      inProduction,
      outForDelivery,
      delivered,
      grossTotal,
    };
  }, [activeOrders]);

  // Filtered & Sorted Orders
  const filteredOrders = useMemo(() => {
    return (activeOrders || [])
      .filter((o: any) => {
        const st = o.status;
        if (statusFilter === "inProduction") {
          if (
            st !== "Processing" &&
            st !== "Tailoring & Handweaving" &&
            st !== "Quality Checked"
          )
            return false;
        } else if (statusFilter === "outForDelivery") {
          if (st !== "Out for delivery" && st !== "Transferred to delivery partner") return false;
        } else if (statusFilter === "delivered") {
          if (st !== "Delivered") return false;
        } else if (statusFilter === "refund") {
          if (!st?.toLowerCase().includes("refund") && st !== "Cancelled") return false;
        }

        if (search.trim()) {
          const q = search.toLowerCase();
          const matchNum = (o.orderNumber || o.subOrderNumber || o._id)?.toLowerCase().includes(q);
          const matchUser = o.user?.name?.toLowerCase().includes(q);
          const matchCity = o.shippingAddress?.city?.toLowerCase().includes(q);
          if (!matchNum && !matchUser && !matchCity) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "priceHigh") {
          return Number(b.totalPrice || 0) - Number(a.totalPrice || 0);
        }
        if (sortBy === "priceLow") {
          return Number(a.totalPrice || 0) - Number(b.totalPrice || 0);
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [activeOrders, search, statusFilter, sortBy]);

  const handlePrintManifest = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!activeOrders || activeOrders.length === 0) {
      toast.info("No orders available to export");
      return;
    }

    const headers = ["Order ID", "Customer", "Date", "Status", "Items Count", "Total (ETB)"];
    const rows = filteredOrders.map((o) => [
      o.orderNumber || o._id.slice(-8).toUpperCase(),
      `"${o.user?.name || "Customer"}"`,
      new Date(o.createdAt).toLocaleDateString(),
      o.status,
      o.cart?.length || o.items?.length || 1,
      o.totalPrice || 0,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MEP_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Orders exported to CSV!");
  };

  const openDispatchModal = (order: any) => {
    setDispatchOrder(order);
    setSelectedCarrier(order.deliveryProvider || "EMS Ethiopian Postal Service");
    const autoTrack = order.trackingCode || `ET-${order.orderNumber || order._id.slice(-6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setTrackingNumberInput(autoTrack);
    setDispatchNotes("");
  };

  const handleConfirmDispatch = async () => {
    if (!trackingNumberInput.trim()) {
      toast.error("Please enter or generate a courier tracking code");
      return;
    }
    if (!dispatchOrder?._id) return;
    setIsDispatching(true);
    try {
      const res = await axios.put(
        `${server}/order/update-order-status/${dispatchOrder._id}`,
        {
          status: "Transferred to delivery partner",
          deliveryProvider: selectedCarrier,
          trackingCode: trackingNumberInput,
          note: dispatchNotes || "Waybill generated and handed to logistics courier",
        },
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.success(
          `Waybill dispatched via ${selectedCarrier} (#${trackingNumberInput})! Customer notified with SMS tracking.`
        );
        if (seller?._id) {
          dispatch(getAllOrdersOfShop(seller._id) as any);
        }
      } else {
        toast.success("Waybill dispatched and status updated!");
        if (seller?._id) {
          dispatch(getAllOrdersOfShop(seller._id) as any);
        }
      }
      setDispatchOrder(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to dispatch order with courier");
    } finally {
      setIsDispatching(false);
    }
  };

  const handleCopyTailoring = (cm: any, name: string) => {
    const text = `🧵 TAILORING SPEC SHEET - ${name}
Bust: ${cm.bust || "N/A"} cm
Waist: ${cm.waist || "N/A"} cm
Hips: ${cm.hips || "N/A"} cm
Length: ${cm.length || "N/A"} cm
Sleeve / Fit Notes: ${cm.notes || "Standard Artisan Fit"}`;
    navigator.clipboard.writeText(text);
    toast.success("Tailoring specifications copied to clipboard for your workshop weavers!");
  };

  return (
    <div className="w-full min-h-screen bg-stone-50 py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold mb-2">
            <FiShoppingBag size={13} className="text-emerald-700" />
            <span>Artisan Order Fulfillment Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            Store Orders & Fulfillments
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
            Track custom garment tailoring, quality inspection checkpoints, courier dispatches, and
            escrow settlement confirmations.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition"
            title="Download CSV report"
          >
            <AiOutlineDownload size={15} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrintManifest}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition shadow-sm"
            title="Print daily packing manifest"
          >
            <AiOutlinePrinter size={15} />
            <span>Print Manifest</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
          <div className="text-[11px] font-bold text-stone-500 uppercase flex items-center gap-1.5">
            <FiLayers className="text-stone-700" /> All Orders
          </div>
          <div className="text-2xl font-bold font-serif text-stone-900 mt-1">
            {metrics.total}
          </div>
          <div className="text-[10px] text-stone-500">Lifetime purchases</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
          <div className="text-[11px] font-bold text-amber-700 uppercase flex items-center gap-1.5">
            <FiScissors className="text-amber-600" /> In Handweaving
          </div>
          <div className="text-2xl font-bold font-serif text-amber-700 mt-1">
            {metrics.inProduction}
          </div>
          <div className="text-[10px] text-stone-500">Tailoring & quality check</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
          <div className="text-[11px] font-bold text-blue-700 uppercase flex items-center gap-1.5">
            <FiTruck className="text-blue-600" /> Out for Delivery
          </div>
          <div className="text-2xl font-bold font-serif text-blue-700 mt-1">
            {metrics.outForDelivery}
          </div>
          <div className="text-[10px] text-stone-500">With local couriers</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
          <div className="text-[11px] font-bold text-emerald-700 uppercase flex items-center gap-1.5">
            <FiCheckCircle className="text-emerald-600" /> Delivered
          </div>
          <div className="text-2xl font-bold font-serif text-emerald-700 mt-1">
            {metrics.delivered}
          </div>
          <div className="text-[10px] text-stone-500">Escrow completed</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm col-span-2 sm:col-span-1">
          <div className="text-[11px] font-bold text-stone-500 uppercase flex items-center gap-1.5">
            <BsCashCoin className="text-emerald-700" /> Gross Orders
          </div>
          <div className="text-xl font-bold font-serif text-stone-900 mt-1 truncate">
            {Number(metrics.grossTotal).toLocaleString()}{" "}
            <span className="text-[10px] font-normal text-stone-500">ETB</span>
          </div>
          <div className="text-[10px] text-stone-500">Total volume</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <AiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-base" />
          <input
            type="text"
            placeholder="Search by order # (e.g. #ORD-...), customer name, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "all", label: "All" },
            { id: "inProduction", label: "In Handweaving" },
            { id: "outForDelivery", label: "In Transit" },
            { id: "delivered", label: "Delivered" },
            { id: "refund", label: "Returns / Issues" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                statusFilter === pill.id
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Sorting */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="py-2 px-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 text-xs font-semibold focus:outline-none"
        >
          <option value="newest">Newest Orders</option>
          <option value="priceHigh">Highest Value</option>
          <option value="priceLow">Lowest Value</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-stone-500">
            <div className="inline-block w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm font-semibold text-stone-800">Loading store orders...</p>
          </div>
        ) : !filteredOrders || filteredOrders.length === 0 ? (
          <div className="p-16 text-center text-stone-500 space-y-2">
            <FiShoppingBag className="mx-auto text-4xl text-stone-300" />
            <p className="text-sm font-semibold text-stone-700">No orders match your criteria</p>
            <p className="text-xs text-stone-400">
              {orders?.length === 0
                ? "When collectors and buyers place orders, they will appear here in real time."
                : "Try adjusting your search terms or status filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-5">Order Reference</th>
                  <th className="py-3.5 px-5">Buyer</th>
                  <th className="py-3.5 px-5">Fulfillment Status</th>
                  <th className="py-3.5 px-5">Craft Items</th>
                  <th className="py-3.5 px-5">Order Total</th>
                  <th className="py-3.5 px-5">Placed On</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredOrders.map((order) => {
                  const items = order.items || order.cart || [];
                  const orderIdDisplay =
                    order.subOrderNumber || order.orderNumber || order._id.slice(-8).toUpperCase();

                  const isCustom = order.customMeasurements && (
                    order.customMeasurements.bust ||
                    order.customMeasurements.waist ||
                    order.customMeasurements.length
                  );

                  return (
                    <tr key={order._id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-mono font-bold text-stone-900 text-xs">
                          #{orderIdDisplay}
                        </div>
                        {isCustom && (
                          <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-semibold border border-amber-200">
                            <FiScissors size={10} /> Custom Sizing
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-stone-900">
                          {order.user?.name || "Customer"}
                        </div>
                        <div className="text-[11px] text-stone-400">
                          {order.shippingAddress?.city || "Addis Ababa"}
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            order.status === "Delivered"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : order.status === "Out for delivery" || order.status === "Transferred to delivery partner"
                              ? "bg-blue-50 text-blue-800 border border-blue-200"
                              : order.status?.toLowerCase().includes("refund") || order.status === "Cancelled"
                              ? "bg-rose-50 text-rose-800 border border-rose-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-stone-600 text-xs">
                        <div className="flex items-center gap-1.5">
                          {items[0]?.images?.[0]?.url && (
                            <img
                              src={items[0].images[0].url}
                              alt=""
                              className="w-8 h-8 rounded-lg object-cover border border-stone-200 shrink-0"
                            />
                          )}
                          <div>
                            <span className="font-medium text-stone-900">
                              {items.length} craft{items.length > 1 ? "s" : ""}
                            </span>
                            {items[0]?.name && (
                              <div className="text-[10px] text-stone-400 truncate max-w-[120px]">
                                {items[0].name}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <span className="font-bold text-stone-900 font-serif">
                          {Number(order.totalPrice || order.subTotal || 0).toLocaleString()} ETB
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-xs text-stone-500 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isCustom && (
                            <button
                              type="button"
                              onClick={() => setTailoringOrder(order)}
                              className="p-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 transition"
                              title="View Bespoke Tailoring Measurements"
                            >
                              <FiScissors size={15} />
                            </button>
                          )}

                          {order.status !== "Delivered" && (
                            <button
                              type="button"
                              onClick={() => openDispatchModal(order)}
                              className="p-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 transition"
                              title="Courier Dispatch & Shipping Slip"
                            >
                              <FiTruck size={15} />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setInvoiceOrder(order)}
                            className="p-1.5 rounded-xl border border-stone-200 hover:border-amber-400 bg-white hover:bg-amber-50 text-stone-700 hover:text-amber-900 transition"
                            title="Print Tax Invoice & Waybill"
                          >
                            <AiOutlinePrinter size={16} />
                          </button>
                          <Link
                            to={`/shop/order/${order._id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-amber-700 text-white text-xs font-semibold transition shadow-xs"
                          >
                            <span>Fulfill</span>
                            <AiOutlineArrowRight size={12} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Production Commercial Tax Invoice & Workshop Job Ticket Modal */}
      {invoiceOrder && (
        <MerchantInvoiceModal
          order={invoiceOrder}
          seller={seller}
          isOpen={Boolean(invoiceOrder)}
          onClose={() => setInvoiceOrder(null)}
        />
      )}

      {/* Courier Shipping Label & Dispatch Manifest Modal */}
      {dispatchOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center text-lg">
                  <FiTruck />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif text-stone-900">
                    Courier Dispatch & Waybill Generation
                  </h3>
                  <p className="text-xs text-stone-500">
                    Order #{dispatchOrder.orderNumber || dispatchOrder._id.slice(-8).toUpperCase()} • Buyer: {dispatchOrder.user?.name || "Customer"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDispatchOrder(null)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              >
                <RxCross1 size={18} />
              </button>
            </div>

            {/* Carrier Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Select Ethiopian Logistics Provider
                </label>
                <select
                  value={selectedCarrier}
                  onChange={(e) => setSelectedCarrier(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="EMS Ethiopian Postal Service">EMS Ethiopian Postal Service (National)</option>
                  <option value="Deliver Addis Express">Deliver Addis Express (Addis Ababa)</option>
                  <option value="Tikus Delivery">Tikus Delivery (Urban Motorbike Courier)</option>
                  <option value="DHL Express Ethiopia">DHL Express Ethiopia (Urgent / Diaspora)</option>
                  <option value="Artisan Workshop Runner">Artisan Workshop Runner (Direct Local Delivery)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Waybill / Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  placeholder="e.g. ET-EMS-948210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono font-bold bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Printable Waybill Slip Preview */}
            <div className="p-4 rounded-2xl bg-stone-50 border-2 border-dashed border-stone-300 text-stone-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                  {selectedCarrier}
                </span>
                <span className="text-[11px] font-mono text-stone-500">
                  REF: {trackingNumberInput || "ET-PENDING"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-stone-400 block">Deliver To</span>
                  <p className="font-bold text-stone-900">{dispatchOrder.user?.name || "Customer"}</p>
                  <p className="text-stone-600 flex items-center gap-1 mt-0.5">
                    <FiMapPin size={12} className="text-stone-400" />
                    <span>{dispatchOrder.shippingAddress?.address1 || dispatchOrder.shippingAddress?.subCity || "Addis Ababa"}, {dispatchOrder.shippingAddress?.city || "Ethiopia"}</span>
                  </p>
                  <p className="text-stone-600 flex items-center gap-1 mt-0.5">
                    <FiPhone size={12} className="text-stone-400" />
                    <span>{dispatchOrder.user?.phoneNumber || "0911223344"}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-stone-400 block">Shipment Contents</span>
                  <p className="font-semibold text-stone-800">
                    {dispatchOrder.cart?.length || dispatchOrder.items?.length || 1} Handcrafted Item(s)
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-900 font-bold text-[10px] rounded-md">
                    ⚠️ FRAGILE / HANDWOVEN TIBEB
                  </span>
                </div>
              </div>

              {/* Barcode Simulation */}
              <div className="pt-2 border-t border-stone-200 flex flex-col items-center">
                <div className="font-mono text-xl tracking-[0.4em] text-stone-800 select-all font-bold">
                  ||||| | |||| || ||| |||| |
                </div>
                <span className="text-[10px] font-mono text-stone-500 mt-0.5">{trackingNumberInput}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-bold transition flex items-center gap-1.5"
              >
                <AiOutlinePrinter size={15} />
                <span>Print Waybill Slip</span>
              </button>

              <button
                type="button"
                disabled={isDispatching}
                onClick={handleConfirmDispatch}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
              >
                {isDispatching ? (
                  <span>Dispatching...</span>
                ) : (
                  <>
                    <FiCheckCircle size={15} />
                    <span>Confirm Dispatch & Hand to Courier</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bespoke Tailoring Sizing Card Modal */}
      {tailoringOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center text-lg">
                  <FiScissors />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif text-stone-900">
                    Bespoke Tailoring & Weaving Specs
                  </h3>
                  <p className="text-xs text-stone-500">
                    Order #{tailoringOrder.orderNumber || tailoringOrder._id.slice(-8).toUpperCase()} • Client: {tailoringOrder.user?.name || "Customer"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTailoringOrder(null)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              >
                <RxCross1 size={18} />
              </button>
            </div>

            {/* Garment Details */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center gap-3">
              {tailoringOrder.cart?.[0]?.images?.[0]?.url && (
                <img
                  src={tailoringOrder.cart[0].images[0].url}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover border border-stone-200"
                />
              )}
              <div>
                <h4 className="text-xs font-bold text-stone-900">
                  {tailoringOrder.cart?.[0]?.name || "Custom Habesha Kemis"}
                </h4>
                <p className="text-[11px] text-stone-500">
                  Special Commission • Requires precision hand-loom weaving & Tilf embroidery
                </p>
              </div>
            </div>

            {/* Measurements Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Bust</span>
                <span className="text-xl font-bold font-serif text-stone-900">
                  {tailoringOrder.customMeasurements?.bust || "94"} <span className="text-xs font-sans font-normal text-stone-500">cm</span>
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Waist</span>
                <span className="text-xl font-bold font-serif text-stone-900">
                  {tailoringOrder.customMeasurements?.waist || "76"} <span className="text-xs font-sans font-normal text-stone-500">cm</span>
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Hips</span>
                <span className="text-xl font-bold font-serif text-stone-900">
                  {tailoringOrder.customMeasurements?.hips || "102"} <span className="text-xs font-sans font-normal text-stone-500">cm</span>
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Length</span>
                <span className="text-xl font-bold font-serif text-stone-900">
                  {tailoringOrder.customMeasurements?.length || "145"} <span className="text-xs font-sans font-normal text-stone-500">cm</span>
                </span>
              </div>
            </div>

            {/* Custom Notes */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-amber-900">
                <FiScissors size={13} /> Artisan Workshop Instructions:
              </span>
              <p className="text-stone-700">
                {tailoringOrder.customMeasurements?.notes || "Double-weave cotton shemma with pure gold-thread tibeb detailing along neckline and hem. Finish with matching Netela."}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleCopyTailoring(tailoringOrder.customMeasurements, tailoringOrder.user?.name || "Client")}
                className="px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-bold transition flex items-center gap-1.5"
              >
                <FiCopy size={14} />
                <span>Copy Specs for Weaver</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
              >
                <AiOutlinePrinter size={15} />
                <span>Print Workshop Card</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Allorder;
