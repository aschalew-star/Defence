import React, { useEffect, useState } from "react";
import { server } from "../../server";
import axios from "axios";
import { toast } from "react-toastify";
import {
  BsShieldCheck,
  BsMegaphone,
  BsSliders,
  BsExclamationTriangle,
  BsPhone,
  BsEnvelope,
  BsTelegram,
  BsDisplay,
  BsLaptop,
  BsCheckCircleFill,
} from "react-icons/bs";
import { RxReload } from "react-icons/rx";

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [platformName, setPlatformName] = useState("MEP Ethiopian Traditional Marketplace");
  const [defaultCommissionRate, setDefaultCommissionRate] = useState(10);
  const [minWithdrawalAmount, setMinWithdrawalAmount] = useState(50);
  const [escrowHoldingDays, setEscrowHoldingDays] = useState(0);
  const [requireSellerVerification, setRequireSellerVerification] = useState(false);
  const [requireProductApproval, setRequireProductApproval] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Support contacts
  const [supportPhone, setSupportPhone] = useState("+251 911 000 000");
  const [supportEmail, setSupportEmail] = useState("support@mep.et");
  const [supportTelegram, setSupportTelegram] = useState("@MEPSupport");

  // Announcement Banner
  const [announcementEnabled, setAnnouncementEnabled] = useState(false);
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementLink, setAnnouncementLink] = useState("");

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${server}/platform/config`);
      if (res.data?.success && res.data.config) {
        const c = res.data.config;
        setPlatformName(c.platformName || "MEP Ethiopian Traditional Marketplace");
        setDefaultCommissionRate(c.defaultCommissionRate ?? 10);
        setMinWithdrawalAmount(c.minWithdrawalAmount ?? 50);
        setEscrowHoldingDays(c.escrowHoldingDays ?? 0);
        setRequireSellerVerification(Boolean(c.requireSellerVerification));
        setRequireProductApproval(Boolean(c.requireProductApproval));
        setMaintenanceMode(Boolean(c.maintenanceMode));

        if (c.supportContact) {
          setSupportPhone(c.supportContact.phone || "+251 911 000 000");
          setSupportEmail(c.supportContact.email || "support@mep.et");
          setSupportTelegram(c.supportContact.telegram || "@MEPSupport");
        }

        if (c.announcementBanner) {
          setAnnouncementEnabled(Boolean(c.announcementBanner.enabled));
          setAnnouncementText(c.announcementBanner.text || "");
          setAnnouncementLink(c.announcementBanner.link || "");
        }
      }
    } catch {
      // Keep sensible defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(
        `${server}/platform/admin-update-config`,
        {
          platformName,
          defaultCommissionRate: Number(defaultCommissionRate),
          minWithdrawalAmount: Number(minWithdrawalAmount),
          escrowHoldingDays: Number(escrowHoldingDays),
          requireSellerVerification,
          requireProductApproval,
          maintenanceMode,
          supportContact: {
            phone: supportPhone,
            email: supportEmail,
            telegram: supportTelegram,
          },
          announcementBanner: {
            enabled: announcementEnabled,
            text: announcementText,
            link: announcementLink,
          },
        },
        { withCredentials: true }
      );
      toast.success("Platform settings and governance rules updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update platform settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2">
            <BsShieldCheck size={14} /> Global Marketplace Governance & Policy Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight">
            Platform Configuration & Controls
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
            Configure default platform commission rates, Ethiopian tax compliance gates, minimum
            payout thresholds, emergency maintenance flags, and sitewide announcements.
          </p>
        </div>

        <button
          onClick={fetchConfig}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition shadow-2xs self-start md:self-auto"
        >
          <RxReload size={14} className={loading ? "animate-spin" : ""} />
          <span>Reload Config</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: FINANCIAL & COMMISSION RULES */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-800 font-bold">
              <BsSliders size={16} />
            </div>
            <div>
              <h3 className="font-bold font-serif text-stone-900 text-base">
                Marketplace Financial & Commission Parameters
              </h3>
              <p className="text-xs text-stone-500">
                Core monetary settings applied to artisan orders and digital disbursals
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Default Platform Commission Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={defaultCommissionRate}
                onChange={(e) => setDefaultCommissionRate(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 font-mono font-bold"
                required
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Standard fee retained per delivered artisan order (default: 10%)
              </span>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Minimum Disbursal Threshold (ETB)
              </label>
              <input
                type="number"
                min="10"
                value={minWithdrawalAmount}
                onChange={(e) => setMinWithdrawalAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 font-mono font-bold"
                required
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Minimum available balance required to initiate Telebirr/CBE payout
              </span>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Escrow Holding Buffer (Days)
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={escrowHoldingDays}
                onChange={(e) => setEscrowHoldingDays(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 font-mono font-bold"
                required
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Days to hold escrow funds after customer delivery confirmation (0 = instant release)
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 2: ETHIOPIAN TAX & REGULATORY COMPLIANCE GATES */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 font-bold">
              <BsShieldCheck size={16} />
            </div>
            <div>
              <h3 className="font-bold font-serif text-stone-900 text-base">
                Artisan Verification & Compliance Gates
              </h3>
              <p className="text-xs text-stone-500">
                Ministry of Trade and Ministry of Revenues mandatory onboarding gates
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-stone-200 hover:bg-stone-50 cursor-pointer transition">
              <input
                type="checkbox"
                checked={requireSellerVerification}
                onChange={(e) => setRequireSellerVerification(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-amber-600 rounded"
              />
              <div>
                <div className="font-bold text-stone-900">
                  Enforce Mandatory 10-Digit TIN & Trade License Verification Before Listing
                </div>
                <div className="text-stone-500 text-[11px] mt-0.5">
                  When enabled, unverified artisan workshops cannot publish products or accept orders until official documents are reviewed and approved.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-stone-200 hover:bg-stone-50 cursor-pointer transition">
              <input
                type="checkbox"
                checked={requireProductApproval}
                onChange={(e) => setRequireProductApproval(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-amber-600 rounded"
              />
              <div>
                <div className="font-bold text-stone-900">
                  Pre-Publishing Craft Quality & Authenticity Review
                </div>
                <div className="text-stone-500 text-[11px] mt-0.5">
                  When enabled, every newly submitted craft listing starts in "Pending Review" status until reviewed by marketplace cultural curators.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* SECTION 3: SITEWIDE ANNOUNCEMENT BANNER */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-800 font-bold">
              <BsMegaphone size={16} />
            </div>
            <div>
              <h3 className="font-bold font-serif text-stone-900 text-base">
                Sitewide Customer Announcement Banner
              </h3>
              <p className="text-xs text-stone-500">
                Display holiday festival promotions or logistics notices across the top of the marketplace
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={announcementEnabled}
                onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded"
              />
              <span className="font-bold text-stone-800">
                Enable Announcement Banner on Public Storefront
              </span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Banner Announcement Text</label>
                <input
                  type="text"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="e.g. Enkutatash Ethiopian New Year Artisan Market — Up to 25% Off Handloom Kemis!"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Action Link (Optional)</label>
                <input
                  type="text"
                  value={announcementLink}
                  onChange={(e) => setAnnouncementLink(e.target.value)}
                  placeholder="e.g. /events or /products?category=Habesha+Kemis"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: PLATFORM SUPPORT CONTACTS & EMERGENCY CONTROLS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Support Contacts */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 space-y-4">
            <div className="pb-3 border-b border-stone-100">
              <h3 className="font-bold font-serif text-stone-900 text-base">
                Marketplace Support Directory
              </h3>
              <p className="text-xs text-stone-500">
                Direct customer & artisan assistance channels
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                  <BsPhone size={13} className="text-amber-800" /> Support Hotline / Telebirr
                </label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                  <BsEnvelope size={13} className="text-amber-800" /> Support Email Address
                </label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                  <BsTelegram size={13} className="text-blue-500" /> Telegram Channel Handle
                </label>
                <input
                  type="text"
                  value={supportTelegram}
                  onChange={(e) => setSupportTelegram(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Emergency Controls */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 space-y-4">
            <div className="pb-3 border-b border-stone-100">
              <h3 className="font-bold font-serif text-rose-900 text-base flex items-center gap-1.5">
                <BsExclamationTriangle size={15} /> Emergency System Operations
              </h3>
              <p className="text-xs text-stone-500">
                Contingency controls for platform upgrades and security maintenance
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-3 text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-rose-600 rounded"
                />
                <div>
                  <div className="font-bold text-rose-950">Activate Platform Maintenance Mode</div>
                  <div className="text-rose-800 text-[11px] mt-0.5">
                    Locks customer cart checkout and restricts live transactions while database migration or banking gateway maintenance is performed.
                  </div>
                </div>
              </label>

              <div className="text-[11px] text-stone-500 pt-1 border-t border-rose-200/60">
                Platform Name: <strong>{platformName}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON BAR */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-stone-200 flex items-center justify-between">
          <span className="text-xs text-stone-500">
            Changes take effect immediately across all client sessions and marketplace transactions.
          </span>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs transition shadow-sm disabled:opacity-50"
          >
            {saving ? "Saving Configuration..." : "Save Platform Configuration"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
