import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { loadSeller } from "../../redux/Action/user";
import {
  FiSettings,
  FiUser,
  FiMapPin,
  FiPhone,
  FiMail,
  FiTruck,
  FiShield,
  FiUploadCloud,
  FiCheckCircle,
  FiSave,
  FiFileText,
  FiUserCheck,
  FiCheck,
  FiExternalLink,
} from "react-icons/fi";
import {
  BsShop,
  BsShieldCheck,
  BsShieldExclamation,
  BsCashCoin,
  BsBank,
  BsCreditCard,
  BsLightningCharge,
  BsUpload,
  BsFileEarmarkText,
  BsCheck2Circle,
  BsAward,
} from "react-icons/bs";

const CRAFT_SPECIALIZATIONS = [
  "Traditional Dresses (Habesha Kemis)",
  "Handwoven Textiles & Netela/Gabi",
  "Men's Traditional Attire (Yebahl Libs)",
  "Authentic Ethiopian Leather Goods",
  "Traditional Jewelry & Cross Pendants",
  "Cultural Home Decor & Mesob Baskets",
  "Woodcraft & Religious Artifacts",
  "Ethiopian Coffee Ceremonial Sets",
];

const ETHIOPIAN_BANKS = [
  { id: "telebirr", name: "Telebirr (Instant Mobile Transfer)" },
  { id: "cbe", name: "Commercial Bank of Ethiopia (CBE)" },
  { id: "awash", name: "Awash Bank" },
  { id: "dashen", name: "Dashen Bank" },
  { id: "abyssinia", name: "Bank of Abyssinia" },
  { id: "wegagen", name: "Wegagen Bank" },
];

