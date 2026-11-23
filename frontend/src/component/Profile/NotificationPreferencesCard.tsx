import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import {
  BsBell,
  BsEnvelope,
  BsPhone,
  BsBagCheck,
  BsPalette,
  BsTag,
  BsShieldCheck,
  BsCheckCircleFill,
  BsLock,
} from "react-icons/bs";

const defaultPrefs = {
  channels: { inApp: true, email: true, sms: true },
  categories: {
    orderUpdates: { inApp: true, email: true, sms: true },
    artisanUpdates: { inApp: true, email: true, sms: false },
    promotionsDeals: { inApp: true, email: true, sms: false },
    disputesReturns: { inApp: true, email: true, sms: true },
    accountSecurity: { inApp: true, email: true, sms: false },
  },
};

const NotificationPreferencesCard: React.FC = () => {
  const [preferences, setPreferences] = useState(defaultPrefs);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await axios.get(`${server}/notification/preferences`, {
          withCredentials: true,
        });
        if (res.data?.success && res.data.preferences) {
          setPreferences({
            channels: { ...defaultPrefs.channels, ...(res.data.preferences.channels || {}) },
            categories: {
              orderUpdates: { ...defaultPrefs.categories.orderUpdates, ...(res.data.preferences.categories?.orderUpdates || {}) },
              artisanUpdates: { ...defaultPrefs.categories.artisanUpdates, ...(res.data.preferences.categories?.artisanUpdates || {}) },
              promotionsDeals: { ...defaultPrefs.categories.promotionsDeals, ...(res.data.preferences.categories?.promotionsDeals || {}) },
              disputesReturns: { ...defaultPrefs.categories.disputesReturns, ...(res.data.preferences.categories?.disputesReturns || {}) },
              accountSecurity: { ...defaultPrefs.categories.accountSecurity, ...(res.data.preferences.categories?.accountSecurity || {}) },
            },
          });
        }
      } catch (err) {
        // use fallback defaults
      } finally {
        setLoading(false);
      }
    };
    fetchPrefs();
  }, []);

  const handleChannelToggle = (channelKey: "inApp" | "email" | "sms") => {
    setPreferences((prev) => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channelKey]: !prev.channels[channelKey],
      },
    }));
  };

  const handleCategoryToggle = (
    categoryKey: keyof typeof defaultPrefs.categories,
    channelKey: "inApp" | "email" | "sms"
  ) => {
    setPreferences((prev) => ({
      ...prev,
      categories: {
        ...prev.categories,
        [categoryKey]: {
          ...prev.categories[categoryKey],
          [channelKey]: !prev.categories[categoryKey][channelKey],
        },
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.put(
        `${server}/notification/preferences`,
        { preferences },
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.success("Notification preferences saved successfully!");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-stone-500">
        Loading notification preferences...
      </div>
    );
  }

  const categoryConfigs = [
    {
      key: "orderUpdates" as const,
      title: "Order & Courier Delivery",
      description: "Chapa payment confirmations, artisan handweaving progress, and tracking codes.",
      icon: BsBagCheck,
      badge: "Transactional",
      badgeColor: "bg-amber-100 text-amber-900",
    },
    {
      key: "artisanUpdates" as const,
      title: "Followed Artisan Workshop Launches",
      description: "Instant notifications whenever artisans you follow publish new traditional crafts.",
      icon: BsPalette,
      badge: "Followers",
      badgeColor: "bg-emerald-100 text-emerald-900",
    },
    {
      key: "promotionsDeals" as const,
      title: "Promotions & Festive Craft Deals",
      description: "Flash discounts, cultural seasonal coupons, and price drops on favorited items.",
      icon: BsTag,
      badge: "Marketing",
      badgeColor: "bg-blue-100 text-blue-900",
    },
    {
      key: "disputesReturns" as const,
      title: "Disputes & Buyer Protection",
      description: "72-hour inspection window alerts, arbitration resolutions, and refund payouts.",
      icon: BsShieldCheck,
      badge: "Escrow Protection",
      badgeColor: "bg-rose-100 text-rose-900",
    },
    {
      key: "accountSecurity" as const,
      title: "Account Security & System Alerts",
      description: "Password changes, unrecognized logins, and platform maintenance updates.",
      icon: BsLock,
      badge: "Security",
      badgeColor: "bg-stone-200 text-stone-800",
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-amber-100 text-amber-900">
            <BsBell size={18} />
          </span>
          <div>
            <h2 className="text-2xl font-black text-gray-900 font-serif">
              Notification Preferences
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Customize how and when you receive alerts across In-App, Email, and SMS
            </p>
          </div>
        </div>
      </div>

      {/* 1. Global Master Delivery Channels */}
      <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-5 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
          Master Delivery Channels
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* In-App Toggle */}
          <div
            onClick={() => handleChannelToggle("inApp")}
            className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
              preferences.channels.inApp
                ? "bg-white border-amber-500 shadow-xs"
                : "bg-stone-100/60 border-stone-200 opacity-60"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BsBell className="text-amber-800 text-base" />
              <div>
                <div className="text-xs font-bold text-stone-900">In-App Alerts</div>
                <div className="text-[10px] text-stone-500">Live notification bell</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.channels.inApp}
              onChange={() => {}}
              className="accent-amber-800 w-4 h-4 cursor-pointer"
            />
          </div>

          {/* Email Toggle */}
          <div
            onClick={() => handleChannelToggle("email")}
            className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
              preferences.channels.email
                ? "bg-white border-amber-500 shadow-xs"
                : "bg-stone-100/60 border-stone-200 opacity-60"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BsEnvelope className="text-blue-700 text-base" />
              <div>
                <div className="text-xs font-bold text-stone-900">Email Digest</div>
                <div className="text-[10px] text-stone-500">HTML receipts & notes</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.channels.email}
              onChange={() => {}}
              className="accent-amber-800 w-4 h-4 cursor-pointer"
            />
          </div>

          {/* SMS Toggle */}
          <div
            onClick={() => handleChannelToggle("sms")}
            className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
              preferences.channels.sms
                ? "bg-white border-amber-500 shadow-xs"
                : "bg-stone-100/60 border-stone-200 opacity-60"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BsPhone className="text-emerald-700 text-base" />
              <div>
                <div className="text-xs font-bold text-stone-900">Mobile SMS</div>
                <div className="text-[10px] text-stone-500">Ethio Telecom / Safaricom</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.channels.sms}
              onChange={() => {}}
              className="accent-amber-800 w-4 h-4 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 2. Granular Category Matrix */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
          Preferences by Notification Type
        </h4>

        <div className="divide-y divide-stone-100 border border-stone-200/80 rounded-2xl overflow-hidden bg-white shadow-2xs">
          {categoryConfigs.map((cat) => {
            const Icon = cat.icon;
            const currentCat = preferences.categories[cat.key];

            return (
              <div key={cat.key} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-stone-50/50 transition">
                {/* Category Info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-bold text-stone-900">{cat.title}</h5>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cat.badgeColor}`}>
                        {cat.badge}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">{cat.description}</p>
                  </div>
                </div>

                {/* Per-Channel Toggles for this Category */}
                <div className="flex items-center gap-5 sm:gap-6 shrink-0 self-end md:self-center bg-stone-50/80 px-3.5 py-2 rounded-xl border border-stone-100">
                  {/* In-App */}
                  <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs text-stone-700 hover:text-amber-900">
                    <input
                      type="checkbox"
                      checked={Boolean(currentCat?.inApp && preferences.channels.inApp)}
                      disabled={!preferences.channels.inApp}
                      onChange={() => handleCategoryToggle(cat.key, "inApp")}
                      className="accent-amber-800 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className="text-[11px] font-medium">In-App</span>
                  </label>

                  {/* Email */}
                  <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs text-stone-700 hover:text-amber-900">
                    <input
                      type="checkbox"
                      checked={Boolean(currentCat?.email && preferences.channels.email)}
                      disabled={!preferences.channels.email}
                      onChange={() => handleCategoryToggle(cat.key, "email")}
                      className="accent-amber-800 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className="text-[11px] font-medium">Email</span>
                  </label>

                  {/* SMS */}
                  <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs text-stone-700 hover:text-amber-900">
                    <input
                      type="checkbox"
                      checked={Boolean(currentCat?.sms && preferences.channels.sms)}
                      disabled={!preferences.channels.sms}
                      onChange={() => handleCategoryToggle(cat.key, "sms")}
                      className="accent-amber-800 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className="text-[11px] font-medium">SMS</span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold shadow-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <BsCheckCircleFill size={13} />
          <span>{saving ? "Saving Preferences..." : "Save Preferences"}</span>
        </button>
      </div>
    </div>
  );
};

export default NotificationPreferencesCard;
