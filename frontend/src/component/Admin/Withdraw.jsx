import axios from "axios";
import React, { useEffect, useState } from "react";
import { server } from "../../server";
import { BsPencil, BsCheckCircle, BsXCircle, BsShieldCheck } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import { toast } from "react-toastify";

const AllWithdraw = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [withdrawData, setWithdrawData] = useState(null);
  const [withdrawStatus, setWithdrawStatus] = useState("Paid");
  const [transactionReference, setTransactionReference] = useState("");
  const [adminComment, setAdminComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!withdrawData) return;
    setSubmitting(true);

    try {
      const res = await axios.put(
        `${server}/withdraw/update-withdraw-request/${withdrawData.id}`,
        {
          sellerId: withdrawData.shopId,
          status: withdrawStatus,
          transactionReference,
          adminComment,
        },
        { withCredentials: true }
      );

      toast.success(res.data.message || "Withdrawal request updated successfully!");
      setData(res.data.withdraws || []);
      setOpen(false);
      setTransactionReference("");
      setAdminComment("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update withdrawal request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-stone-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2">
              <BsShieldCheck size={14} /> Admin Financial Settlements
            </div>
            <h1 className="text-2xl font-bold font-serif text-stone-900">
              Merchant Payout & Withdrawal Requests
            </h1>
            <p className="text-sm text-stone-600 mt-1">
              Review and disburse Telebirr, CBE Birr, and Ethiopian bank transfer payouts for verified artisans.
            </p>
          </div>
          <button
            onClick={fetchWithdrawals}
            className="self-start sm:self-auto px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-sm font-medium rounded-xl transition-all"
          >
            Refresh
          </button>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-stone-500">Loading payout requests...</div>
          ) : data.length === 0 ? (
            <div className="p-12 text-center text-stone-500">
              <p className="text-base font-medium text-stone-700">No withdrawal requests found</p>
              <p className="text-xs text-stone-400 mt-1">When merchants request settlements, they will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-stone-100 text-stone-700 font-semibold border-b border-stone-200">
                    <th className="px-5 py-3">Merchant / Shop</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Payout Method</th>
                    <th className="px-5 py-3">Account Details</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Requested</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {data.map((item) => {
                    const sellerName = item.seller?.name || "Merchant";
                    const sellerEmail = item.seller?.email || "";
                    const method = item.payoutMethod || {};
                    const isProcessing = item.status === "Processing";

                    return (
                      <tr key={item._id} className="hover:bg-stone-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-stone-900">{sellerName}</div>
                          <div className="text-xs text-stone-500">{sellerEmail}</div>
                          <div className="text-[11px] text-stone-400 font-mono mt-0.5">ID: {item.shopId}</div>
                        </td>
                        <td className="px-5 py-4 font-bold text-stone-900">
                          {Number(item.amount || 0).toLocaleString()} ETB
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-stone-100 text-stone-800 capitalize">
                            {method.type || "Telebirr"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-stone-600">
                          {method.type === "telebirr" && (
                            <div>
                              <div className="font-medium text-stone-900">Phone: {method.telebirrNumber || item.seller?.phoneNumber || "N/A"}</div>
                              <div>Name: {method.accountHolderName || sellerName}</div>
                            </div>
                          )}
                          {method.type === "cbe" && (
                            <div>
                              <div className="font-medium text-stone-900">CBE: {method.accountNumber || "N/A"}</div>
                              <div>Holder: {method.accountHolderName || sellerName}</div>
                            </div>
                          )}
                          {method.type === "bank" && (
                            <div>
                              <div className="font-medium text-stone-900">{method.bankName || "Commercial Bank of Ethiopia"}</div>
                              <div>Acc: {method.accountNumber || "N/A"}</div>
                            </div>
                          )}
                          {!method.type && <div>Default Account</div>}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                              item.status === "Paid" || item.status === "Succeed"
                                ? "bg-emerald-100 text-emerald-800"
                                : item.status === "Rejected"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {item.status}
                          </span>
                          {item.transactionReference && (
                            <div className="text-[11px] font-mono text-stone-500 mt-1">
                              Ref: {item.transactionReference}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 text-xs text-stone-500">
                          {new Date(item.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-5 py-4 text-right">
                          {isProcessing ? (
                            <button
                              onClick={() => {
                                setWithdrawData({
                                  id: item._id,
                                  shopId: item.shopId || item.seller?._id,
                                  amount: item.amount,
                                  sellerName,
                                  method,
                                });
                                setWithdrawStatus("Paid");
                                setOpen(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                            >
                              <BsPencil size={13} /> Settle Payout
                            </button>
                          ) : (
                            <span className="text-xs text-stone-400 font-medium">Completed</span>
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
      </div>

      {/* Payout Modal */}
      {open && withdrawData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <h2 className="text-lg font-bold font-serif text-stone-900">
                Process Merchant Payout
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all"
              >
                <RxCross1 size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-1.5 text-xs text-stone-700">
                <div className="flex justify-between">
                  <span className="text-stone-500">Merchant:</span>
                  <span className="font-semibold text-stone-900">{withdrawData.sellerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Payout Amount:</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    {Number(withdrawData.amount || 0).toLocaleString()} ETB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Payout Method:</span>
                  <span className="font-semibold capitalize text-stone-900">
                    {withdrawData.method?.type || "Telebirr"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Settlement Status
                </label>
                <select
                  value={withdrawStatus}
                  onChange={(e) => setWithdrawStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Paid">Paid / Succeeded (Funds Disbursed)</option>
                  <option value="Rejected">Rejected (Refund back to Merchant balance)</option>
                </select>
              </div>

              {withdrawStatus === "Paid" && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Transaction / Telebirr Reference No.
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionReference}
                    onChange={(e) => setTransactionReference(e.target.value)}
                    placeholder="e.g. TB98234123 or FT23019349"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Admin Note / Comment (Optional)
                </label>
                <textarea
                  rows={2}
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  placeholder="Notes visible to merchant regarding this disbursement"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition-all ${
                    withdrawStatus === "Rejected"
                      ? "bg-rose-600 hover:bg-rose-700"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  {submitting ? "Processing..." : `Confirm ${withdrawStatus}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllWithdraw;