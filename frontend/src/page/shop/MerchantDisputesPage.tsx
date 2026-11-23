import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import MerchantNavbar from "../../component/shop/MerchantNavbar";
import DashboardSideBar from "../../component/shop/DashboardSideBar";
import {
  BsShieldExclamation,
  BsCheckCircleFill,
} from "react-icons/bs";
import { RxCross1, RxReload } from "react-icons/rx";

const MerchantDisputesPage: React.FC = () => {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDispute, setSelectedDispute] = useState<any | null>(null);

  // Response drawer state
  const [responseAction, setResponseAction] = useState<"accept_refund" | "offer_partial" | "counter_proof">("accept_refund");
  const [partialAmount, setPartialAmount] = useState<string>("");
  const [merchantNote, setMerchantNote] = useState<string>("");
  const [submittingResponse, setSubmittingResponse] = useState<boolean>(false);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${server}/dispute/get-seller-disputes`, { withCredentials: true });
      if (res.data?.success) {
        setDisputes(res.data.disputes || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleRespond = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute) return;

    setSubmittingResponse(true);
    try {
      const res = await axios.put(
        `${server}/dispute/merchant-respond/${selectedDispute._id}`,
        {
          action: responseAction,
          partialAmount: responseAction === "offer_partial" ? Number(partialAmount) : undefined,
          note: merchantNote,
        },
        { withCredentials: true }
      );
      toast.success(res.data?.message || "Response recorded! The mediator and buyer will be notified.");
      setSelectedDispute(null);
      setMerchantNote("");
      setPartialAmount("");
      fetchDisputes();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit response");
    } finally {
      setSubmittingResponse(false);
    }
  };

  const totalClaims = disputes.length;
  const pendingAction = disputes.filter((d) => d.status === "Open").length;
  const resolved = disputes.filter((d) => d.status.toLowerCase().includes("resolved")).length;

  const filteredDisputes = disputes.filter((d) => {
    if (statusFilter === "open" && d.status !== "Open") return false;
    if (statusFilter === "resolved" && !d.status.toLowerCase().includes("resolved")) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <MerchantNavbar />

      <div className="flex w-full pt-16">
        <div className="w-[72px] md:w-[270px] flex-shrink-0">
          <DashboardSideBar active={13} />
        </div>

        <main className="flex-1 w-full min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
                <BsShieldExclamation />
                <span>Escrow Arbitration Desk</span>
              </div>
              <h1 className="text-2xl font-black font-serif text-stone-900 tracking-tight">
                Disputes & Buyer Claims
              </h1>
              <p className="text-xs text-stone-500">
                Manage and resolve customer order issues, negotiate partial settlements, and protect your store trust rating.
              </p>
            </div>

            <button
              onClick={() => fetchDisputes()}
              className="p-2.5 rounded-2xl border border-stone-200 text-stone-600 hover:bg-stone-100 transition self-start sm:self-auto"
            >
              <RxReload size={15} />
            </button>
          </div>

          {/* Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
              <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                Total Claims Filed
              </div>
              <div className="font-mono text-2xl font-black text-stone-900">{totalClaims}</div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-amber-300 shadow-2xs bg-gradient-to-br from-amber-50/50 to-white">
              <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1">
                Action Required (Pending)
              </div>
              <div className="font-mono text-2xl font-black text-amber-900">{pendingAction}</div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
              <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
                Resolved Claims
              </div>
              <div className="font-mono text-2xl font-black text-emerald-800">{resolved}</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  statusFilter === "all" ? "bg-stone-900 text-white" : "bg-white text-stone-600 border border-stone-200"
                }`}
              >
                All ({disputes.length})
              </button>
              <button
                onClick={() => setStatusFilter("open")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  statusFilter === "open" ? "bg-stone-900 text-white" : "bg-white text-stone-600 border border-stone-200"
                }`}
              >
                Action Required ({pendingAction})
              </button>
              <button
                onClick={() => setStatusFilter("resolved")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  statusFilter === "resolved" ? "bg-stone-900 text-white" : "bg-white text-stone-600 border border-stone-200"
                }`}
              >
                Resolved ({resolved})
              </button>
            </div>
          </div>

          {/* Disputes Table */}
          {loading ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-stone-200">
              <div className="w-8 h-8 border-3 border-amber-800 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs font-bold text-stone-500">Loading shop claims...</p>
            </div>
          ) : filteredDisputes.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 space-y-3">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto text-2xl">
                <BsCheckCircleFill />
              </div>
              <h3 className="font-serif font-black text-lg text-stone-900">Zero Pending Disputes</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Your artisan shop has no active buyer claims! Keep delivering high-quality traditional handwoven garments to maintain your Top-Rated badge.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5">Dispute ID</th>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Issue & Reason</th>
                    <th className="px-5 py-3.5">Requested Outcome</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredDisputes.map((d) => (
                    <tr key={d._id} className="hover:bg-stone-50/50 transition">
                      <td className="px-5 py-4 font-mono font-bold text-stone-900">
                        {d.disputeNumber || `DIS-${d._id.slice(-6).toUpperCase()}`}
                      </td>
                      <td className="px-5 py-4 font-semibold text-stone-800">
                        {d.customer?.name || "Customer"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-stone-900">{d.reason}</div>
                        <div className="text-[11px] text-stone-400 line-clamp-1">{d.details}</div>
                      </td>
                      <td className="px-5 py-4 text-emerald-800 font-semibold">
                        {d.requestedResolution || "Full Refund"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            d.status === "Open"
                              ? "bg-amber-100 text-amber-900 ring-1 ring-amber-300"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedDispute(d)}
                          className="px-3 py-1.5 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl transition"
                        >
                          Respond & Arbitrate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Respond Modal Drawer */}
          {selectedDispute && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <h3 className="font-serif font-black text-lg text-stone-900">
                    Respond to Buyer Claim
                  </h3>
                  <button
                    onClick={() => setSelectedDispute(null)}
                    className="p-1 rounded-full text-stone-400 hover:text-stone-700"
                  >
                    <RxCross1 size={18} />
                  </button>
                </div>

                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Claim ID:</span>
                    <span className="font-mono font-bold text-stone-900">{selectedDispute.disputeNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Customer:</span>
                    <span className="font-bold text-stone-900">{selectedDispute.customer?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Reason:</span>
                    <span className="font-bold text-stone-900">{selectedDispute.reason}</span>
                  </div>
                  <p className="text-stone-600 pt-2 border-t border-stone-200">
                    "{selectedDispute.details}"
                  </p>
                </div>

                <form onSubmit={handleRespond} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      Choose Your Resolution Offer
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-50 text-xs">
                        <input
                          type="radio"
                          name="action"
                          checked={responseAction === "accept_refund"}
                          onChange={() => setResponseAction("accept_refund")}
                        />
                        <span className="font-bold text-stone-900">Accept Full Refund</span>
                        <span className="text-stone-400">— Return funds to customer immediately</span>
                      </label>
                      <label className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-50 text-xs">
                        <input
                          type="radio"
                          name="action"
                          checked={responseAction === "offer_partial"}
                          onChange={() => setResponseAction("offer_partial")}
                        />
                        <span className="font-bold text-stone-900">Offer Partial Settlement</span>
                        <span className="text-stone-400">— Discount for customer to keep item</span>
                      </label>
                      <label className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-50 text-xs">
                        <input
                          type="radio"
                          name="action"
                          checked={responseAction === "counter_proof"}
                          onChange={() => setResponseAction("counter_proof")}
                        />
                        <span className="font-bold text-stone-900">Counter with Handcraft Explanation</span>
                        <span className="text-stone-400">— Traditional weave characteristics</span>
                      </label>
                    </div>
                  </div>

                  {responseAction === "offer_partial" && (
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Offered Compensation Amount (ETB)
                      </label>
                      <input
                        type="number"
                        required
                        value={partialAmount}
                        onChange={(e) => setPartialAmount(e.target.value)}
                        placeholder="e.g. 500"
                        className="w-full px-4 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Artisan Explanation / Note
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={merchantNote}
                      onChange={(e) => setMerchantNote(e.target.value)}
                      placeholder="Explain to the mediator and customer (e.g. Weaving details, fabric care)..."
                      className="w-full p-3 rounded-2xl border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-amber-700"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={() => setSelectedDispute(null)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingResponse}
                      className="px-5 py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold shadow-xs transition disabled:opacity-50"
                    >
                      {submittingResponse ? "Submitting..." : "Submit Response to Mediator"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MerchantDisputesPage;
