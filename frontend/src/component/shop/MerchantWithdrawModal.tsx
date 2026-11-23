import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import {
  BsCashCoin,
  BsCheckCircleFill,
  BsClockHistory,
  BsArrowDownCircle,
  BsReceipt,
} from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";

export interface MerchantWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  seller: any;
  onSuccess?: () => void;
}

const PAYOUT_CHANNELS = [
  {
    id: "Telebirr",
    name: "Telebirr (Ethio Telecom Mobile Money)",
    short: "Telebirr",
    badge: "Instant Transfer",
    fee: "0 ETB Fee",
    placeholder: "0912345678",
    color: "emerald",
  },
  {
    id: "CBE",
    name: "Commercial Bank of Ethiopia (CBE)",
    short: "CBE Bank",
    badge: "Same-Day Settlement",
    fee: "0 ETB Fee",
    placeholder: "1000123456789",
    color: "amber",
  },
  {
    id: "Awash Bank",
    name: "Awash International Bank",
    short: "Awash Bank",
    badge: "Direct Deposit",
    fee: "0 ETB Fee",
    placeholder: "01320123456789",
    color: "blue",
  },
  {
    id: "Bank of Abyssinia",
    name: "Bank of Abyssinia",
    short: "Abyssinia",
    badge: "Direct Deposit",
    fee: "0 ETB Fee",
    placeholder: "12345678",
    color: "purple",
  },
  {
    id: "Dashen Bank",
    name: "Dashen Bank (Amole)",
    short: "Dashen",
    badge: "Direct Deposit",
    fee: "0 ETB Fee",
    placeholder: "510012345678",
    color: "rose",
  },
  {
    id: "Wegagen Bank",
    name: "Wegagen Bank",
    short: "Wegagen",
    badge: "Direct Deposit",
    fee: "0 ETB Fee",
    placeholder: "078912345678",
    color: "orange",
  },
];

