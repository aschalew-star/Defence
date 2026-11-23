import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { RxCross2 } from "react-icons/rx";
import {
  AiOutlineDelete,
  AiOutlineCopy,
  AiOutlineCheck,
} from "react-icons/ai";
import {
  FiExternalLink,
  FiCalendar,
  FiClock,
  FiTag,
  FiPercent,
  FiTrendingUp,
  FiPackage,
  FiScissors,
  FiEdit,
} from "react-icons/fi";
import {
  BsShieldCheck,
  BsCashCoin,
  BsHourglassSplit,
  BsLightningCharge,
} from "react-icons/bs";
import { toast } from "react-toastify";

export interface MerchantEventDetailModalProps {
  event: any;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (event: any) => void;
}

const MerchantEventDetailModal: React.FC<MerchantEventDetailModalProps> = ({ event, onClose, onDelete, onEdit }) => {
  const [selectedImg, setSelectedImg] = useState(0);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    status: "running",
  });

  useEffect(() => {
    if (!event) return;
    const start = new Date(event.start_Date).getTime();
    const end = new Date(event.Finish_Date).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      if (now < start) {
        const diff = start - now;
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
          status: "upcoming",
        });
      } else if (now > end) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, status: "expired" });
      } else {
        const diff = end - now;
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
          status: "running",
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [event]);

  if (!event) return null;

  const images =
    event.images && event.images.length > 0
      ? event.images
      : [{ url: event.featuredImage?.url || "/photo.jpg" }];

  const currentPrice = Number(event.discountPrice || 0);
  const originalPrice = Number(event.originalPrice || 0);
  const hasDiscount = originalPrice > 0 && currentPrice < originalPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;
  const discountSaved = hasDiscount ? originalPrice - currentPrice : 0;

  const unitsSold = Number(event.sold_out || 0);
  const stock = Number(event.stock || 0);
  const estRevenue = unitsSold * currentPrice;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/event/${event._id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Event link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-stone-200 my-auto">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 font-semibold text-xs border border-amber-500/30 flex items-center gap-1">
              <BsLightningCharge /> Flash Campaign
            </span>
            <span className="px-2.5 py-1 rounded-md bg-stone-800 text-stone-300 text-xs font-medium">
              {event.category || "Promotional Craft"}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                timeLeft.status === "running"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : timeLeft.status === "upcoming"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  : "bg-stone-500/20 text-stone-300 border border-stone-500/30"
              }`}
            >
              {timeLeft.status === "running"
                ? "Live & Running"
                : timeLeft.status === "upcoming"
                ? "Scheduled / Upcoming"
                : "Concluded"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition"
              title="Copy event link"
            >
              {copied ? <AiOutlineCheck className="text-emerald-400" /> : <AiOutlineCopy />}
              <span>{copied ? "Copied" : "Share Event"}</span>
            </button>

            <Link
              to={`/event/${event._id}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition"
              title="View on buyer event page"
            >
              <span>Public Event</span>
              <FiExternalLink size={13} />
            </Link>

            <Link
              to={`/dashboard/edit-event/${event._id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs"
              title="Open full-page editor"
            >
              <FiEdit size={13} />
              <span>Edit Page</span>
            </Link>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition"
              title="Close modal"
            >
              <RxCross2 size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 overflow-y-auto flex-1">
          {/* Left Column: Media Gallery */}
          <div className="md:col-span-5 p-6 bg-stone-50 border-r border-stone-200 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-white shadow-md border border-stone-200">
                <img
                  src={images[selectedImg]?.url || "/photo.jpg"}
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
                {hasDiscount && (
                  <span className="absolute top-3 right-3 bg-rose-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md">
                    -{discountPercent}% OFF
                  </span>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImg(idx)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        selectedImg === idx
                          ? "border-amber-600 scale-105 shadow-sm"
                          : "border-stone-300 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Live Campaign Countdown Box */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 text-center space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center justify-center gap-1.5">
                <FiClock />
                {timeLeft.status === "running"
                  ? "Campaign Concludes In"
                  : timeLeft.status === "upcoming"
                  ? "Campaign Starts In"
                  : "Campaign Concluded"}
              </div>
              <div className="font-mono text-xl font-black text-amber-950">
                {timeLeft.status === "expired" ? (
                  <span className="text-stone-400">00d : 00h : 00m : 00s</span>
                ) : (
                  <span>
                    {String(timeLeft.days).padStart(2, "0")}d :{" "}
                    {String(timeLeft.hours).padStart(2, "0")}h :{" "}
                    {String(timeLeft.minutes).padStart(2, "0")}m :{" "}
                    {String(timeLeft.seconds).padStart(2, "0")}s
                  </span>
                )}
              </div>
              <div className="text-[10px] text-stone-500">
                {new Date(event.start_Date).toLocaleDateString()} ➔{" "}
                {new Date(event.Finish_Date).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Right Column: Event Details & Performance */}
          <div className="md:col-span-7 p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-5">
              {/* Event Name & Category */}
              <div>
                <h2 className="text-2xl font-bold font-serif text-stone-900 leading-snug">
                  {event.name}
                </h2>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-stone-500">
                  <span className="font-medium text-amber-700">{event.category}</span>
                  <span>•</span>
                  <span>Created {new Date(event.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Pricing & Discount Matrix */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                  <div className="text-[11px] text-stone-500 uppercase font-semibold flex items-center gap-1">
                    <BsCashCoin className="text-emerald-700" /> Event Price
                  </div>
                  <div className="text-lg font-bold font-serif text-stone-900 mt-1">
                    {currentPrice.toLocaleString()}{" "}
                    <span className="text-[11px] font-normal text-stone-500">ETB</span>
                  </div>
                  {hasDiscount && (
                    <div className="text-[10px] text-stone-400 line-through">
                      {originalPrice.toLocaleString()} ETB
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                  <div className="text-[11px] text-stone-500 uppercase font-semibold flex items-center gap-1">
                    <FiPercent className="text-amber-600" /> Promotion
                  </div>
                  <div className="text-lg font-bold text-amber-800 mt-1">
                    -{discountPercent}%
                  </div>
                  <div className="text-[10px] text-stone-500">
                    Save {discountSaved.toLocaleString()} ETB
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                  <div className="text-[11px] text-stone-500 uppercase font-semibold flex items-center gap-1">
                    <FiTrendingUp className="text-blue-700" /> Revenue
                  </div>
                  <div className="text-lg font-bold font-serif text-stone-900 mt-1">
                    {estRevenue.toLocaleString()}{" "}
                    <span className="text-[11px] font-normal text-stone-500">ETB</span>
                  </div>
                  <div className="text-[10px] text-stone-500">{unitsSold} sold</div>
                </div>
              </div>

              {/* Inventory & Stock Health */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-stone-700">Promo Inventory Level:</span>
                  <span className="font-mono text-stone-900 font-bold">
                    {stock} units remaining • {unitsSold} sold
                  </span>
                </div>
                <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-600 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(10, (stock / (stock + unitsSold || 1)) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              {/* Sizes & Attributes */}
              <div className="space-y-3 text-xs">
                {event.sizes && event.sizes.length > 0 && (
                  <div>
                    <span className="font-bold text-stone-700">Available Promo Sizes:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {event.sizes.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 font-semibold border border-stone-200"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <span className="font-bold text-stone-700">Campaign Details:</span>
                  <p className="mt-1 text-xs text-stone-600 leading-relaxed max-h-32 overflow-y-auto bg-stone-50 p-3 rounded-xl border border-stone-200 whitespace-pre-line">
                    {event.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-stone-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  if (onDelete) onDelete(event._id);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold transition"
              >
                <AiOutlineDelete size={16} />
                <span>Delete Event</span>
              </button>

              <div className="flex items-center gap-2">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(event)}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition inline-flex items-center gap-1.5"
                  >
                    <FiEdit size={13} />
                    <span>Edit Flash Event</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition"
                >
                  Close
                </button>
                <Link
                  to={`/event/${event._id}`}
                  target="_blank"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition inline-flex items-center gap-1.5"
                >
                  <span>Open Public Event</span>
                  <FiExternalLink size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MerchantEventDetailModal;
