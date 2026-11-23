import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { server } from "../../server";
import { IReferralStats } from "../../types";
import { BsGift, BsCopy, BsCheck2, BsShare } from "react-icons/bs";

const ReferralCard: React.FC = () => {
  const [stats, setStats] = useState<IReferralStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [friendCode, setFriendCode] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${server}/user/referral-stats`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleCopy = () => {
    if (!stats?.referralCode) return;
    const shareUrl = `${window.location.origin}/signup?ref=${stats.referralCode}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Referral invitation link copied to clipboard!");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleApplyFriendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendCode.trim()) {
      toast.error("Please enter a referral code");
      return;
    }
    try {
      setSubmitting(true);
      const res = await axios.post(
        `${server}/user/apply-referral`,
        { code: friendCode.trim() },
        { withCredentials: true }
      );
      toast.success(res.data?.message || "Referral reward applied!");
      setFriendCode("");
      fetchStats();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to apply referral code"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-stone-500">
        Loading your referral program...
      </div>
    );
  }

  const code = stats?.referralCode || "HABESHA-VIP";
  const shareUrl = `${window.location.origin}/signup?ref=${code}`;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-br from-amber-900 via-amber-850 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-amber-800/40">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 mb-3">
            <BsGift />
            <span>AliExpress-Style Referral Rewards</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-serif text-white tracking-tight mb-2">
            Invite Friends, Earn Store Credit
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed mb-6">
            Share the beauty of authentic Ethiopian handloom. Your friends get{" "}
            <strong className="text-amber-300">50 Habesha Coins (25 ETB)</strong>{" "}
            on signup, and you receive{" "}
            <strong className="text-amber-300">50 Coins</strong> automatically!
          </p>

          {/* Code Box */}
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-center sm:text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-200">
                Your Exclusive Referral Code
              </span>
              <div className="font-mono text-xl font-black text-white tracking-widest mt-0.5">
                {code}
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition"
            >
              {copied ? <BsCheck2 className="text-base" /> : <BsCopy />}
              <span>{copied ? "Copied!" : "Copy Invite Link"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Redeem Friend's Code & Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Redeem Box */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-1">
            Were You Invited?
          </h3>
          <p className="text-xs text-stone-500 mb-4">
            Enter a friend's referral code to instantly unlock 50 bonus loyalty coins.
          </p>

          <form onSubmit={handleApplyFriendCode} className="space-y-3">
            <input
              type="text"
              placeholder="e.g. HABESHA-7X9B2C"
              value={friendCode}
              onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-mono font-bold text-stone-900 outline-none focus:border-amber-600"
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-stone-900 hover:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-xs transition disabled:bg-stone-300"
            >
              {submitting ? "Applying..." : "Claim 50 Coins Reward"}
            </button>
          </form>
        </div>

        {/* Stats Summary */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-1">
              Your Referral Network
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Real-time tracking of friends who joined using your code.
            </p>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-950 font-serif">
                {stats?.totalReferred || 0}
              </span>
              <span className="text-xs font-bold text-stone-600">
                Friend(s) Joined
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Coins Earned:</span>
            <span className="font-bold text-amber-800">
              {((stats?.totalReferred || 0) * 50).toLocaleString()} Coins
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralCard;
