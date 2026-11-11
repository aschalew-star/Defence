import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { BsShieldCheck, BsTruck, BsTag, BsCheck2, BsArrowLeft } from "react-icons/bs";
import { FiCheck, FiShoppingBag } from "react-icons/fi";
import CheckoutSteps from "./Checkoutprocess";

const Chekout = () => {
  const { user } = useSelector((state) => state.user);
  const { cart } = useSelector((state) => state.Cart);
  const navigate = useNavigate();

  const [country, setCountry] = useState("Ethiopia");
  const [city, setCity] = useState("Addis Ababa");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [zipCode, setZipCode] = useState("1000");

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Pre-fill from user default if available
    if (user) {
      if (user.phoneNumber) setPhoneNumber(user.phoneNumber);
      if (user.addresses && user.addresses.length > 0) {
        const defaultAddr = user.addresses[0];
        setCountry(defaultAddr.country || "Ethiopia");
        setCity(defaultAddr.city || "Addis Ababa");
        setAddress1(defaultAddr.address1 || "");
        setAddress2(defaultAddr.address2 || "");
        setZipCode(defaultAddr.zipCode || "1000");
      }
    }
  }, [user]);

  const cartList = cart || [];

  // Accurate subtotal from discountPrice or originalPrice
  const subTotalPrice = cartList.reduce(
    (acc, item) =>
      acc + (item.discountPrice || item.originalPrice || 0) * (item.qty || 1),
    0
  );

  // Dynamic Ethiopian shipping: Free if subtotal >= 3,000 ETB, else 150 for Addis, 300 for Regional
  const isAddis = city.toLowerCase().includes("addis");
  const baseShippingRate = isAddis ? 150 : 300;
  const shipping = subTotalPrice >= 3000 ? 0 : baseShippingRate;

  const totalPrice = Math.max(0, subTotalPrice + shipping - discountAmount);

  // Apply Coupon Handler
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code!");
      return;
    }

    setApplyingCoupon(true);
    try {
      const res = await axios.post(`${server}/coupon/apply-coupon`, {
        code: couponCode.trim(),
        cartTotal: subTotalPrice,
        userId: user?._id || null,
        shopId: cartList[0]?.shopId || cartList[0]?.shop?._id || null,
      });

      if (res.data?.success) {
        setAppliedCoupon(res.data.coupon);
        setDiscountAmount(Number(res.data.discountAmount) || 0);
        toast.success(res.data.message || "Coupon applied successfully!");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid or expired coupon code");
      setAppliedCoupon(null);
      setDiscountAmount(0);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode("");
    toast.info("Coupon removed");
  };

  const paymentSubmit = (e) => {
    e.preventDefault();
    if (!address1.trim() || !city.trim() || !phoneNumber.trim()) {
      toast.error("Please fill in your address, city, and phone number!");
      return;
    }

    if (cartList.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    const shippingAddress = {
      address1: address1.trim(),
      address2: address2.trim(),
      zipCode: zipCode || "1000",
      country: country || "Ethiopia",
      city: city.trim(),
    };

    const orderData = {
      cart: cartList,
      totalPrice,
      subTotalPrice,
      shipping,
      discountPrice: discountAmount,
      couponCode: appliedCoupon?.code || "",
      shippingAddress,
      user,
      phoneNumber: phoneNumber.trim(),
    };

    localStorage.setItem("latestOrder", JSON.stringify(orderData));
    navigate("/payments");
  };

  const ethiopianCities = [
    "Addis Ababa",
    "Hawassa",
    "Bahir Dar",
    "Gondar",
    "Dire Dawa",
    "Mekelle",
    "Adama (Nazret)",
    "Bishoftu (Debre Zeyit)",
    "Jimma",
    "Harar",
    "Dessie",
    "Other Region",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      {/* Checkout Progress Stepper */}
      <CheckoutSteps active={1} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-6">
        
        {/* LEFT COLUMN: Shipping Address Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 font-serif">
                Delivery Address
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Where should the artisan courier deliver your handwoven garments?
              </p>
            </div>
            <Link to="/cart" className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1">
              <BsArrowLeft /> <span>Back to Bag</span>
            </Link>
          </div>

          {/* Quick Select Saved Address (if user has any) */}
          {user?.addresses && user.addresses.length > 0 && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-2">
                Use Saved Address
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                    }}
                    className={`p-3 text-left rounded-2xl border text-xs transition ${
                      address1 === item.address1
                        ? "bg-amber-50/70 border-amber-600 text-amber-950 font-bold"
                        : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span className="block font-bold text-gray-900">{item.addressType || "Address"}</span>
                    <span className="block truncate text-gray-600 mt-0.5">{item.address1}</span>
                    <span className="block text-gray-400">{item.city}, {item.country}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={paymentSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                  Recipient Full Name *
                </label>
                <input
                  type="text"
                  required
                  defaultValue={user?.name || ""}
                  placeholder="Full name for delivery contact"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-amber-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                  Phone Number (Telebirr / Courier) *
                </label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="09... or +251 9..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-amber-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                  Country *
                </label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-amber-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                  City / Region *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-amber-600 focus:bg-white font-medium"
                >
                  {ethiopianCities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                Street Address / Subcity & House Number *
              </label>
              <input
                type="text"
                required
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                placeholder="e.g. Bole Subcity, Woreda 03, near Edna Mall"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-amber-600 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                  Specific Landmark / Courier Note (Optional)
                </label>
                <input
                  type="text"
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                  placeholder="e.g. Blue gate opposite the bank"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-amber-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                  Postal / Area Code
                </label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-amber-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition text-sm flex items-center justify-center gap-2"
              >
                <span>Continue to Secure Payment</span>
                <BsTruck />
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Order Summary & Coupon Code (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Order Summary Box */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-5">
            <h3 className="text-lg font-black text-gray-900 font-serif pb-3 border-b border-gray-100 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs font-normal text-gray-400">
                {cartList.length} craft(s)
              </span>
            </h3>

            {/* Cart Items Preview */}
            <div className="space-y-3 max-h-60 overflow-y-auto no-scrollbar pr-1">
              {cartList.map((item) => (
                <div key={item._id} className="flex items-center gap-3">
                  <img
                    src={item.images?.[0]?.url || "/placeholder.jpg"}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover border border-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-gray-900 truncate">{item.name}</h5>
                    <p className="text-[11px] text-gray-400">
                      Qty: {item.qty} {item.selectedSize ? `• Size: ${item.selectedSize}` : ""}
                    </p>
                  </div>
                  <span className="text-xs font-extrabold text-amber-900">
                    {(Number(item.discountPrice || item.originalPrice || 0) * (item.qty || 1)).toLocaleString()} ETB
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Code Redemption Form */}
            <div className="pt-3 border-t border-gray-100">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-1.5 flex items-center gap-1">
                <BsTag className="text-amber-700" />
                <span>Coupon or Promotional Code</span>
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
                    onClick={removeCoupon}
                    className="text-xs text-rose-600 hover:underline font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code (e.g. MESKEL10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs uppercase font-bold outline-none focus:border-amber-600"
                  />
                  <button
                    type="submit"
                    disabled={applyingCoupon}
                    className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs rounded-xl shadow-xs transition disabled:bg-gray-300"
                  >
                    {applyingCoupon ? "..." : "Apply"}
                  </button>
                </form>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-3 border-t border-gray-100 space-y-2.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Crafts Subtotal:</span>
                <span className="font-semibold text-gray-900">{subTotalPrice.toLocaleString()} ETB</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Zonal Courier Shipping:</span>
                <span className="font-semibold text-gray-900">
                  {shipping === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE (over 3,000 ETB)</span>
                  ) : (
                    `${shipping.toLocaleString()} ETB`
                  )}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Promotional Discount:</span>
                  <span>-{discountAmount.toLocaleString()} ETB</span>
                </div>
              )}

              <div className="flex justify-between items-baseline pt-3 border-t border-gray-100 text-base">
                <span className="font-black text-gray-900 font-serif">Total Payable:</span>
                <span className="text-xl font-black text-amber-950 font-serif">
                  {totalPrice.toLocaleString()} <span className="text-xs text-amber-700 font-bold">ETB</span>
                </span>
              </div>
            </div>

            {/* Trust Assurance */}
            <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/50 flex items-center gap-2.5 text-xs text-amber-950">
              <BsShieldCheck className="text-amber-800 text-xl shrink-0" />
              <span>
                <strong>Chapa Escrow Guarantee:</strong> Payment is held safely until you confirm delivery.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chekout;
