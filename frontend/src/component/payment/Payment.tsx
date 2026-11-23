import React from "react";
import { usePaymentLogic, ETHIOPIAN_DELIVERY_ZONES, PaymentMethodType } from "../../hooks/usePaymentLogic";
import {
  BsShieldCheck,
  BsCreditCard2Back,
  BsPhone,
  BsBuilding,
  BsTruck,
  BsCheck2Circle,
  BsLockFill,
  BsArrowRight,
  BsPatchCheckFill,
} from "react-icons/bs";
import { FiLock, FiCheck } from "react-icons/fi";
import { useLanguage } from "../../hooks/useLanguage";

export interface PaymentInfoProps {
  user: any;
  loading: boolean;
  selectedMethod: PaymentMethodType;
  setSelectedMethod: (method: PaymentMethodType) => void;
  telebirrNumber: string;
  setTelebirrNumber: (num: string) => void;
  handleChapaPayment: (e?: React.FormEvent) => void;
  handleTelebirrPayment: (e?: React.FormEvent) => void;
  orderTotal: number;
  formatPrice: (amount: number) => string;
}

export interface CartDataProps {
  orderData: any;
  formatPrice: (amount: number) => string;
}

const Payment: React.FC = () => {
  const {
    orderData,
    user,
    selectedMethod,
    setSelectedMethod,
    loading,
    telebirrNumber,
    setTelebirrNumber,
    handleChapaPayment,
    handleTelebirrPayment,
    formatPrice,
  } = usePaymentLogic();
  const { t } = useLanguage();

  const totalAmount = Number(orderData?.totalPrice || 0);

  return (
    <div className="w-full space-y-6">
      {/* National Escrow Assurance Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white p-5 sm:p-6 rounded-3xl shadow-sm border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-600/30 border border-amber-500/40 text-amber-300 flex items-center justify-center text-2xl shadow-xs shrink-0">
            <BsShieldCheck />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold font-serif text-white tracking-tight">
                {t("paymentPage.escrowTitle", "National Escrow Trust & Trade Checkout")}
              </h1>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                100% Escrow Secured
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-0.5">
              Powered by Chapa • Funds held safely until you physically inspect your craft & confirm handover OTP
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center text-xs font-mono bg-stone-950/80 px-3.5 py-2 rounded-2xl border border-stone-800 text-stone-300">
          <BsLockFill className="text-emerald-400" />
          <span>256-Bit SSL Encrypted</span>
        </div>
      </div>

      {/* Main Grid: Left = Channels, Right = Cart Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Payment Channel Selection (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <PaymentInfo
            user={user}
            loading={loading}
            selectedMethod={selectedMethod}
            setSelectedMethod={setSelectedMethod}
            telebirrNumber={telebirrNumber}
            setTelebirrNumber={setTelebirrNumber}
            handleChapaPayment={handleChapaPayment}
            handleTelebirrPayment={handleTelebirrPayment}
            orderTotal={totalAmount}
            formatPrice={formatPrice}
          />
        </div>

        {/* Order Summary Sidebar (5 cols) */}
        <div className="lg:col-span-5">
          <CartData orderData={orderData} formatPrice={formatPrice} />
        </div>
      </div>
    </div>
  );
};

