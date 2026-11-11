import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import {
  FiCalendar,
  FiClock,
  FiTag,
  FiArrowRight,
  FiShoppingBag,
  FiLayers,
} from "react-icons/fi";
import { BsShop, BsLightningCharge, BsShieldCheck } from "react-icons/bs";
import { MdOutlineVerified } from "react-icons/md";
import { AiFillStar } from "react-icons/ai";

// Mini Countdown Component for each event card
function EventCardCountdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  useEffect(() => {
    if (!targetDate) return;
    const target = new Date(targetDate).getTime();

    const update = () => {
      const now = new Date().getTime();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds, expired: false });
      }
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.expired) {
    return <span className="text-[11px] font-bold text-stone-400">Concluded</span>;
  }

  return (
    <div className="flex items-center gap-1 font-mono text-[11px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
      <FiClock className="text-amber-700" />
      <span>
        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
      </span>
    </div>
  );
}

function Events() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.get(`${server}/event/get-all-events`);
        setEvents(data.events || []);
      } catch (err) {
        console.error("Failed to load events:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const now = new Date().getTime();

  const filteredEvents = events.filter((ev) => {
    if (filter === "all") return true;
    const end = new Date(ev.Finish_Date).getTime();
    const start = new Date(ev.start_Date).getTime();
    if (filter === "running") return now >= start && now <= end;
    if (filter === "upcoming") return now < start;
    if (filter === "expired") return now > end;
    return true;
  });

  const featuredHeroEvent = events.find((ev) => {
    const end = new Date(ev.Finish_Date).getTime();
    return now <= end;
  }) || events[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Page Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-stone-200/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-stone-100">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-900 bg-amber-50 px-3 py-1 rounded-full mb-2 border border-amber-200/60">
              <FiCalendar /> Ethiopian Festival & Holiday Flash Deals
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-serif text-stone-900">
              Cultural Events & Limited-Time Flash Sales
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
              Special promotional releases crafted for holidays like Meskel, Enkutatash, Timkat, Fasika, and artisan boutique flash events.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-900 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200/60 shadow-2xs">
              {events.length} Promotions Hosted
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 no-scrollbar">
          <span className="text-xs text-stone-400 font-bold uppercase tracking-wider mr-2">
            Status:
          </span>
          {[
            { label: "All Campaigns", val: "all" },
            { label: "Active Deals", val: "running" },
            { label: "Upcoming Holidays", val: "upcoming" },
            { label: "Past Promotions", val: "expired" },
          ].map((tab) => (
            <button
              key={tab.val}
              onClick={() => setFilter(tab.val)}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition whitespace-nowrap ${
                filter === tab.val
                  ? "bg-amber-800 text-white shadow-sm"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* HERO SPOTLIGHT EVENT BANNER */}
      {featuredHeroEvent && (
        <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white rounded-3xl overflow-hidden shadow-xl border border-amber-900/40">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            {/* Left Image Showcase */}
            <div className="lg:col-span-5 relative aspect-[4/3] lg:aspect-auto lg:h-full overflow-hidden bg-stone-950">
              <img
                src={
                  featuredHeroEvent.featuredImage?.url ||
                  featuredHeroEvent.images?.[0]?.url ||
                  "/placeholder.jpg"
                }
                alt={featuredHeroEvent.name}
                className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-4 left-4 bg-amber-600 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                <AiFillStar className="text-amber-200" /> SPOTLIGHT DEAL
              </div>
              {featuredHeroEvent.images?.length > 1 && (
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                  {featuredHeroEvent.images.length} photos available
                </div>
              )}
            </div>

            {/* Right Details */}
            <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <FiTag /> {featuredHeroEvent.category || "Traditional Festival Apparel"}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black font-serif text-white">
                  {featuredHeroEvent.name}
                </h2>
                <p className="text-stone-300 text-xs sm:text-sm mt-2 line-clamp-3 leading-relaxed">
                  {featuredHeroEvent.description}
                </p>
              </div>

              {/* Pricing & Countdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
                <div>
                  <div className="text-[11px] text-stone-400 font-semibold uppercase tracking-wider">
                    Promotional Price
                  </div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-black font-serif text-white">
                      {Number(featuredHeroEvent.discountPrice || featuredHeroEvent.originalPrice || 0).toLocaleString()} ETB
                    </span>
                    {featuredHeroEvent.originalPrice && (
                      <span className="text-xs text-stone-400 line-through">
                        {Number(featuredHeroEvent.originalPrice).toLocaleString()} ETB
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-stone-400 font-semibold uppercase tracking-wider mb-1">
                    Flash Window Ends
                  </div>
                  <EventCardCountdown targetDate={featuredHeroEvent.Finish_Date} />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to={`/event/${featuredHeroEvent._id}`}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                >
                  <BsLightningCharge />
                  <span>Inspect Event Craft Details</span>
                  <FiArrowRight />
                </Link>

                <div className="text-xs text-stone-400 flex items-center gap-1.5">
                  <BsShieldCheck className="text-emerald-400" />
                  <span>Verified Artisan Escrow Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EVENTS GRID */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold font-serif text-stone-900">
            Active & Upcoming Promotions ({filteredEvents.length})
          </h3>
          <span className="text-xs text-stone-500">
            Click any craft to view multiple photos, sizes, and specs
          </span>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-semibold text-stone-500">
              Loading festival promotions...
            </p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
            <div className="w-16 h-16 bg-amber-50 text-amber-800 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              🇪🇹
            </div>
            <h4 className="text-lg font-bold text-stone-900">No campaigns found in this view</h4>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Artisans are currently preparing new holiday deals. Check back soon or browse the full everyday catalog.
            </p>
            <Link
              to="/products"
              className="inline-block mt-4 px-5 py-2.5 bg-amber-800 text-white text-xs font-bold rounded-xl shadow"
            >
              Browse Everyday Traditional Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredEvents.map((ev) => {
              const coverImg =
                ev.featuredImage?.url ||
                ev.images?.find((i) => i.isFeatured)?.url ||
                ev.images?.[0]?.url ||
                "/placeholder.jpg";

              const disc =
                ev.originalPrice && ev.discountPrice && ev.originalPrice > ev.discountPrice
                  ? Math.round(((ev.originalPrice - ev.discountPrice) / ev.originalPrice) * 100)
                  : null;

              return (
                <div
                  key={ev._id}
                  className="bg-white rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                >
                  {/* Photo Container */}
                  <Link to={`/event/${ev._id}`} className="relative aspect-[4/5] overflow-hidden bg-stone-100 block">
                    <img
                      src={coverImg}
                      alt={ev.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                      {disc && (
                        <span className="bg-rose-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full shadow uppercase">
                          -{disc}% FLASH
                        </span>
                      )}
                    </div>

                    {/* Multi-photo Pill */}
                    {ev.images?.length > 1 && (
                      <span className="absolute bottom-2.5 left-2.5 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-2xs">
                        {ev.images.length} photos
                      </span>
                    )}
                  </Link>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      {/* Category & Countdown */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[11px] font-semibold text-stone-500 truncate">
                          {ev.category || "Traditional Apparel"}
                        </span>
                        <EventCardCountdown targetDate={ev.Finish_Date} />
                      </div>

                      <Link to={`/event/${ev._id}`}>
                        <h4 className="font-bold text-stone-900 text-sm line-clamp-2 hover:text-amber-800 transition">
                          {ev.name}
                        </h4>
                      </Link>

                      {/* Artisan Tag */}
                      <div className="flex items-center gap-1 text-[11px] text-stone-500 mt-1">
                        <BsShop size={11} className="text-amber-700" />
                        <span className="truncate">{ev.shop?.name || "Artisan Workshop"}</span>
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-base font-black text-stone-900 font-serif">
                          {Number(ev.discountPrice || ev.originalPrice || 0).toLocaleString()} ETB
                        </div>
                        {ev.originalPrice && (
                          <div className="text-[11px] text-stone-400 line-through">
                            {Number(ev.originalPrice).toLocaleString()} ETB
                          </div>
                        )}
                      </div>

                      <Link
                        to={`/event/${ev._id}`}
                        className="px-3.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold rounded-xl shadow-2xs transition"
                      >
                        Inspect Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Events;