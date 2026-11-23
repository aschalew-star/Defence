import { server } from "../../server";
import React, { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  BsShop,
  BsUpload,
  BsCheckCircleFill,
  BsShieldCheck,
  BsBank,
  BsBuildingCheck,
  BsGeoAlt,
  BsFileEarmarkCheck,
  BsAward,
  BsCheck2Circle,
  BsTrash,
  BsClockHistory,
  BsCreditCard2Front,
  BsCashCoin,
} from "react-icons/bs";
import {
  FiFileText,
  FiUserCheck,
  FiCheck,
  FiArrowRight,
  FiArrowLeft,
  FiInfo,
} from "react-icons/fi";
import ShopHeader from "./ShopHeader";

const ETHIOPIAN_REGIONS = [
  "Addis Ababa",
  "Oromia",
  "Amhara",
  "Sidama",
  "Dire Dawa",
  "Harari",
  "Tigray",
  "South Ethiopia",
  "Central Ethiopia",
  "South West Ethiopia",
  "Afar",
  "Benishangul-Gumuz",
  "Gambela",
  "Somali",
];

const ADDIS_SUB_CITIES = [
  "Gulele (Shiro Meda Artisan Hub)",
  "Arada (Piazza Heritage Quarter)",
  "Kirkos (Meskel Flower & Kazanchis)",
  "Bole (Bole Medhanialem & Atlas)",
  "Lideta (Traditional Merkato Craft Zone)",
  "Yeka (Ferensay & Kotebe)",
  "Nifas Silk-Lafto",
  "Kolfe Keranio",
  "Akaky Kaliti",
  "Lemi Kura",
];

const CRAFT_OPTIONS = [
  "Traditional Dresses (Habesha Kemis & Tibeb)",
  "Handwoven Shemma, Gabi & Netela",
  "Men's Traditional Attire (Yebahl Libs)",
  "Authentic Ethiopian Leathercraft & Bags",
  "Cultural Home Decor, Mesob & Basketry",
  "Traditional Silver Crosses & Filigree Jewelry",
  "Clay Pottery & Traditional Coffee Sets (Jebena)",
  "Woodcraft & Religious Heritage Artifacts",
];

const ETHIOPIAN_PAYOUT_BANKS = [
  { id: "telebirr", name: "Telebirr (Ethio Telecom Mobile Merchant)" },
  { id: "cbe", name: "Commercial Bank of Ethiopia (CBE)" },
  { id: "awash", name: "Awash International Bank" },
  { id: "dashen", name: "Dashen Bank / Amole" },
  { id: "abyssinia", name: "Bank of Abyssinia" },
  { id: "coop", name: "Cooperative Bank of Oromia (Coop)" },
  { id: "zemen", name: "Zemen Bank" },
  { id: "hibret", name: "Hibret Bank" },
];

const ETHIOPIAN_COURIERS = [
  "Direct Merchant Delivery",
  "EMS Ethiopian Postal Service",
  "Tikus Delivery (Addis Ababa)",
  "Gomeju Logistics",
  "DHL Express (Diaspora Worldwide)",
];