const ShopSettings: React.FC = () => {
  const { seller } = useAppSelector((state) => state.seller);
  const dispatch = useAppDispatch();

  const effectiveSeller: any = seller || {};

  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "payout" | "shipping" | "verification"
  const [loading, setLoading] = useState(false);

  // Profile State
  const [name, setName] = useState(effectiveSeller?.name || "");
  const [description, setDescription] = useState(effectiveSeller?.description || "");
  const [businessType, setBusinessType] = useState(effectiveSeller?.businessType || "Individual Artisan");
  const [phoneNumber, setPhoneNumber] = useState(effectiveSeller?.phoneNumber || "");
  const [address, setAddress] = useState(effectiveSeller?.address || "");
  const [zipCode, setZipCode] = useState(String(effectiveSeller?.zipCode ?? "1000"));
  const [craftSpecialization, setCraftSpecialization] = useState(effectiveSeller?.craftSpecialization || []);
  const [avatarPreview, setAvatarPreview] = useState(effectiveSeller?.avatar?.url || "");
  const [avatarFile, setAvatarFile] = useState(null);

  // Payout State
  const [payoutBank, setPayoutBank] = useState(
    effectiveSeller?.payoutMethods?.[0]?.bankName || effectiveSeller?.withdrawMethod?.bankName || "telebirr"
  );
  const [accountNumber, setAccountNumber] = useState(
    effectiveSeller?.payoutMethods?.[0]?.accountNumber || effectiveSeller?.withdrawMethod?.bankAccountNumber || ""
  );
  const [accountHolderName, setAccountHolderName] = useState(
    effectiveSeller?.payoutMethods?.[0]?.accountHolderName || effectiveSeller?.withdrawMethod?.bankHolderName || ""
  );

  // Shipping & Policies State
  const [handlingDays, setHandlingDays] = useState(effectiveSeller?.shippingSettings?.handlingDays || 3);
  const [expressDelivery, setExpressDelivery] = useState(
    effectiveSeller?.shippingSettings?.localExpressAvailable ?? true
  );
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(
    effectiveSeller?.shippingSettings?.freeShippingMinOrder || 0
  );
  const [returnPolicy, setReturnPolicy] = useState(
    effectiveSeller?.returnPolicy || "Crafts are made to order. Exchanges accepted within 7 days for sizing adjustments."
  );

  // Vacation Mode & Regional Shipping Rates
  const [vacationMode, setVacationMode] = useState(false);
  const [vacationNotice, setVacationNotice] = useState(
    "Artisan workshop is currently fulfilling bespoke holiday orders. Inquiries are active and orders will resume shipment on Monday."
  );
  const [addisShippingFee, setAddisShippingFee] = useState("150");
  const [regionalShippingFee, setRegionalShippingFee] = useState("350");
  const [internationalShippingFee, setInternationalShippingFee] = useState("2500");

  // Verification State
  const [tinNumber, setTinNumber] = useState(effectiveSeller?.tinNumber || "");
  const [businessReg, setBusinessReg] = useState(effectiveSeller?.businessRegistrationNumber || "");
  const [businessLicense, setBusinessLicense] = useState(null);
  const [idCard, setIdCard] = useState(null);
  const [licensePreview, setLicensePreview] = useState(effectiveSeller?.businessLicense?.url || "");
  const [idCardPreview, setIdCardPreview] = useState(effectiveSeller?.idCard?.url || "");

  useEffect(() => {
    const s: any = seller || {};
    setName(s.name || "");
    setDescription(s.description || "");
    setBusinessType(s.businessType || "Individual Artisan");
    setPhoneNumber(s.phoneNumber || "");
    setAddress(s.address || "");
    setZipCode(String(s.zipCode ?? "1000"));
    setAvatarPreview(s.avatar?.url || "");
    setTinNumber(s.tinNumber || "");
    setBusinessReg(s.businessRegistrationNumber || "");
    setLicensePreview(s.businessLicense?.url || "");
    setIdCardPreview(s.idCard?.url || "");
    if (s.craftSpecialization) setCraftSpecialization(s.craftSpecialization);
  }, [seller]);

  const handleDocUpload = (e, fileSetter, previewSetter) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("File size must be under 8MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        fileSetter(reader.result);
        previewSetter(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setAvatarPreview(reader.result);
        setAvatarFile(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleToggleSpecialization = (craft) => {
    if (craftSpecialization.includes(craft)) {
      setCraftSpecialization(craftSpecialization.filter((c) => c !== craft));
    } else {
      setCraftSpecialization([...craftSpecialization, craft]);
    }
  };

  // 1. Save Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // If avatar was changed, upload avatar first
      if (avatarFile) {
        await axios.put(
          `${server}/shop/update-shop-avatar`,
          { avatar: avatarFile },
          { withCredentials: true }
        );
      }

      const res = await axios.put(
        `${server}/shop/update-seller-info`,
        {
          name,
          description,
          businessType,
          phoneNumber,
          address,
          zipCode,
          craftSpecialization,
        },
        { withCredentials: true }
      );

      if (res.data?.success) {
        toast.success("Store profile updated successfully!");
        dispatch(loadSeller());
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // 2. Save Payout Method
  const handleSavePayout = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        withdrawMethod: {
          bankName: payoutBank,
          bankAccountNumber: accountNumber,
          bankHolderName: accountHolderName || name,
        },
        payoutMethods: [
          {
            type: payoutBank === "telebirr" ? "telebirr" : "bank_transfer",
            bankName: payoutBank,
            accountNumber,
            accountHolderName: accountHolderName || name,
            isDefault: true,
          },
        ],
      };

      const res = await axios.put(`${server}/shop/update-payment-methods`, payload, {
        withCredentials: true,
      });

      if (res.data?.success) {
        toast.success("Payout details saved successfully!");
        dispatch(loadSeller());
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save payout settings");
    } finally {
      setLoading(false);
    }
  };

  // 3. Save Shipping & Policies
  const handleSaveShipping = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        handlingDays: Number(handlingDays),
        localExpressAvailable: Boolean(expressDelivery),
        freeShippingMinOrder: Number(freeShippingThreshold),
        returnPolicy,
      };

      const res = await axios.put(`${server}/shop/update-shipping-settings`, payload, {
        withCredentials: true,
      });

      if (res.data?.success) {
        toast.success("Shipping policies updated successfully!");
        dispatch(loadSeller());
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save shipping settings");
    } finally {
      setLoading(false);
    }
  };

  // 4. Submit Verification
  const handleSaveVerification = async (e) => {
    e.preventDefault();
    if (!tinNumber) {
      toast.error("Please enter your Ethiopian Tax Identification Number (TIN)");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        `${server}/shop/submit-verification`,
        {
          tinNumber: tinNumber.trim(),
          businessRegistrationNumber: businessReg.trim(),
          businessLicense: businessLicense || undefined,
          idCard: idCard || undefined,
        },
        { withCredentials: true }
      );

      if (res.data?.success) {
        toast.success("Verification documents submitted for compliance review!");
        dispatch(loadSeller());
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit verification");
    } finally {
      setLoading(false);
    }
  };

  const isVerified = seller?.isVerified || seller?.verificationStatus === "Verified";

  return (
    <div className="w-full space-y-6">
      {/* Page Title & Navigation Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold mb-2">
            <FiSettings size={13} className="text-amber-700" />
            <span>Storefront Settings & Brand Configuration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            Artisan Store Settings
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Configure your artisan brand story, bank payout credentials, delivery policies, and
            business verification.
          </p>
        </div>

        {/* Live Verification Status Pill */}
        <div className="flex items-center gap-3">
          <div
            className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 border text-xs font-bold ${
              isVerified
                ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                : seller?.verificationStatus === "Rejected"
                ? "bg-rose-50 text-rose-900 border-rose-200"
                : seller?.verificationStatus === "Pending"
                ? "bg-amber-50 text-amber-900 border-amber-200"
                : "bg-stone-50 text-stone-700 border-stone-200"
            }`}
          >
            {isVerified ? (
              <>
                <BsShieldCheck size={16} className="text-emerald-700" />
                <span>Verified Artisan Hub ({seller?.badge || "Bronze Artisan"})</span>
              </>
            ) : seller?.verificationStatus === "Rejected" ? (
              <>
                <BsShieldExclamation size={16} className="text-rose-700" />
                <span>Verification Rejected — Action Needed</span>
              </>
            ) : seller?.verificationStatus === "Pending" ? (
              <>
                <BsShieldExclamation size={16} className="text-amber-700" />
                <span>Under Compliance Review</span>
              </>
            ) : (
              <>
                <BsShieldExclamation size={16} className="text-stone-500" />
                <span>Unverified Store</span>
              </>
            )}
          </div>

          <Link
            to={`/shop/preview/${effectiveSeller?._id || "64a000000000000000000001"}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-2xl border border-stone-300 hover:bg-stone-50 text-stone-800 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
          >
            <FiExternalLink size={14} className="text-amber-800" />
            <span>View Public Storefront</span>
          </Link>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white rounded-2xl p-2 border border-stone-200 shadow-sm flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
        {[
          { id: "profile", label: "Brand & Workshop Profile", icon: BsShop },
          { id: "payout", label: "Payouts & Telebirr/Bank", icon: BsCashCoin },
          { id: "shipping", label: "Delivery & Return Policies", icon: FiTruck },
          { id: "verification", label: "Artisan Verification", icon: FiShield },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-stone-900 text-white shadow-sm"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: BRAND & WORKSHOP PROFILE */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div className="border-b border-stone-100 pb-4">
            <h2 className="text-lg font-bold font-serif text-stone-900">
              Workshop Identity & Story
            </h2>
            <p className="text-xs text-stone-500">
              This information is displayed publicly on your public artisan storefront.
            </p>
          </div>

          {/* Logo & Avatar */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <div className="relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-300 shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-stone-800 text-white font-serif font-black text-2xl flex items-center justify-center">
                  {name ? name.charAt(0).toUpperCase() : "A"}
                </div>
              )}
            </div>

            <div className="space-y-1.5 text-center sm:text-left">
              <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold cursor-pointer transition shadow-2xs">
                <FiUploadCloud size={15} />
                <span>Upload Workshop Logo / Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-stone-500">
                Recommended size: 500x500px square (PNG, JPG or WEBP).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Artisan Store Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Roha Handloom & Tibeb Studio"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Workshop Business Type
              </label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
              >
                <option value="Individual Artisan">Individual Artisan</option>
                <option value="Family Workshop Collective">Family Workshop Collective</option>
                <option value="Women Weavers Cooperative">Women Weavers Cooperative</option>
                <option value="Boutique Heritage Studio">Boutique Heritage Studio</option>
                <option value="Master Craft Guild">Master Craft Guild</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Contact Phone / WhatsApp *
              </label>
              <input
                type="text"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+251 91 123 4567"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Workshop Address & City *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Shiro Meda, Addis Ababa"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
          </div>

          {/* Description & Story */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Artisan Story & Heritage Bio
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell buyers about your weaving ancestry, handloom techniques, traditions, and the authentic materials you work with..."
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          {/* Craft Specialization Tags */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              Craft Specializations & Focus:
            </label>
            <div className="flex flex-wrap gap-2">
              {CRAFT_SPECIALIZATIONS.map((c, i) => {
                const selected = craftSpecialization.includes(c);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleToggleSpecialization(c)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                      selected
                        ? "bg-amber-600 text-white border-amber-600"
                        : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                    }`}
                  >
                    {selected ? "✓ " : "+ "}
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-stone-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-sm transition"
            >
              <FiSave size={16} />
              <span>{loading ? "Saving Changes..." : "Save Store Profile"}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: PAYOUT & BANKING CREDENTIALS */}
      {activeTab === "payout" && (
        <form onSubmit={handleSavePayout} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div className="border-b border-stone-100 pb-4">
            <h2 className="text-lg font-bold font-serif text-stone-900">
              Payout & Bank Disbursement Settings
            </h2>
            <p className="text-xs text-stone-500">
              Earnings from delivered orders are disbursed automatically or on-demand to this account.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Primary Payout Method *
              </label>
              <select
                value={payoutBank}
                onChange={(e) => setPayoutBank(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 font-semibold"
              >
                {ETHIOPIAN_BANKS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                {payoutBank === "telebirr" ? "Telebirr Mobile Number *" : "Bank Account Number *"}
              </label>
              <input
                type="text"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder={payoutBank === "telebirr" ? "09xxxxxxxx" : "1000xxxxxxxx"}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Account Holder Legal Name *
              </label>
              <input
                type="text"
                required
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                placeholder="Name as registered on Telebirr or Bank Account"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-1">
            <span className="font-bold flex items-center gap-1">
              <BsShieldCheck /> Escrow Security Notice:
            </span>
            <p className="text-[11px] text-stone-600">
              When a buyer confirms receipt of their authentic craft, funds move instantly from
              Pending Escrow to Cleared Available Balance and are paid out to your specified account.
            </p>
          </div>

          <div className="pt-4 border-t border-stone-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm shadow-sm transition"
            >
              <FiSave size={16} />
              <span>{loading ? "Saving..." : "Save Payout Credentials"}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: DELIVERY & RETURN POLICIES */}
      {activeTab === "shipping" && (
        <form onSubmit={handleSaveShipping} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div className="border-b border-stone-100 pb-4">
            <h2 className="text-lg font-bold font-serif text-stone-900">
              Fulfillment & Sizing Exchange Policies
            </h2>
            <p className="text-xs text-stone-500">
              Set clear delivery expectations for local and diaspora collectors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Standard Crafting & Handling Time (Days)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={handlingDays}
                onChange={(e) => setHandlingDays(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Average days to weave, inspect, and package craft
              </span>
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Free Shipping Threshold (ETB)
              </label>
              <input
                type="number"
                min={0}
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(e.target.value)}
                placeholder="0 for none"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Orders above this amount receive free delivery (0 = disabled)
              </span>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={expressDelivery}
                  onChange={(e) => setExpressDelivery(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="text-xs font-bold text-stone-800">
                  Enable Local Express Courier Delivery (Same-day / next-day delivery in Addis Ababa)
                </span>
              </label>
            </div>

            {/* Regional Courier Delivery Zones */}
            <div className="md:col-span-2 p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <FiTruck className="text-amber-700" /> Regional Shipping Rates Configuration (ETB)
                </span>
                <span className="text-[10px] text-stone-500">Auto-calculated at checkout based on buyer address</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-stone-600 mb-1">Addis Ababa Express</label>
                  <input
                    type="number"
                    value={addisShippingFee}
                    onChange={(e) => setAddisShippingFee(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono font-bold bg-white focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                  <span className="text-[9px] text-stone-400">Motorbike / local van</span>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-600 mb-1">Regional Cities (EMS)</label>
                  <input
                    type="number"
                    value={regionalShippingFee}
                    onChange={(e) => setRegionalShippingFee(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono font-bold bg-white focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                  <span className="text-[9px] text-stone-400">Hawassa, Bahir Dar, etc.</span>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-600 mb-1">Diaspora Express (DHL)</label>
                  <input
                    type="number"
                    value={internationalShippingFee}
                    onChange={(e) => setInternationalShippingFee(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono font-bold bg-white focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                  <span className="text-[9px] text-stone-400">North America & Europe</span>
                </div>
              </div>
            </div>

            {/* Vacation / Workshop Pause Mode */}
            <div className="md:col-span-2 p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-950 text-xs block">
                    🌴 Workshop Vacation / Order Pause Mode
                  </span>
                  <p className="text-[11px] text-amber-800">
                    Temporarily pause incoming checkout orders during holiday celebrations or when weaving at maximum capacity.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vacationMode}
                    onChange={(e) => {
                      setVacationMode(e.target.checked);
                      toast.info(e.target.checked ? "Vacation mode enabled: Store is paused for new orders." : "Vacation mode disabled: Store is active!");
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              {vacationMode && (
                <div className="pt-2 border-t border-amber-200 animate-in fade-in duration-200">
                  <label className="block text-[10px] font-bold uppercase text-amber-900 mb-1">
                    Vacation Announcement to Shoppers
                  </label>
                  <input
                    type="text"
                    value={vacationNotice}
                    onChange={(e) => setVacationNotice(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-amber-300 text-xs bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Artisan Return & Tailoring Policy
              </label>
              <textarea
                rows={3}
                value={returnPolicy}
                onChange={(e) => setReturnPolicy(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-sm transition"
            >
              <FiSave size={16} />
              <span>{loading ? "Saving..." : "Save Delivery Settings"}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: ARTISAN VERIFICATION */}
      {activeTab === "verification" && (
        <form onSubmit={handleSaveVerification} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div className="border-b border-stone-100 pb-4">
            <h2 className="text-lg font-bold font-serif text-stone-900">
              Artisan Trust & Legal Verification
            </h2>
            <p className="text-xs text-stone-500">
              Verified merchants earn a trusted green badge and receive priority placement in marketplace discovery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Ethiopian Tax Identification Number (TIN) *
              </label>
              <input
                type="text"
                required
                value={tinNumber}
                onChange={(e) => setTinNumber(e.target.value)}
                placeholder="10-digit Ethiopian TIN"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Trade License / Business Registration Number
              </label>
              <input
                type="text"
                value={businessReg}
                onChange={(e) => setBusinessReg(e.target.value)}
                placeholder="Ministry of Trade / Kebele License ID"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-1">
            <span className="font-bold flex items-center gap-1">
              <BsShieldCheck /> Benefits of Verification:
            </span>
            <ul className="list-disc list-inside text-[11px] text-stone-600 space-y-0.5">
              <li>Permanent "Verified Artisan Workshop" trust badge across all your products</li>
              <li>Faster escrow release window upon order delivery</li>
              <li>Featured spotlight in "Artisan Directory" & "More to Love" recommendations</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-stone-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-sm transition"
            >
              <FiCheckCircle size={16} />
              <span>{loading ? "Submitting..." : "Submit for Verification"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default ShopSettings;
