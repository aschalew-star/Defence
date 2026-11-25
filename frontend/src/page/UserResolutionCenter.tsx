import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { server } from "../server";
import { toast } from "react-toastify";
import Navbar from "../component/Layout/Navbar";
import Footer from "../component/Layout/Footer";
import {
  BsShieldCheck,
  BsShieldExclamation,
  BsClockHistory,
  BsCheckCircleFill,
  BsChatDots,
  BsBoxSeam,
  BsPlusCircle,
  BsImage,
} from "react-icons/bs";
import { FiUploadCloud } from "react-icons/fi";
import { RxCross1, RxReload } from "react-icons/rx";

interface IClaim {
  _id: string;
  disputeNumber?: string;
  returnNumber?: string;
  type: "dispute" | "return";
  orderId?: string;
  orderNumber?: string;
  shopName?: string;
  reason: string;
  details?: string;
  requestedResolution?: string;
  status: string;
  refundAmount?: number;
  evidence?: Array<{ url: string; public_id?: string }>;
  createdAt: string;
  messages?: any[];
}

const UserResolutionCenter: React.FC = () => {
  const [claims, setClaims] = useState<IClaim[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"all" | "disputes" | "returns">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedClaim, setSelectedClaim] = useState<IClaim | null>(null);

  // New claim modal
  const [newClaimModalOpen, setNewClaimModalOpen] = useState<boolean>(false);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [claimType, setClaimType] = useState<"dispute" | "return">("dispute");
  const [claimReason, setClaimReason] = useState<string>("Item Damaged / Defective");
  const [claimDetails, setClaimDetails] = useState<string>("");
  const [evidencePhotos, setEvidencePhotos] = useState<string[]>([]);
  const [submittingClaim, setSubmittingClaim] = useState<boolean>(false);

  // Message reply
  const [replyText, setReplyText] = useState<string>("");
  const [sendingReply, setSendingReply] = useState<boolean>(false);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const [disputesRes, returnsRes] = await Promise.all([
        axios.get(`${server}/dispute/get-user-disputes`, { withCredentials: true }).catch(() => ({ data: { disputes: [] } })),
        axios.get(`${server}/return/my-returns`, { withCredentials: true }).catch(() => ({ data: { returns: [] } })),
      ]);

      const formattedDisputes: IClaim[] = (disputesRes.data?.disputes || []).map((d: any) => ({
        _id: d._id,
        disputeNumber: d.disputeNumber || `DIS-${d._id.slice(-6).toUpperCase()}`,
        type: "dispute",
        orderId: d.parentOrder?._id || d.parentOrder,
        orderNumber: d.parentOrder?.orderNumber || "Order",
        shopName: d.shop?.name || "Artisan Shop",
        reason: d.reason,
        details: d.details,
        requestedResolution: d.requestedResolution || "Full Refund",
        status: d.status || "Open",
        evidence: d.evidence || [],
        createdAt: d.createdAt,
        messages: d.messages || [],
      }));

      const formattedReturns: IClaim[] = (returnsRes.data?.returns || []).map((r: any) => ({
        _id: r._id,
        returnNumber: r.returnNumber || `RET-${r._id.slice(-6).toUpperCase()}`,
        type: "return",
        orderId: r.parentOrder,
        orderNumber: r.subOrder?.subOrderNumber || "SubOrder",
        shopName: r.shop?.name || "Artisan Shop",
        reason: r.items?.[0]?.reason || "Product Return",
        details: r.items?.[0]?.reasonNote || "",
        status: r.status || "Requested",
        refundAmount: r.refundAmount || 0,
        createdAt: r.createdAt,
        messages: r.messages || [],
      }));

      setClaims([...formattedDisputes, ...formattedReturns].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrdersForClaim = async () => {
    try {
      const res = await axios.get(`${server}/order/get-all-orders-user`, { withCredentials: true }).catch(() => null);
      if (res?.data?.orders) {
        setUserOrders(res.data.orders);
        if (res.data.orders.length > 0) setSelectedOrderId(res.data.orders[0]._id);
      }
    } catch {}
  };

  useEffect(() => {
    fetchClaims();
    fetchOrdersForClaim();
  }, []);

  const handleEvidenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2 && reader.result) {
          setEvidencePhotos((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmitNewClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) {
      toast.error("Please select an order for this claim");
      return;
    }
    if (!claimDetails.trim()) {
      toast.error("Please describe the issue in detail");
      return;
    }

    setSubmittingClaim(true);
    try {
      if (claimType === "dispute") {
        const res = await axios.post(
          `${server}/dispute/create-dispute`,
          {
            orderId: selectedOrderId,
            reason: claimReason,
            details: claimDetails,
            requestedResolution: "Full Refund",
            evidence: evidencePhotos,
          },
          { withCredentials: true }
        );
        toast.success(res.data?.message || "Dispute claim submitted successfully! A mediator is assigned.");
      } else {
        const res = await axios.post(
          `${server}/order/order-refund/${selectedOrderId}`,
          {
            status: "Processing refund",
            reason: claimReason,
            details: claimDetails,
          },
          { withCredentials: true }
        );
        toast.success(res.data?.message || "Return claim submitted to the artisan!");
      }

      setNewClaimModalOpen(false);
      setClaimDetails("");
      setEvidencePhotos([]);
      fetchClaims();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit claim");
    } finally {
      setSubmittingClaim(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim || !replyText.trim()) return;
    setSendingReply(true);
    try {
      await axios.post(
        `${server}/dispute/add-message/${selectedClaim._id}`,
        { message: replyText.trim() },
        { withCredentials: true }
      );
      toast.success("Message sent to artisan & mediator!");
      setReplyText("");
      fetchClaims();
      if (selectedClaim) {
        setSelectedClaim({
          ...selectedClaim,
          messages: [...(selectedClaim.messages || []), { senderType: "customer", senderName: "You", message: replyText, createdAt: new Date().toISOString() }],
        });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send message");
    } finally {
      setSendingReply(false);
    }
  };

  const filteredClaims = claims.filter((c) => {
    if (activeTab === "disputes" && c.type !== "dispute") return false;
    if (activeTab === "returns" && c.type !== "return") return false;
    if (statusFilter !== "all") {
      if (statusFilter === "open" && !["open", "requested", "merchant responded"].includes(c.status.toLowerCase())) return false;
      if (statusFilter === "resolved" && !c.status.toLowerCase().includes("resolved") && !c.status.toLowerCase().includes("refund")) return false;
    }
    return true;
  });

  return (
    <div className="bg-stone-50 min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6 pt-24 sm:pt-28">
        {/* Header Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
              <BsShieldCheck />
              <span>Buyer Protection & Escrow Guarantee</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-stone-900 tracking-tight">
              Customer Resolution Center
            </h1>
            <p className="text-xs text-stone-500">
              Track open disputes, return claims, and escrow refunds backed by MEP 72-hour buyer inspection protection.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchClaims()}
              className="p-2.5 rounded-2xl border border-stone-200 text-stone-600 hover:bg-stone-100 transition"
              title="Refresh Claims"
            >
              <RxReload size={15} />
            </button>
            <button
              onClick={() => setNewClaimModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-2xl shadow-xs transition flex items-center gap-1.5"
            >
              <BsPlusCircle size={14} />
              <span>File New Claim</span>
            </button>
          </div>
        </div>

        {/* Protection Guarantee Banner */}
        <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/60 rounded-2xl flex items-center gap-3 text-xs text-amber-950">
          <span className="text-2xl">🛡️</span>
          <div>
            <span className="font-bold">100% Escrow Protection:</span> When you shop traditional Ethiopian crafts on MEP, the artisan receives their payout only after you receive and inspect your items. If an item is damaged or not delivered, you are guaranteed a full refund.
          </div>
        </div>

        {/* Filters & Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-stone-200 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === "all" ? "bg-stone-900 text-white shadow-2xs" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              All Claims ({claims.length})
            </button>
            <button
              onClick={() => setActiveTab("disputes")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === "disputes" ? "bg-stone-900 text-white shadow-2xs" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Disputes ({claims.filter((c) => c.type === "dispute").length})
            </button>
            <button
              onClick={() => setActiveTab("returns")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === "returns" ? "bg-stone-900 text-white shadow-2xs" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Returns ({claims.filter((c) => c.type === "return").length})
            </button>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            >
              <option value="all">All Statuses</option>
              <option value="open">Active / In Progress</option>
              <option value="resolved">Resolved & Refunded</option>
            </select>
          </div>
        </div>

        {/* Claims List */}
        {loading ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-stone-200">
            <div className="w-8 h-8 border-3 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-bold text-stone-500">Loading your protection claims...</p>
          </div>
        ) : filteredClaims.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 space-y-3">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto text-2xl">
              <BsCheckCircleFill />
            </div>
            <h3 className="font-serif font-black text-lg text-stone-900">No Open Disputes</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              All your Ethiopian craft orders are currently in good standing! If you ever receive an item that requires mediation, click "File New Claim" above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredClaims.map((claim) => {
              const isResolved = claim.status.toLowerCase().includes("resolved") || claim.status.toLowerCase().includes("refund");
              return (
                <div
                  key={claim._id}
                  onClick={() => setSelectedClaim(claim)}
                  className="bg-white p-5 rounded-3xl border border-stone-200 hover:border-emerald-700/50 shadow-2xs hover:shadow-xs transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-base ${
                        claim.type === "dispute"
                          ? "bg-amber-100 text-amber-900"
                          : "bg-purple-100 text-purple-900"
                      }`}
                    >
                      {claim.type === "dispute" ? <BsShieldExclamation /> : <BsBoxSeam />}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-stone-900">
                          {claim.disputeNumber || claim.returnNumber}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                          {claim.shopName}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-stone-900">{claim.reason}</h4>
                      <p className="text-xs text-stone-500 line-clamp-1">
                        {claim.details || "No additional notes provided."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-stone-100">
                    <div className="text-right">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isResolved
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-900 ring-1 ring-amber-300"
                        }`}
                      >
                        {claim.status}
                      </span>
                      <div className="text-[10px] text-stone-400 mt-0.5">
                        {new Date(claim.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <button className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition">
                      View Thread →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Claim Details & Live Thread Drawer Modal */}
        {selectedClaim && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-stone-900">
                    {selectedClaim.disputeNumber || selectedClaim.returnNumber}
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                    {selectedClaim.status}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedClaim(null)}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-700 transition"
                >
                  <RxCross1 size={18} />
                </button>
              </div>

              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">Merchant Store:</span>
                  <span className="font-bold text-stone-900">{selectedClaim.shopName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Claim Reason:</span>
                  <span className="font-bold text-stone-900">{selectedClaim.reason}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Requested Outcome:</span>
                  <span className="font-bold text-emerald-800">{selectedClaim.requestedResolution || "Full Escrow Refund"}</span>
                </div>
                <p className="text-stone-600 pt-2 border-t border-stone-200">
                  {selectedClaim.details || "No additional description."}
                </p>
              </div>

              {/* Photo Evidence Gallery */}
              {selectedClaim.evidence && selectedClaim.evidence.length > 0 && (
                <div>
                  <h5 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    Photographic Proof ({selectedClaim.evidence.length})
                  </h5>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {selectedClaim.evidence.map((ev, idx) => (
                      <a key={idx} href={ev.url} target="_blank" rel="noreferrer" className="block w-20 h-20 rounded-xl overflow-hidden border border-stone-200 flex-shrink-0 hover:opacity-90">
                        <img src={ev.url} alt="Evidence" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Conversation Messages */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Mediation Messages & Timeline
                </h5>
                <div className="space-y-2 max-h-48 overflow-y-auto p-3 bg-stone-50 rounded-2xl border border-stone-200">
                  {(!selectedClaim.messages || selectedClaim.messages.length === 0) ? (
                    <p className="text-xs text-stone-400 text-center py-4">No messages in this claim thread yet.</p>
                  ) : (
                    selectedClaim.messages.map((m: any, idx: number) => (
                      <div key={idx} className={`p-2.5 rounded-xl text-xs ${m.senderType === "customer" ? "bg-emerald-50 text-emerald-950 ml-6" : "bg-white text-stone-900 mr-6 border border-stone-200"}`}>
                        <div className="flex justify-between text-[10px] text-stone-400 mb-1">
                          <span className="font-bold">{m.senderName || m.senderType}</span>
                          <span>{new Date(m.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <p>{m.message}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendReply} className="flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type a message to the artisan or mediator..."
                    className="flex-1 px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                  <button
                    type="submit"
                    disabled={sendingReply || !replyText.trim()}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                  >
                    {sendingReply ? "Sending..." : "Reply"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* File New Claim Modal */}
        {newClaimModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <h3 className="text-base font-bold font-serif text-stone-900">
                  File Buyer Protection Claim
                </h3>
                <button
                  onClick={() => setNewClaimModalOpen(false)}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-700 transition"
                >
                  <RxCross1 size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitNewClaim} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Select Order
                  </label>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    {userOrders.length === 0 ? (
                      <option value="">No past orders found</option>
                    ) : (
                      userOrders.map((ord) => (
                        <option key={ord._id} value={ord._id}>
                          Order #{ord.orderNumber || ord._id.slice(-6)} — {ord.cart?.[0]?.name} ({ord.totalPrice?.toLocaleString()} ETB)
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setClaimType("dispute")}
                    className={`p-3 rounded-2xl border text-xs font-bold text-center transition ${
                      claimType === "dispute" ? "bg-amber-100 border-amber-400 text-amber-950" : "bg-stone-50 border-stone-200 text-stone-600"
                    }`}
                  >
                    🛡️ Dispute Mediation
                  </button>
                  <button
                    type="button"
                    onClick={() => setClaimType("return")}
                    className={`p-3 rounded-2xl border text-xs font-bold text-center transition ${
                      claimType === "return" ? "bg-purple-100 border-purple-400 text-purple-950" : "bg-stone-50 border-stone-200 text-stone-600"
                    }`}
                  >
                    📦 Physical Return
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Reason for Claim
                  </label>
                  <select
                    value={claimReason}
                    onChange={(e) => setClaimReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    <option value="Item Damaged / Defective">Item Damaged / Torn Handweaving</option>
                    <option value="Incorrect Size / Custom Fit">Incorrect Size / Custom Measurements Mismatch</option>
                    <option value="Color or Tibeb Pattern Discrepancy">Color or Tibeb Pattern Discrepancy</option>
                    <option value="Parcel Not Delivered / Missing">Package Not Delivered / Missing</option>
                    <option value="Counterfeit / Non-Handmade">Not Authentic Ethiopian Artisan Craft</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Describe the Issue
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={claimDetails}
                    onChange={(e) => setClaimDetails(e.target.value)}
                    placeholder="Provide exact details to help the mediator evaluate your refund request..."
                    className="w-full p-3 rounded-2xl border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                {/* Upload Photos */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Attach Damage Photos (Recommended)
                  </label>
                  <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-stone-300 rounded-2xl hover:border-emerald-700 cursor-pointer bg-stone-50 text-xs font-bold text-stone-600 transition">
                    <FiUploadCloud size={16} />
                    <span>Upload Images ({evidencePhotos.length} selected)</span>
                    <input type="file" multiple accept="image/*" onChange={handleEvidenceUpload} className="hidden" />
                  </label>
                  {evidencePhotos.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto mt-2">
                      {evidencePhotos.map((p, i) => (
                        <img key={i} src={p} alt="Proof" className="w-14 h-14 object-cover rounded-xl border border-stone-200" />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setNewClaimModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingClaim}
                    className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs transition disabled:opacity-50"
                  >
                    {submittingClaim ? "Submitting..." : "Submit Claim for Escrow Review"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default UserResolutionCenter;
