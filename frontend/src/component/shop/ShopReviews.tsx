import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { server } from "../../server";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  AiFillStar,
  AiOutlineStar,
  AiOutlineSearch,
  AiOutlineCheck,
} from "react-icons/ai";
import {
  BsShieldCheck,
  BsChatDots,
  BsReply,
  BsAward,
  BsEye,
} from "react-icons/bs";
import { FiFilter, FiSend, FiMessageSquare } from "react-icons/fi";
import { RxReload, RxCross1 } from "react-icons/rx";
import { IReview } from "../../types";
import { useAppSelector } from "../../hooks";

import { useMerchantReviews } from "../../hooks";

const ShopReviews: React.FC = () => {
  const {
    seller,
    reviews,
    filteredReviews,
    loading,
    starFilter,
    setStarFilter,
    search,
    setSearch,
    activeReplyId,
    setActiveReplyId,
    replyText,
    setReplyText,
    submittingReply,
    handleSendReply,
    lightboxImg,
    setLightboxImg,
    metrics,
    fetchReviews,
  } = useMerchantReviews();

  const stats = {
    avgRating: metrics.averageRating,
    totalReviews: metrics.totalReviews,
    breakdown: metrics.starDistribution,
    replyRate: metrics.totalReviews > 0 ? Math.round(((metrics.totalReviews - metrics.needsReplyCount) / metrics.totalReviews) * 100) : 100,
  };
  return (
    <div className="w-full space-y-6 select-none">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold mb-2">
            <BsShieldCheck size={13} className="text-emerald-700" />
            <span>Artisan Reputation & Buyer Satisfaction</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            Customer Reviews & Craft Ratings
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
            Inspect authentic customer feedback, buyer photos, and engage directly with clients by
            replying as the verified craft atelier.
          </p>
        </div>

        <button
          onClick={fetchReviews}
          className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
          title="Refresh reviews"
        >
          <RxReload size={15} className={loading ? "animate-spin text-amber-700" : ""} />
        </button>
      </div>

      {/* Ratings Hero & Breakdown Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Overall Rating Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-amber-900 via-stone-900 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-md border border-amber-900/40 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/30">
              <BsAward size={12} />
              <span>Workshop Reputation Score</span>
            </div>

            <div className="flex items-baseline gap-3 mt-4">
              <span className="text-5xl sm:text-6xl font-black font-serif text-white">
                {stats.avgRating}
              </span>
              <div>
                <div className="flex items-center text-amber-400 text-lg">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <AiFillStar
                      key={s}
                      className={
                        s <= Math.round(stats.avgRating)
                          ? "text-amber-400"
                          : "text-stone-600"
                      }
                    />
                  ))}
                </div>
                <div className="text-xs text-stone-300 font-medium mt-1">
                  Based on {stats.totalReviews} verified purchase reviews
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 mt-6 grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-semibold">
                Artisan Reply Rate
              </span>
              <div className="text-xl font-bold font-serif text-emerald-400 mt-0.5">
                {stats.replyRate}%
              </div>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-semibold">
                Quality Guarantee
              </span>
              <div className="text-xl font-bold font-serif text-amber-300 mt-0.5">
                100% Authentic
              </div>
            </div>
          </div>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold font-serif text-stone-900">
              Customer Rating Distribution
            </h3>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Verified review distribution across all product collections
            </p>

            <div className="space-y-2.5 mt-5">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = stats.breakdown[stars] || 0;
                const pct =
                  stats.totalReviews > 0
                    ? Math.round((count / stats.totalReviews) * 100)
                    : stars === 5
                    ? 85
                    : stars === 4
                    ? 12
                    : 1;

                return (
                  <div key={stars} className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1 w-12 font-bold text-stone-700">
                      <span>{stars}</span>
                      <AiFillStar className="text-amber-500" size={13} />
                    </div>
                    <div className="flex-1 h-2.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-600 to-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="font-mono text-stone-500 w-12 text-right">
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 mt-4 flex items-center justify-between text-[11px] text-stone-500">
            <span>Shiro Meda & Dorze Quality Standards</span>
            <span className="font-bold text-emerald-700">Top-Tier Merchant Status</span>
          </div>
        </div>
      </div>

      {/* Filter Strip & Reviews List */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-stone-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
          {/* Star Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setStarFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                starFilter === "all"
                  ? "bg-amber-600 text-white font-bold shadow-xs"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              All Reviews
            </button>
            <button
              onClick={() => setStarFilter("needs_reply")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                starFilter === "needs_reply"
                  ? "bg-amber-600 text-white font-bold shadow-xs"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              Needs Reply
            </button>
            {[5, 4, 3, 2, 1].map((s) => (
              <button
                key={s}
                onClick={() => setStarFilter(String(s))}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
                  starFilter === String(s)
                    ? "bg-stone-900 text-white font-bold shadow-xs"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                <span>{s}</span>
                <AiFillStar size={12} className="text-amber-400" />
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative max-w-xs w-full">
            <AiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search comments or buyer name..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-stone-200 text-xs bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Reviews Listing */}
        {loading ? (
          <div className="py-12 text-center text-stone-500 text-xs">
            Loading reviews...
          </div>
        ) : filteredReviews.length > 0 ? (
          <div className="space-y-4">
            {filteredReviews.map((r) => {
              const rating = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
              const hasReply = Boolean(r.merchantReply?.comment);
              const isReplying = activeReplyId === r._id;

              return (
                <div
                  key={r._id}
                  className="p-5 rounded-2xl bg-stone-50/80 border border-stone-200 space-y-3 hover:border-stone-300 transition"
                >
                  {/* Review Header: User info, Craft info, and Star rating */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {r.user?.avatar?.url ? (
                        <img
                          src={r.user.avatar.url}
                          alt={r.user.name}
                          className="w-9 h-9 rounded-full object-cover border border-amber-200"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 to-stone-800 text-white flex items-center justify-center font-bold text-xs">
                          {r.user?.name ? r.user.name.charAt(0).toUpperCase() : "B"}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-stone-900">
                            {r.user?.name || "Verified Buyer"}
                          </span>
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <BsShieldCheck size={11} /> Verified Purchase
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-400">
                          Reviewed on {new Date(r.createdAt || Date.now()).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Star Rating & Craft Pill */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center text-amber-500 text-sm">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <AiFillStar
                            key={s}
                            className={s <= rating ? "text-amber-500" : "text-stone-300"}
                          />
                        ))}
                      </div>

                      {r.productRef && (
                        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-stone-200 text-[11px] font-semibold text-stone-700">
                          {r.productRef.images?.[0]?.url && (
                            <img
                              src={r.productRef.images[0].url}
                              alt=""
                              className="w-4 h-4 rounded object-cover"
                            />
                          )}
                          <span className="max-w-[130px] truncate">{r.productRef.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Comment Text */}
                  <p className="text-xs text-stone-800 leading-relaxed font-normal">
                    &quot;{r.comment}&quot;
                  </p>

                  {/* Customer Photos */}
                  {Array.isArray(r.images) && r.images.length > 0 && (
                    <div className="flex items-center gap-2 pt-1">
                      {r.images.map((img: any, i: number) => {
                        const imgUrl = typeof img === "string" ? img : img?.url || "";
                        return (
                          <img
                            key={i}
                            src={imgUrl || "/placeholder.jpg"}
                            alt="Customer photo"
                            onClick={() => setLightboxImg(imgUrl)}
                            className="w-14 h-14 rounded-xl object-cover border border-stone-200 cursor-pointer hover:opacity-90 transition"
                          />
                        );
                      })}
                    </div>
                  )}

                  {/* Existing Artisan Workshop Reply */}
                  {hasReply && (
                    <div className="mt-3 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-amber-900 font-bold text-[11px]">
                        <span className="flex items-center gap-1.5">
                          <BsReply size={13} className="text-amber-700" />
                          <span>Artisan Workshop Response ({seller?.name || "Artisan"})</span>
                        </span>
                        <span className="text-stone-400 font-normal">
                          {r.merchantReply.repliedAt
                            ? new Date(r.merchantReply.repliedAt).toLocaleDateString()
                            : ""}
                        </span>
                      </div>
                      <p className="text-stone-700 text-xs pl-5">
                        {r.merchantReply.comment}
                      </p>
                    </div>
                  )}

                  {/* Reply Action / Form */}
                  <div className="pt-2 flex items-center justify-between">
                    {!hasReply && !isReplying && (
                      <button
                        onClick={() => {
                          setActiveReplyId(r._id);
                          setReplyText("");
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 transition"
                      >
                        <BsReply size={14} />
                        <span>Reply as Artisan Workshop</span>
                      </button>
                    )}

                    {isReplying && (
                      <div className="w-full space-y-2 mt-2">
                        <textarea
                          rows={2}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Thank the customer or address their sizing/weaving questions..."
                          className="w-full p-3 rounded-xl border border-stone-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveReplyId(null);
                              setReplyText("");
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-200 transition"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={submittingReply}
                            onClick={() => handleSendReply(r._id)}
                            className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <FiSend size={12} />
                            <span>{submittingReply ? "Publishing..." : "Send Reply"}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-stone-500 text-xs space-y-2">
            <BsChatDots className="mx-auto text-stone-400" size={32} />
            <p className="font-semibold text-stone-700">No reviews found matching your filter.</p>
            <p className="text-[11px] text-stone-400">
              When customers leave reviews on your handcrafted items, they will appear here!
            </p>
          </div>
        )}
      </div>

      {/* Enlarged Photo Lightbox Modal */}
      {lightboxImg && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-xl max-h-[85vh] bg-white rounded-3xl overflow-hidden shadow-2xl p-2 animate-fadeIn">
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center text-sm shadow"
            >
              ✕
            </button>
            <img
              src={lightboxImg}
              alt="Enlarged customer photo"
              className="max-h-[75vh] w-auto mx-auto object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ShopReviews;