function ShopCreate() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  // Step 1: Brand & Representative Identity
  const [name, setName] = useState("");
  const [legalOwnerName, setLegalOwnerName] = useState("");
  const [legalBusinessName, setLegalBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [telegram, setTelegram] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [coverBanner, setCoverBanner] = useState(null);

  // Step 2: Legal KYC, Ethiopian Tax (TIN) & Regulatory Documents
  const [businessType, setBusinessType] = useState("Individual Artisan");
  const [tinNumber, setTinNumber] = useState("");
  const [businessRegistrationNumber, setBusinessRegistrationNumber] = useState("");
  const [taxScheme, setTaxScheme] = useState("exempt"); // "vat", "tot", "exempt"
  const [vatNumber, setVatNumber] = useState("");
  const [taxOffice, setTaxOffice] = useState("Addis Ababa City Revenues Bureau");
  const [idType, setIdType] = useState("Kebele ID");
  const [idNumber, setIdNumber] = useState("");
  const [businessLicense, setBusinessLicense] = useState(null);
  const [idCard, setIdCard] = useState(null);

  // Step 3: Workshop Location, Payout Banking & Craft Heritage
  const [stateOrRegion, setStateOrRegion] = useState("Addis Ababa");
  const [city, setCity] = useState("Addis Ababa");
  const [subCity, setSubCity] = useState("Gulele (Shiro Meda Artisan Hub)");
  const [woreda, setWoreda] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [zipCode, setZipCode] = useState("1000");

  const [bankName, setBankName] = useState("telebirr");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [bankBranch, setBankBranch] = useState("");

  const [craftSpecialization, setCraftSpecialization] = useState([
    "Traditional Dresses (Habesha Kemis & Tibeb)",
  ]);
  const [artisanLineage, setArtisanLineage] = useState("");
  const [description, setDescription] = useState("");
  const [story, setStory] = useState("");
  const [preferredCourier, setPreferredCourier] = useState("Direct Merchant Delivery");
  const [dispatchDays, setDispatchDays] = useState(3);

  // Step 4: Legal Undertakings & Agreements
  const [agreeAuthenticity, setAgreeAuthenticity] = useState(false);
  const [agreeEcommerceLaw, setAgreeEcommerceLaw] = useState(false);
  const [agreeEscrow, setAgreeEscrow] = useState(false);
  const [agreeTaxTruth, setAgreeTaxTruth] = useState(false);

  // Helper for file upload preview
  const handleFileUpload = (e, setter) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      toast.error("File size must be under 8MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setter(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleToggleCraft = (craft) => {
    if (craftSpecialization.includes(craft)) {
      if (craftSpecialization.length > 1) {
        setCraftSpecialization(craftSpecialization.filter((c) => c !== craft));
      } else {
        toast.info("Please select at least one primary craft");
      }
    } else {
      setCraftSpecialization([...craftSpecialization, craft]);
    }
  };

  // Step Validations
  const validateStep1 = () => {
    if (!name.trim()) {
      toast.error("Please enter your artisan brand or workshop name");
      return false;
    }
    if (!legalOwnerName.trim()) {
      toast.error("Please provide the legal representative's full name (Grandfather name format)");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      toast.error("Please enter a valid business email address");
      return false;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }
    const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, "");
    if (!cleanPhone || cleanPhone.length < 9) {
      toast.error("Please provide a valid Ethiopian phone number for Telebirr/courier contact");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (tinNumber) {
      const cleanTin = tinNumber.replace(/\D/g, "");
      if (cleanTin.length !== 10) {
        toast.warning(
          "Notice: Standard Ethiopian Taxpayer Identification Numbers (TIN) must contain exactly 10 digits"
        );
      }
    }
    if (taxScheme === "vat" && !vatNumber.trim()) {
      toast.error("Please provide your 10-digit VAT registration number");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!address.trim()) {
      toast.error("Please enter your physical workshop or boutique address");
      return false;
    }
    if (!accountNumber.trim()) {
      toast.error(
        `Please provide your ${
          bankName === "telebirr" ? "Telebirr mobile account number" : "bank account number"
        } for order disbursements`
      );
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
    setCurrentStep((prev) => Math.min(4, prev + 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agreeAuthenticity || !agreeEcommerceLaw || !agreeEscrow || !agreeTaxTruth) {
      toast.error("Please accept all legal affirmations and compliance agreements to proceed");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        legalOwnerName: legalOwnerName.trim(),
        legalBusinessName: legalBusinessName.trim() || name.trim(),
        idType,
        idNumber: idNumber.trim(),
        email: email.toLowerCase().trim(),
        password,
        phoneNumber: phoneNumber.trim(),
        avatar,
        businessType,
        tinNumber: tinNumber.trim(),
        businessRegistrationNumber: businessRegistrationNumber.trim(),
        vatRegistered: taxScheme === "vat",
        vatNumber: taxScheme === "vat" ? vatNumber.trim() : "",
        totRegistered: taxScheme === "tot",
        taxOffice: taxOffice.trim(),
        businessLicense,
        idCard,
        stateOrRegion,
        city: city.trim(),
        subCity: subCity.trim(),
        woreda: woreda.trim(),
        address: address.trim(),
        landmark: landmark.trim(),
        zipCode: zipCode.trim() || "1000",
        bankName,
        accountNumber: accountNumber.trim(),
        accountHolderName: accountHolderName.trim() || legalOwnerName.trim() || name.trim(),
        bankBranch: bankBranch.trim(),
        craftSpecialization,
        artisanLineage: artisanLineage.trim(),
        description: description.trim(),
        story: story.trim(),
        coverBanner,
        telegram: telegram.trim(),
        preferredCourier: preferredCourier.trim(),
        dispatchDays: Number(dispatchDays) || 3,
      };

      const res = await axios.post(`${server}/shop/shopcreate`, payload, {
        withCredentials: true,
      });

      if (res.data?.success) {
        toast.success(
          tinNumber || businessLicense
            ? "Artisan workshop registered! Application submitted for legal compliance verification."
            : "Artisan merchant account created successfully!"
        );
        setLoading(false);
        navigate("/dashboard");
        window.location.reload();
      }
    } catch (error: any) {
      setLoading(false);
      toast.error(
        error.response?.data?.message || "Registration failed. Please review your credentials."
      );
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-between select-none">
      <ShopHeader isLogin={false} />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-200 grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Ethiopian Artisan & Legal Assurance (4 cols) */}
          <div className="lg:col-span-4 bg-gradient-to-br from-amber-950 via-stone-900 to-amber-900 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-600/40 border border-amber-500/50 flex items-center justify-center">
                <BsShop className="text-2xl text-amber-300" />
              </div>

              <div>
                <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30 uppercase tracking-wider">
                  Ethiopian Ministry & Tax Regulated
                </span>
                <h2 className="text-2xl font-bold font-serif leading-tight mt-2.5">
                  Artisan & Boutique Commercial Onboarding
                </h2>
                <p className="mt-3 text-stone-300 text-xs leading-relaxed">
                  Join verified master weavers, traditional Habesha Kemis designers, and cultural
                  leather workshops. Connect directly with domestic connoisseurs and the global
                  Ethiopian diaspora.
                </p>
              </div>

              {/* Legal & Regulatory Highlights */}
              <div className="space-y-3 pt-2">
                {[
                  {
                    title: "Proclamation No. 1205/2020 Compliant",
                    desc: "Fully aligned with Ethiopian Electronic Transactions and Trade competition mandates.",
                  },
                  {
                    title: "10-Digit TIN & Commercial Registry",
                    desc: "Official verification grants the Verified Artisan Shield and priority placement.",
                  },
                  {
                    title: "Telebirr & CBE Escrow Settlements",
                    desc: "Funds secured in domestic escrow and disbursed immediately upon customer delivery.",
                  },
                  {
                    title: "Artisan Heritage Protection",
                    desc: "Protection against imported counterfeits; celebrating authentic Ethiopian handcrafts.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs">
                    <BsCheckCircleFill className="text-emerald-400 text-sm mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold text-amber-100">{item.title}</div>
                      <div className="text-[11px] text-stone-400 leading-tight">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Login Link */}
            <div className="mt-8 pt-5 border-t border-amber-800/80 relative z-10 text-xs text-stone-300">
              Already registered as an artisan merchant?{" "}
              <Link to="/shop-login" className="text-amber-300 font-bold hover:underline">
                Sign In to Portal
              </Link>
            </div>
          </div>

          {/* Right Column: 4-Step Registration Form (8 cols) */}
          <div className="lg:col-span-8 p-6 sm:p-10 flex flex-col justify-between">
            <div>
              {/* Stepper Progress Bar */}
              <div className="mb-8">
                <div className="grid grid-cols-4 gap-2 text-[11px] font-bold text-stone-500 mb-2.5">
                  <span className={currentStep === 1 ? "text-amber-800" : ""}>
                    1. Identity
                  </span>
                  <span className={currentStep === 2 ? "text-amber-800" : ""}>
                    2. Legal KYC
                  </span>
                  <span className={currentStep === 3 ? "text-amber-800" : ""}>
                    3. Workshop & Bank
                  </span>
                  <span className={currentStep === 4 ? "text-amber-800" : ""}>
                    4. Verification
                  </span>
                </div>
                <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-600 h-full rounded-full transition-all duration-300"
                    style={{
                      width:
                        currentStep === 1
                          ? "25%"
                          : currentStep === 2
                          ? "50%"
                          : currentStep === 3
                          ? "75%"
                          : "100%",
                    }}
                  />
                </div>
              </div>

              {/* STEP 1: IDENTITY & STORE CREDENTIALS */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h3 className="text-xl font-bold font-serif text-stone-900">
                      Step 1: Artisan Brand & Representative Identity
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Provide your public brand name and authorized legal manager credentials.
                    </p>
                  </div>

                  {/* Storefront Logo & Cover Banner Upload Preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt="Logo Preview"
                            className="w-14 h-14 rounded-2xl object-cover border border-amber-300 shadow-xs"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-stone-800 text-white font-serif font-black text-xl flex items-center justify-center">
                            {name ? name.charAt(0).toUpperCase() : "A"}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold cursor-pointer transition shadow-2xs">
                          <BsUpload size={13} />
                          <span>Store Logo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, setAvatar)}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[10px] text-stone-400 mt-1 truncate">
                          Emblem / Avatar (PNG, JPG)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-stone-200 pt-2 sm:pt-0 sm:pl-3">
                      <div className="relative shrink-0">
                        {coverBanner ? (
                          <img
                            src={coverBanner}
                            alt="Banner Preview"
                            className="w-14 h-14 rounded-2xl object-cover border border-amber-300 shadow-xs"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-amber-900/40 border border-amber-800/40 text-amber-200 text-xs font-bold flex items-center justify-center text-center p-1">
                            Banner
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold cursor-pointer transition shadow-2xs">
                          <BsUpload size={13} />
                          <span>Cover Banner</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, setCoverBanner)}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[10px] text-stone-400 mt-1 truncate">
                          Wide boutique header (Optional)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Artisan Brand / Store Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Roha Handloom & Tibeb Studio"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                        />
                        <span className="text-[10px] text-stone-400">Public customer-facing boutique name</span>
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Legal Representative Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={legalOwnerName}
                          onChange={(e) => setLegalOwnerName(e.target.value)}
                          placeholder="e.g. Almaz Bekele Wolde (First Father Grandfather)"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                        />
                        <span className="text-[10px] text-stone-400">Must match your Kebele / National ID</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Business Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="workshop@artisan.et"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-600"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Telebirr / Phone *
                        </label>
                        <input
                          type="text"
                          required
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="0911234567"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-600"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Telegram Handle
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold">@</span>
                          <input
                            type="text"
                            value={telegram}
                            onChange={(e) => setTelegram(e.target.value.replace(/^@/, ""))}
                            placeholder="roha_tibeb"
                            className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-600"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Portal Password *
                      </label>
                      <div className="relative">
                        <input
                          type={visible ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Minimum 6 characters"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                        />
                        <button
                          type="button"
                          onClick={() => setVisible(!visible)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                        >
                          {visible ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: LEGAL KYC, ETHIOPIAN TAX (TIN) & REGULATORY DOCUMENTS */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h3 className="text-xl font-bold font-serif text-stone-900">
                      Step 2: Legal Entity & Ethiopian Tax Credentials
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Verify your business under Ethiopian Federal Tax Administration Proclamation No. 983/2016.
                    </p>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Legal Entity Type *
                        </label>
                        <select
                          value={businessType}
                          onChange={(e) => setBusinessType(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-600"
                        >
                          <option value="Individual Artisan">
                            Individual Artisan / Master Weaver (ግለሰብ እደ-ጥበብ ባለሙያ)
                          </option>
                          <option value="Registered Boutique">
                            Registered Boutique / Sole Proprietorship (የግል ድርጅት)
                          </option>
                          <option value="Weaving Cooperative">
                            Weaving Cooperative / Union (የሸማ ማህበር)
                          </option>
                          <option value="Traditional Crafts Workshop">
                            Traditional Crafts Workshop / Atelier (የባህል አውደ-ጥናት)
                          </option>
                          <option value="Fashion House">
                            Fashion House / PLC (ኃ/የተ/የግ/ማህበር)
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Registered Commercial / Legal Name
                        </label>
                        <input
                          type="text"
                          value={legalBusinessName}
                          onChange={(e) => setLegalBusinessName(e.target.value)}
                          placeholder="Legal name on trade license if different"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-600"
                        />
                      </div>
                    </div>

                    {/* Ethiopian 10-Digit TIN & Ministry Registration */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block font-bold text-stone-700 uppercase tracking-wider">
                            Ethiopian TIN (Tax ID) *
                          </label>
                          <span
                            className={`font-mono text-[10px] font-bold ${
                              tinNumber.replace(/\D/g, "").length === 10
                                ? "text-emerald-700"
                                : "text-stone-400"
                            }`}
                          >
                            {tinNumber.replace(/\D/g, "").length}/10 digits
                          </span>
                        </div>
                        <input
                          type="text"
                          maxLength={12}
                          value={tinNumber}
                          onChange={(e) => setTinNumber(e.target.value)}
                          placeholder="e.g. 0012345678"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                        />
                        <span className="text-[10px] text-stone-500 mt-0.5 block">
                          Ministry of Revenues 10-digit Tax Identification Number
                        </span>
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Trade License / Ministry Reg No.
                        </label>
                        <input
                          type="text"
                          value={businessRegistrationNumber}
                          onChange={(e) => setBusinessRegistrationNumber(e.target.value)}
                          placeholder="e.g. ET/MOTI/AA/2024/0981"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-600"
                        />
                        <span className="text-[10px] text-stone-500 mt-0.5 block">
                          Commercial registration license number
                        </span>
                      </div>
                    </div>

                    {/* Tax Classification: VAT vs TOT vs Micro-Exempt */}
                    <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                      <label className="block font-bold text-stone-800 uppercase tracking-wider text-[11px]">
                        Tax Registration Classification in Ethiopia:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {[
                          { id: "exempt", title: "Micro-Artisan Exempt", desc: "Under 1,000,000 ETB annual turnover" },
                          { id: "tot", title: "TOT Registered", desc: "2% Goods / 10% Services turnover tax" },
                          { id: "vat", title: "VAT Registered (15%)", desc: "Standard Ethiopian VAT certificate" },
                        ].map((scheme) => (
                          <div
                            key={scheme.id}
                            onClick={() => setTaxScheme(scheme.id)}
                            className={`p-2.5 rounded-xl border cursor-pointer transition ${
                              taxScheme === scheme.id
                                ? "bg-amber-50 border-amber-600 ring-1 ring-amber-600"
                                : "bg-white border-stone-200 hover:border-stone-300"
                            }`}
                          >
                            <div className="font-bold text-stone-900 text-xs">{scheme.title}</div>
                            <div className="text-[10px] text-stone-500">{scheme.desc}</div>
                          </div>
                        ))}
                      </div>

                      {taxScheme === "vat" && (
                        <div className="pt-2 animate-fadeIn">
                          <label className="block font-semibold text-stone-700 mb-1">
                            Ethiopian VAT Certificate Number *
                          </label>
                          <input
                            type="text"
                            value={vatNumber}
                            onChange={(e) => setVatNumber(e.target.value)}
                            placeholder="e.g. 1548293021"
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono text-xs"
                          />
                        </div>
                      )}
                    </div>

                    {/* Owner Legal ID Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Owner Identification Document Type
                        </label>
                        <select
                          value={idType}
                          onChange={(e) => setIdType(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs font-semibold"
                        >
                          <option value="Kebele ID">Resident Kebele ID (የቀበሌ መታወቂያ)</option>
                          <option value="National Digital ID (Fayda)">
                            Fayda National Digital ID (የፋይዳ ዲጂታል መታወቂያ)
                          </option>
                          <option value="Passport">Ethiopian Passport (ፓስፖርት)</option>
                          <option value="Driver License">Driver's License (መንጃ ፈቃድ)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                          ID Card / FIN Document Number
                        </label>
                        <input
                          type="text"
                          value={idNumber}
                          onChange={(e) => setIdNumber(e.target.value)}
                          placeholder="e.g. AA-03-84729 or FAYDA-FIN-..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono text-xs"
                        />
                      </div>
                    </div>

                    {/* Document Uploads with Clear Lightbox/Thumbnail Preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Trade License Upload */}
                      <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-800 flex items-center gap-1.5 text-xs">
                            <FiFileText className="text-amber-700" /> Trade License Scan
                          </span>
                          {businessLicense && (
                            <button
                              type="button"
                              onClick={() => setBusinessLicense(null)}
                              className="text-rose-600 hover:text-rose-700 text-[11px] font-semibold"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        {businessLicense ? (
                          <div className="relative group rounded-xl overflow-hidden border border-emerald-300 bg-emerald-50 p-2 flex items-center gap-3">
                            <img
                              src={businessLicense}
                              alt="License Preview"
                              className="w-12 h-12 rounded-lg object-cover border border-emerald-400"
                            />
                            <div>
                              <div className="text-emerald-900 font-bold text-xs flex items-center gap-1">
                                <FiCheck /> Trade License Attached
                              </div>
                              <div className="text-[10px] text-emerald-700">Ready for compliance review</div>
                            </div>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-stone-300 hover:border-amber-600 rounded-xl cursor-pointer bg-white transition text-center">
                            <BsUpload className="text-stone-400 mb-1" size={16} />
                            <span className="text-[11px] text-stone-700 font-bold">
                              Upload Trade License / Certificate
                            </span>
                            <span className="text-[10px] text-stone-400">JPG or PNG scan up to 8MB</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, setBusinessLicense)}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>

                      {/* Kebele ID / Passport Upload */}
                      <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-800 flex items-center gap-1.5 text-xs">
                            <FiUserCheck className="text-amber-700" /> {idType} Scan
                          </span>
                          {idCard && (
                            <button
                              type="button"
                              onClick={() => setIdCard(null)}
                              className="text-rose-600 hover:text-rose-700 text-[11px] font-semibold"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        {idCard ? (
                          <div className="relative group rounded-xl overflow-hidden border border-emerald-300 bg-emerald-50 p-2 flex items-center gap-3">
                            <img
                              src={idCard}
                              alt="ID Preview"
                              className="w-12 h-12 rounded-lg object-cover border border-emerald-400"
                            />
                            <div>
                              <div className="text-emerald-900 font-bold text-xs flex items-center gap-1">
                                <FiCheck /> ID Photo Attached
                              </div>
                              <div className="text-[10px] text-emerald-700">Ready for identity verification</div>
                            </div>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-stone-300 hover:border-amber-600 rounded-xl cursor-pointer bg-white transition text-center">
                            <BsUpload className="text-stone-400 mb-1" size={16} />
                            <span className="text-[11px] text-stone-700 font-bold">
                              Upload {idType} Photo
                            </span>
                            <span className="text-[10px] text-stone-400">Clear front/back image</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, setIdCard)}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: WORKSHOP LOCATION, PAYOUT BANK & CRAFT HERITAGE */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h3 className="text-xl font-bold font-serif text-stone-900">
                      Step 3: Workshop Location, Payout Banking & Craft Focus
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Configure your workshop physical address and bank account for order settlements.
                    </p>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    {/* Location Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Region / City *
                        </label>
                        <select
                          value={stateOrRegion}
                          onChange={(e) => {
                            setStateOrRegion(e.target.value);
                            setCity(e.target.value);
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs font-semibold"
                        >
                          {ETHIOPIAN_REGIONS.map((reg) => (
                            <option key={reg} value={reg}>
                              {reg}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Sub-city / Zone
                        </label>
                        {stateOrRegion === "Addis Ababa" ? (
                          <select
                            value={subCity}
                            onChange={(e) => setSubCity(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs"
                          >
                            {ADDIS_SUB_CITIES.map((sc) => (
                              <option key={sc} value={sc}>
                                {sc}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={subCity}
                            onChange={(e) => setSubCity(e.target.value)}
                            placeholder="e.g. Hawassa City Zone"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs"
                          />
                        )}
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Woreda / Kebele
                        </label>
                        <input
                          type="text"
                          value={woreda}
                          onChange={(e) => setWoreda(e.target.value)}
                          placeholder="e.g. Woreda 03, Kebele 12"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Physical Workshop / Atelier Address *
                        </label>
                        <input
                          type="text"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="e.g. Shiro Meda Handloom Market, House #142"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Workshop Landmark / Guide
                        </label>
                        <input
                          type="text"
                          value={landmark}
                          onChange={(e) => setLandmark(e.target.value)}
                          placeholder="e.g. Behind Medhanealem Church, Gate 2"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs"
                        />
                      </div>
                    </div>

                    {/* Settlement Payout Bank / Telebirr */}
                    <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
                          <BsBank className="text-emerald-700" /> Primary Settlement Payout Account:
                        </span>
                        <span className="text-[10px] text-stone-500 font-mono">
                          Escrow funds disbursed directly
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block font-semibold text-stone-700 mb-1">
                            Disbursement Provider *
                          </label>
                          <select
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-semibold text-xs"
                          >
                            {ETHIOPIAN_PAYOUT_BANKS.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold text-stone-700 mb-1">
                            {bankName === "telebirr" ? "Telebirr Mobile No. *" : "Account Number *"}
                          </label>
                          <input
                            type="text"
                            required
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            placeholder={
                              bankName === "telebirr" ? "e.g. 0911234567" : "1000xxxxxxxxx"
                            }
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block font-semibold text-stone-700 mb-1">
                            Account Holder Legal Name
                          </label>
                          <input
                            type="text"
                            value={accountHolderName}
                            onChange={(e) => setAccountHolderName(e.target.value)}
                            placeholder={legalOwnerName || name || "Full Name as registered with bank"}
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                          />
                        </div>

                        {bankName !== "telebirr" && (
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">
                              Bank Branch Name
                            </label>
                            <input
                              type="text"
                              value={bankBranch}
                              onChange={(e) => setBankBranch(e.target.value)}
                              placeholder="e.g. Finfine Branch / Shiro Meda Branch"
                              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Craft Specializations */}
                    <div className="space-y-1.5">
                      <label className="block font-bold text-stone-700 uppercase tracking-wider text-xs">
                        Primary Heritage Crafts You Specialize In:
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {CRAFT_OPTIONS.map((c, i) => {
                          const isSelected = craftSpecialization.includes(c);
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleToggleCraft(c)}
                              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition ${
                                isSelected
                                  ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                                  : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                              }`}
                            >
                              {isSelected ? "✓ " : "+ "}
                              {c}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1 text-xs">
                        Artisan Lineage & Traditional Technique
                      </label>
                      <input
                        type="text"
                        value={artisanLineage}
                        onChange={(e) => setArtisanLineage(e.target.value)}
                        placeholder="e.g. 3rd-generation Dorze master weavers specializing in Menze wool and pure cotton Tibeb embroidery"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs"
                      />
                    </div>

                    {/* Dispatch Courier & Handcraft SLA Commitment */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                      <div>
                        <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1 text-xs">
                          Primary Dispatch Courier Partner
                        </label>
                        <select
                          value={preferredCourier}
                          onChange={(e) => setPreferredCourier(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-semibold text-xs"
                        >
                          {ETHIOPIAN_COURIERS.map((cour) => (
                            <option key={cour} value={cour}>
                              {cour}
                            </option>
                          ))}
                        </select>
                        <span className="text-[10px] text-stone-400">
                          Couriers will pick up packages from your workshop
                        </span>
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1 text-xs">
                          Handcraft & Dispatch SLA
                        </label>
                        <select
                          value={dispatchDays}
                          onChange={(e) => setDispatchDays(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-semibold text-xs"
                        >
                          <option value={2}>1-2 Days (Ready Stock / Fast Dispatch)</option>
                          <option value={3}>3-5 Days (Handwoven Shemma & Standard Tailoring)</option>
                          <option value={7}>7-14 Days (Bespoke Luxury Bridal Weaving)</option>
                        </select>
                        <span className="text-[10px] text-stone-400">
                          Displays guaranteed dispatch badge on your products
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: REVIEW SUMMARY & LEGAL UNDERTAKINGS */}
              {currentStep === 4 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h3 className="text-xl font-bold font-serif text-stone-900">
                      Step 4: Application Review & Legal Certification
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Review your legal dossier and execute the mandatory compliance agreements under Ethiopian law.
                    </p>
                  </div>

                  {/* Summary Dossier Card */}
                  <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-3 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                      <div className="flex items-center gap-2.5">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt="Logo"
                            className="w-8 h-8 rounded-lg object-cover border border-amber-300"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-stone-800 text-white font-bold flex items-center justify-center">
                            {name ? name.charAt(0).toUpperCase() : "A"}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-stone-900 text-sm">{name}</div>
                          <div className="text-[10px] text-stone-500">{businessType}</div>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                        Pending Official Review
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <span className="text-stone-500 block text-[10px]">Legal Representative:</span>
                        <span className="font-semibold text-stone-900">{legalOwnerName}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px]">Contact Mobile:</span>
                        <span className="font-mono text-stone-900">{phoneNumber}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px]">10-Digit TIN:</span>
                        <span className="font-mono font-bold text-emerald-800">
                          {tinNumber || "Not Provided"}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px]">Tax Classification:</span>
                        <span className="font-semibold text-stone-900 uppercase">
                          {taxScheme === "vat" ? `VAT (No: ${vatNumber})` : taxScheme}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px]">Disbursement:</span>
                        <span className="font-semibold text-stone-900">
                          {bankName.toUpperCase()} - {accountNumber}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px]">Location:</span>
                        <span className="font-semibold text-stone-900">
                          {city}, {subCity}
                        </span>
                      </div>
                      {telegram && (
                        <div>
                          <span className="text-stone-500 block text-[10px]">Telegram:</span>
                          <span className="font-mono text-stone-900">@{telegram}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-stone-500 block text-[10px]">Courier SLA:</span>
                        <span className="font-semibold text-stone-900">
                          {preferredCourier} ({dispatchDays} Days)
                        </span>
                      </div>
                    </div>

                    {/* Uploaded Documents Indicator */}
                    <div className="pt-2 border-t border-stone-200 flex items-center gap-4 text-[11px]">
                      <span className="text-stone-500 font-semibold">Verification Scans:</span>
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          businessLicense ? "text-emerald-700" : "text-stone-400"
                        }`}
                      >
                        {businessLicense ? <BsCheck2Circle /> : "○"} Trade License Scan
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          idCard ? "text-emerald-700" : "text-stone-400"
                        }`}
                      >
                        {idCard ? <BsCheck2Circle /> : "○"} {idType} Scan
                      </span>
                    </div>
                  </div>

                  {/* Mandatory Legal Affirmations */}
                  <div className="space-y-2.5 pt-1">
                    <label className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/60 border border-amber-200 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreeAuthenticity}
                        onChange={(e) => setAgreeAuthenticity(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 mt-0.5 shrink-0"
                      />
                      <span className="text-xs text-stone-800 leading-tight">
                        <strong>Authentic Ethiopian Craftsmanship Declaration:</strong> I solemnly declare
                        that all goods listed on this store are authentic Ethiopian handwoven, tailored, or
                        handcrafted works. I will not resell imported synthetic or counterfeit replicas.
                      </span>
                    </label>

                    <label className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreeEcommerceLaw}
                        onChange={(e) => setAgreeEcommerceLaw(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 mt-0.5 shrink-0"
                      />
                      <span className="text-xs text-stone-800 leading-tight">
                        <strong>Electronic Commerce Proclamation No. 1205/2020:</strong> I agree to abide by
                        Ethiopian commercial regulations, fair trade practices, and consumer protection laws.
                      </span>
                    </label>

                    <label className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreeEscrow}
                        onChange={(e) => setAgreeEscrow(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 mt-0.5 shrink-0"
                      />
                      <span className="text-xs text-stone-800 leading-tight">
                        <strong>Platform Escrow & Settlement Terms:</strong> I understand customer payments
                        are held in platform escrow and disbursed automatically to my Telebirr/Bank account
                        upon delivery confirmation.
                      </span>
                    </label>

                    <label className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreeTaxTruth}
                        onChange={(e) => setAgreeTaxTruth(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 mt-0.5 shrink-0"
                      />
                      <span className="text-xs text-stone-800 leading-tight">
                        <strong>Tax Compliance & Truthfulness Under Oath:</strong> I affirm that the submitted
                        TIN, Trade License, and identification are genuine, valid, and belong to the undersigned
                        representative under penalty of applicable Ethiopian laws.
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Stepper Navigation Buttons */}
            <div className="pt-6 border-t border-stone-100 flex items-center justify-between gap-3 mt-6">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50 transition"
                >
                  <FiArrowLeft size={14} />
                  <span>Previous Step</span>
                </button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition shadow-sm"
                >
                  <span>Continue to Step {currentStep + 1}</span>
                  <FiArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={
                    loading ||
                    !agreeAuthenticity ||
                    !agreeEcommerceLaw ||
                    !agreeEscrow ||
                    !agreeTaxTruth
                  }
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-sm"
                >
                  <BsShieldCheck size={16} />
                  <span>{loading ? "Submitting Application..." : "Submit Official Application"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShopCreate;