const MerchantWithdrawModal: React.FC<MerchantWithdrawModalProps> = ({
  isOpen,
  onClose,
  seller,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<"request" | "history">("request");
  const [submitting, setSubmitting] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [withdrawHistory, setWithdrawHistory] = useState<any[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<any | null>(null);

  // Form Fields
  const [payoutMethod, setPayoutMethod] = useState(PAYOUT_CHANNELS[0].id);
  const [amount, setAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState(
    seller?.payoutMethods?.[0]?.accountNumber ||
      seller?.withdrawMethod?.bankAccountNumber ||
      seller?.phoneNumber ||
      ""
  );
  const [accountName, setAccountName] = useState(
    seller?.payoutMethods?.[0]?.accountHolderName ||
      seller?.withdrawMethod?.bankHolderName ||
      seller?.name ||
      ""
  );
  const [bankBranch] = useState("Addis Ababa Main");

  const availableBalance = Number(seller?.availableBalance || 0);
  const pendingBalance = Number(seller?.pendingBalance || 0);
  const totalWithdrawn = Number(seller?.totalWithdrawn || 0);

  // Load withdrawal history
  const fetchWithdrawHistory = () => {
    setLoadingHistory(true);
    axios
      .get(`${server}/withdraw/get-seller-withdraw-requests`, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data?.withdraws) {
          setWithdrawHistory(res.data.withdraws);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch payout history:", err);
      })
      .finally(() => setLoadingHistory(false));
  };

  useEffect(() => {
    if (isOpen) {
      fetchWithdrawHistory();
    }
  }, [isOpen]);

  const handlePercentageSelect = (pct: number) => {
    const val = Math.floor((availableBalance * pct) / 100);
    setAmount(String(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmount = Number(amount);

    if (!withdrawAmount || withdrawAmount < 50) {
      toast.error("Minimum withdrawal amount is 50 ETB");
      return;
    }

    if (withdrawAmount > availableBalance) {
      toast.error("Amount exceeds your cleared available balance");
      return;
    }

    if (!accountNumber.trim()) {
      toast.error("Please enter a valid payout account or mobile number");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        amount: withdrawAmount,
        payoutMethod: {
          methodType: payoutMethod,
          accountName: accountName.trim() || seller?.name,
          accountNumber: accountNumber.trim(),
          phoneNumber: accountNumber.trim(),
          bankBranch: bankBranch.trim(),
        },
      };

      const res = await axios.post(
        `${server}/withdraw/create-withdraw-request`,
        payload,
        { withCredentials: true }
      );

      if (res.data?.success) {
        toast.success(
          res.data.message ||
            "Payout request submitted successfully! Funds will be disbursed shortly."
        );
        setAmount("");
        fetchWithdrawHistory();
        setActiveTab("history");
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to submit payout request"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentChannel =
    PAYOUT_CHANNELS.find((c) => c.id === payoutMethod) || PAYOUT_CHANNELS[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold">
              <BsCashCoin size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-serif">
                  Artisan Payout & Disbursement Hub
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  Instant Clearing
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Disburse your earned artisan proceeds via Telebirr or Ethiopian Commercial Banks.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <RxCross1 size={18} />
          </button>
        </div>

        {/* Balance Metric Highlights */}
        <div className="grid grid-cols-3 gap-2 p-4 bg-stone-50 border-b border-stone-200 text-xs">
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
            <span className="text-[11px] text-emerald-800 font-medium block">
              Cleared Withdrawable
            </span>
            <span className="text-lg font-black text-emerald-950 font-serif">
              {availableBalance.toLocaleString()} ETB
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
            <span className="text-[11px] text-amber-800 font-medium block">
              In Escrow Transit
            </span>
            <span className="text-lg font-black text-amber-950 font-serif">
              {pendingBalance.toLocaleString()} ETB
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-stone-100 border border-stone-200">
            <span className="text-[11px] text-stone-600 font-medium block">
              Lifetime Disbursed
            </span>
            <span className="text-lg font-black text-stone-900 font-serif">
              {totalWithdrawn.toLocaleString()} ETB
            </span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center border-b border-stone-200 bg-white px-6">
          <button
            onClick={() => setActiveTab("request")}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === "request"
                ? "border-emerald-700 text-emerald-800"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            <BsArrowDownCircle size={14} />
            <span>Request New Payout</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("history");
              fetchWithdrawHistory();
            }}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === "history"
                ? "border-emerald-700 text-emerald-800"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            <BsClockHistory size={14} />
            <span>Payout History ({withdrawHistory.length})</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto no-scrollbar flex-1 space-y-5">
          {activeTab === "request" ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Channel Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Select Payout Destination
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {PAYOUT_CHANNELS.map((ch) => {
                    const sel = payoutMethod === ch.id;
                    return (
                      <div
                        key={ch.id}
                        onClick={() => setPayoutMethod(ch.id)}
                        className={`p-3 rounded-2xl border-2 cursor-pointer transition text-left flex flex-col justify-between ${
                          sel
                            ? "border-emerald-700 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-700/20"
                            : "border-stone-200 hover:border-stone-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-stone-900">{ch.short}</span>
                          {sel && <BsCheckCircleFill className="text-emerald-700 text-xs" />}
                        </div>
                        <span className="text-[10px] text-stone-500">{ch.badge}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Amount Input & Percentages */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Disbursement Amount (ETB) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs text-stone-500 font-medium">
                    Available: <span className="font-bold">{availableBalance.toLocaleString()} ETB</span>
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    required
                    min="50"
                    max={availableBalance}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount (min. 50 ETB)"
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-base font-bold font-serif focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                  <span className="absolute right-4 top-3.5 text-xs font-bold text-stone-400 font-mono">
                    ETB
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] font-semibold text-stone-400">Quick:</span>
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handlePercentageSelect(pct)}
                      className="px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-emerald-100 hover:text-emerald-900 text-stone-700 text-xs font-bold transition"
                    >
                      {pct === 100 ? "MAX" : `${pct}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Account / Mobile Number Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    {payoutMethod === "Telebirr" ? "Telebirr Mobile Number" : "Account Number"}{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder={currentChannel.placeholder}
                    className="w-full px-4 py-2.5 rounded-2xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Account Holder Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder={seller?.name || "Abebe Kebede"}
                    className="w-full px-4 py-2.5 rounded-2xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              {/* Transparent Fee Summary */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Gross Payout Request:</span>
                  <span className="font-bold text-stone-900">
                    {Number(amount || 0).toLocaleString()} ETB
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Marketplace Disbursement Fee:</span>
                  <span className="font-semibold text-emerald-700">0.00 ETB (FREE)</span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-stone-900">
                  <span>Net Expected in Account:</span>
                  <span className="text-emerald-900 font-serif text-sm">
                    {Number(amount || 0).toLocaleString()} ETB
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || availableBalance < 50}
                  className="w-full py-4 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <BsCheckCircleFill />
                  <span>
                    {submitting
                      ? "Submitting Payout..."
                      : `Disburse ${Number(amount || 0).toLocaleString()} ETB to ${currentChannel.short}`}
                  </span>
                </button>
              </div>
            </form>
          ) : (
            /* HISTORY TAB */
            <div className="space-y-4">
              {loadingHistory ? (
                <div className="py-12 text-center text-stone-500 text-xs">
                  Loading withdrawal transactions...
                </div>
              ) : withdrawHistory.length === 0 ? (
                <div className="py-12 text-center text-stone-400 space-y-2">
                  <BsReceipt className="mx-auto text-3xl text-stone-300" />
                  <p className="text-xs font-semibold">No payout requests recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {withdrawHistory.map((item, idx) => {
                    const status = item.status || "Processing";
                    const isCompleted =
                      status.toLowerCase() === "succeed" ||
                      status.toLowerCase() === "completed" ||
                      status.toLowerCase() === "approved";
                    const isRejected = status.toLowerCase() === "rejected";

                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900 text-sm font-serif">
                              {Number(item.amount).toLocaleString()} ETB
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isCompleted
                                  ? "bg-emerald-100 text-emerald-800"
                                  : isRejected
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {status}
                            </span>
                          </div>
                          <div className="text-stone-500 text-[11px]">
                            <span>Via {item.payoutMethod?.methodType || "Telebirr"}</span>
                            <span> • Ref: {item._id?.slice(-8).toUpperCase()}</span>
                            <span> • {new Date(item.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedVoucher(item)}
                          className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs flex items-center gap-1 shadow-2xs"
                        >
                          <BsReceipt />
                          <span>Slip</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Voucher / Receipt Modal Overlay */}
        {selectedVoucher && (
          <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-4 text-center border border-stone-300">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto text-xl">
                <BsReceipt />
              </div>
              <div>
                <h3 className="font-serif font-black text-lg text-stone-900">
                  Artisan Payout Voucher
                </h3>
                <p className="text-xs text-stone-500">Official Settlement Confirmation</p>
              </div>

              <div className="bg-stone-50 p-4 rounded-2xl space-y-2 text-xs text-left border border-stone-200">
                <div className="flex justify-between">
                  <span className="text-stone-500">Voucher Ref:</span>
                  <span className="font-mono font-bold text-stone-900">
                    {selectedVoucher._id}
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
                    {selectedVoucher.payoutMethod?.methodType || "Telebirr"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Destination:</span>
                  <span className="font-mono text-stone-900">
                    {selectedVoucher.payoutMethod?.phoneNumber ||
                      selectedVoucher.payoutMethod?.accountNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Status:</span>
                  <span className="font-bold text-stone-900">{selectedVoucher.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Date:</span>
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
                Close Voucher
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MerchantWithdrawModal;