const PaymentInfo: React.FC<PaymentInfoProps> = ({
  loading,
  selectedMethod,
  setSelectedMethod,
  telebirrNumber,
  setTelebirrNumber,
  handleChapaPayment,
  handleTelebirrPayment,
  orderTotal,
  formatPrice,
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6">
      <div className="flex items-center justify-between pb-5 border-b border-stone-100">
        <div>
          <h2 className="text-xl font-bold font-serif text-stone-900">
            Select Payment Method
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Pay safely with your preferred digital wallet, bank transfer, or debit card
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-stone-400 block">Total Due</span>
          <span className="font-mono font-black text-amber-900 text-base sm:text-lg">
            {formatPrice(orderTotal)}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* OPTION 1: CHAPA UNIFIED MULTI-GATEWAY */}
        <div
          onClick={() => setSelectedMethod("chapa")}
          className={`p-5 rounded-3xl border-2 cursor-pointer transition-all ${
            selectedMethod === "chapa"
              ? "border-amber-700 bg-amber-50/40 shadow-xs ring-1 ring-amber-700/20"
              : "border-stone-200 hover:border-stone-300 bg-white"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                  selectedMethod === "chapa"
                    ? "border-amber-800 bg-amber-800 text-white"
                    : "border-stone-300"
                }`}
              >
                {selectedMethod === "chapa" && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-stone-900">
                    Chapa Multi-Payment Gateway
                  </h4>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  Pay securely with Telebirr, CBEBirr, Awash Birr, Bank of Abyssinia, Visa, or Mastercard.
                </p>

                {/* Bank / Provider Icons Pill Strip */}
                <div className="flex flex-wrap items-center gap-1.5 mt-3">
                  <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                    <BsPhone size={10} /> Telebirr
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold flex items-center gap-1">
                    <BsBuilding size={10} /> CBEBirr
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 text-[10px] font-bold flex items-center gap-1">
                    <BsBuilding size={10} /> Awash Bank
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-purple-50 text-purple-900 border border-purple-200 text-[10px] font-bold flex items-center gap-1">
                    <BsBuilding size={10} /> Abyssinia
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-stone-100 text-stone-800 border border-stone-200 text-[10px] font-bold flex items-center gap-1">
                    <BsCreditCard2Back size={10} /> Visa / MC
                  </span>
                </div>
              </div>
            </div>

            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0 font-mono">
              0% Fee
            </span>
          </div>

          {selectedMethod === "chapa" && (
            <div className="mt-5 pt-4 border-t border-amber-200/60 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Mobile Number (For Telebirr Push & SMS Receipt)
                </label>
                <input
                  type="tel"
                  value={telebirrNumber}
                  onChange={(e) => setTelebirrNumber(e.target.value)}
                  placeholder="e.g. 0912345678 or 0712345678"
                  className="w-full px-4 py-2.5 rounded-2xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-700 font-mono"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  Your phone number will be pre-filled on Chapa's checkout page for one-touch mobile authorization.
                </p>
              </div>

              <button
                type="button"
                onClick={handleChapaPayment}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-amber-800 to-amber-950 hover:from-amber-900 hover:to-black text-white font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Connecting to Chapa Secure Gateway...</span>
                  </div>
                ) : (
                  <>
                    <span>Pay {formatPrice(orderTotal)} with Chapa Gateway</span>
                    <BsArrowRight />
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* OPTION 2: TELEBIRR DIRECT SHORTCUT */}
        <div
          onClick={() => setSelectedMethod("telebirr")}
          className={`p-5 rounded-3xl border-2 cursor-pointer transition-all ${
            selectedMethod === "telebirr"
              ? "border-emerald-600 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-600/20"
              : "border-stone-200 hover:border-stone-300 bg-white"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                  selectedMethod === "telebirr"
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-stone-300"
                }`}
              >
                {selectedMethod === "telebirr" && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-stone-900">
                    Telebirr Direct Mobile Checkout
                  </h4>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                    Instant Mobile Payment
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  Authorize payment directly via your Telebirr SuperApp, USSD (*127#), or Telebirr PIN.
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0 font-mono">
              Instant
            </span>
          </div>

          {selectedMethod === "telebirr" && (
            <div className="mt-5 pt-4 border-t border-emerald-200 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Telebirr Registered Number *
                </label>
                <input
                  type="tel"
                  value={telebirrNumber}
                  onChange={(e) => setTelebirrNumber(e.target.value)}
                  placeholder="0912345678 or 0712345678"
                  className="w-full px-4 py-2.5 rounded-2xl border border-emerald-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  You will be prompted on your phone or in the Telebirr app to confirm your escrow authorization.
                </p>
              </div>

              <button
                type="button"
                onClick={handleTelebirrPayment}
                disabled={loading}
                className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Connecting to Telebirr...</span>
                  </div>
                ) : (
                  <>
                    <span>Pay {formatPrice(orderTotal)} with Telebirr via Chapa</span>
                    <BsArrowRight />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Escrow Guarantee Statement */}
      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3 text-xs text-stone-600">
        <BsCheck2Circle className="text-emerald-700 text-lg shrink-0 mt-0.5" />
        <div>
          <strong className="text-stone-900 block font-serif">Ministry of Trade Escrow Compliance</strong>
          <p className="mt-0.5">
            Your payment is held in neutral platform escrow. The artisan boutique is paid only after you physically inspect the garment and provide the 6-digit courier verification OTP.
          </p>
        </div>
      </div>
    </div>
  );
};

const CartData: React.FC<CartDataProps> = ({ orderData, formatPrice }) => {
  const { t } = useLanguage();
  const subTotal = Number(orderData?.subTotalPrice || 0);
  const shipping = Number(orderData?.shipping || 0);
  const discount = Number(orderData?.discountPrice || 0);
  const total = Number(orderData?.totalPrice || 0);
  const items = orderData?.cart || [];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-5">
      <div className="pb-3 border-b border-stone-100 flex items-center justify-between">
        <h3 className="text-lg font-bold font-serif text-stone-900">
          Order Summary
        </h3>
        <span className="text-xs font-mono font-bold bg-amber-50 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-200">
          {items.length} garment{items.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Financial Breakdown */}
      <div className="space-y-3 text-xs">
        <div className="flex justify-between text-stone-600">
          <span>Crafts Subtotal:</span>
          <span className="font-bold text-stone-900 font-mono">{formatPrice(subTotal)}</span>
        </div>

        <div className="flex justify-between text-stone-600">
          <span>Courier Shipping:</span>
          <span className="font-semibold text-stone-900 font-mono">
            {shipping === 0 ? "FREE" : formatPrice(shipping)}
          </span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-emerald-700 font-semibold">
            <span>Promotion / Loyalty Applied:</span>
            <span className="font-mono">-{formatPrice(discount)}</span>
          </div>
        )}

        <div className="flex justify-between text-stone-500 text-[11px]">
          <span>Chapa Escrow Fee:</span>
          <span className="text-emerald-700 font-semibold">0 ETB (Covered by Platform)</span>
        </div>

        <div className="pt-3 border-t border-stone-100 flex justify-between items-baseline">
          <span className="text-sm font-bold text-stone-900 font-serif">Total Payable:</span>
          <span className="text-2xl font-black text-amber-900 font-mono">
            {formatPrice(total)}
          </span>
        </div>
      </div>

      {/* Cart Items List */}
      {items.length > 0 && (
        <div className="pt-4 border-t border-stone-100 space-y-3">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
            Handcrafted Garments in Order
          </h4>
          <div className="space-y-2.5 max-h-56 overflow-y-auto no-scrollbar pr-1">
            {items.map((item: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-2.5 rounded-2xl bg-stone-50 border border-stone-200/80"
              >
                <img
                  src={item.images?.[0]?.url || item.featuredImage?.url || "/placeholder.jpg"}
                  alt={item.name}
                  className="w-12 h-12 rounded-xl object-cover bg-stone-200 border border-stone-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-stone-900 truncate">{item.name}</p>
                  <p className="text-[11px] text-stone-500">
                    Qty: {item.qty || 1} {item.selectedSize ? `• Size: ${item.selectedSize}` : ""}
                  </p>
                </div>
                <span className="text-xs font-bold text-stone-900 font-mono">
                  {formatPrice(Number(item.discountPrice || item.originalPrice || 0) * (item.qty || 1))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delivery Guarantee Card */}
      <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/60 rounded-2xl flex items-center gap-3">
        <BsTruck className="text-emerald-700 text-xl shrink-0" />
        <div className="text-xs">
          <div className="font-bold text-emerald-950">Pre-Shipment Quality Inspection</div>
          <div className="text-stone-600 text-[11px]">
            Garment inspected with photo proof before courier dispatch.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
