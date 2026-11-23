import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCheckoutLogic, ETHIOPIAN_CITIES, ADDIS_ABABA_SUBCITIES } from "../../hooks";
import {
  BsShieldCheck,
  BsTruck,
  BsTag,
  BsArrowLeft,
  BsScissors,
  BsGeoAlt,
  BsTelephone,
  BsPerson,
} from "react-icons/bs";
import { FiCheck } from "react-icons/fi";
import { useLanguage } from "../../hooks/useLanguage";

const Chekout: React.FC = () => {
  const {
    cart,
    user,
    country,
    setCountry,
    city,
    setCity,
    subCity,
    setSubCity,
    phoneNumber,
    setPhoneNumber,
    address1,
    setAddress1,
    address2,
    setAddress2,
    zipCode,
    setZipCode,
    includeCustomMeasurements,
    setIncludeCustomMeasurements,
    bust,
    setBust,
    waist,
    setWaist,
    hips,
    setHips,
    length,
    setLength,
    tailoringNotes,
    setTailoringNotes,
    handleAutofillMeasurements,
    couponCode,
    setCouponCode,
    appliedCoupon,
    discountAmount,
    applyingCoupon,
    handleApplyCoupon,
    handleRemoveCoupon,
    subTotalPrice,
    shippingPrice: shipping,
    totalPrice,
    handleProceedToPayment: paymentSubmit,
  } = useCheckoutLogic();
  const { t } = useLanguage();

  const [recipientName, setRecipientName] = useState<string>(user?.name || "");

  const cartList = cart || [];
  const ethiopianCities = ETHIOPIAN_CITIES;
  const addisSubCities = ADDIS_ABABA_SUBCITIES;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Shipping Address & Tailoring Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-200/80">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                <BsGeoAlt />
                <span>Step 1: Delivery Information</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-serif">
                {t("checkoutPage.deliveryAddress", "Delivery Address")}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {t("checkoutPage.whereDeliver", "Where should the artisan courier deliver your handwoven garments?")}
              </p>
            </div>
            <Link
              to="/cart"
              className="text-xs font-bold text-amber-800 hover:text-amber-950 hover:underline flex items-center gap-1 transition"
            >
              <BsArrowLeft /> <span>{t("checkoutPage.backToBag", "Back to Bag")}</span>
            </Link>
          </div>

          {/* Quick Select Saved Address (if user has any) */}
          {user?.addresses && user.addresses.length > 0 && (
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                {t("checkoutPage.useSavedAddress", "Saved Addresses on File")}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {user.addresses.map((item, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => {
                      setAddress1(item.address1 || "");
                      setAddress2(item.address2 || "");
                      setCity(item.city || "Addis Ababa");
                      setCountry(item.country || "Ethiopia");
                      setZipCode(item.zipCode || "1000");
                      if (item.subCity) setSubCity(item.subCity);
                    }}
                    className={`p-3 text-left rounded-2xl border text-xs transition ${
                      address1 === item.address1
                        ? "bg-amber-50 border-amber-600 text-amber-950 font-bold shadow-2xs"
                        : "bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700"
                    }`}
                  >
                    <span className="block font-bold text-stone-900">{item.addressType || "Address"}</span>
                    <span className="block truncate text-stone-600 mt-0.5">{item.address1}</span>
                    <span className="block text-stone-400 text-[11px]">{item.city}, {item.country}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={paymentSubmit} className="space-y-4">
            {/* Recipient Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                  <BsPerson className="text-amber-700" />
                  <span>Recipient Full Name *</span>
                </label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Full name for delivery contact"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-900 outline-none focus:border-amber-700 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                  <BsTelephone className="text-amber-700" />
                  <span>Phone Number (Telebirr / Courier) *</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="09... or +251 9..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-900 outline-none focus:border-amber-700 focus:bg-white transition font-mono"
                />
              </div>
            </div>

            {/* Country & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                  Country *
                </label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-900 outline-none focus:border-amber-700 focus:bg-white transition font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                  City / Region *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-900 outline-none focus:border-amber-700 focus:bg-white transition font-semibold"
                >
                  {ethiopianCities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subcity (if Addis Ababa) & Postal Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {city === "Addis Ababa" ? (
                <div>
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                    Addis Ababa Subcity (ክፍለ ከተማ) *
                  </label>
                  <select
                    value={subCity}
                    onChange={(e) => setSubCity(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-900 outline-none focus:border-amber-700 focus:bg-white transition font-semibold"
                  >
                    {addisSubCities.map((sc) => (
                      <option key={sc} value={sc}>
                        {sc} Subcity
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                    Zone / Woreda
                  </label>
                  <input
                    type="text"
                    value={subCity}
                    onChange={(e) => setSubCity(e.target.value)}
                    placeholder="Zone, Kebele, or District"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-900 outline-none focus:border-amber-700 focus:bg-white transition"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                  Postal / Area Code
                </label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="1000"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-900 outline-none focus:border-amber-700 focus:bg-white transition font-mono"
                />
              </div>
            </div>

            {/* Street Address */}
            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                Street Address / Woreda & House Number *
              </label>
              <input
                type="text"
                required
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                placeholder="e.g. Woreda 03, House #142, near Edna Mall"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-900 outline-none focus:border-amber-700 focus:bg-white transition"
              />
            </div>

            {/* Landmark Note */}
            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                Specific Landmark / Courier Note (Optional)
              </label>
              <input
                type="text"
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
                placeholder="e.g. Blue gate opposite Commercial Bank of Ethiopia"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-900 outline-none focus:border-amber-700 focus:bg-white transition"
              />
            </div>

            {/* Traditional Custom Tailoring Section */}
            <div className="pt-2 border-t border-stone-200/80">
              <div className="bg-amber-50/60 rounded-2xl border border-amber-200/70 p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeCustomMeasurements}
                      onChange={(e) => setIncludeCustomMeasurements(e.target.checked)}
                      className="w-4 h-4 text-amber-800 rounded border-stone-300 focus:ring-amber-700 accent-amber-800 cursor-pointer"
                    />
                    <span className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-2">
                      <BsScissors className="text-amber-800 text-base" />
                      <span>Custom Tailoring for Habesha Kemis / Traditional Attire</span>
                    </span>
                  </label>

                  {user?.customMeasurements && (user.customMeasurements.bust || user.customMeasurements.waist) && (
                    <button
                      type="button"
                      onClick={handleAutofillMeasurements}
                      className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold rounded-xl border border-amber-300 transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                    >
                      <span>⚡ Autofill Sizing Profile</span>
                    </button>
                  )}
                </div>

                {includeCustomMeasurements && (
                  <div className="space-y-4 pt-2 border-t border-amber-200/60">
                    <p className="text-xs text-amber-900/80">
                      Our Shemma pit weavers and Tilf embroiderers will hand-tailor your order to these body dimensions:
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
                          Bust / Chest (ደረት)
                        </label>
                        <input
                          type="text"
                          value={bust}
                          onChange={(e) => setBust(e.target.value)}
                          placeholder="e.g. 92 cm"
                          className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-amber-700 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
                          Waist (ወገብ)
                        </label>
                        <input
                          type="text"
                          value={waist}
                          onChange={(e) => setWaist(e.target.value)}
                          placeholder="e.g. 74 cm"
                          className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-amber-700 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
                          Hips (ዳሌ)
                        </label>
                        <input
                          type="text"
                          value={hips}
                          onChange={(e) => setHips(e.target.value)}
                          placeholder="e.g. 100 cm"
                          className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-amber-700 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
                          Dress Length (ቁመት)
                        </label>
                        <input
                          type="text"
                          value={length}
                          onChange={(e) => setLength(e.target.value)}
                          placeholder="e.g. 140 cm"
                          className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-amber-700 font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-1">
                        Tailoring Notes / Embroidery Preferences (Optional)
                      </label>
                      <input
                        type="text"
                        value={tailoringNotes}
                        onChange={(e) => setTailoringNotes(e.target.value)}
                        placeholder="e.g. Gold thread tibeb border, loose sleeves, high neckline..."
                        className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-amber-700"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-amber-800 to-amber-950 hover:from-amber-900 hover:to-stone-950 text-white font-bold rounded-2xl shadow-sm hover:shadow-md transition text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t("checkoutPage.continuePayment", "Continue to Secure Payment")}</span>
                <BsTruck />
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Order Summary & Coupon Code (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-2xs space-y-5 sticky top-28">
            <h3 className="text-lg font-black text-stone-900 font-serif pb-3 border-b border-stone-200/80 flex items-center justify-between">
              <span>{t("checkoutPage.orderSummary", "Order Summary")}</span>
              <span className="text-xs font-normal text-stone-500">
                {cartList.length} craft item{cartList.length !== 1 ? "s" : ""}
              </span>
            </h3>

            {/* Multi-Merchant Grouped Cart Items Preview */}
            <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
              {Object.entries(
                cartList.reduce<Record<string, typeof cartList>>((acc, item) => {
                  const shopName =
                    item.shop?.name || item.shopName || "Ethiopian Artisan Workshop";
                  if (!acc[shopName]) acc[shopName] = [];
                  acc[shopName].push(item);
                  return acc;
                }, {})
              ).map(([shopName, items], gIdx) => (
                <div key={gIdx} className="bg-stone-50 p-3 rounded-2xl border border-stone-200/70 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 border-b border-stone-200 pb-1.5">
                    <span className="flex items-center gap-1.5 truncate">
                      <span>📦 Package {gIdx + 1}:</span>
                      <span className="text-stone-800 font-bold truncate">{shopName}</span>
                    </span>
                    <span className="text-stone-400 font-normal shrink-0">
                      {items.length} item{items.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item._id} className="flex items-center gap-3">
                        <img
                          src={item.featuredImage?.url || item.images?.[0]?.url || "/placeholder.jpg"}
                          alt={item.name}
                          className="w-11 h-11 rounded-xl object-cover border border-amber-200/80 shrink-0 shadow-2xs"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-bold text-stone-900 truncate">{item.name}</h5>
                          <p className="text-[11px] text-stone-500">
                            Qty: {item.qty} {item.selectedSize ? `• Size: ${item.selectedSize}` : ""}
                          </p>
                        </div>
                        <span className="text-xs font-extrabold text-amber-950 font-mono shrink-0">
                          {(Number(item.discountPrice || item.originalPrice || 0) * (item.qty || 1)).toLocaleString()} ETB
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Code Redemption Form */}
            <div className="pt-3 border-t border-stone-200/80">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1.5 flex items-center gap-1">
                <BsTag className="text-amber-800" />
                <span>{t("checkoutPage.couponCode", "Promotional Voucher / Coupon")}</span>
              </label>

              {appliedCoupon ? (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                      <FiCheck /> {appliedCoupon.code} Applied
                    </span>
                    <span className="text-[11px] text-emerald-600">
                      Saved {discountAmount.toLocaleString()} ETB
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    type="button"
                    className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code (e.g. MESKEL10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs uppercase font-bold outline-none focus:border-amber-700"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={applyingCoupon}
                    className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs rounded-xl shadow-2xs transition disabled:bg-stone-300 cursor-pointer"
                  >
                    {applyingCoupon ? "..." : "Apply"}
                  </button>
                </div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-3 border-t border-stone-200/80 space-y-2.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Crafts Subtotal:</span>
                <span className="font-semibold text-stone-900">{subTotalPrice.toLocaleString()} ETB</span>
              </div>

              <div className="flex justify-between text-stone-600">
                <span>Zonal Courier Shipping:</span>
                <span className="font-semibold text-stone-900">
                  {shipping === 0 ? (
                    <span className="text-emerald-700 font-bold">FREE (over 5,000 ETB)</span>
                  ) : (
                    `${shipping.toLocaleString()} ETB`
                  )}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Voucher Discount:</span>
                  <span>-{discountAmount.toLocaleString()} ETB</span>
                </div>
              )}

              <div className="flex justify-between items-baseline pt-3 border-t border-stone-200/80 text-base">
                <span className="font-black text-stone-900 font-serif">Total Payable:</span>
                <span className="text-xl font-black text-amber-950 font-serif">
                  {totalPrice.toLocaleString()} <span className="text-xs text-amber-800 font-bold font-sans">ETB</span>
                </span>
              </div>
            </div>

            {/* Trust Assurance */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-center gap-2.5 text-xs text-amber-950">
              <BsShieldCheck className="text-amber-800 text-xl shrink-0" />
              <div className="leading-tight">
                <strong className="block text-amber-900">Chapa Escrow Guarantee</strong>
                <span className="text-[11px] text-stone-600">Funds released to artisan only upon your verified delivery.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chekout;
