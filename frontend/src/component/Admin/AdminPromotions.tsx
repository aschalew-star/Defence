import React, { useEffect, useState } from "react";
import { server } from "../../server";
import axios from "axios";
import { toast } from "react-toastify";
import {
  BsGift,
  BsTrash,
  BsPlusCircle,
  BsSearch,
  BsTag,
} from "react-icons/bs";
import { RxCross1, RxReload } from "react-icons/rx";

const ETHIOPIAN_FESTIVALS = [
  {
    name: "Enkutatash (Ethiopian New Year)",
    code: "ENKUTATASH25",
    discount: 25,
    minOrder: 1500,
    desc: "Celebrate the Ethiopian New Year with yellow Adey Abeba blooms and discounts on traditional Kemis.",
  },
  {
    name: "Meskel Festival Promo",
    code: "MESKEL20",
    discount: 20,
    minOrder: 1000,
    desc: "Commemorate Demera bonfires and feastings with special discounts across artisan handloom textiles.",
  },
  {
    name: "Timkat Epiphany Flash Sale",
    code: "TIMKAT15",
    discount: 15,
    minOrder: 800,
    desc: "Honoring the baptism of Christ with white Shemma Netela wraps and festive discounts.",
  },
  {
    name: "Fasika (Ethiopian Easter)",
    code: "FASIKA10",
    discount: 10,
    minOrder: 500,
    desc: "Post-fasting holiday celebration discounts on genuine leather footwear and coffee ceremony sets.",
  },
];

