import React, { useState, useMemo } from "react";
import {
  BsBagCheck,
  BsScissors,
  BsTruck,
  BsShieldCheck,
  BsSearch,
  BsGift,
  BsArrowLeft,
  BsCheckCircleFill,
  BsClockHistory,
  BsShop,
} from "react-icons/bs";
import { Link } from "react-router-dom";
import { useUserOrderDetails } from "../hooks";
import { useLanguage } from "../hooks/useLanguage";
import { RxCross1 } from "react-icons/rx";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";

const UserOrderDetails: React.FC = () => {
  const {
    id,
    order: data,
    orders,
    loading,
    user,
    reviewOpen: open,
    setReviewOpen: setOpen,
    comment,
    setComment,
    selectedItem,
    setSelectedItem,
    rating,
    setRating,
    handleReviewSubmit: reviewHandler,
    disputeOpen,
    setDisputeOpen,
    disputeReason,
    setDisputeReason,
    disputeDetails,
    setDisputeDetails,
    submittingDispute,
    handleDisputeSubmit,
    handleRefundRequest: refundHandler,
    handleConfirmDelivery: confirmDeliveryHandler,
    invoiceModalOpen,
    setInvoiceModalOpen,
    formatPrice,
  } = useUserOrderDetails();
  const { t } = useLanguage();

  // User Order List Filter & Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const disputeHandler = (e: React.FormEvent) => {
    e.preventDefault();
    handleDisputeSubmit();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "Shipping":
      case "On the way":
      case "Out for delivery":
      case "Transferred to delivery partner":
        return "bg-sky-50 text-sky-800 border-sky-200";
      case "In Tailoring":
      case "Crafting":
      case "Tailoring & Handweaving":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "Quality Checked":
      case "Quality Inspected":
        return "bg-indigo-50 text-indigo-800 border-indigo-200";
      case "Delivered - Pending Inspection":
        return "bg-teal-50 text-teal-800 border-teal-200";
      case "Processing refund":
      case "Refund Success":
        return "bg-purple-50 text-purple-800 border-purple-200";
      case "Cancelled":
        return "bg-rose-50 text-rose-800 border-rose-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const FULFILLMENT_STAGES = [
    { label: t("orderView.stageEscrow", "Escrow Secured"), desc: t("orderView.stageEscrowDesc", "CBE / Telebirr trust lock"), icon: "💳" },
    { label: t("orderView.stageWeaving", "Weaving & Tailoring"), desc: t("orderView.stageWeavingDesc", "Pit loom & Tibeb motifs"), icon: "🧵" },
    { label: t("orderView.stageQuality", "Quality Inspected"), desc: t("orderView.stageQualityDesc", "Pre-shipment verification"), icon: "🔍" },
    { label: t("orderView.stageDelivery", "Out for Delivery"), desc: t("orderView.stageDeliveryDesc", "Courier en route to you"), icon: "🚚" },
    { label: t("orderView.stageHandover", "Delivered & Inspected"), desc: t("orderView.stageHandoverDesc", "OTP verified & funds released"), icon: "✨" },
  ];

  const getFulfillmentStep = (status: string) => {
    switch (status) {
      case "Processing":
      case "Order Placed":
        return 0;
      case "In Tailoring":
      case "Crafting":
      case "Tailoring & Handweaving":
        return 1;
      case "Quality Checked":
      case "Quality Inspected":
        return 2;
      case "Transferred to delivery partner":
      case "Shipping":
      case "Out for delivery":
        return 3;
      case "Delivered - Pending Inspection":
      case "Delivered":
        return 4;
      default:
        return 0;
    }
  };

  // Filtered orders for list view
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter((o) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        o.orderNumber?.toLowerCase().includes(q) ||
        o._id?.toLowerCase().includes(q) ||
        o.cart?.some((item: any) => item.name?.toLowerCase().includes(q));

      if (!matchSearch) return false;

      if (activeFilter === "all") return true;
      if (activeFilter === "tailoring")
        return (
          o.status === "Processing" ||
          o.status === "Tailoring & Handweaving" ||
          o.status === "Quality Checked"
        );
      if (activeFilter === "transit")
        return (
          o.status === "Transferred to delivery partner" ||
          o.status === "Out for delivery" ||
          (o.status as string) === "Shipping" ||
          (o.status as string) === "On the way" ||
          (o.status as string) === "Transit"
        );
      if (activeFilter === "delivered")
        return o.status === "Delivered" || o.status === "Delivered - Pending Inspection";
      if (activeFilter === "disputed")
        return (
          o.status === "Processing refund" ||
          o.status === "Refund Success" ||
          o.status === "Cancelled"
        );
      return true;
    });
  }, [orders, searchTerm, activeFilter]);

  // 1. ORDER LIST VIEW (when !id)
  if (!id) {
    return (
      <div className="py-10 px-4 md:px-8 min-h-screen max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100/70 text-amber-800 flex items-center justify-center text-2xl shadow-xs shrink-0">
              <BsBagCheck />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight font-serif">
                {t("orderView.myCraftOrders", "My Craft Orders")}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                {t("orderView.ordersSubtitle", "Track handwoven Habesha apparel, verify courier handover, and inspect escrow protection")}
              </p>
            </div>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold px-4 py-2.5 rounded-xl bg-amber-800 text-white hover:bg-amber-900 transition shadow-xs self-start md:self-auto"
          >
            {t("orderView.exploreCatalog", "Explore Catalog →")}
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-md">
            <BsSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search by order ref (e.g. #MEP-...) or garment name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-700 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "all", label: `All (${orders?.length || 0})` },
              { id: "tailoring", label: "In Tailoring" },
              { id: "transit", label: "In Transit" },
              { id: "delivered", label: "Delivered" },
              { id: "disputed", label: "Returns / Claims" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition ${
                  activeFilter === tab.id
                    ? "bg-amber-900 text-white shadow-xs"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-stone-200 p-8 space-y-3">
            <div className="w-8 h-8 border-3 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-stone-600">Loading your craft orders...</p>
          </div>
        ) : !filteredOrders || filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-stone-200 p-8 space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-3xl">
              🛍️
            </div>
            <h2 className="text-xl font-bold text-gray-900 font-serif">
              {searchTerm || activeFilter !== "all"
                ? "No Orders Found Matching Criteria"
                : t("orderView.noOrders", "No Orders Placed Yet")}
            </h2>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {searchTerm || activeFilter !== "all"
                ? "Try searching for a different order reference or selecting another status filter."
                : t("orderView.noOrdersDesc", "You haven't ordered any handcrafted Habesha kemis or cultural attire yet.")}
            </p>
            {!searchTerm && activeFilter === "all" && (
              <Link to="/products">
                <button className="mt-4 px-6 py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-semibold shadow-xs text-xs transition">
                  {t("orderView.startExploring", "Start Exploring")}
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-3xl overflow-hidden border border-stone-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 text-sm text-left">
                <thead className="bg-stone-50 text-gray-600 uppercase text-[11px] font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">{t("orderView.orderRef", "Order Ref")}</th>
                    <th className="px-6 py-4">{t("orderView.placedDate", "Placed Date")}</th>
                    <th className="px-6 py-4">{t("orderView.crafts", "Garments")}</th>
                    <th className="px-6 py-4">{t("orderView.status", "Status")}</th>
                    <th className="px-6 py-4">{t("orderView.totalAmount", "Total Amount")}</th>
                    <th className="px-6 py-4 text-right">{t("orderView.details", "Details")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredOrders.map((o) => {
                    const firstItem = o.cart?.[0];
                    const hasCustomSizing =
                      o.customMeasurements &&
                      (o.customMeasurements.bust ||
                        o.customMeasurements.waist ||
                        o.customMeasurements.length);

                    return (
                      <tr key={o._id} className="hover:bg-amber-50/20 transition">
                        <td className="px-6 py-4">
                          <span className="font-mono font-bold text-gray-900 text-xs block">
                            {o.orderNumber || `#${o._id?.slice(-8).toUpperCase()}`}
                          </span>
                          {hasCustomSizing && (
                            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                              <BsScissors size={10} /> Custom Sized
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                          {o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={firstItem?.images?.[0]?.url || firstItem?.featuredImage?.url || "/placeholder.jpg"}
                              alt=""
                              className="w-10 h-10 rounded-xl object-cover border border-stone-200 shrink-0"
                            />
                            <div>
                              <span className="font-bold text-gray-900 block truncate max-w-[180px]">
                                {firstItem?.name || "Handcrafted Craft"}
                              </span>
                              <span className="text-[11px] text-gray-500">
                                {o.cart?.length || 1} craft(s) total
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-2.5 py-1 text-[11px] font-bold rounded-full border ${getStatusBadge(
                              o.status
                            )}`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-black text-amber-900 font-serif text-sm">
                          {Number(o.totalPrice || 0).toLocaleString()} <span className="text-xs text-amber-700 font-sans font-bold">ETB</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link to={`/order/${o._id}`}>
                            <button className="px-3.5 py-1.5 text-xs bg-stone-900 hover:bg-amber-800 text-white rounded-xl font-bold transition shadow-2xs">
                              {t("orderView.viewOrder", "View Details")}
                            </button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. SINGLE ORDER DETAILS VIEW (when id is present)
  if (loading) {
    return (
      <div className="py-20 px-4 min-h-[60vh] flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-10 h-10 border-4 border-amber-800 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Loading order details...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-20 px-4 min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center text-3xl">
          🔍
        </div>
        <h2 className="text-xl font-bold font-serif text-stone-900">Order Not Found</h2>
        <p className="text-xs text-stone-500 max-w-sm">
          We could not locate the details for this order. It may have been updated or you may have entered an incorrect reference.
        </p>
        <Link to="/order">
          <button className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-amber-800 text-white font-bold text-xs transition">
            ← Return to My Orders
          </button>
        </Link>
      </div>
    );
  }

  const trackingNumber =
    data.trackingDetails?.waybillNumber ||
    data.trackingCode ||
    data.deliveryDetails?.trackingCode;

  const courierName =
    data.trackingDetails?.carrierName ||
    data.deliveryProvider ||
    data.deliveryDetails?.provider ||
    "Ethiopian Post / Local Express";

  const trackingEvents = data.trackingDetails?.trackingEvents || [];

  return (
    <div className="py-10 px-4 md:px-8 min-h-screen max-w-5xl mx-auto space-y-6">
      {/* Top Breadcrumb & Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100/70 text-amber-800 flex items-center justify-center text-xl shadow-xs shrink-0">
            <BsBagCheck />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 font-serif tracking-tight">
                Order #{data.orderNumber || data._id?.slice(-8).toUpperCase()}
              </h1>
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${getStatusBadge(data.status)}`}>
                {data.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Placed on: {data.createdAt ? new Date(data.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}
            </p>
          </div>
        </div>

        <Link to="/order">
          <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs transition">
            <BsArrowLeft size={13} />
            <span>{t("orderView.backToOrders", "Back to Orders")}</span>
          </button>
        </Link>
      </div>

      {/* Courier Handover OTP Banner for Customer */}
      {data.deliveryVerification?.deliveryOtp && !data.deliveryVerification?.isOtpVerified && data.status !== "Delivered" && (
        <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔐</span>
            <div>
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                {t("orderView.deliveryOtp", "Delivery Handover Verification Code (OTP)")}
              </h4>
              <p className="text-xs text-amber-900 mt-0.5">
                {t("orderView.deliveryOtpDesc", "Provide this 6-digit code to the courier or artisan only upon physical delivery to verify your order:")}
              </p>
            </div>
          </div>
          <div className="px-6 py-2.5 bg-white rounded-2xl border border-amber-300 shadow-xs font-mono font-black text-2xl text-amber-950 tracking-widest shrink-0">
            {data.deliveryVerification.deliveryOtp}
          </div>
        </div>
      )}

      {/* Visual 5-Stage Order Tracking Stepper */}
      <div className="p-6 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
              <span>{t("orderView.lifecycleTitle", "Order Fulfillment & Escrow Lifecycle")}</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {t("orderView.lifecycleDesc", "Track your handwoven garment from the artisan's loom to your doorstep with escrow transparency")}
            </p>
          </div>
          {trackingNumber && (
            <span className="text-xs font-mono font-bold bg-amber-50 text-amber-900 px-3 py-1 rounded-xl border border-amber-200 self-start sm:self-auto">
              Waybill: {trackingNumber}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {FULFILLMENT_STAGES.map((stg, sIdx) => {
            const currentStep = getFulfillmentStep(data.status);
            const isCompleted = sIdx < currentStep || data.status === "Delivered";
            const isCurrent = sIdx === currentStep && data.status !== "Delivered";

            return (
              <div
                key={sIdx}
                className={`p-3.5 rounded-2xl border transition flex flex-col justify-between ${
                  isCompleted
                    ? "bg-emerald-50/90 border-emerald-300 text-emerald-950"
                    : isCurrent
                    ? "bg-amber-100/80 border-amber-400 text-amber-950 shadow-xs ring-2 ring-amber-400/30"
                    : "bg-stone-50/80 border-stone-200 text-stone-400 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{stg.icon}</span>
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCompleted
                        ? "bg-emerald-600 text-white"
                        : isCurrent
                        ? "bg-amber-700 text-white animate-pulse"
                        : "bg-stone-200 text-stone-600"
                    }`}
                  >
                    {isCompleted ? "✓" : sIdx + 1}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-tight">{stg.label}</h4>
                  <p className="text-[10px] mt-0.5 leading-snug line-clamp-2">
                    {stg.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pre-Shipment Quality Photo Preview */}
        {data.preShipmentProof?.photo?.url && (
          <div className="mt-3 p-4 bg-amber-50/70 rounded-2xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={data.preShipmentProof.photo.url}
                alt="Quality Check"
                className="w-14 h-14 rounded-xl object-cover border border-amber-300 shadow-2xs shrink-0"
              />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-white px-2 py-0.5 rounded-full border border-amber-200">
                  Artisan Pre-Shipment Quality Photo
                </span>
                <p className="text-xs text-stone-700 mt-1">
                  {data.preShipmentProof.notes || "Weaving & embroidery craftsmanship inspected before courier dispatch."}
                </p>
              </div>
            </div>
            <a
              href={data.preShipmentProof.photo.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-amber-900 bg-white px-3.5 py-2 rounded-xl border border-amber-300 hover:bg-amber-100 transition shrink-0 text-center"
            >
              Inspect Photo Fullscreen ↗
            </a>
          </div>
        )}
      </div>

      {/* AliExpress Buyer Protection & Escrow Assurance Banner */}
      <div className="p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl shadow-xs shrink-0">
            <BsShieldCheck />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-emerald-950 font-serif">
                AliExpress-Grade Buyer Protection Active
              </h3>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                100% Escrow Secured
              </span>
            </div>
            <p className="text-xs text-emerald-900 mt-0.5">
              15-Day Return Window • Funds held in platform trust until courier OTP verification • Money Back Guarantee
            </p>
          </div>
        </div>
        <div className="text-right text-xs text-emerald-800 font-medium shrink-0 self-start sm:self-auto">
          <span>Auto-Settlement Window: </span>
          <strong className="text-emerald-950">15 Days Post-Delivery</strong>
        </div>
      </div>

      {/* Ordered Crafts Items List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
        <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider font-serif">
          {t("orderView.garmentsTitle", "Ordered Crafts")} ({data.cart?.length || 0})
        </h3>
        <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
          {data.cart?.map((item: any, index: number) => {
            const itemPrice = Number(item.discountPrice || item.originalPrice || 0);
            const itemQty = item.qty || 1;
            const shopName = item.shop?.name || item.shopName || "Ethiopian Artisan Boutique";

            return (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-amber-50/20 transition gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={item.images?.[0]?.url || item.featuredImage?.url || "/placeholder.jpg"}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-2xl border border-gray-100 shadow-2xs shrink-0"
                  />
                  <div>
                    <h5 className="text-sm font-bold text-gray-900">{item.name}</h5>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                        <BsShop size={11} className="text-amber-800" />
                        <span>{shopName}</span>
                      </span>
                      {item.size && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                          Size: {item.size}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {itemPrice.toLocaleString()} ETB × {itemQty}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <span className="font-black text-amber-900 text-sm font-mono">
                    {(itemPrice * itemQty).toLocaleString()} ETB
                  </span>
                  {!item.isReviewed && data.status === "Delivered" && (
                    <button
                      className="px-3.5 py-1.5 text-xs bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
                      onClick={() => {
                        setOpen(true);
                        setSelectedItem(item);
                      }}
                    >
                      Write Review
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Body Measurements Card (if bespoke sizing ordered) */}
      {data.customMeasurements &&
        (data.customMeasurements.bust ||
          data.customMeasurements.waist ||
          data.customMeasurements.hips ||
          data.customMeasurements.length ||
          data.customMeasurements.heightOrLength) && (
          <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50/40 rounded-3xl border border-amber-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
              <BsScissors className="text-amber-800 text-lg" />
              <span className="font-serif">Custom Body Measurements for Pit Loom Weaving</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-2xs">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Bust</span>
                <span className="font-bold text-stone-900 text-sm font-mono">{data.customMeasurements.bust || "—"} cm</span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-2xs">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Waist</span>
                <span className="font-bold text-stone-900 text-sm font-mono">{data.customMeasurements.waist || "—"} cm</span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-2xs">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Hips</span>
                <span className="font-bold text-stone-900 text-sm font-mono">{data.customMeasurements.hips || "—"} cm</span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-2xs">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Dress Length</span>
                <span className="font-bold text-stone-900 text-sm font-mono">
                  {data.customMeasurements.length || data.customMeasurements.heightOrLength || "—"} cm
                </span>
              </div>
            </div>
            {(data.customMeasurements.notes || data.customMeasurements.additionalInstructions) && (
              <p className="text-xs text-gray-700 bg-white/90 p-3 rounded-2xl border border-amber-200">
                <strong className="text-amber-950 font-bold">Artisan Note:</strong>{" "}
                {data.customMeasurements.notes || data.customMeasurements.additionalInstructions}
              </p>
            )}
          </div>
        )}

      {/* Gift Packaging Details Card (if selected) */}
      {data.giftOptions?.isGift && (
        <div className="p-5 bg-purple-50/70 border border-purple-200 rounded-3xl flex items-start gap-3.5 shadow-2xs">
          <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-800 text-xl shrink-0">
            <BsGift />
          </div>
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-purple-950 font-serif">Gift Order Presentation</h4>
            <p className="text-purple-900">
              {data.giftOptions.giftWrapping ? "✓ Premium cultural gift wrapping requested." : "Standard packaging."}
            </p>
            {data.giftOptions.giftMessage && (
              <div className="p-2.5 bg-white rounded-xl border border-purple-200 text-purple-950 italic mt-1">
                "{data.giftOptions.giftMessage}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* Consolidated Logistics & Tracking Timeline Card (No duplication with address card) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <BsTruck className="text-amber-800 text-lg" />
            <h3 className="text-sm font-bold text-stone-900 font-serif">
              Courier Delivery & Live Transit Tracking
            </h3>
          </div>
          <span className="text-xs font-bold text-stone-600 bg-stone-100 px-3 py-1 rounded-xl">
            {courierName}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Waybill / Tracking Code</span>
            <span className="font-mono font-bold text-emerald-800 text-sm">
              {trackingNumber || "Pending Courier Dispatch"}
            </span>
            <p className="text-[11px] text-stone-500 mt-1">
              {trackingNumber ? "Trackable via Ethiopian Postal Service & Local Couriers" : "Tracking number will be assigned once the garment finishes handweaving"}
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Courier Contact</span>
            <span className="font-semibold text-stone-900">
              {data.trackingDetails?.carrierPhone ? `Direct Phone: ${data.trackingDetails.carrierPhone}` : "Dispatch Hotline: +251 911 223 344"}
            </span>
            <p className="text-[11px] text-stone-500 mt-1">
              Assigned Courier: {courierName}
            </p>
          </div>
        </div>

        {/* Tracking Events Timeline */}
        {trackingEvents.length > 0 && (
          <div className="pt-3 border-t border-stone-100 space-y-2">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Recent Logistics Events</span>
            <div className="space-y-2">
              {trackingEvents.map((evt, eIdx) => (
                <div key={eIdx} className="flex items-start gap-2.5 text-xs">
                  <BsClockHistory className="text-amber-800 text-sm shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-900">{evt.status}</span>
                    {evt.location && <span className="text-stone-500"> — {evt.location}</span>}
                    <div className="text-[10px] text-stone-400">
                      {new Date(evt.timestamp).toLocaleString()} {evt.note ? `• ${evt.note}` : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Two-Column Grid: Delivery Address & Payment Summary (Clean & Deduplicated) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Clean Delivery Address Card (No duplicate tracking code) */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2 pb-2 border-b border-stone-100">
            <BsTruck className="text-stone-700" />
            <span>{t("orderView.deliveryAddress", "Delivery Destination")}</span>
          </h4>
          <div className="space-y-1.5 text-xs text-stone-700">
            <p className="font-bold text-stone-900 text-sm">
              Recipient: {data.user?.name || user?.name || "Customer"}
            </p>
            <p className="font-medium text-stone-800">
              {data.shippingAddress?.address1 ? `${data.shippingAddress.address1} ${data.shippingAddress.address2 || ""}` : "Not specified"}
            </p>
            <p className="text-stone-600">
              {data.shippingAddress?.subCity ? `${data.shippingAddress.subCity}, ` : ""}{data.shippingAddress?.city}, {data.shippingAddress?.country || "Ethiopia"}
            </p>
            <p className="text-stone-600">
              Recipient Phone: <strong className="text-stone-900 font-mono">{data.shippingAddress?.phoneNumber || data.user?.phoneNumber || "N/A"}</strong>
            </p>
            {(data.deliveryNotes || data.deliveryDetails?.deliveryNotes) && (
              <p className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-stone-700 mt-2">
                <strong>Delivery Instructions:</strong> {data.deliveryNotes || data.deliveryDetails?.deliveryNotes}
              </p>
            )}
          </div>
        </div>

        {/* Right: Payment Breakdown & Escrow Actions */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2 pb-2 border-b border-stone-100">
            <BsShieldCheck className="text-stone-700" />
            <span>{t("orderView.paymentSummary", "Payment & Settlement")}</span>
          </h4>

          {/* Itemized Price Breakdown */}
          <div className="space-y-2 text-xs text-stone-700">
            <div className="flex justify-between">
              <span>Crafts Subtotal:</span>
              <span className="font-mono font-semibold">
                {Number(data.financials?.subTotal || (data.totalPrice || 0) - (data.shippingTotal || data.shipping || 0)).toLocaleString()} ETB
              </span>
            </div>
            <div className="flex justify-between">
              <span>Courier Delivery Fee:</span>
              <span className="font-mono font-semibold">
                {Number(data.shippingTotal || data.shipping || 0).toLocaleString()} ETB
              </span>
            </div>
            {Number(data.walletAmountApplied || 0) > 0 && (
              <div className="flex justify-between text-emerald-800 font-semibold">
                <span>Loyalty Wallet Applied:</span>
                <span className="font-mono">-{Number(data.walletAmountApplied).toLocaleString()} ETB</span>
              </div>
            )}
            {Number(data.coinsDiscount || 0) > 0 && (
              <div className="flex justify-between text-amber-800 font-semibold">
                <span>Coins Discount:</span>
                <span className="font-mono">-{Number(data.coinsDiscount).toLocaleString()} ETB</span>
              </div>
            )}
            <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline">
              <span className="font-bold text-stone-900 text-sm">Total Paid (Escrow):</span>
              <span className="text-xl font-black text-amber-900 font-mono">
                {Number(data.totalPrice || 0).toLocaleString()} <span className="text-xs text-amber-700 font-sans">ETB</span>
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500 space-y-1">
            <p>
              Method: <span className="font-semibold text-stone-900">{data.paymentInfo?.type || "Chapa / Telebirr"}</span>
            </p>
            {data.paymentInfo?.id && (
              <p className="font-mono text-[10px] text-stone-400 truncate">
                TxRef: {data.paymentInfo.id}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              className="w-full px-4 py-2.5 bg-stone-900 hover:bg-black text-white rounded-xl font-bold text-xs shadow-xs transition"
              onClick={() => setInvoiceModalOpen(true)}
            >
              📜 View Tax E-Invoice (MoR Receipt)
            </button>

            {((data.status as string) === "Delivered - Pending Inspection" ||
              data.status === "Transferred to delivery partner" ||
              data.status === "Out for delivery") && (
              <button
                className="w-full px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-xs transition"
                onClick={confirmDeliveryHandler}
              >
                ✓ Confirm Quality & Release Escrow
              </button>
            )}

            {data.status === "Delivered" && (
              <button
                className="w-full px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl font-bold text-xs transition"
                onClick={refundHandler}
              >
                Request Order Refund
              </button>
            )}

            {data.status !== "Cancelled" && (
              <button
                className="w-full px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold text-xs border border-rose-200 transition"
                onClick={() => setDisputeOpen(true)}
              >
                {t("orderView.raiseDispute", "Open Dispute / Tailoring Claim")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Review Dialog */}
      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 animate-fadeIn border border-gray-100">
            <div className="w-full flex justify-between items-center pb-4 border-b border-gray-100">
              <h2 className="text-lg font-black text-gray-900 font-serif">
                Review Handcrafted Craft
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <RxCross1 size={18} />
              </button>
            </div>

            <div className="flex items-center gap-4 py-4 border-b border-gray-100">
              <img
                src={selectedItem?.images?.[0]?.url || selectedItem?.featuredImage?.url || "/placeholder.jpg"}
                alt=""
                className="w-14 h-14 object-cover rounded-xl border border-gray-100 shadow-2xs"
              />
              <div>
                <p className="text-sm font-bold text-gray-900">{selectedItem?.name}</p>
                <p className="text-xs text-amber-700 font-bold">
                  {selectedItem?.discountPrice || selectedItem?.originalPrice} ETB
                </p>
              </div>
            </div>

            <div className="pt-4">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                Your Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((i) =>
                  rating >= i ? (
                    <AiFillStar
                      key={i}
                      className="cursor-pointer text-amber-500 hover:scale-110 transition"
                      size={28}
                      onClick={() => setRating(i)}
                    />
                  ) : (
                    <AiOutlineStar
                      key={i}
                      className="cursor-pointer text-gray-300 hover:scale-110 transition"
                      size={28}
                      onClick={() => setRating(i)}
                    />
                  )
                )}
              </div>
            </div>

            <div className="pt-4">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                Feedback for the Artisan Weaver
              </label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts on the tibeb embroidery, cotton softness, fit, or craftsmanship..."
                className="w-full border border-gray-200 p-3 rounded-xl text-sm outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-bold text-xs shadow-xs transition"
                onClick={reviewHandler}
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {disputeOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 animate-fadeIn border border-gray-100">
            <div className="w-full flex justify-between items-center pb-4 border-b border-gray-100">
              <h2 className="text-lg font-black text-gray-900 font-serif">
                Open Arbitration Dispute
              </h2>
              <button
                onClick={() => setDisputeOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <RxCross1 size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-500 py-3">
              If your garment arrived damaged, has sizing discrepancies, or was not received,
              our platform arbitration committee will review your claim and hold or refund your escrow.
            </p>

            <form onSubmit={disputeHandler} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                  Reason for Dispute
                </label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-xs outline-none focus:border-amber-600 font-semibold"
                >
                  <option value="Damaged item">Damaged item / Defective weaving</option>
                  <option value="Item not as described">Item not as described</option>
                  <option value="Wrong size / tailoring">Wrong size / custom tailoring discrepancy</option>
                  <option value="Late delivery">Late courier delivery</option>
                  <option value="Item not received">Item not received</option>
                  <option value="Quality issue">Gold Tibeb embroidery quality issue</option>
                  <option value="Other">Other reason</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                  Claim Explanation & Evidence Details
                </label>
                <textarea
                  rows={4}
                  value={disputeDetails}
                  onChange={(e) => setDisputeDetails(e.target.value)}
                  placeholder="Describe what went wrong with the garment or delivery so the merchant and arbitrator can investigate..."
                  className="w-full border border-gray-200 p-3 rounded-xl text-xs outline-none focus:border-amber-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setDisputeOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDispute}
                  className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold text-xs shadow transition disabled:bg-gray-300"
                >
                  {submittingDispute ? "Submitting..." : "Submit Dispute Claim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official MoR Electronic Tax Invoice Modal */}
      {invoiceModalOpen && data && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 animate-fadeIn border border-gray-200 my-8 space-y-6 print:m-0 print:p-4 print:shadow-none print:border-none print:w-full">
            
            {/* MoR Official Header */}
            <div className="text-center pb-4 border-b-2 border-stone-800 space-y-1">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">🇪🇹</span>
                <span className="text-xs font-black tracking-widest text-amber-950 uppercase">
                  Federal Democratic Republic of Ethiopia
                </span>
                <span className="text-2xl">⚖️</span>
              </div>
              <h2 className="text-base sm:text-lg font-serif font-black text-stone-900 tracking-tight">
                MINISTRY OF REVENUES (MoR) • የገቢዎች ሚኒስቴር
              </h2>
              <p className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                Official Electronic Fiscal Cash Sales Tax Invoice • የኤሌክትሮኒክ የሽያጭ ደረሰኝ
              </p>
              <p className="text-[10px] text-stone-400">
                Issued in accordance with Electronic Transaction Proclamation No. 1205/2020 & VAT Proclamation No. 285/2002
              </p>
            </div>

            {/* Invoice Meta Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Fiscal Receipt Ref</span>
                <span className="font-mono font-bold text-stone-900 text-xs sm:text-sm">
                  ET-TAX-{data.orderNumber || data._id?.slice(-8).toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Date & Fiscal Time</span>
                <span className="font-semibold text-stone-800">
                  {new Date(data.createdAt || Date.now()).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Fiscal Machine No</span>
                <span className="font-mono text-stone-700 text-xs">FSR-ERCA-MEP-09824</span>
              </div>
            </div>

            {/* Tax Entities: Platform Operator, Artisan Merchant & Buyer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border border-stone-200 space-y-1">
                <div className="flex items-center justify-between border-b border-stone-100 pb-1 mb-1">
                  <span className="font-bold text-amber-950 uppercase text-[10px]">Marketplace Operator</span>
                  <span className="text-[10px] font-mono text-emerald-800 font-bold">VERIFIED PLATFORM</span>
                </div>
                <p className="font-bold text-stone-900">MEP Traditional Crafts PLC</p>
                <p className="text-stone-600">Platform TIN: <strong className="text-stone-900 font-mono">0064291845</strong></p>
                <p className="text-stone-600">VAT Reg: <strong className="text-stone-900 font-mono">1198420-VAT-AA</strong></p>
                <p className="text-stone-500 text-[11px]">Bole Subcity, Woreda 03, Addis Ababa</p>
              </div>

              <div className="p-3.5 rounded-xl border border-stone-200 space-y-1">
                <div className="flex items-center justify-between border-b border-stone-100 pb-1 mb-1">
                  <span className="font-bold text-amber-950 uppercase text-[10px]">Artisan Merchant / Buyer</span>
                  <span className="text-[10px] font-mono text-emerald-800 font-bold">ESCROW PROTECTED</span>
                </div>
                <p className="font-bold text-stone-900">
                  {data.cart?.[0]?.shop?.name || data.cart?.[0]?.shopName || "Ethiopian Artisan Workshop"}
                </p>
                <p className="text-stone-600">Merchant TIN: <strong className="text-stone-900 font-mono">0089421570</strong></p>
                <div className="pt-1 mt-1 border-t border-stone-100">
                  <p className="text-stone-700 font-semibold">Buyer: {data.user?.name || user?.name || "Customer"}</p>
                  <p className="text-stone-500 text-[11px]">
                    Delivery: {data.shippingAddress?.address1 ? `${data.shippingAddress.address1}, ${data.shippingAddress.city}` : "Addis Ababa"}
                  </p>
                </div>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="border border-stone-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-stone-100 text-stone-700 font-bold uppercase text-[10px] border-b border-stone-200">
                  <tr>
                    <th className="p-2.5">Craft Description</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Unit Price</th>
                    <th className="p-2.5 text-right">Total (ETB)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {data.cart?.map((item: any, idx: number) => {
                    const price = Number(item.discountPrice || item.originalPrice || 0);
                    const qty = item.qty || 1;
                    return (
                      <tr key={idx} className="text-stone-800">
                        <td className="p-2.5">
                          <span className="font-semibold">{item.name}</span>
                          {item.size && (
                            <span className="text-[10px] text-stone-400 block">Size: {item.size}</span>
                          )}
                        </td>
                        <td className="p-2.5 text-center">{qty}</td>
                        <td className="p-2.5 text-right font-mono">{price.toLocaleString()}</td>
                        <td className="p-2.5 text-right font-mono font-bold">{(price * qty).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Financial & Tax Breakdown */}
            <div className="space-y-1.5 text-xs text-stone-700 pt-2 border-t border-stone-200">
              <div className="flex justify-between">
                <span>Taxable Amount (Excl. 15% VAT):</span>
                <span className="font-mono">
                  {Math.round((data.totalPrice || 0) / 1.15).toLocaleString()} ETB
                </span>
              </div>
              <div className="flex justify-between">
                <span>Value Added Tax (VAT 15%):</span>
                <span className="font-mono">
                  {((data.totalPrice || 0) - Math.round((data.totalPrice || 0) / 1.15)).toLocaleString()} ETB
                </span>
              </div>
              <div className="flex justify-between">
                <span>Courier Logistics / Delivery Fee:</span>
                <span className="font-mono">{(data.shippingTotal || data.shipping || 0).toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-stone-950 pt-2 border-t-2 border-stone-800">
                <span>Grand Total Paid:</span>
                <span className="font-mono text-base text-amber-950">
                  {Number(data.totalPrice || 0).toLocaleString()} ETB
                </span>
              </div>
            </div>

            {/* Escrow Legal Seal & Validation */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-[11px] text-emerald-950">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏛️</span>
                <div>
                  <strong className="block uppercase font-bold text-[10px]">CBE & Telebirr Escrow Assurance</strong>
                  <span>Funds held in escrow trust until customer OTP handover verification</span>
                </div>
              </div>
              <span className="font-mono font-bold text-xs bg-white px-2 py-1 rounded border border-emerald-300">
                STATUS: PAID
              </span>
            </div>

            {/* Actions: Print and Close */}
            <div className="flex justify-end gap-3 pt-4 border-t border-stone-200 print:hidden">
              <button
                onClick={() => setInvoiceModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-2 transition"
              >
                <span>🖨️ Print / Save PDF Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrderDetails;
