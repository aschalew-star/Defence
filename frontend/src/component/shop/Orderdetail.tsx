import React from "react";
import {
  BsFillBagFill,
  BsTruck,
  BsScissors,
  BsPerson,
  BsTelephone,
  BsGeoAlt,
  BsShieldCheck,
  BsCamera,
  BsCheck2Circle,
  BsCashCoin,
  BsFileText,
  BsClockHistory,
  BsPrinter,
} from "react-icons/bs";
import MerchantInvoiceModal from "./MerchantInvoiceModal";
import { Link } from "react-router-dom";
import { useMerchantOrderDetails, ORDER_STATUS_STEPS } from "../../hooks";
import { toast } from "react-toastify";
import { FiCheck, FiX, FiUploadCloud } from "react-icons/fi";

const OrderDetails: React.FC = () => {
  const {
    order,
    loading,
    status,
    setStatus,
    deliveryProvider,
    setDeliveryProvider,
    trackingCode,
    setTrackingCode,
    statusNote,
    setStatusNote,
    updating,
    handleUpdateStatus,
    otpInput,
    setOtpInput,
    verifyingOtp,
    handleVerifyOtp,
    proofPhoto,
    setProofPhoto,
    proofNote,
    setProofNote,
    uploadingProof,
    showProofModal,
    setShowProofModal,
    handleProofUpload,
    invoiceModalOpen,
    setInvoiceModalOpen,
    formatPrice,
    navigate,
    seller,
  } = useMerchantOrderDetails();

  const handleProofPhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2 && typeof reader.result === "string") {
          setProofPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const copyMeasurements = () => {
    if (!order?.customMeasurements) return;
    const cm = order.customMeasurements;
    const text = `Custom Sizing for ${order.userData?.name || "Customer"}:\nBust: ${cm.bust || "N/A"} cm\nWaist: ${cm.waist || "N/A"} cm\nHips: ${cm.hips || "N/A"} cm\nLength: ${cm.length || "N/A"} cm\nNotes: ${cm.notes || "None"}`;
    navigator.clipboard.writeText(text);
    toast.success("Tailoring measurements copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-stone-500 text-sm">Loading order fulfillment details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <p className="text-stone-700 font-bold mb-2">Order Not Found</p>
        <Link to="/AllOrders" className="text-emerald-700 font-semibold text-xs hover:underline">
          ← Return to All Orders
        </Link>
      </div>
    );
  }

  const items = order.items || order.cart || [];
  const customMeasurements = order.customMeasurements || {};
  const hasMeasurements =
    customMeasurements.bust ||
    customMeasurements.waist ||
    customMeasurements.hips ||
    customMeasurements.length;

  const financials = order.financials || {};
  const netEarnings = financials.merchantNetEarnings || (order.subTotal || order.totalPrice || 0) * 0.9;
  const platformFee = financials.platformFeeAmount || (order.subTotal || order.totalPrice || 0) * 0.1;
  const payoutStatus = financials.payoutStatus || "Pending Escrow";

  const getPayoutBadge = (st) => {
    switch (st) {
      case "Eligible for Payout":
      case "Paid Out":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "Inspection Period":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "Disputed Frozen":
        return "bg-rose-50 text-rose-800 border-rose-200";
      default:
        return "bg-stone-50 text-stone-700 border-stone-200";
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-16">
      {/* Top Header Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-xl shrink-0 shadow-2xs">
            <BsFillBagFill />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-serif text-stone-900">
                Order #{order.subOrderNumber || order.orderNumber || order._id.slice(-8).toUpperCase()}
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 border border-stone-200">
                {order.status}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Placed on: {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setInvoiceModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-stone-900 hover:bg-amber-700 transition shadow-sm inline-flex items-center gap-1.5"
          >
            <BsPrinter size={14} />
            <span>Official Tax Invoice & Waybill</span>
          </button>
          <Link
            to="/AllOrders"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition"
          >
            ← Back to Orders
          </Link>
        </div>
      </div>

      {/* Fulfillment & Escrow Pipeline Stepper */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
              <span>🧵 Merchant Fulfillment & Escrow Release Pipeline</span>
            </h3>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Complete each stage to ensure quality compliance under Ethiopian e-commerce rules and release your payout
            </p>
          </div>
          <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 px-3 py-1 rounded-xl border border-emerald-200 self-start sm:self-auto flex items-center gap-1.5">
            <BsShieldCheck size={13} className="text-emerald-700" />
            <span>Escrow Protected (15-Day Auto-Release)</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {[
            { label: "1. Escrow Held", desc: "Customer paid into trust", icon: "💳", check: true },
            {
              label: "2. In Tailoring",
              desc: "Weaving on pit loom",
              icon: "✂️",
              check: ["Tailoring & Handweaving", "Quality Checked", "Transferred to delivery partner", "Out for delivery", "Delivered"].includes(order.status),
            },
            {
              label: "3. Quality Proof",
              desc: order.preShipmentProof?.photo?.url ? "Photo uploaded" : "Upload proof photo",
              icon: "📸",
              check: !!order.preShipmentProof?.photo?.url || ["Quality Checked", "Transferred to delivery partner", "Out for delivery", "Delivered"].includes(order.status),
            },
            {
              label: "4. Courier Transit",
              desc: order.trackingCode || order.deliveryDetails?.trackingCode ? "Tracking attached" : "Dispatch courier",
              icon: "🚚",
              check: ["Transferred to delivery partner", "Out for delivery", "Delivered"].includes(order.status),
            },
            {
              label: "5. Payout Released",
              desc: order.deliveryVerification?.isOtpVerified || order.status === "Delivered" ? "Escrow released" : "Verify delivery OTP",
              icon: "💰",
              check: !!order.deliveryVerification?.isOtpVerified || order.status === "Delivered",
            },
          ].map((st, i) => (
            <div
              key={i}
              className={`p-3 rounded-xl border transition flex flex-col justify-between ${
                st.check
                  ? "bg-emerald-50/70 border-emerald-300 text-emerald-950"
                  : "bg-stone-50 border-stone-200 text-stone-400"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-lg">{st.icon}</span>
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    st.check ? "bg-emerald-600 text-white" : "bg-stone-200 text-stone-600"
                  }`}
                >
                  {st.check ? "✓" : i + 1}
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight">{st.label}</h4>
                <p className="text-[10px] mt-0.5 line-clamp-1">{st.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Left = Items & Customer, Right = Escrow & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Items, Sizing & Delivery Address (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Order Items Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-stone-900 font-serif flex items-center justify-between">
              <span>Your Boutique's Crafts in This Order ({items.length})</span>
              <span className="text-xs font-mono font-bold text-emerald-800">
                Subtotal: {Number(order.itemsTotal || order.subTotal || order.totalPrice || 0).toLocaleString()} ETB
              </span>
            </h3>

            <div className="divide-y divide-stone-100">
              {items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.images?.[0]?.url || item.featuredImage?.url || "/placeholder.jpg"}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-stone-900 line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {Number(item.discountPrice || item.originalPrice || 0).toLocaleString()} ETB × {item.qty || 1}
                      </p>
                      {item.selectedSize && (
                        <span className="inline-block mt-1 text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md">
                          Size: {item.selectedSize}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-stone-900 font-mono">
                    {(Number(item.discountPrice || item.originalPrice || 0) * (item.qty || 1)).toLocaleString()} ETB
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Tailoring Measurements (If Custom Sizing Ordered) */}
          {hasMeasurements && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BsScissors className="text-amber-800" size={18} />
                  <h4 className="text-sm font-bold text-stone-900">
                    Buyer's Custom Body Measurements
                  </h4>
                </div>
                <button
                  onClick={copyMeasurements}
                  className="text-xs font-bold text-amber-800 hover:underline"
                >
                  Copy Specs
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {customMeasurements.bust && (
                  <div className="bg-white p-3 rounded-xl border border-amber-200">
                    <span className="text-stone-400 block text-[10px] font-bold uppercase">Bust</span>
                    <strong className="text-stone-900 text-sm font-mono">{customMeasurements.bust} cm</strong>
                  </div>
                )}
                {customMeasurements.waist && (
                  <div className="bg-white p-3 rounded-xl border border-amber-200">
                    <span className="text-stone-400 block text-[10px] font-bold uppercase">Waist</span>
                    <strong className="text-stone-900 text-sm font-mono">{customMeasurements.waist} cm</strong>
                  </div>
                )}
                {customMeasurements.hips && (
                  <div className="bg-white p-3 rounded-xl border border-amber-200">
                    <span className="text-stone-400 block text-[10px] font-bold uppercase">Hips</span>
                    <strong className="text-stone-900 text-sm font-mono">{customMeasurements.hips} cm</strong>
                  </div>
                )}
                {customMeasurements.length && (
                  <div className="bg-white p-3 rounded-xl border border-amber-200">
                    <span className="text-stone-400 block text-[10px] font-bold uppercase">Dress Length</span>
                    <strong className="text-stone-900 text-sm font-mono">{customMeasurements.length} cm</strong>
                  </div>
                )}
              </div>

              {customMeasurements.notes && (
                <div className="bg-white p-3 rounded-xl border border-amber-200 text-xs">
                  <span className="text-stone-500 font-bold block mb-0.5">Artisan Note:</span>
                  <p className="text-stone-800">{customMeasurements.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Shipping & Recipient Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-stone-900 font-serif flex items-center gap-2">
              <BsGeoAlt size={16} className="text-stone-600" /> Shipping & Customer Recipient
            </h3>

            <div className="text-xs space-y-2 text-stone-700">
              <div className="flex items-center gap-2">
                <BsPerson className="text-stone-400 text-sm" />
                <span className="font-bold text-stone-900 text-sm">{order.userData?.name || order.user?.name || "Customer"}</span>
                <span className="text-stone-400">({order.userData?.email || order.user?.email || "No email"})</span>
              </div>
              <div className="flex items-center gap-2">
                <BsTelephone className="text-stone-400 text-sm" />
                <span className="font-semibold text-stone-900">{order.userData?.phoneNumber || order.user?.phoneNumber || order.shippingAddress?.phoneNumber || "No phone"}</span>
              </div>
              <div className="pt-2 text-stone-600 border-t border-stone-100">
                <div className="font-semibold text-stone-900">Delivery Destination:</div>
                <div>{order.shippingAddress?.address1} {order.shippingAddress?.address2}</div>
                <div>{order.shippingAddress?.city}, {order.shippingAddress?.country || "Ethiopia"}</div>
              </div>
              {order.deliveryNotes && (
                <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-200/60 text-stone-700">
                  <span className="font-bold text-amber-900">Delivery Instructions:</span> {order.deliveryNotes}
                </div>
              )}
            </div>
          </div>

          {/* Pre-Shipment Quality Photo Proof (Merchant Protection) */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BsCamera className="text-emerald-700" size={18} />
                <h3 className="text-base font-bold text-stone-900 font-serif">
                  Pre-Shipment Quality Photo Proof
                </h3>
              </div>
              <button
                onClick={() => setShowProofModal(true)}
                className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition"
              >
                + Upload Quality Photo
              </button>
            </div>

            {order.deliveryVerification?.preShipmentProof?.photoUrl ? (
              <div className="flex items-start gap-4 p-3 bg-stone-50 rounded-xl border border-stone-200">
                <img
                  src={order.deliveryVerification.preShipmentProof.photoUrl}
                  alt="Pre-shipment proof"
                  className="w-24 h-24 object-cover rounded-lg border border-stone-300 shadow-2xs"
                />
                <div className="text-xs space-y-1">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    ✓ Proof Verified & Timestamped
                  </span>
                  <p className="text-stone-700 font-medium">
                    {order.deliveryVerification.preShipmentProof.note || "Garment inspected before dispatch"}
                  </p>
                  <p className="text-[11px] text-stone-400">
                    Uploaded: {new Date(order.deliveryVerification.preShipmentProof.uploadedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-500">
                Upload a photo of the completed garment with measuring tape or packaging before handing to courier. This protects your boutique from false non-delivery or sizing claims.
              </p>
            )}
          </div>

          {/* Fulfillment Status History Audit Log */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <BsClockHistory className="text-stone-700" size={16} />
                <h3 className="text-base font-bold text-stone-900 font-serif">
                  Fulfillment Status Audit Trail
                </h3>
              </div>
              <div className="space-y-3">
                {order.statusHistory.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 text-xs border-l-2 border-emerald-500 pl-3 py-0.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900">{item.status}</span>
                        <span className="text-[10px] text-stone-400">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {item.note && <p className="text-stone-600 mt-0.5">{item.note}</p>}
                      {item.updatedBy && (
                        <span className="text-[10px] text-stone-400 block mt-0.5">
                          Recorded by: {item.updatedBy}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Escrow Financials, OTP Verification & Status (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* SECURE ESCROW & EARNINGS BREAKDOWN */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900 font-serif flex items-center gap-2">
                <BsCashCoin className="text-amber-700" size={18} /> Escrow & Net Earnings
              </h3>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getPayoutBadge(payoutStatus)}`}>
                {payoutStatus}
              </span>
            </div>

            <div className="bg-stone-50 rounded-xl p-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-stone-900 font-mono">
                  {Number(order.itemsTotal || order.subTotal || 0).toLocaleString()} ETB
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Shipping Allowance:</span>
                <span className="font-semibold text-stone-900 font-mono">
                  {Number(order.shippingFee || 0).toLocaleString()} ETB
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Platform Commission (10%):</span>
                <span className="font-semibold text-rose-600 font-mono">
                  -{Number(platformFee).toLocaleString()} ETB
                </span>
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline">
                <span className="font-bold text-stone-900">Your Net Payout:</span>
                <span className="text-lg font-black text-emerald-800 font-mono">
                  {Number(netEarnings).toLocaleString()} ETB
                </span>
              </div>
            </div>

            <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
              <BsShieldCheck className="text-emerald-600" />
              <span>Funds locked in platform escrow. Credited to your Available Balance once delivery is verified.</span>
            </div>
          </div>

          {/* COURIER / HANDOVER OTP VERIFICATION CARD */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <BsCheck2Circle className="text-amber-800" size={20} />
              <div>
                <h4 className="text-sm font-bold text-stone-900">
                  Courier Handover OTP Verification
                </h4>
                <p className="text-[11px] text-stone-600">
                  Enter the 6-digit handover code provided by the buyer upon package delivery.
                </p>
              </div>
            </div>

            {order.deliveryVerification?.isOtpVerified ? (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center gap-2 text-xs text-emerald-900 font-bold">
                <FiCheck className="text-base text-emerald-700" />
                <span>Handover Verified via OTP ({order.deliveryVerification.verifiedBy || "Courier OTP Handover"})</span>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); handleVerifyOtp(); }} className="space-y-3">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-Digit OTP (e.g. 849201)"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="w-full text-center font-mono font-black text-lg tracking-widest bg-white border border-stone-300 rounded-xl p-2.5 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-500/20"
                />
                <button
                  type="submit"
                  disabled={verifyingOtp || !otpInput.trim()}
                  className="w-full py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-bold text-xs shadow-sm transition disabled:opacity-50"
                >
                  {verifyingOtp ? "Verifying..." : "Verify Delivery & Release Escrow"}
                </button>
              </form>
            )}
          </div>

          {/* FULFILLMENT & STATUS UPDATE */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-stone-900 font-serif flex items-center gap-2">
              <BsTruck size={18} className="text-emerald-700" /> Order Fulfillment Status
            </h3>

            <form onSubmit={(e) => { e.preventDefault(); handleUpdateStatus(); }} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Update Stage
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  {ORDER_STATUS_STEPS.map((step) => (
                    <option key={step} value={step}>
                      {step}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Delivery Courier / Partner
                </label>
                <input
                  type="text"
                  value={deliveryProvider}
                  onChange={(e) => setDeliveryProvider(e.target.value)}
                  placeholder="e.g. Ethiopian Post, Addis Express"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Tracking Number / Waybill
                </label>
                <input
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  placeholder="e.g. ET-POST-98234"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Status Note (Optional)
                </label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Completed handweaving, sent to courier"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all shadow-sm disabled:opacity-50"
              >
                {updating ? "Saving Changes..." : "Save Fulfillment Status"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* UPLOAD PROOF MODAL */}
      {showProofModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900">
                Upload Pre-Shipment Quality Photo
              </h3>
              <button
                onClick={() => setShowProofModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleProofUpload(); }} className="space-y-4 pt-4">
              <div className="border-2 border-dashed border-stone-300 hover:border-emerald-600 rounded-2xl p-6 text-center cursor-pointer">
                <input
                  type="file"
                  id="proof-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleProofPhotoFile}
                />
                <label htmlFor="proof-upload" className="cursor-pointer flex flex-col items-center">
                  <FiUploadCloud size={32} className="text-emerald-700 mb-2" />
                  <span className="text-xs font-bold text-stone-900">
                    Click to select photo of completed craft
                  </span>
                  <span className="text-[11px] text-stone-400 mt-0.5">
                    Measuring tape or garment tag recommended
                  </span>
                </label>
              </div>

              {proofPhoto && (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-stone-200">
                  <img src={proofPhoto} alt="Selected proof" className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Inspection Note
                </label>
                <input
                  type="text"
                  value={proofNote}
                  onChange={(e) => setProofNote(e.target.value)}
                  placeholder="e.g. Bust 95cm, length 140cm verified."
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProofModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingProof || !proofPhoto}
                  className="px-5 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow disabled:opacity-50"
                >
                  {uploadingProof ? "Uploading..." : "Save Proof"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Ethiopian Commercial Tax Invoice & Workshop Job Ticket Modal */}
      {invoiceModalOpen && (
        <MerchantInvoiceModal
          order={order}
          seller={seller}
          isOpen={invoiceModalOpen}
          onClose={() => setInvoiceModalOpen(false)}
        />
      )}
    </div>
  );
};

export default OrderDetails;