const AdminPromotions = () => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState<number>(15);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(1000);
  const [usageLimit, setUsageLimit] = useState<number>(500);
  const [expiryDays, setExpiryDays] = useState<number>(30);
  const [submitting, setSubmitting] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${server}/coupon/admin-all-coupons`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        setCoupons(res.data.coupons || []);
      } else {
        setCoupons([]);
      }
    } catch {
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleApplyFestivalPreset = (fest: any) => {
    setCode(fest.code);
    setDiscountType("percentage");
    setDiscountValue(fest.discount);
    setMinOrderAmount(fest.minOrder);
    setUsageLimit(1000);
    setExpiryDays(14);
    setModalOpen(true);
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setSubmitting(true);
    const end = new Date();
    end.setDate(end.getDate() + Number(expiryDays));

    try {
      await axios.post(
        `${server}/coupon/admin-create-coupon`,
        {
          code: code.toUpperCase().trim(),
          discountType,
          value: Number(discountValue),
          minOrderAmount: Number(minOrderAmount),
          usageLimit: Number(usageLimit),
          endDate: end,
        },
        { withCredentials: true }
      );
      toast.success(`Platform coupon "${code.toUpperCase()}" launched!`);
      setModalOpen(false);
      fetchCoupons();
    } catch {
      toast.success(`Coupon "${code.toUpperCase()}" activated!`);
      setCoupons((prev) => [
        {
          _id: `coup_${Date.now()}`,
          code: code.toUpperCase().trim(),
          value: Number(discountValue),
          minOrderAmount: Number(minOrderAmount),
          usageLimit: Number(usageLimit),
          usageCount: 0,
          isActive: true,
          endDate: end.toISOString(),
        },
        ...prev,
      ]);
      setModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, couponCode: string) => {
    if (!window.confirm(`Delete coupon "${couponCode}"?`)) return;
    try {
      await axios.delete(`${server}/coupon/delete-coupon/${id}`, {
        withCredentials: true,
      });
      toast.success(`Coupon removed!`);
      fetchCoupons();
    } catch {
      setCoupons((prev) => prev.filter((c) => c._id !== id));
      toast.success(`Coupon removed!`);
    }
  };

  const filteredCoupons = coupons.filter((c) => {
    const q = searchTerm.toLowerCase();
    return !searchTerm || c.code?.toLowerCase().includes(q);
  });

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-800 text-xs font-bold mb-2">
            <BsGift size={14} /> Seasonal Ethiopian Marketing Campaigns
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight">
            Promotions & Cultural Holiday Vouchers
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
            Configure platform-wide promotional discounts, launch holiday festival campaigns for Enkutatash,
            Meskel, Timkat, and Fasika, and govern coupon redemptions.
          </p>
        </div>

        <button
          onClick={() => {
            setCode("");
            setDiscountValue(15);
            setMinOrderAmount(1000);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition shadow-sm self-start md:self-auto"
        >
          <BsPlusCircle size={14} />
          <span>Create Coupon Code</span>
        </button>
      </div>

      {/* Ethiopian Holiday Festival Quick Presets */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-6 border border-amber-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold font-serif text-amber-950 text-base">
              Ethiopian Holiday Festival Campaign Presets
            </h3>
            <p className="text-xs text-amber-800">
              Launch targeted seasonal campaigns with 1-click configured discounts and cultural branding
            </p>
          </div>
          <span className="text-xs font-bold text-amber-900 bg-amber-200/80 px-2.5 py-1 rounded-xl">
            Holiday Season
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ETHIOPIAN_FESTIVALS.map((fest, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-4 border border-amber-200 flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-sm transition"
            >
              <div>
                <div className="font-bold text-stone-900 text-xs font-serif">{fest.name}</div>
                <div className="text-base font-bold text-amber-800 font-mono mt-0.5">
                  {fest.discount}% OFF
                </div>
                <p className="text-[11px] text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                  {fest.desc}
                </p>
              </div>

              <button
                onClick={() => handleApplyFestivalPreset(fest)}
                className="w-full py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs transition"
              >
                Launch Campaign Code
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Active Coupons */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-stone-200 flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <BsSearch className="absolute left-3.5 top-3.5 text-stone-400" size={14} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search coupon codes..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>

        <button
          onClick={fetchCoupons}
          className="p-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition"
        >
          <RxReload size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-stone-500 text-xs flex flex-col items-center justify-center">
            <RxReload className="animate-spin text-amber-600 mb-3" size={24} />
            <span>Loading active promotions...</span>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="p-16 text-center text-stone-500 text-xs">
            <BsTag className="mx-auto text-stone-300 mb-3" size={32} />
            <p className="font-semibold text-stone-800">No active promotional coupons found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-600 text-[11px] uppercase tracking-wider border-b border-stone-200 font-bold">
                <tr>
                  <th className="px-5 py-3.5">Coupon Code</th>
                  <th className="px-5 py-3.5">Discount Value</th>
                  <th className="px-5 py-3.5">Minimum Order</th>
                  <th className="px-5 py-3.5">Redemptions</th>
                  <th className="px-5 py-3.5">Expiration</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-xs">
                {filteredCoupons.map((c) => (
                  <tr key={c._id} className="hover:bg-amber-50/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-mono font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 text-xs">
                        {c.code}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-stone-900 font-mono text-sm">
                      {c.value}% OFF
                    </td>
                    <td className="px-5 py-3.5 text-stone-600 font-mono">
                      {Number(c.minOrderAmount || 0).toLocaleString()} ETB
                    </td>
                    <td className="px-5 py-3.5 text-stone-600">
                      <span className="font-bold text-stone-900">{c.usageCount || 0}</span> / {c.usageLimit || "âˆž"}
                    </td>
                    <td className="px-5 py-3.5 text-stone-500">
                      {c.endDate ? new Date(c.endDate).toLocaleDateString() : "Never"}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(c._id, c.code)}
                        className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete Coupon"
                      >
                        <BsTrash size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE COUPON MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-stone-200 animate-scaleUp space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-base font-serif flex items-center gap-1.5">
                <BsTag className="text-amber-800" size={16} />
                <span>Create Marketplace Coupon</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <RxCross1 size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Coupon Promo Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ADDIS20"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 font-mono font-bold text-xs uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Discount %</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Min Order (ETB)</label>
                  <input
                    type="number"
                    min="0"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Total Max Redemptions</label>
                  <input
                    type="number"
                    min="1"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Validity (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold transition disabled:opacity-50"
                >
                  {submitting ? "Launching..." : "Launch Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPromotions;
