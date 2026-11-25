import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getAllEventsShop, deleteEvent } from "../../redux/Action/event";
import MerchantEventDetailModal from "./MerchantEventDetailModal";
import MerchantEventEditModal from "./MerchantEventEditModal";
import {
  AiOutlineDelete,
  AiOutlineEye,
  AiOutlineSearch,
} from "react-icons/ai";
import {
  FiPlus,
  FiCalendar,
  FiClock,
  FiLayers,
  FiTrendingUp,
  FiGrid,
  FiList,
  FiExternalLink,
  FiEdit,
} from "react-icons/fi";
import {
  BsLightningCharge,
  BsHourglassSplit,
  BsBoxSeam,
} from "react-icons/bs";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../hooks";

// Helper Countdown Component
interface MiniCountdownProps {
  targetDate: string;
  isRunning?: boolean;
}

function MiniCountdown({ targetDate, isRunning }: MiniCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!targetDate) return;
    const target = new Date(targetDate).getTime();

    const update = () => {
      const now = new Date().getTime();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-1 font-mono text-xs font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
      <FiClock className="text-amber-700 shrink-0" />
      <span>
        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
      </span>
    </div>
  );
}

const ShopAllEvents: React.FC = () => {
  const dispatch = useAppDispatch();
  const { seller } = useAppSelector((state) => state.seller);
  const { events, isLoading } = useAppSelector((state) => state.events);

  const activeEvents: any[] = events || [];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);

  useEffect(() => {
    if (seller?._id) {
      dispatch(getAllEventsShop(seller._id));
    }
  }, [dispatch, seller]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to end and remove this promotional event?")) {
      dispatch(deleteEvent(id));
      toast.success("Event removed successfully");
      setTimeout(() => {
        if (seller?._id) dispatch(getAllEventsShop(seller._id));
      }, 500);
    }
  };

  const now = new Date().getTime();

  // Metrics Calculation
  const metrics = useMemo(() => {
    const list = activeEvents || [];
    let running = 0;
    let upcoming = 0;
    let expired = 0;
    let totalStock = 0;
    let totalSold = 0;
    let estRevenue = 0;

    list.forEach((ev) => {
      const s = new Date(ev.start_Date).getTime();
      const e = new Date(ev.Finish_Date).getTime();
      if (now >= s && now <= e) running++;
      else if (now < s) upcoming++;
      else expired++;

      const st = Number(ev.stock || 0);
      const so = Number(ev.sold_out || 0);
      const pr = Number(ev.discountPrice || 0);
      totalStock += st;
      totalSold += so;
      estRevenue += so * pr;
    });

    return {
      total: list.length,
      running,
      upcoming,
      expired,
      totalStock,
      totalSold,
      estRevenue,
    };
  }, [activeEvents, now]);

  // Unique categories
  const categories = useMemo<string[]>(() => {
    const set = new Set<string>();
    (activeEvents || []).forEach((e) => {
      if (e.category) set.add(String(e.category));
    });
    return Array.from(set);
  }, [activeEvents]);

  // Filtered & Sorted list
  const filteredEvents = useMemo(() => {
    return (activeEvents as any[])
      .filter((ev: any) => {
        const s = new Date(ev.start_Date).getTime();
        const e = new Date(ev.Finish_Date).getTime();
        const isRunning = now >= s && now <= e;
        const isUpcoming = now < s;
        const isExpired = now > e;

        if (statusFilter === "running" && !isRunning) return false;
        if (statusFilter === "upcoming" && !isUpcoming) return false;
        if (statusFilter === "expired" && !isExpired) return false;

        if (categoryFilter !== "all" && ev.category !== categoryFilter) return false;

        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = ev.name?.toLowerCase().includes(q);
          const matchCat = ev.category?.toLowerCase().includes(q);
          const matchTag = ev.tags?.toLowerCase().includes(q);
          if (!matchName && !matchCat && !matchTag) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "endingSoon") {
          return new Date(a.Finish_Date).getTime() - new Date(b.Finish_Date).getTime();
        }
        if (sortBy === "highestDiscount") {
          const discA = a.originalPrice ? (a.originalPrice - a.discountPrice) / a.originalPrice : 0;
          const discB = b.originalPrice ? (b.originalPrice - b.discountPrice) / b.originalPrice : 0;
          return discB - discA;
        }
        if (sortBy === "mostSold") {
          return (b.sold_out || 0) - (a.sold_out || 0);
        }
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [events, search, statusFilter, categoryFilter, sortBy, now]);

  return (
    <div className="w-full min-h-screen bg-stone-50 py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold mb-2.5">
            <BsLightningCharge className="text-amber-600" />
            <span>Artisan Promotional Campaigns & Flash Sales</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            Event & Flash Sale Catalog
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
            Manage your time-limited cultural events, festive holiday discounts, and promotional
            inventory in one place.
          </p>
        </div>

        <Link
          to="/create-event"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all shrink-0"
        >
          <FiPlus size={18} />
          <span>Launch Flash Sale Event</span>
        </Link>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
          <div className="text-[11px] font-bold text-stone-500 uppercase flex items-center gap-1.5">
            <FiLayers className="text-stone-700" /> All Events
          </div>
          <div className="text-2xl font-bold font-serif text-stone-900 mt-1">
            {metrics.total}
          </div>
          <div className="text-[10px] text-stone-500">Created campaigns</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
          <div className="text-[11px] font-bold text-emerald-700 uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Running
          </div>
          <div className="text-2xl font-bold font-serif text-emerald-700 mt-1">
            {metrics.running}
          </div>
          <div className="text-[10px] text-stone-500">Active right now</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
          <div className="text-[11px] font-bold text-blue-700 uppercase flex items-center gap-1.5">
            <FiCalendar className="text-blue-600" /> Scheduled
          </div>
          <div className="text-2xl font-bold font-serif text-blue-700 mt-1">
            {metrics.upcoming}
          </div>
          <div className="text-[10px] text-stone-500">Upcoming sales</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
          <div className="text-[11px] font-bold text-stone-500 uppercase flex items-center gap-1.5">
            <BsHourglassSplit className="text-stone-400" /> Concluded
          </div>
          <div className="text-2xl font-bold font-serif text-stone-600 mt-1">
            {metrics.expired}
          </div>
          <div className="text-[10px] text-stone-500">Past events</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
          <div className="text-[11px] font-bold text-stone-500 uppercase flex items-center gap-1.5">
            <BsBoxSeam className="text-amber-600" /> Promo Stock
          </div>
          <div className="text-2xl font-bold font-serif text-stone-900 mt-1">
            {metrics.totalStock}
          </div>
          <div className="text-[10px] text-stone-500">Items allocated</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
          <div className="text-[11px] font-bold text-stone-500 uppercase flex items-center gap-1.5">
            <FiTrendingUp className="text-emerald-700" /> Promo Sales
          </div>
          <div className="text-2xl font-bold font-serif text-stone-900 mt-1">
            {metrics.totalSold} <span className="text-xs font-normal text-stone-400">sold</span>
          </div>
          <div className="text-[10px] text-stone-500 font-mono">
            {metrics.estRevenue.toLocaleString()} ETB
          </div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <AiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-base" />
          <input
            type="text"
            placeholder="Search events by craft title, category, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "all", label: "All" },
            { id: "running", label: "Live Running" },
            { id: "upcoming", label: "Upcoming" },
            { id: "expired", label: "Concluded" },
          ].map((status) => (
            <button
              key={status.id}
              onClick={() => setStatusFilter(status.id)}
              className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                statusFilter === status.id
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>

        {/* Category & Sorting Selectors */}
        <div className="flex items-center gap-2">
          {categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-2 px-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 text-xs font-semibold focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((c, i) => (
                <option key={i} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="py-2 px-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 text-xs font-semibold focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="endingSoon">Ending Soonest</option>
            <option value="highestDiscount">Highest Discount</option>
            <option value="mostSold">Most Units Sold</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition ${
                viewMode === "grid" ? "bg-white text-stone-900 shadow-sm" : "text-stone-400"
              }`}
              title="Grid Card View"
            >
              <FiGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg transition ${
                viewMode === "table" ? "bg-white text-stone-900 shadow-sm" : "text-stone-400"
              }`}
              title="Table View"
            >
              <FiList size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Catalog Content */}
      {isLoading ? (
        <div className="p-16 text-center text-stone-500 bg-white rounded-3xl border border-stone-200 shadow-sm">
          <div className="inline-block w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm font-semibold text-stone-800">Loading your event catalog...</p>
        </div>
      ) : !filteredEvents || filteredEvents.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-stone-200 shadow-sm space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-2xl font-bold">
            <BsLightningCharge />
          </div>
          <h3 className="text-lg font-bold font-serif text-stone-900">
            No Event Campaigns Found
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            {events?.length === 0
              ? "Promote seasonal celebrations like Enkutatash, Meskel, or Timkat with limited-time price drops."
              : "No events match your current filter and search criteria."}
          </p>
          <div className="pt-2">
            <Link
              to="/create-event"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-sm hover:bg-amber-700 transition"
            >
              <FiPlus size={15} /> Launch First Event
            </Link>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID CARD VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredEvents.map((item) => {
            const s = new Date(item.start_Date).getTime();
            const e = new Date(item.Finish_Date).getTime();
            const isRunning = now >= s && now <= e;
            const isUpcoming = now < s;
            const isExpired = now > e;

            const currentPrice = Number(item.discountPrice || 0);
            const originalPrice = Number(item.originalPrice || 0);
            const hasDiscount = originalPrice > 0 && currentPrice < originalPrice;
            const discountPercent = hasDiscount
              ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
              : 0;

            const image =
              item.featuredImage?.url ||
              item.images?.find((img) => img.isFeatured)?.url ||
              item.images?.[0]?.url ||
              "/photo.jpg";

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Image & Badges */}
                  <div className="relative aspect-[4/3] w-full bg-stone-100 overflow-hidden">
                    <img
                      src={image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Status Badge */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      {isRunning && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          Live Now
                        </span>
                      )}
                      {isUpcoming && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white shadow">
                          Upcoming
                        </span>
                      )}
                      {isExpired && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-700 text-stone-200 shadow">
                          Concluded
                        </span>
                      )}
                    </div>

                    {hasDiscount && (
                      <span className="absolute top-2.5 right-2.5 bg-rose-600 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow">
                        -{discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    {/* Category & Countdown */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-stone-500 truncate">
                        {item.category}
                      </span>
                      {isRunning && <MiniCountdown targetDate={item.Finish_Date} isRunning={true} />}
                      {isUpcoming && <MiniCountdown targetDate={item.start_Date} isRunning={false} />}
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-stone-900 text-sm line-clamp-1 group-hover:text-amber-800 transition-colors">
                      {item.name}
                    </h3>

                    {/* Pricing */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-bold font-serif text-stone-900">
                        {currentPrice.toLocaleString()} ETB
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-stone-400 line-through">
                          {originalPrice.toLocaleString()} ETB
                        </span>
                      )}
                    </div>

                    {/* Stock & Sold Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-stone-600">
                        <span>Stock: {item.stock} left</span>
                        <span className="font-semibold">{item.sold_out || 0} sold</span>
                      </div>
                      <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-600 h-full rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                10,
                                ((item.stock || 1) / ((item.stock || 1) + (item.sold_out || 0))) * 100
                              )
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="px-4 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEvent(item);
                        setModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-stone-600 hover:text-amber-700 hover:bg-white transition"
                      title="Inspect Event Details"
                    >
                      <AiOutlineEye size={18} />
                    </button>
                    <Link
                      to={`/dashboard/edit-event/${item._id}`}
                      className="p-1.5 rounded-lg text-amber-700 hover:text-amber-900 hover:bg-amber-100/60 transition inline-block"
                      title="Edit Flash Event Full Page"
                    >
                      <FiEdit size={16} />
                    </Link>
                    <Link
                      to={`/event/${item._id}`}
                      target="_blank"
                      className="p-1.5 rounded-lg text-stone-600 hover:text-amber-700 hover:bg-white transition"
                      title="View public event page"
                    >
                      <FiExternalLink size={15} />
                    </Link>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(item._id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete Event"
                  >
                    <AiOutlineDelete size={17} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-5">Promotional Craft</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Event Price</th>
                  <th className="py-3.5 px-5">Stock</th>
                  <th className="py-3.5 px-5">Sold</th>
                  <th className="py-3.5 px-5">Schedule</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredEvents.map((item) => {
                  const s = new Date(item.start_Date).getTime();
                  const e = new Date(item.Finish_Date).getTime();
                  const isRunning = now >= s && now <= e;
                  const isUpcoming = now < s;
                  const isExpired = now > e;

                  const image =
                    item.featuredImage?.url ||
                    item.images?.find((img) => img.isFeatured)?.url ||
                    item.images?.[0]?.url ||
                    "/photo.jpg";

                  return (
                    <tr key={item._id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={image}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                          />
                          <div>
                            <div className="font-semibold text-stone-900 line-clamp-1">
                              {item.name}
                            </div>
                            <div className="text-[11px] text-stone-400 font-mono">
                              ID: {item._id.slice(-6).toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-stone-600 text-xs">{item.category}</td>
                      <td className="py-3.5 px-5">
                        {isRunning && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            Live
                          </span>
                        )}
                        {isUpcoming && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            Upcoming
                          </span>
                        )}
                        {isExpired && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-600">
                            Concluded
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-stone-900">
                          {Number(item.discountPrice).toLocaleString()} ETB
                        </span>
                        {item.originalPrice && item.originalPrice > item.discountPrice && (
                          <div className="text-[11px] text-stone-400 line-through">
                            {Number(item.originalPrice).toLocaleString()} ETB
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            item.stock > 5
                              ? "bg-emerald-50 text-emerald-800"
                              : item.stock > 0
                              ? "bg-amber-50 text-amber-800"
                              : "bg-rose-50 text-rose-800"
                          }`}
                        >
                          {item.stock} left
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-stone-600 text-xs font-medium">
                        {item.sold_out || 0}
                      </td>
                      <td className="py-3.5 px-5 text-stone-500 text-xs">
                        <div>{new Date(item.start_Date).toLocaleDateString()}</div>
                        <div className="text-[11px] text-stone-400">
                          to {new Date(item.Finish_Date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-right space-x-1">
                        <button
                          onClick={() => {
                            setSelectedEvent(item);
                            setModalOpen(true);
                          }}
                          className="p-2 rounded-lg text-stone-600 hover:text-amber-700 hover:bg-stone-100 transition"
                          title="Inspect Event"
                        >
                          <AiOutlineEye size={18} />
                        </button>
                        <Link
                          to={`/dashboard/edit-event/${item._id}`}
                          className="p-2 inline-block rounded-lg text-amber-700 hover:bg-amber-100/60 transition"
                          title="Edit Flash Event Full Page"
                        >
                          <FiEdit size={16} />
                        </Link>
                        <Link
                          to={`/event/${item._id}`}
                          target="_blank"
                          className="p-2 inline-block rounded-lg text-stone-600 hover:text-amber-700 hover:bg-stone-100 transition"
                          title="Public Event Page"
                        >
                          <FiExternalLink size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-2 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Event"
                        >
                          <AiOutlineDelete size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Creative Event Detail Modal */}
      {modalOpen && selectedEvent && (
        <MerchantEventDetailModal
          event={selectedEvent}
          onClose={() => {
            setModalOpen(false);
            setSelectedEvent(null);
          }}
          onDelete={handleDelete}
          onEdit={(evt) => {
            setModalOpen(false);
            setEventToEdit(evt);
            setEditModalOpen(true);
          }}
        />
      )}

      {/* Creative Event Edit Modal */}
      {editModalOpen && eventToEdit && (
        <MerchantEventEditModal
          event={eventToEdit}
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEventToEdit(null);
          }}
          onSuccess={(updated) => {
            if (seller?._id) dispatch(getAllEventsShop(seller._id));
            if (selectedEvent && selectedEvent._id === updated._id) {
              setSelectedEvent(updated);
            }
          }}
        />
      )}
    </div>
  );
}

export default ShopAllEvents;
