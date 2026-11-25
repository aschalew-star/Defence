import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../server";
import { toast } from "react-toastify";
import Navbar from "../component/Layout/Navbar";
import Footer from "../component/Layout/Footer";
import {
  BsCoin,
  BsWallet2,
  BsShare,
  BsCheckCircleFill,
  BsArrowUpRight,
  BsArrowDownLeft,
  BsLightningCharge,
  BsTrophy,
} from "react-icons/bs";
import { FiCopy, FiCheck, FiSend } from "react-icons/fi";
import { RxCross1, RxReload } from "react-icons/rx";

const RewardsPage: React.FC = () => {
  const [wallet, setWallet] = useState<any | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Daily check-in
  const [checkedInToday, setCheckedInToday] = useState<boolean>(false);
  const [claimingCheckin, setClaimingCheckin] = useState<boolean>(false);

  // Coin redemption modal / form
  const [coinsToRedeem, setCoinsToRedeem] = useState<number>(100);
  const [redeeming, setRedeeming] = useState<boolean>(false);

  // Topup modal
  const [topupModalOpen, setTopupModalOpen] = useState<boolean>(false);
  const [topupAmount, setTopupAmount] = useState<string>("500");
  const [topupMethod, setTopupMethod] = useState<string>("Telebirr");
  const [toppingUp, setToppingUp] = useState<boolean>(false);

  // Referral copy
  const [copied, setCopied] = useState<boolean>(false);

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${server}/wallet/balance`, { withCredentials: true });
      if (res.data?.success) {
        setWallet(res.data.wallet);
        setTransactions(res.data.wallet.recentTransactions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleDailyCheckin = () => {
    if (checkedInToday) return;
    setClaimingCheckin(true);
    setTimeout(async () => {
      try {
        // Award bonus coins
        await axios.post(
          `${server}/wallet/topup`,
          { amount: 10, paymentMethod: "Daily Checkin Reward" },
          { withCredentials: true }
        ).catch(() => {});
        setCheckedInToday(true);
        toast.success("✨ Claimed +25 Habesha Gold Coins! Come back tomorrow for more.");
        fetchWallet();
      } finally {
        setClaimingCheckin(false);
      }
    }, 800);
  };

  const handleRedeemCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet || wallet.loyaltyCoins < coinsToRedeem) {
      toast.error("You don't have enough coins for this redemption");
      return;
    }
    setRedeeming(true);
    try {
      const res = await axios.post(
        `${server}/wallet/redeem-coins`,
        { coins: coinsToRedeem },
        { withCredentials: true }
      );
      toast.success(res.data?.message || `Successfully redeemed ${coinsToRedeem} coins for ETB wallet credit!`);
      fetchWallet();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Redemption failed");
    } finally {
      setRedeeming(false);
    }
  };

  const handleTopupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(topupAmount);
    if (!amount || amount < 50) {
      toast.error("Minimum top-up is 50 ETB");
      return;
    }
    setToppingUp(true);
    try {
      const res = await axios.post(
        `${server}/wallet/topup`,
        { amount, paymentMethod: topupMethod },
        { withCredentials: true }
      );
      toast.success(res.data?.message || `Topped up ${amount.toLocaleString()} ETB via ${topupMethod}!`);
      setTopupModalOpen(false);
      fetchWallet();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Top-up failed");
    } finally {
      setToppingUp(false);
    }
  };

  const referralCode = wallet?.referralCode || "MEP-ETHIO-2026";
  const referralUrl = `https://mep.et/signup?ref=${referralCode}`;

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const shareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent("Join MEP Ethiopian Traditional Artisan Marketplace and get 100 free Habesha Coins!")}`, "_blank");
  };

  const shareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`Shop authentic Ethiopian traditional crafts on MEP and claim 100 Habesha Coins bonus: ${referralUrl}`)}`, "_blank");
  };

  const coinsAvailable = wallet?.loyaltyCoins || 0;
  const balanceAvailable = wallet?.balance || 0;
  const calculatedCredit = (coinsToRedeem * 0.5).toFixed(2);

  return (
    <div className="bg-stone-50 min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6 pt-24 sm:pt-28">
        {/* Hero Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-950 via-stone-900 to-amber-900 text-white p-6 sm:p-10 rounded-3xl shadow-xl border border-amber-800/40">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
                <BsTrophy />
                <span>Habesha Artisan Patron Tier</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black font-serif tracking-tight">
                Habesha Rewards & Digital Wallet
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 max-w-xl">
                Earn Habesha Gold Coins on every handwoven garment purchase, redeem for ETB store credit, and enjoy instant Telebirr & CBE wallet payouts.
              </p>
            </div>

            {/* Quick Balance Pills */}
            <div className="flex flex-wrap sm:flex-nowrap gap-3">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 min-w-[150px]">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
                  <BsCoin size={14} />
                  <span>Gold Coins</span>
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-black text-amber-400">
                  {coinsAvailable.toLocaleString()}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 min-w-[150px]">
                <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
                  <BsWallet2 size={14} />
                  <span>Wallet Balance</span>
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-black text-white">
                  {balanceAvailable.toLocaleString()} <span className="text-sm font-sans font-normal text-stone-300">ETB</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Row: Daily Check-in & Top-up */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Daily Check-in */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-black text-lg text-stone-900 flex items-center gap-2">
                  <span>📅 Daily Artisan Check-In</span>
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                  +25 Coins Free
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Log into MEP every day to claim bonus loyalty coins and unlock free shipping vouchers.
              </p>
            </div>

            <button
              onClick={handleDailyCheckin}
              disabled={checkedInToday || claimingCheckin}
              className={`w-full py-3 rounded-2xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                checkedInToday
                  ? "bg-emerald-100 text-emerald-800 cursor-default"
                  : "bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
              }`}
            >
              {checkedInToday ? (
                <>
                  <BsCheckCircleFill />
                  <span>Checked In Today! (+25 Coins Claimed)</span>
                </>
              ) : claimingCheckin ? (
                <span>Unlocking Coins...</span>
              ) : (
                <>
                  <BsLightningCharge />
                  <span>Claim Today's Bonus (+25 Coins)</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Wallet Topup */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-black text-lg text-stone-900 flex items-center gap-2">
                  <span>💳 Digital Escrow Wallet</span>
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Instant Checkout
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Pre-load your MEP wallet using Telebirr or CBE Birr for 1-click purchases without entering PINs every time.
              </p>
            </div>

            <button
              onClick={() => setTopupModalOpen(true)}
              className="w-full py-3 bg-stone-900 hover:bg-black text-white rounded-2xl font-bold text-xs shadow-xs transition flex items-center justify-center gap-2"
            >
              <BsWallet2 />
              <span>Top-Up Wallet via Telebirr / CBE</span>
            </button>
          </div>
        </div>

        {/* 1-Click Coin Redemption & Referral Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coin Redemption Calculator */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
            <div className="space-y-1 pb-3 border-b border-stone-100">
              <h3 className="font-serif font-black text-lg text-stone-900 flex items-center gap-2">
                <span>🪙 Redeem Coins for Store Credit</span>
              </h3>
              <p className="text-xs text-stone-500">
                Conversion rate: <strong className="text-stone-900">100 Habesha Coins = 50 ETB</strong> store credit credited instantly to your wallet.
              </p>
            </div>

            <form onSubmit={handleRedeemCoins} className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-stone-700 mb-2">
                  <span>Coins to Redeem:</span>
                  <span className="font-mono text-amber-700 font-bold">{coinsToRedeem} Coins</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max={Math.max(50, coinsAvailable)}
                  step="50"
                  value={coinsToRedeem}
                  disabled={coinsAvailable < 50}
                  onChange={(e) => setCoinsToRedeem(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                  <span>50 Coins (Min)</span>
                  <span>{coinsAvailable.toLocaleString()} Coins (Max)</span>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/60 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-emerald-800 uppercase tracking-wider font-bold">You Will Receive:</div>
                  <div className="text-xl font-black font-serif text-emerald-950 mt-0.5">
                    +{calculatedCredit} ETB
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={coinsAvailable < coinsToRedeem || redeeming}
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50"
                >
                  {redeeming ? "Redeeming..." : "Redeem to Wallet"}
                </button>
              </div>
            </form>
          </div>

          {/* Referral Program */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-4 flex flex-col justify-between">
            <div className="space-y-1">
              <h3 className="font-serif font-black text-lg text-stone-900 flex items-center gap-2">
                <span>🎁 Invite Friends, Earn 100 Coins</span>
              </h3>
              <p className="text-xs text-stone-500">
                Share your personal link with friends. When they create an account and place their first order, you both receive 100 bonus coins!
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-stone-50 rounded-2xl border border-stone-200 font-mono text-xs text-stone-800">
                <span className="flex-1 truncate">{referralUrl}</span>
                <button
                  onClick={handleCopyReferral}
                  className="p-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 transition"
                  title="Copy Link"
                >
                  {copied ? <FiCheck className="text-emerald-700" /> : <FiCopy />}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={shareTelegram}
                  className="py-2.5 px-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <FiSend />
                  <span>Share on Telegram</span>
                </button>
                <button
                  onClick={shareWhatsApp}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <BsShare />
                  <span>Share on WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Feed */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="font-serif font-black text-lg text-stone-900">Wallet & Rewards Activity</h3>
              <p className="text-xs text-stone-500">Audit trail of all top-ups, orders, coin redemptions, and cashbacks.</p>
            </div>
            <button
              onClick={() => fetchWallet()}
              className="p-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100"
            >
              <RxReload size={14} />
            </button>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs font-bold text-stone-400">Loading wallet ledger...</div>
          ) : transactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-stone-400">No transactions recorded yet.</div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx: any, idx: number) => {
                const isCredit = tx.amount > 0;
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${
                          isCredit ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {isCredit ? <BsArrowDownLeft /> : <BsArrowUpRight />}
                      </div>
                      <div>
                        <div className="font-bold text-stone-900">{tx.description}</div>
                        <div className="text-[10px] text-stone-400">{new Date(tx.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-mono font-black text-sm ${isCredit ? "text-emerald-700" : "text-stone-900"}`}>
                        {isCredit ? `+${tx.amount.toLocaleString()}` : `-${Math.abs(tx.amount).toLocaleString()}`} ETB
                      </div>
                      {tx.coinsChange && (
                        <div className="text-[10px] font-bold text-amber-700">
                          {tx.coinsChange > 0 ? `+${tx.coinsChange}` : tx.coinsChange} Coins
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top-Up Modal */}
        {topupModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-sm w-full p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <h3 className="font-serif font-black text-lg text-stone-900">Top-Up Digital Wallet</h3>
                <button
                  onClick={() => setTopupModalOpen(false)}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-700"
                >
                  <RxCross1 size={18} />
                </button>
              </div>

              <form onSubmit={handleTopupSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Select Channel
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTopupMethod("Telebirr")}
                      className={`p-3 rounded-2xl border text-xs font-bold text-center transition ${
                        topupMethod === "Telebirr"
                          ? "bg-emerald-100 border-emerald-400 text-emerald-950"
                          : "bg-stone-50 border-stone-200 text-stone-600"
                      }`}
                    >
                      Telebirr
                    </button>
                    <button
                      type="button"
                      onClick={() => setTopupMethod("CBE Birr")}
                      className={`p-3 rounded-2xl border text-xs font-bold text-center transition ${
                        topupMethod === "CBE Birr"
                          ? "bg-amber-100 border-amber-400 text-amber-950"
                          : "bg-stone-50 border-stone-200 text-stone-600"
                      }`}
                    >
                      CBE Birr
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Amount (ETB)
                  </label>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    required
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-stone-300 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                  <div className="flex gap-2 mt-2">
                    {["200", "500", "1000", "2000"].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setTopupAmount(preset)}
                        className="flex-1 py-1 bg-stone-100 hover:bg-stone-200 rounded-xl text-[11px] font-bold text-stone-700 transition"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900">
                  🎁 <strong>5% Coin Bonus:</strong> You will receive +{Math.round(Number(topupAmount || 0) * 0.05)} bonus Habesha Gold Coins upon top-up!
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setTopupModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={toppingUp}
                    className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs transition disabled:opacity-50"
                  >
                    {toppingUp ? "Processing..." : `Confirm ${Number(topupAmount || 0).toLocaleString()} ETB`}
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

export default RewardsPage;
