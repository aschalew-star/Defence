import React from "react";
import {
  MdOutlineLocalOffer,
  MdContentCopy,
  MdCheck,
  MdDeleteOutline,
  MdAdd,
} from "react-icons/md";
import {
  BsTicketPerforated,
  BsLightningCharge,
} from "react-icons/bs";
import { RxCross1, RxReload } from "react-icons/rx";
import { FiSearch } from "react-icons/fi";

import { useMerchantCoupons, HOLIDAY_PRESETS } from "../../hooks";

const ShopCoupons: React.FC = () => {
  const {
    coupons,
    filteredCoupons,
    loading,
    search,
    setSearch,
    copiedCode,
    copyToClipboard,
    createModalOpen,
    setCreateModalOpen,
    submitting,
    code,
    setCode,
    title,
    setTitle,
    discountType,
    setDiscountType,
    discountValue,
    setDiscountValue,
    minOrderAmount,
    setMinOrderAmount,
    usageLimit,
    setUsageLimit,
    endDate,
    setEndDate,
    applyPreset,
    fetchCoupons,
    handleCreateCoupon,
    handleDeleteCoupon,
  } = useMerchantCoupons();

  const handleCopyCode = copyToClipboard;
  const handleApplyPreset = (p: any) => {
    applyPreset(p);
    setCreateModalOpen(true);
  };
  return (
    <div className="w-full space-y-6 select-none">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold mb-2">
            <BsLightningCharge size={13} className="text-amber-700" />
            <span>Holiday Promotions & Customer Vouchers</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            Artisan Discount Coupons
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
            Create promotional discount codes for Ethiopian holidays (Meskel, Enkutatash, Timkat)
            to attract more buyers to your handwoven collections.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCoupons}
            className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
            title="Refresh coupons"
          >
            <RxReload size={15} className={loading ? "animate-spin text-amber-700" : ""} />
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
          >
            <MdAdd size={16} />
            <span>Create New Coupon</span>
          </button>
        </div>
      </div>

      {/* Quick Cultural Presets Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 rounded-3xl p-6 text-white shadow-md border border-amber-900/40">
        <div className="flex items-center justify-between pb-3 border-b border-amber-900/50">
          <div className="flex items-center gap-2">
            <BsTicketPerforated className="text-amber-400" size={18} />
            <h3 className="text-sm font-bold font-serif text-white">
              Ethiopian Holiday Presets (1-Click Setup)
            </h3>
          </div>
          <span className="text-[11px] text-amber-300 font-semibold">
            Boost holiday sales by 40%+
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {HOLIDAY_PRESETS.map((preset) => (
            <div
              key={preset.code}
              onClick={() => {
                handleApplyPreset(preset);
                setCreateModalOpen(true);
              }}
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-400 text-xs tracking-wider">
                    {preset.code}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold">
                    {preset.discountType === "percentage"
                      ? `${preset.discountValue}% OFF`
                      : `${preset.discountValue} ETB OFF`}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white mt-2 group-hover:text-amber-300 transition-colors">
                  {preset.title}
                </h4>
                <p className="text-[10px] text-stone-300 mt-1 line-clamp-2">
                  {preset.desc}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-stone-400">
                <span>Min: {preset.minOrderAmount} ETB</span>
                <span className="text-amber-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                  Apply Preset →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coupons Table & Filter */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-stone-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search coupon codes or title..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-xs bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
            />
          </div>

          <div className="text-xs font-semibold text-stone-500">
            Total Active Codes: <span className="font-bold text-stone-900">{coupons.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-stone-500 text-xs">
            Loading your promotional coupons...
          </div>
        ) : filteredCoupons.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 font-semibold uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="px-4 py-3">Coupon Code</th>
                  <th className="px-4 py-3">Discount</th>
                  <th className="px-4 py-3">Min Order</th>
                  <th className="px-4 py-3">Redemptions</th>
                  <th className="px-4 py-3">Expiration</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredCoupons.map((c) => {
                  const isExpired = new Date(c.endDate) < new Date();
                  const isLimitReached = c.usageLimit && c.usageCount >= c.usageLimit;
                  const isActive = c.isActive && !isExpired && !isLimitReached;

                  return (
                    <tr key={c._id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">
                            {c.code}
                          </span>
                          <button
                            onClick={() => handleCopyCode(c.code)}
                            className="p-1 rounded-md text-stone-400 hover:text-stone-700 transition"
                            title="Copy code"
                          >
                            {copiedCode === c.code ? (
                              <MdCheck className="text-emerald-600" size={14} />
                            ) : (
                              <MdContentCopy size={14} />
                            )}
                          </button>
                        </div>
                        {c.title && (
                          <div className="text-[11px] text-stone-500 mt-1 line-clamp-1">
                            {c.title}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5 font-bold text-stone-900">
                        {c.discountType === "percentage" ? (
                          <span className="text-emerald-700 font-serif text-sm">
                            {c.discountValue}% OFF
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-serif text-sm">
                            {c.discountValue} ETB OFF
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-stone-600 font-mono">
                        {c.minOrderAmount ? `${c.minOrderAmount.toLocaleString()} ETB` : "None"}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-mono text-stone-900 font-semibold">
                          {c.usageCount || 0}
                        </span>
                        {c.usageLimit ? (
                          <span className="text-stone-400 font-mono"> / {c.usageLimit}</span>
                        ) : (
                          <span className="text-stone-400"> (Unlimited)</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-stone-600">
                        {new Date(c.endDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      <td className="px-4 py-3.5">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Active
                          </span>
                        ) : isExpired ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-200 text-stone-600">
                            Expired
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            Limit Reached
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => handleDeleteCoupon(c._id)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete coupon"
                        >
                          <MdDeleteOutline size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-stone-500 text-xs space-y-2">
            <BsTicketPerforated className="mx-auto text-stone-400" size={32} />
            <p className="font-semibold text-stone-700">No promotional coupons created yet.</p>
            <p className="text-[11px] text-stone-400">
              Click &quot;Create New Coupon&quot; or choose a holiday preset above to launch your first code!
            </p>
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <MdOutlineLocalOffer size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold font-serif text-stone-900">
                    Create Artisan Discount Code
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Promotional code redeemable by buyers at checkout
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              >
                <RxCross1 size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. MESKEL20, ENKUTATASH15"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Campaign Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Meskel Feast Artisan Promotion"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed ETB Amount</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Discount Value *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      max={discountType === "percentage" ? "90" : "10000"}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      placeholder={discountType === "percentage" ? "15" : "500"}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-stone-400">
                      {discountType === "percentage" ? "%" : "ETB"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Min Order Amount (ETB)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    placeholder="e.g. 2500"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Max Redemptions Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    placeholder="Leave empty for unlimited"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Expiration Date *
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-sm transition disabled:opacity-50"
                >
                  {submitting ? "Publishing Coupon..." : "Publish Coupon Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShopCoupons;