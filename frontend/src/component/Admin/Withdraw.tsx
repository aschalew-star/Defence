import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import { server } from "../../server";
import {
  BsPencil,
  BsShieldCheck,
  BsCashCoin,
  BsClockHistory,
  BsCheckCircleFill,
  BsReceipt,
} from "react-icons/bs";
import { RxCross1, RxReload } from "react-icons/rx";
import { FiDownload } from "react-icons/fi";
import { toast } from "react-toastify";

const AllWithdraw = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [withdrawData, setWithdrawData] = useState<any | null>(null);
  const [withdrawStatus, setWithdrawStatus] = useState("Paid");
  const [transactionReference, setTransactionReference] = useState("");
  const [adminComment, setAdminComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [autoDisbursing, setAutoDisbursing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [selectedVoucher, setSelectedVoucher] = useState<any | null>(null);

  const activeWithdrawals: any[] = data || [];

  const fetchWithdrawals = () => {
    setLoading(true);
    axios
      .get(`${server}/withdraw/get-all-withdraw-request`, {
        withCredentials: true,
      })
      .then((res) => {
        setData(res.data.withdraws || []);
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "Failed to load withdrawal requests");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  // Financial Metrics
  const metrics = useMemo(() => {
    const totalRequests = activeWithdrawals.length;
    const paidRequests = activeWithdrawals.filter(
      (w) => w.status?.toLowerCase() === "paid" || w.status?.toLowerCase() === "succeed"
    );
    const totalDisbursed = paidRequests.reduce((acc, w) => acc + (w.amount || 0), 0);
    const pendingRequests = activeWithdrawals.filter((w) => w.status === "Processing");
    const totalPendingAmount = pendingRequests.reduce((acc, w) => acc + (w.amount || 0), 0);

    return {
      totalRequests,
      paidCount: paidRequests.length,
      totalDisbursed,
      pendingCount: pendingRequests.length,
      totalPendingAmount,
    };
  }, [activeWithdrawals]);

  // Filtered requests
  const filteredData = useMemo(() => {
    return activeWithdrawals.filter((item) => {
      if (statusFilter !== "all") {
        if (statusFilter === "Processing" && item.status !== "Processing") return false;
        if (
          statusFilter === "Paid" &&
          item.status?.toLowerCase() !== "paid" &&
          item.status?.toLowerCase() !== "succeed"
        )
          return false;
        if (statusFilter === "Rejected" && item.status?.toLowerCase() !== "rejected")
          return false;
      }

      if (methodFilter !== "all") {
        const methodType = (
          item.payoutMethod?.methodType ||
          item.payoutMethod?.type ||
          ""
        ).toLowerCase();
        if (methodFilter === "telebirr" && !methodType.includes("telebirr")) return false;
        if (methodFilter === "cbe" && !methodType.includes("cbe")) return false;
        if (
          methodFilter === "bank" &&
          (methodType.includes("telebirr") || methodType.includes("cbe"))
        )
          return false;
      }

      return true;
    });
  }, [activeWithdrawals, statusFilter, methodFilter]);

  // Auto-generate realistic Ethiopian reference
  const generateRef = (type: string) => {
    const isTb = type.toLowerCase().includes("telebirr");
    const prefix = isTb ? "TB-ET" : "CBE-TX";
    const num = Math.floor(10000000 + Math.random() * 90000000);
    setTransactionReference(`${prefix}-${num}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawData) return;
    setSubmitting(true);

    try {
      const res = await axios.put(
        `${server}/withdraw/update-withdraw-request/${withdrawData.id}`,
        {
          sellerId: withdrawData.shopId,
          status: withdrawStatus,
          transactionReference: transactionReference.trim() || undefined,
          adminComment: adminComment.trim() || undefined,
        },
        { withCredentials: true }
      );

      toast.success(res.data.message || "Withdrawal request updated successfully!");
      setData(res.data.withdraws || []);
      setOpen(false);
      setTransactionReference("");
      setAdminComment("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update withdrawal request");
    } finally {
      setSubmitting(false);
    }
  };

  // Automated Disbursement via Chapa Transfer API
  const handleAutoDisburse = async () => {
    if (!withdrawData?.id) return;
    if (
      !window.confirm(
        `Are you sure you want to automatically transfer ${Number(withdrawData.amount || 0).toLocaleString()} ETB to ${withdrawData.sellerName} via Chapa Transfer API?`
      )
    ) {
      return;
    }

    setAutoDisbursing(true);
    try {
      const res = await axios.post(
        `${server}/withdraw/auto-disburse/${withdrawData.id}`,
        {},
        { withCredentials: true }
      );
      toast.success(res.data.message || "Disbursement completed via Chapa Transfer!");
      setData(res.data.withdraws || []);
      setOpen(false);
      setTransactionReference("");
      setAdminComment("");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Failed to auto-disburse with Chapa. You can use manual settlement instead."
      );
    } finally {
      setAutoDisbursing(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!filteredData.length) return;
    const headers = ["ID", "Merchant", "Amount ETB", "Method", "Account/Phone", "Status", "Reference", "Requested At"];
    const rows = filteredData.map((w) => [
      `"${w._id}"`,
      `"${w.seller?.name || "Merchant"}"`,
      w.amount || 0,
      `"${w.payoutMethod?.methodType || w.payoutMethod?.type || "Telebirr"}"`,
      `"${w.payoutMethod?.phoneNumber || w.payoutMethod?.accountNumber || ""}"`,
      `"${w.status}"`,
      `"${w.transactionReference || ""}"`,
      `"${new Date(w.createdAt).toISOString()}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Merchant_Payouts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Payout registry exported to CSV!");
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2">
            <BsShieldCheck size={14} /> Ministry of Trade & Electronic Settlement Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            Artisan Payouts & Settlement Disbursements
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
            Authorize and execute artisan withdrawals across Telebirr, CBE Birr, and Ethiopian Commercial Banks with immutable ledger auditing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition shadow-2xs"
          >
            <FiDownload size={13} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={fetchWithdrawals}
            className="px-4 py-2.5 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
          >
            <RxReload size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Disbursed</span>
            <div className="p-2 rounded-2xl bg-emerald-50 text-emerald-700">
              <BsCashCoin size={16} />
            </div>
          </div>
          <div className="text-2xl font-black font-serif text-emerald-900">
            {metrics.totalDisbursed.toLocaleString()} <span className="text-xs font-sans text-stone-500">ETB</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">
            {metrics.paidCount} completed payouts
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Approval</span>
            <div className="p-2 rounded-2xl bg-amber-50 text-amber-700">
              <BsClockHistory size={16} />
            </div>
          </div>
          <div className="text-2xl font-black font-serif text-amber-900">
            {metrics.totalPendingAmount.toLocaleString()} <span className="text-xs font-sans text-stone-500">ETB</span>
          </div>
          <span className="text-[11px] text-amber-800 font-medium">
            {metrics.pendingCount} awaiting transfer
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Requests</span>
            <div className="p-2 rounded-2xl bg-blue-50 text-blue-700">
              <BsReceipt size={16} />
            </div>
          </div>
          <div className="text-2xl font-black font-serif text-stone-900">{metrics.totalRequests}</div>
          <span className="text-[11px] text-blue-700 font-medium">Lifetime requests</span>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Platform Payout Fee</span>
            <div className="p-2 rounded-2xl bg-stone-100 text-stone-700">
              <BsShieldCheck size={16} />
            </div>
          </div>
          <div className="text-2xl font-black font-serif text-stone-900">0.00 ETB</div>
          <span className="text-[11px] text-stone-500 font-medium">100% free artisan payout</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: `All Requests (${metrics.totalRequests})` },
            { id: "Processing", label: `Pending (${metrics.pendingCount})` },
            { id: "Paid", label: `Paid / Succeeded (${metrics.paidCount})` },
            { id: "Rejected", label: "Rejected" },
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

        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="px-3.5 py-2 rounded-2xl border border-stone-300 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-700 text-stone-700"
        >
          <option value="all">All Payout Channels</option>
          <option value="telebirr">Telebirr Only</option>
          <option value="cbe">CBE Birr / CBE Bank</option>
          <option value="bank">Other Commercial Banks</option>
        </select>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-stone-500 text-xs space-y-2">
            <div className="w-8 h-8 border-4 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Loading withdrawal requests...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="p-16 text-center text-stone-500 text-xs space-y-1">
            <BsReceipt className="mx-auto text-3xl text-stone-300" />
            <p className="text-sm font-semibold text-stone-700">No payout requests found matching filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider border-b border-stone-200 font-bold">
                <tr>
                  <th className="px-5 py-4">Artisan Merchant</th>
                  <th className="px-5 py-4">Disbursement Amount</th>
                  <th className="px-5 py-4">Channel</th>
                  <th className="px-5 py-4">Account / Phone Details</th>
                  <th className="px-5 py-4">Settlement Status</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-xs">
                {filteredData.map((item) => {
                  const sellerName = item.seller?.name || item.shop?.name || "Merchant";
                  const sellerEmail = item.seller?.email || item.shop?.email || "";
                  const method = item.payoutMethod || {};
                  const isProcessing = item.status === "Processing";
                  const isPaid = item.status === "Paid" || item.status === "Succeed";
                  const isRejected = item.status === "Rejected";

                  return (
                    <tr key={item._id} className="hover:bg-stone-50/80 transition-colors">
                      {/* Merchant */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-stone-900 font-serif text-sm">{sellerName}</div>
                        <div className="text-[11px] text-stone-400 font-mono">{sellerEmail}</div>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4 font-bold text-emerald-900 font-serif text-sm">
                        {Number(item.amount || 0).toLocaleString()} ETB
                      </td>

                      {/* Channel */}
                      <td className="px-5 py-4">
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-800 border border-stone-200">
                          {method.methodType || method.type || "Telebirr"}
                        </span>
                      </td>

                      {/* Account Details */}
                      <td className="px-5 py-4">
                        <div className="font-mono font-bold text-stone-900">
                          {method.phoneNumber || method.accountNumber || "N/A"}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          Holder: {method.accountName || method.accountHolderName || sellerName}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isPaid
                              ? "bg-emerald-100 text-emerald-800"
                              : isRejected
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-900 ring-1 ring-amber-300"
                          }`}
                        >
                          {item.status}
                        </span>
                        {item.transactionReference && (
                          <div className="text-[10px] font-mono text-stone-400 mt-0.5">
                            Ref: {item.transactionReference}
                          </div>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-stone-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right">
                        {isProcessing ? (
                          <button
                            onClick={() => {
                              setWithdrawData({
                                id: item._id,
                                shopId: item.shopId || item.shop?._id || item.seller?._id,
                                amount: item.amount,
                                sellerName,
                                method,
                              });
                              setWithdrawStatus("Paid");
                              generateRef(method.methodType || method.type || "Telebirr");
                              setOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs transition"
                          >
                            <BsPencil size={12} />
                            <span>Settle</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedVoucher(item)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition"
                          >
                            <BsReceipt size={12} />
                            <span>Slip</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payout Modal */}
      {open && withdrawData && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <h2 className="text-lg font-bold font-serif text-stone-900">
                Execute Merchant Payout
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 transition"
              >
                <RxCross1 size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">Merchant Store:</span>
                  <span className="font-bold text-stone-900">{withdrawData.sellerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Disbursement Amount:</span>
                  <span className="font-bold text-emerald-800 text-base font-serif">
                    {Number(withdrawData.amount || 0).toLocaleString()} ETB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Destination Account / Phone:</span>
                  <span className="font-mono font-bold text-stone-900">
                    {withdrawData.method?.phoneNumber || withdrawData.method?.accountNumber || "N/A"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Settlement Decision
                </label>
                <select
                  value={withdrawStatus}
                  onChange={(e) => setWithdrawStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  <option value="Paid">Disbursed / Paid (Settled to Artisan)</option>
                  <option value="Rejected">Rejected (Refund to Merchant Balance)</option>
                </select>
              </div>

              {withdrawStatus === "Paid" && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Transaction Reference Number
                    </label>
                    <button
                      type="button"
                      onClick={() => generateRef(withdrawData.method?.methodType || withdrawData.method?.type || "Telebirr")}
                      className="text-xs text-amber-800 hover:underline font-bold"
                    >
                      Generate New Ref
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={transactionReference}
                    onChange={(e) => setTransactionReference(e.target.value)}
                    placeholder="e.g. TB-ET-84920193"
                    className="w-full px-4 py-2.5 rounded-2xl border border-stone-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Administrative Note (Optional)
                </label>
                <textarea
                  rows={2}
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  placeholder="Notes recorded in ledger regarding this disbursement"
                  className="w-full p-3 rounded-2xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-stone-200">
                {withdrawStatus === "Paid" && (
                  <button
                    type="button"
                    disabled={autoDisbursing || submitting}
                    onClick={handleAutoDisburse}
                    className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5"
                  >
                    <span>⚡ {autoDisbursing ? "Disbursing with Chapa..." : "Auto-Disburse (Chapa Transfer)"}</span>
                  </button>
                )}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || autoDisbursing}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition ${
                      withdrawStatus === "Rejected"
                        ? "bg-rose-600 hover:bg-rose-700"
                        : "bg-stone-900 hover:bg-black"
                    }`}
                  >
                    {submitting ? "Processing..." : `Manual ${withdrawStatus}`}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disbursal Settlement Slip / Voucher Modal */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-4 text-center border border-stone-300">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto text-xl">
              <BsCheckCircleFill />
            </div>
            <div>
              <h3 className="font-serif font-black text-lg text-stone-900">
                Artisan Disbursal Voucher
              </h3>
              <p className="text-xs text-stone-500">Official Settlement Confirmation</p>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl space-y-2 text-xs text-left border border-stone-200">
              <div className="flex justify-between">
                <span className="text-stone-500">Merchant Store:</span>
                <span className="font-bold text-stone-900">
                  {selectedVoucher.seller?.name || "Merchant"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Disbursed Amount:</span>
                <span className="font-bold text-emerald-800 text-sm font-serif">
                  {Number(selectedVoucher.amount).toLocaleString()} ETB
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Channel:</span>
                <span className="font-semibold text-stone-900">
                  {selectedVoucher.payoutMethod?.methodType || selectedVoucher.payoutMethod?.type || "Telebirr"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Account / Phone:</span>
                <span className="font-mono text-stone-900">
                  {selectedVoucher.payoutMethod?.phoneNumber || selectedVoucher.payoutMethod?.accountNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Transaction Ref:</span>
                <span className="font-mono font-bold text-stone-900">
                  {selectedVoucher.transactionReference || selectedVoucher._id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Settled On:</span>
                <span className="text-stone-900">
                  {new Date(selectedVoucher.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedVoucher(null)}
              className="w-full py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold"
            >
              Close Slip
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllWithdraw;
