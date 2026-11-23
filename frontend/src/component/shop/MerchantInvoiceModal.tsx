import React, { useRef, useState } from "react";
import { RxCross1 } from "react-icons/rx";
import {
  BsPrinter,
  BsDownload,
  BsShieldCheck,
  BsCheck2Circle,
  BsScissors,
  BsBuildingCheck,
  BsQrCode,
} from "react-icons/bs";
import { FiFileText, FiTruck, FiPackage } from "react-icons/fi";

export interface MerchantInvoiceModalProps {
  order: any;
  seller?: any;
  isOpen: boolean;
  onClose: () => void;
}

const MerchantInvoiceModal: React.FC<MerchantInvoiceModalProps> = ({ order, seller, isOpen, onClose }) => {
  const [docType, setDocType] = useState<"invoice" | "jobTicket">("invoice");
  const printRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = `INV-${order._id.slice(-8).toUpperCase()}`;
  const invoiceDate = new Date(order.createdAt || Date.now()).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

  const cartItems = order.cart || [];
  const subTotal = cartItems.reduce(
    (acc, item) =>
      acc + (Number(item.discountPrice || item.originalPrice || 0) * (item.qty || 1)),
    0
  );
  const shippingFee = Number(order.shippingPrice || order.shippingFee || 150);
  const grandTotal = Number(order.totalPrice || subTotal + shippingFee);

  const isVat = Boolean(seller?.vatRegistered);
  const vatRate = 0.15;
  const vatAmount = isVat ? Math.round(subTotal * vatRate) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-stone-200 my-auto">
        {/* Modal Controls (Not printed) */}
        <div className="print:hidden p-4 sm:p-5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-bold">
              <FiFileText />
            </span>
            <div>
              <h2 className="text-base font-bold font-serif">
                Commercial Logistics & Tax Documents
              </h2>
              <p className="text-[11px] text-stone-400">
                Order #{order._id.slice(-8).toUpperCase()} • Customer: {order.user?.name || "Client"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Document Switcher */}
            <div className="bg-stone-800 p-1 rounded-xl flex items-center text-xs font-semibold">
              <button
                type="button"
                onClick={() => setDocType("invoice")}
                className={`px-3 py-1 rounded-lg transition ${
                  docType === "invoice" ? "bg-amber-600 text-white shadow-xs" : "text-stone-400 hover:text-white"
                }`}
              >
                Tax Invoice
              </button>
              <button
                type="button"
                onClick={() => setDocType("jobTicket")}
                className={`px-3 py-1 rounded-lg transition ${
                  docType === "jobTicket" ? "bg-amber-600 text-white shadow-xs" : "text-stone-400 hover:text-white"
                }`}
              >
                Weaver Job Ticket
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition"
            >
              <BsPrinter size={14} />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition"
            >
              <RxCross1 size={18} />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-10 overflow-y-auto flex-1 bg-white text-stone-900 text-xs font-sans print:p-0 print:m-0">
          {docType === "invoice" ? (
            /* ============================================================== */
            /* 1. OFFICIAL ETHIOPIAN COMMERCIAL TAX INVOICE */
            /* ============================================================== */
            <div className="space-y-6 max-w-2xl mx-auto border border-stone-200 p-8 rounded-2xl bg-white shadow-2xs print:border-none print:shadow-none print:p-0">
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-stone-900 pb-5">
                <div>
                  <div className="flex items-center gap-2.5">
                    {seller?.avatar?.url ? (
                      <img
                        src={seller.avatar.url}
                        alt="Logo"
                        className="w-12 h-12 rounded-xl object-cover border border-stone-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-stone-900 text-white font-serif font-black text-xl flex items-center justify-center">
                        {seller?.name ? seller.name.charAt(0).toUpperCase() : "A"}
                      </div>
                    )}
                    <div>
                      <h1 className="text-xl font-bold font-serif text-stone-900">
                        {seller?.legalBusinessName || seller?.name || "Artisan Workshop"}
                      </h1>
                      <p className="text-[11px] text-stone-500">
                        {seller?.businessType || "Verified Artisan Boutique"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 text-[11px] text-stone-600 space-y-0.5">
                    <p>
                      <strong>Workshop:</strong> {seller?.address || "Shiro Meda Market"}, {seller?.city || "Addis Ababa"}
                    </p>
                    <p>
                      <strong>Tel:</strong> {seller?.phoneNumber || "N/A"} • <strong>Email:</strong> {seller?.email || "N/A"}
                    </p>
                    <p className="font-mono text-emerald-900 font-bold">
                      TIN: {seller?.tinNumber || "0012345678"} • Trade Reg: {seller?.businessRegistrationNumber || "MOTI/AA/2024"}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-3 py-1 rounded-md bg-stone-900 text-white font-mono text-[11px] font-bold uppercase tracking-wider inline-block">
                    Commercial Tax Invoice
                  </span>
                  <div className="mt-2 text-stone-900 font-bold font-mono text-sm">
                    {invoiceNumber}
                  </div>
                  <div className="text-stone-500 text-[11px] mt-0.5">
                    Date: {invoiceDate}
                  </div>
                  <div className="text-[10px] text-emerald-800 font-bold mt-1 inline-flex items-center gap-1">
                    <BsShieldCheck /> Platform Escrow Paid
                  </div>
                </div>
              </div>

              {/* Bill To & Shipping Address */}
              <div className="grid grid-cols-2 gap-6 py-2 border-b border-stone-200 text-xs">
                <div>
                  <span className="font-bold uppercase tracking-wider text-stone-500 text-[10px] block mb-1">
                    Customer / Consignee:
                  </span>
                  <div className="font-bold text-stone-900 text-sm">
                    {order.user?.name || "Valued Collector"}
                  </div>
                  <div className="text-stone-600 mt-0.5">
                    {order.user?.email}
                  </div>
                  <div className="font-mono text-stone-800 mt-0.5">
                    Phone: {order.user?.phoneNumber || order.shippingAddress?.phoneNumber || "N/A"}
                  </div>
                </div>

                <div>
                  <span className="font-bold uppercase tracking-wider text-stone-500 text-[10px] block mb-1">
                    Destination & Delivery Address:
                  </span>
                  <div className="font-medium text-stone-900">
                    {order.shippingAddress?.address1 || "Addis Ababa delivery"}
                  </div>
                  <div className="text-stone-600">
                    {order.shippingAddress?.city || "Addis Ababa"}, {order.shippingAddress?.country || "Ethiopia"}
                  </div>
                  <div className="text-stone-500 text-[11px] mt-0.5">
                    Delivery Courier: {order.deliveryProvider || "Direct Courier"}
                  </div>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="pt-2">
                <table className="w-full text-left text-xs">
                  <thead className="border-b-2 border-stone-200 text-stone-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2">Description of Artisan Craft</th>
                      <th className="py-2 text-center">Qty</th>
                      <th className="py-2 text-right">Unit Price</th>
                      <th className="py-2 text-right">Total (ETB)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {cartItems.map((item, idx) => {
                      const itemPrice = Number(item.discountPrice || item.originalPrice || 0);
                      const qty = item.qty || 1;
                      return (
                        <tr key={idx} className="py-2">
                          <td className="py-2.5">
                            <div className="font-bold text-stone-900">{item.name}</div>
                            <div className="text-[10px] text-stone-500 font-mono">
                              SKU: {item.sku || "N/A"} {item.selectedSize ? `• Size: ${item.selectedSize}` : ""}
                            </div>
                          </td>
                          <td className="py-2.5 text-center font-mono">{qty}</td>
                          <td className="py-2.5 text-right font-mono">{itemPrice.toLocaleString()}</td>
                          <td className="py-2.5 text-right font-mono font-bold">
                            {(itemPrice * qty).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Totals Summary */}
              <div className="flex justify-between items-start pt-4 border-t border-stone-200">
                <div className="text-[10px] text-stone-500 max-w-xs space-y-1">
                  <p className="font-bold text-stone-800">
                    Payment Method: {order.paymentInfo?.type?.toUpperCase() || "TELEBIRR / ESCROW"}
                  </p>
                  <p>
                    Goods sold are authentic Ethiopian handwoven or artisanal items. Returns or alterations honored within 7 days under platform consumer guarantee.
                  </p>
                </div>

                <div className="w-56 space-y-1.5 text-xs text-right">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Subtotal:</span>
                    <span className="font-mono font-medium">{subTotal.toLocaleString()} ETB</span>
                  </div>

                  {isVat && (
                    <div className="flex justify-between text-stone-600">
                      <span>VAT (15%):</span>
                      <span className="font-mono font-medium">{vatAmount.toLocaleString()} ETB</span>
                    </div>
                  )}

                  <div className="flex justify-between text-stone-600">
                    <span>Domestic Delivery:</span>
                    <span className="font-mono font-medium">{shippingFee.toLocaleString()} ETB</span>
                  </div>

                  <div className="flex justify-between pt-2 border-t border-stone-900 font-bold text-sm text-stone-900">
                    <span>Total Due / Paid:</span>
                    <span className="font-mono text-emerald-800">{grandTotal.toLocaleString()} ETB</span>
                  </div>
                </div>
              </div>

              {/* Authorized Seal & Stamp */}
              <div className="pt-6 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <div className="font-bold text-stone-900">Authorized Merchant Signature</div>
                    <div className="text-[10px]">Roha Electronic Verification Seal</div>
                  </div>
                </div>

                <div className="text-right font-mono text-[10px]">
                  Proclamation No. 1205/2020 Compliant
                </div>
              </div>
            </div>
          ) : (
            /* ============================================================== */
            /* 2. WEAVER & TAILOR WORKSHOP JOB TICKET */
            /* ============================================================== */
            <div className="space-y-6 max-w-2xl mx-auto border-2 border-dashed border-amber-600 p-8 rounded-2xl bg-amber-50/20 text-stone-900 print:border-stone-900 print:bg-white">
              {/* Job Ticket Banner */}
              <div className="flex items-center justify-between border-b-2 border-amber-700 pb-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-600 text-white font-mono text-[10px] font-bold uppercase">
                    Atelier Production Ticket
                  </span>
                  <h2 className="text-xl font-bold font-serif text-stone-900 mt-1">
                    Master Weaver & Tailor Work Order
                  </h2>
                  <p className="text-[11px] text-stone-600">
                    Workshop Ticket #{order._id.slice(-6).toUpperCase()} • Due in {order.deliveryTime || "3-5"} business days
                  </p>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                  <BsScissors size={24} />
                </div>
              </div>

              {/* Client & Production Urgency */}
              <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-amber-200">
                <div>
                  <span className="font-bold text-stone-500 uppercase text-[10px] block">
                    Client & Measurements Reference:
                  </span>
                  <div className="font-bold text-sm text-stone-900">
                    {order.user?.name || "Client"}
                  </div>
                  <div className="text-stone-600 text-xs">
                    Phone: {order.user?.phoneNumber || order.shippingAddress?.phoneNumber || "N/A"}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-stone-500 uppercase text-[10px] block">
                    Target Delivery Destination:
                  </span>
                  <div className="font-medium text-xs text-stone-900">
                    {order.shippingAddress?.city || "Addis Ababa"}, {order.shippingAddress?.address1 || "Local"}
                  </div>
                </div>
              </div>

              {/* Tailoring & Weaving Specs per Craft */}
              <div className="space-y-3">
                <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <BsScissors className="text-amber-700" /> Garment Cutting & Weaving Specifications
                </h3>

                {cartItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white rounded-xl border border-stone-200 space-y-2"
                  >
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <div className="font-bold text-sm text-stone-900">{item.name}</div>
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 font-mono font-bold text-xs">
                        QTY: {item.qty || 1}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div>
                        <span className="text-stone-400 block text-[9px] uppercase font-bold">Size:</span>
                        <span className="font-bold text-amber-900">{item.selectedSize || "Custom"}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[9px] uppercase font-bold">Weave Fabric:</span>
                        <span className="font-medium">{item.materials || "Pure Cotton (Shemma)"}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[9px] uppercase font-bold">Tilf Motif:</span>
                        <span className="font-medium">Traditional Gold / Color</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[9px] uppercase font-bold">Hemming Style:</span>
                        <span className="font-medium">Handcrafted Tassels</span>
                      </div>
                    </div>

                    {item.customMeasurements && (
                      <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 mt-2 text-[10px]">
                        <span className="font-bold text-amber-950 block mb-1">
                          Client Custom Measurements:
                        </span>
                        <div className="grid grid-cols-4 gap-1 font-mono">
                          <span>Bust: {item.customMeasurements.bust || "Standard"}</span>
                          <span>Waist: {item.customMeasurements.waist || "Standard"}</span>
                          <span>Hips: {item.customMeasurements.hips || "Standard"}</span>
                          <span>Length: {item.customMeasurements.length || "Standard"}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Quality Checklist */}
              <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-2 text-xs">
                <span className="font-bold text-stone-800 block uppercase text-[10px]">
                  Workshop Quality Checkpoints (Sign-off before courier handoff):
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-3.5 h-3.5 accent-amber-600" />
                    <span>Shemma cotton texture inspected for flaws</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-3.5 h-3.5 accent-amber-600" />
                    <span>Tibeb embroidery thread tension & symmetry</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-3.5 h-3.5 accent-amber-600" />
                    <span>Final steaming, pressing, & netela packaging</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-3.5 h-3.5 accent-amber-600" />
                    <span>Courier waybill attached & sealed</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MerchantInvoiceModal;
