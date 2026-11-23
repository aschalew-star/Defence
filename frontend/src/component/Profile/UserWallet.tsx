import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { server } from "../../server";
import { useCurrency } from "../../hooks";
import { IWallet, IWalletTransaction } from "../../types";
import {
  BsWallet2,
  BsCoin,
  BsArrowDownLeft,
  BsArrowUpRight,
  BsPlusCircle,
  BsGift,
} from "react-icons/bs";

const UserWallet: React.FC = () => {
  const { formatPrice } = useCurrency();
  const [wallet, setWallet] = useState<IWallet | null>(null);
  const [transactions, setTransactions] = useState<IWalletTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [topupAmount, setTopupAmount] = useState<string>("500");
  const [topupModal, setTopupModal] = useState<boolean>(false);
  const [redeemModal, setRedeemModal] = useState<boolean>(false);
  const [coinsToRedeem, setCoinsToRedeem] = useState<string>("100");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${server}/wallet/balance`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        setWallet(res.data.wallet);
        setTransactions(res.data.wallet.recentTransactions || []);
      }
    } catch (err: any) {
      console.error("Failed to load wallet", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(topupAmount);
    if (!amount || amount < 50) {
      toast.error("Minimum top-up amount is 50 ETB");
      return;
    }
    try {
      setSubmitting(true);
      const res = await axios.post(
        `${server}/wallet/topup`,
        { amount, paymentMethod: "Telebirr" },
        { withCredentials: true }
      );
      toast.success(res.data?.message || "Wallet topped up successfully!");
      setTopupModal(false);
      fetchWallet();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to top up wallet");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRedeemCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    const coins = Number(coinsToRedeem);
    if (!coins || coins < 50) {
      toast.error("Minimum 50 coins required for redemption");
      return;
    }
    try {
      setSubmitting(true);
      const res = await axios.post(
        `${server}/wallet/redeem-coins`,
        { coins },
        { withCredentials: true }
      );
      toast.success(res.data?.message || "Coins redeemed successfully!");
      setRedeemModal(false);
      fetchWallet();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to redeem coins");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-10 h-10 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-stone-500 font-medium">Loading your Habesha Wallet & Rewards...</p>
      </div>
    );
  }

  const balance = wallet?.balance || 0;
  const coins = wallet?.loyaltyCoins || 0;

  return (
    <div className="space-y-6">
      {/* Wallet Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-amber-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden border border-amber-900/30">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-wider text-amber-300 font-semibold flex items-center gap-1.5">
              <BsWallet2 className="text-amber-400" />
              Available Store Credit
            </span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
              Active
            </span>
          </div>

          <div className="text-3xl sm:text-4xl font-black font-serif tracking-tight text-white mb-1">
            {formatPrice(balance)}
          </div>
          <p className="text-[11px] text-stone-400 mb-5">
            Use on any artisan craft checkout with zero transaction fees.
          </p>

          <button
            onClick={() => setTopupModal(true)}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black text-xs py-2.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01]"
          >
            <BsPlusCircle className="text-sm font-bold" />
            <span>Top-up Credit (Telebirr / CBE)</span>
          </button>
        </div>

        {/* Loyalty Coins Card */}
        <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-3xl p-6 shadow-sm border border-amber-200/80 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider text-amber-900 font-bold flex items-center gap-1.5">
                <BsCoin className="text-amber-600 text-base" />
                Habesha Loyalty Coins
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                100 Coins = 50 ETB
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl sm:text-4xl font-black text-amber-950 font-serif">
                {coins.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-amber-800">Coins</span>
            </div>
            <p className="text-[11px] text-stone-600">
              Earn coins with every delivered purchase and when inviting friends.
            </p>
          </div>

          <button
            onClick={() => setRedeemModal(true)}
            disabled={coins < 50}
            className="mt-5 w-full bg-amber-800 hover:bg-amber-900 disabled:bg-stone-200 disabled:text-stone-400 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all"
          >
            <BsGift className="text-sm" />
            <span>Redeem for Store Credit</span>
          </button>
        </div>
      </div>

      {/* Transactions Feed */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-5 sm:p-6 shadow-xs">
        <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>Recent Activity</span>
          <span className="text-xs font-normal text-stone-400 lowercase">
            {transactions.length} record(s)
          </span>
        </h3>

        {transactions.length === 0 ? (
          <div className="text-center py-8 text-stone-400 text-xs">
            No transactions yet. Top up or complete an order to see activity here!
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {transactions.map((tx, idx) => {
              const isCredit =
                tx.transactionType === "topup" ||
                tx.transactionType === "refund_credit" ||
                tx.transactionType === "cashback" ||
                tx.transactionType === "coins_redemption" ||
                tx.transactionType === "referral_reward";

              return (
                <div
                  key={idx}
                  className="py-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm ${
                        isCredit
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {isCredit ? <BsArrowDownLeft /> : <BsArrowUpRight />}
                    </div>
                    <div>
                      <p className="font-semibold text-stone-900 leading-snug">
                        {tx.description || tx.transactionType.replace("_", " ")}
                      </p>
                      <span className="text-[10px] text-stone-400">
                        {new Date(tx.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-black font-mono text-sm ${
                        isCredit ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {isCredit ? "+" : "-"}
                      {formatPrice(tx.amount)}
                    </span>
                    {tx.coinsChange ? (
                      <span className="block text-[10px] text-amber-700 font-bold">
                        {tx.coinsChange > 0 ? `+${tx.coinsChange}` : tx.coinsChange} coins
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Top-up Modal */}
      {topupModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-fadeIn border border-stone-200">
            <h4 className="font-serif font-bold text-stone-900 text-lg mb-1">
              Top-up Store Credit
            </h4>
            <p className="text-xs text-stone-500 mb-4">
              Instant balance via Telebirr or Commercial Bank of Ethiopia.
            </p>

            <form onSubmit={handleTopup} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase text-stone-600 block mb-1">
                  Amount in ETB
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {["200", "500", "1000"].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopupAmount(amt)}
                      className={`py-1.5 rounded-xl text-xs font-bold border transition ${
                        topupAmount === amt
                          ? "bg-amber-50 border-amber-600 text-amber-900"
                          : "border-stone-200 text-stone-700 hover:bg-stone-50"
                      }`}
                    >
                      {amt} ETB
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="50"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-sm font-bold text-stone-900 outline-none focus:border-amber-600"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setTopupModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold shadow-sm disabled:bg-stone-300"
                >
                  {submitting ? "Processing..." : "Confirm Top-up"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Redeem Coins Modal */}
      {redeemModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-fadeIn border border-stone-200">
            <h4 className="font-serif font-bold text-stone-900 text-lg mb-1">
              Redeem Loyalty Coins
            </h4>
            <p className="text-xs text-stone-500 mb-4">
              Convert your earned Habesha coins directly into store credit balance.
            </p>

            <form onSubmit={handleRedeemCoins} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase text-stone-600 block mb-1">
                  Coins to Redeem (Available: {coins})
                </label>
                <input
                  type="number"
                  min="50"
                  max={coins}
                  value={coinsToRedeem}
                  onChange={(e) => setCoinsToRedeem(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-sm font-bold text-stone-900 outline-none focus:border-amber-600"
                />
                <span className="text-[11px] text-amber-800 font-medium mt-1 block">
                  You will receive:{" "}
                  <strong>{formatPrice(Math.round(Number(coinsToRedeem) * 0.5))}</strong> in store credit
                </span>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setRedeemModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold shadow-sm disabled:bg-stone-300"
                >
                  {submitting ? "Redeeming..." : "Redeem Now"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserWallet;
