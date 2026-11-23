import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import AdminNavbar from "../../component/Admin/AdminNavbar";
import Adminsidebar from "../../component/Admin/Adminheader";
import {
  BsBoxSeam,
  BsShieldCheck,
  BsClockHistory,
  BsCheckCircleFill,
  BsArrowRepeat,
  BsCashCoin,
} from "react-icons/bs";
import { RxCross1, RxReload } from "react-icons/rx";

const AdminReturnsPage: React.FC = () => {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedReturn, setSelectedReturn] = useState<any | null>(null);

  // Arbitration decision modal
  const [arbitrationDecision, setArbitrationDecision] = useState<"approve_refund" | "reject_return">("approve_refund");
  const [arbitrationNote, setArbitrationNote] = useState<string>("");
  const [submittingDecision, setSubmittingDecision] = useState<boolean>(false);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${server}/return/admin-all-returns`, { withCredentials: true });
      if (res.data?.success) {
        setReturns(res.data.returns || []);
      }
    } catch {
      // Mock / fallback if no returns yet
      setReturns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleArbitrate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturn) return;

    setSubmittingDecision(true);
    try {
      const res = await axios.put(
        `${server}/return/admin-arbitrate/${selectedReturn._id}`,
        {
          decision: arbitrationDecision,
          note: arbitrationNote,
        },
        { withCredentials: true }
      );
      toast.success(res.data?.message || "Return arbitration completed!");
      setSelectedReturn(null);
      setArbitrationNote("");
      fetchReturns();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setSubmittingDecision(false);
    }
  };

  const metrics = useMemo(() => {
    const total = returns.length;
    const pending = returns.filter((r) => r.status === "Requested" || r.status === "Item Shipped").length;
    const inspected = returns.filter((r) => r.status === "Inspected" || r.status === "Item Received").length;
    const refunded = returns.filter((r) => r.status === "Refunded").length;
    const totalRefundETB = returns.reduce((acc, r) => acc + (r.refundAmount || 0), 0);
    return { total, pending, inspected, refunded, totalRefundETB };
  }, [returns]);

  const filteredReturns = returns.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <AdminNavbar />

      <div className="flex w-full pt-16">
        <div className="w-[72px] md:w-[270px] flex-shrink-0">
          <Adminsidebar active={14} />
        </div>

        <main className="flex-1 w-full min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-800 uppercase tracking-wider">
                <BsBoxSeam />
                <span>Physical Return & Inspection Vault</span>
              </div>
              <h1 className="text-2xl font-black font-serif text-stone-900 tracking-tight">
                Returns & Escrow Refund Desk
              </h1>
              <p className="text-xs text-stone-500">
                Oversee physical handwoven returns from customers, verify artisan parcel receipts, and release escrow refunds.
              </p>
            </div>

            <button
              onClick={() => fetchReturns()}
              className="p-2.5 rounded-2xl border border-stone-200 text-stone-600 hover:bg-stone-100 transition self-start sm:self-auto"
            >
              <RxReload size={15} />
            </button>
          </div>

          {/* Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
              <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                Total Returns
              </div>
              <div className="font-mono text-2xl font-black text-stone-900">{metrics.total}</div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-amber-300 shadow-2xs bg-amber-50/40">
              <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1">
                In Transit / Pending
              </div>
              <div className="font-mono text-2xl font-black text-amber-900">{metrics.pending}</div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-purple-200 shadow-2xs bg-purple-50/40">
              <div className="text-[11px] font-bold text-purple-800 uppercase tracking-wider mb-1">
                Awaiting Inspection
              </div>
              <div className="font-mono text-2xl font-black text-purple-900">{metrics.inspected}</div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
              <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
                Escrow Refunded
              </div>
              <div className="font-mono text-2xl font-black text-emerald-800">{metrics.refunded}</div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-stone-200">
              <div className="w-8 h-8 border-3 border-purple-800 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs font-bold text-stone-500">Loading return claims...</p>
            </div>
          ) : filteredReturns.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 space-y-3">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto text-2xl">
                <BsCheckCircleFill />
              </div>
              <h3 className="font-serif font-black text-lg text-stone-900">Zero Outstanding Returns</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                All physical craft returns are currently settled and verified by the inspection team.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5">Return ID</th>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Artisan Shop</th>
                    <th className="px-5 py-3.5">Refund Amount</th>
                    <th className="px-5 py-3.5">Inspection Status</th>
                    <th className="px-5 py-3.5 text-right">Arbitrate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredReturns.map((r) => (
                    <tr key={r._id} className="hover:bg-stone-50/50 transition">
                      <td className="px-5 py-4 font-mono font-bold text-stone-900">
                        {r.returnNumber || `RET-${r._id.slice(-6).toUpperCase()}`}
                      </td>
                      <td className="px-5 py-4 font-semibold text-stone-800">
                        {r.customer?.name || "Customer"}
                      </td>
                      <td className="px-5 py-4 text-stone-700">
                        {r.shop?.name || "Artisan Shop"}
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-emerald-800">
                        {r.refundAmount?.toLocaleString()} ETB
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900">
                          {r.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedReturn(r)}
                          className="px-3 py-1.5 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl transition"
                        >
                          Inspect & Settle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Settle Modal */}
          {selectedReturn && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <h3 className="font-serif font-black text-lg text-stone-900">
                    Physical Return Inspection Decision
                  </h3>
                  <button
                    onClick={() => setSelectedReturn(null)}
                    className="p-1 rounded-full text-stone-400 hover:text-stone-700"
                  >
                    <RxCross1 size={18} />
                  </button>
                </div>

                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Return ID:</span>
                    <span className="font-mono font-bold text-stone-900">{selectedReturn.returnNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Artisan Store:</span>
                    <span className="font-bold text-stone-900">{selectedReturn.shop?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Refund Value:</span>
                    <span className="font-bold font-mono text-emerald-800 text-sm">
                      {selectedReturn.refundAmount?.toLocaleString()} ETB
                    </span>
                  </div>
                </div>

                <form onSubmit={handleArbitrate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      Inspector Settlement Decision
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-50 text-xs">
                        <input
                          type="radio"
                          name="decision"
                          checked={arbitrationDecision === "approve_refund"}
                          onChange={() => setArbitrationDecision("approve_refund")}
                        />
                        <span className="font-bold text-stone-900">Approve & Release Refund to Customer</span>
                        <span className="text-stone-400">— Item received intact</span>
                      </label>
                      <label className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-50 text-xs">
                        <input
                          type="radio"
                          name="decision"
                          checked={arbitrationDecision === "reject_return"}
                          onChange={() => setArbitrationDecision("reject_return")}
                        />
                        <span className="font-bold text-stone-900">Reject & Release Escrow to Artisan</span>
                        <span className="text-stone-400">— Item damaged by buyer</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Inspector Note
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={arbitrationNote}
                      onChange={(e) => setArbitrationNote(e.target.value)}
                      placeholder="Inspection notes recorded in the platform ledger..."
                      className="w-full p-3 rounded-2xl border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-purple-700"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={() => setSelectedReturn(null)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingDecision}
                      className="px-5 py-2.5 bg-purple-900 hover:bg-purple-950 text-white rounded-xl text-xs font-bold shadow-xs transition disabled:opacity-50"
                    >
                      {submittingDecision ? "Executing..." : "Confirm Settlement"}
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

export default AdminReturnsPage;
