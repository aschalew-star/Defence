import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/Store/Store";
import { getAllSellers } from "../../redux/Action/Seller";
import { server } from "../../server";
import axios from "axios";
import { toast } from "react-toastify";
import {
  BsShieldCheck,
  BsShieldExclamation,
  BsTrash,
  BsSearch,
  BsFileEarmarkText,
  BsCheck2Circle,
  BsClockHistory,
  BsBank,
  BsBuildingCheck,
  BsGeoAlt,
  BsEye,
  BsZoomIn,
  BsZoomOut,
  BsDownload,
  BsShop,
  BsCashCoin,
  BsStarFill,
  BsStar,
  BsCheckSquare,
  BsSquare,
  BsMegaphone,
  BsSliders,
  BsArrowRight,
  BsPlusCircle,
  BsDashCircle,
  BsAward,
  BsPrinter,
  BsCalculator,
} from "react-icons/bs";
import { RxCross1, RxReload } from "react-icons/rx";
import { FiExternalLink, FiCopy, FiCheck, FiShoppingBag, FiLayers } from "react-icons/fi";

const REJECTION_PRESETS = [
  {
    id: "tin_invalid",
    label: "Invalid or Non-matching 10-digit TIN",
    text: "The Taxpayer Identification Number (TIN) provided could not be verified against the Ethiopian Ministry of Revenues registry or contains invalid digits. Please provide an active 10-digit TIN matching your legal business name.",
  },
  {
    id: "license_illegible",
    label: "Illegible or Expired Trade License",
    text: "The uploaded Trade License / Commercial Registration scan is blurry, cropped, or past its annual renewal date. Please upload a clear, full-page scan of your valid commercial license.",
  },
  {
    id: "id_mismatch",
    label: "Kebele / National ID Mismatch",
    text: "The representative name on the submitted Kebele ID or Fayda Digital ID does not match the registered business manager or trade license owner. Please provide valid matching identification.",
  },
  {
    id: "payout_mismatch",
    label: "Bank / Telebirr Account Name Mismatch",
    text: "The disbursement account holder name does not correspond to the legal representative or registered business entity. In compliance with Ethiopian banking regulations, payout accounts must match the verified merchant identity.",
  },
  {
    id: "authenticity_standard",
    label: "Does Not Meet Handmade Heritage Standards",
    text: "The listed crafts appear to be imported synthetic goods or industrial mass-manufactured items rather than authentic Ethiopian artisanal works. Roha platform requires genuine handloom, leathercraft, or traditional artisan production.",
  },
  {
    id: "custom",
    label: "Other Compliance Grounds (Custom Note)",
    text: "",
  },
];

const BADGE_OPTIONS = [
  { id: "Bronze Artisan", label: "Bronze Artisan", desc: "New verified boutique or master weaver" },
  { id: "Silver Artisan", label: "Silver Artisan", desc: "Established studio with verified craftsmanship" },
  { id: "Gold Master Weaver", label: "Gold Master Weaver", desc: "Premier cultural master / heritage brand" },
  { id: "Verified Cooperative", label: "Verified Cooperative", desc: "Artisan collective / weavers association" },
  { id: "Top Seller", label: "Top Seller", desc: "Platform ambassador with stellar fulfillment" },
];

const ETHIOPIAN_SUBCITIES = [
  "Bole",
  "Kirkos",
  "Arada",
  "Gullele",
  "Yeka",
  "Nifas Silk-Lafto",
  "Lideta",
  "Akaky Kaliti",
  "Addis Ketema",
  "Kolfe Keranio",
  "Lemi Kura",
];

// Heuristic Artisan Trust & Compliance Score Calculator (0-100)
export const computeArtisanTrustScore = (seller: any) => {
  if (!seller) return { score: 0, breakdown: [], tier: "Unregistered", tierColor: "text-stone-500 bg-stone-100 border-stone-200", badgeIcon: "❓" };

  let score = 20; // baseline for active account
  const breakdown: { label: string; points: number; maxPoints: number; earned: boolean; detail: string }[] = [];

  // 1. Valid 10-Digit Ethiopian TIN (+20 pts)
  const hasTin = Boolean(seller.tinNumber && String(seller.tinNumber).trim().length >= 10);
  if (hasTin) score += 20;
  breakdown.push({
    label: "Ministry of Revenues TIN",
    points: hasTin ? 20 : 0,
    maxPoints: 20,
    earned: hasTin,
    detail: hasTin ? `Valid 10-digit TIN (${seller.tinNumber})` : "Missing or incomplete 10-digit TIN",
  });

  // 2. Commercial Trade License Scan (+20 pts)
  const hasLicense = Boolean(seller.businessLicense?.url);
  if (hasLicense) score += 20;
  breakdown.push({
    label: "Commercial Trade License",
    points: hasLicense ? 20 : 0,
    maxPoints: 20,
    earned: hasLicense,
    detail: hasLicense ? "Trade License document scan on file" : "No commercial license scan uploaded",
  });

  // 3. Official Compliance Verification (+20 pts)
  const isVerified = Boolean(seller.isVerified || seller.verificationStatus === "Verified");
  if (isVerified) score += 20;
  breakdown.push({
    label: "Compliance Verification",
    points: isVerified ? 20 : 0,
    maxPoints: 20,
    earned: isVerified,
    detail: isVerified ? "Passed formal administrative verification" : "Pending officer review or unverified",
  });

  // 4. Legal Representative ID (+10 pts)
  const hasId = Boolean(seller.idCard?.url || seller.idNumber);
  if (hasId) score += 10;
  breakdown.push({
    label: "Kebele / National ID",
    points: hasId ? 10 : 0,
    maxPoints: 10,
    earned: hasId,
    detail: hasId ? "National or Kebele ID verified" : "No representative ID document submitted",
  });

  // 5. Domestic Disbursement Account (+10 pts)
  const hasPayment = Boolean(
    seller.payoutMethods?.length > 0 ||
    seller.withdrawMethod ||
    seller.phoneNumber
  );
  if (hasPayment) score += 10;
  breakdown.push({
    label: "Disbursement Setup",
    points: hasPayment ? 10 : 0,
    maxPoints: 10,
    earned: hasPayment,
    detail: hasPayment ? "Telebirr or CBE Birr account mapped" : "Disbursement destination incomplete",
  });

  // Tier designation
  let tier = "High Compliance Risk";
  let tierColor = "text-rose-700 bg-rose-50 border-rose-200";
  let badgeIcon = "⚠️";

  if (score >= 90) {
    tier = "Master Artisan (Certified)";
    tierColor = "text-emerald-800 bg-emerald-50 border-emerald-300";
    badgeIcon = "🌟";
  } else if (score >= 70) {
    tier = "Verified Guild Member";
    tierColor = "text-blue-800 bg-blue-50 border-blue-300";
    badgeIcon = "🛡️";
  } else if (score >= 50) {
    tier = "Provisional Craftsman";
    tierColor = "text-amber-800 bg-amber-50 border-amber-300";
    badgeIcon = "⏳";
  }

  return { score, breakdown, tier, tierColor, badgeIcon };
};

const AllSellers = () => {
  const dispatch = useAppDispatch();
  const { sellers = [], isLoading } = useAppSelector((state) => state.seller);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // "all", "pending", "verified", "suspended", "unverified", "featured"
  const [filterEntity, setFilterEntity] = useState("all");
  const [filterRegion, setFilterRegion] = useState("all");
  const [filterSubCity, setFilterSubCity] = useState("all");
  const [filterTax, setFilterTax] = useState("all"); // "all", "vat", "tot", "tin_only"
  const [sortBy, setSortBy] = useState("newest");

  // Multi-select Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkActionModalOpen, setBulkActionModalOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<"verify" | "suspend" | "activate" | "commission" | "badge" | "feature">("verify");
  const [bulkCommissionRate, setBulkCommissionRate] = useState(8);
  const [bulkBadge, setBulkBadge] = useState("Bronze Artisan");
  const [bulkReason, setBulkReason] = useState("");
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  // Comprehensive 360-degree Inspector Modal
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<any>(null);
  const [inspectorTab, setInspectorTab] = useState("dossier"); // dossier, documents, payout, products, orders, notices, settings, decision
  const [dossierData, setDossierData] = useState<any>(null);
  const [loadingDossier, setLoadingDossier] = useState(false);

  // Document Lightbox state
  const [activeDocType, setActiveDocType] = useState<"license" | "idCard" | "avatar">("license");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [copiedField, setCopiedField] = useState("");

  // Compliance Decision State
  const [decisionMode, setDecisionMode] = useState<"approve" | "reject" | "request_revision">("approve");
  const [chosenBadge, setChosenBadge] = useState("Bronze Artisan");
  const [commissionRate, setCommissionRate] = useState(8);
  const [rejectionPreset, setRejectionPreset] = useState("tin_invalid");
  const [verificationNotes, setVerificationNotes] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  // Quick Action Modal (Delete & Suspend)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [sellerToDelete, setSellerToDelete] = useState<any>(null);

  // Quick Balance Adjustment Modal
  const [balanceModalOpen, setBalanceModalOpen] = useState(false);
  const [sellerForBalance, setSellerForBalance] = useState<any>(null);
  const [balanceAdjAmount, setBalanceAdjAmount] = useState("");
  const [balanceAdjType, setBalanceAdjType] = useState<"credit" | "debit">("credit");
  const [balanceAdjReason, setBalanceAdjReason] = useState("");
  const [adjustingBalance, setAdjustingBalance] = useState(false);

  // Quick Notice Dispatch Modal
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [sellerForNotice, setSellerForNotice] = useState<any>(null);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");
  const [noticeType, setNoticeType] = useState("info");
  const [sendingNotice, setSendingNotice] = useState(false);

  // In-Drawer Settings Form State
  const [storeEditState, setStoreEditState] = useState<any>({});
  const [savingSettings, setSavingSettings] = useState(false);

  // Creative Additions: Trust Score Modal
  const [trustModalOpen, setTrustModalOpen] = useState(false);
  const [trustSeller, setTrustSeller] = useState<any>(null);

  // Creative Additions: Official Digital Accreditation Certificate
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [certificateSeller, setCertificateSeller] = useState<any>(null);

  // Creative Additions: Interactive Escrow & Settlement Simulator (Tab 3)
  const [simAmount, setSimAmount] = useState<number>(5000);
  const [simCommission, setSimCommission] = useState<number>(10);

  useEffect(() => {
    dispatch(getAllSellers() as any);
  }, [dispatch]);

  // Copy helper
  const handleCopy = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.info(`Copied ${fieldName} to clipboard`);
    setTimeout(() => setCopiedField(""), 2000);
  };

  // KPI Calculations
  const metrics = useMemo(() => {
    const total = sellers.length;
    const pending = sellers.filter(
      (s: any) => s.verificationStatus === "Pending" || (!s.isVerified && (s.tinNumber || s.businessLicense?.url))
    ).length;
    const verified = sellers.filter(
      (s: any) => s.isVerified || s.verificationStatus === "Verified"
    ).length;
    const suspended = sellers.filter(
      (s: any) => s.status === "suspended" || s.verificationStatus === "Rejected"
    ).length;
    const featured = sellers.filter((s: any) => s.isFeatured).length;
    const totalBalance = sellers.reduce(
      (acc: number, s: any) => acc + Number(s.availableBalance || 0) + Number(s.pendingBalance || 0),
      0
    );
    const totalEscrow = sellers.reduce(
      (acc: number, s: any) => acc + Number(s.pendingBalance || 0),
      0
    );

    return { total, pending, verified, suspended, featured, totalBalance, totalEscrow };
  }, [sellers]);

  // Filter & Sort Logic
  const filteredSellers = useMemo(() => {
    return sellers
      .filter((s: any) => {
        // Search Term
        const q = searchTerm.toLowerCase();
        const matchesSearch =
          !searchTerm ||
          s.name?.toLowerCase().includes(q) ||
          s.legalOwnerName?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          String(s.phoneNumber || "").toLowerCase().includes(q) ||
          s.tinNumber?.toLowerCase().includes(q) ||
          s.businessRegistrationNumber?.toLowerCase().includes(q) ||
          s.city?.toLowerCase().includes(q) ||
          s.subCity?.toLowerCase().includes(q);

        if (!matchesSearch) return false;

        // Status Filter
        const isStoreVerified = s.isVerified || s.verificationStatus === "Verified";
        const isPending =
          s.verificationStatus === "Pending" ||
          (!s.isVerified && (s.tinNumber || s.businessLicense?.url));
        const isSuspended = s.status === "suspended" || s.verificationStatus === "Rejected";

        if (filterStatus === "pending" && !isPending) return false;
        if (filterStatus === "verified" && !isStoreVerified) return false;
        if (filterStatus === "suspended" && !isSuspended) return false;
        if (filterStatus === "unverified" && (isStoreVerified || isPending)) return false;
        if (filterStatus === "featured" && !s.isFeatured) return false;

        // Business Entity Filter
        if (filterEntity !== "all" && s.businessType !== filterEntity) return false;

        // Region Filter
        if (filterRegion !== "all" && s.stateOrRegion !== filterRegion && s.city !== filterRegion)
          return false;

        // Subcity Filter
        if (filterSubCity !== "all" && s.subCity !== filterSubCity) return false;

        // Tax Filter
        if (filterTax === "vat" && !s.vatRegistered) return false;
        if (filterTax === "tot" && !s.totRegistered) return false;
        if (filterTax === "tin_only" && !s.tinNumber) return false;

        return true;
      })
      .sort((a: any, b: any) => {
        if (sortBy === "newest") return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        if (sortBy === "oldest") return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        if (sortBy === "balance")
          return (
            Number(b.availableBalance || 0) +
            Number(b.pendingBalance || 0) -
            (Number(a.availableBalance || 0) + Number(a.pendingBalance || 0))
          );
        if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
        return 0;
      });
  }, [sellers, searchTerm, filterStatus, filterEntity, filterRegion, filterSubCity, filterTax, sortBy]);

  // Load Dossier data when inspector opens
  const fetchSellerDossier = async (sellerId: string) => {
    setLoadingDossier(true);
    try {
      const res = await axios.get(`${server}/shop/admin-seller-dossier/${sellerId}`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        setDossierData(res.data.dossier);
      }
    } catch {
      // fallback
    } finally {
      setLoadingDossier(false);
    }
  };

  // Open Inspector Drawer
  const openInspector = (seller: any, defaultTab = "dossier") => {
    setSelectedSeller(seller);
    setInspectorTab(defaultTab);
    setChosenBadge(seller.badge || "Bronze Artisan");
    setCommissionRate(seller.commissionRate ?? 8);
    setDecisionMode(seller.verificationStatus === "Verified" ? "approve" : "approve");
    setVerificationNotes(seller.verificationNotes || "");
    setRejectionPreset("tin_invalid");
    setZoomLevel(1);
    setSimCommission(seller.commissionRate ?? 10);
    setSimAmount(5000);

    setStoreEditState({
      name: seller.name || "",
      phoneNumber: seller.phoneNumber || "",
      address: seller.address || "",
      city: seller.city || "Addis Ababa",
      subCity: seller.subCity || "",
      woreda: seller.woreda || "",
      landmark: seller.landmark || "",
      tinNumber: seller.tinNumber || "",
      vatRegistered: Boolean(seller.vatRegistered),
      totRegistered: Boolean(seller.totRegistered),
      taxOffice: seller.taxOffice || "",
      commissionRate: seller.commissionRate ?? 10,
      badge: seller.badge || "Bronze Artisan",
      isFeatured: Boolean(seller.isFeatured),
      status: seller.status || "active",
      addisAbabaRate: seller.shippingSettings?.addisAbabaRate ?? 150,
      regionalRate: seller.shippingSettings?.regionalRate ?? 300,
      freeShippingThreshold: seller.shippingSettings?.freeShippingThreshold ?? 3000,
      story: seller.story || "",
      returnPolicy: seller.returnPolicy || "",
    });

    if (seller.businessLicense?.url) {
      setActiveDocType("license");
    } else if (seller.idCard?.url) {
      setActiveDocType("idCard");
    } else {
      setActiveDocType("avatar");
    }

    setInspectorOpen(true);
    fetchSellerDossier(seller._id);
  };

  // Multi-select Handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredSellers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSellers.map((s: any) => s._id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Submit Bulk Action
  const handleBulkSubmit = async () => {
    if (selectedIds.length === 0) return;
    setBulkSubmitting(true);
    try {
      let payload: any = {};
      if (bulkActionType === "verify") {
        payload = { badge: bulkBadge, commissionRate: Number(bulkCommissionRate) };
      } else if (bulkActionType === "suspend") {
        payload = { reason: bulkReason || "Administrative suspension via bulk governance." };
      } else if (bulkActionType === "commission") {
        payload = { commissionRate: Number(bulkCommissionRate) };
      } else if (bulkActionType === "badge") {
        payload = { badge: bulkBadge };
      } else if (bulkActionType === "feature") {
        payload = { isFeatured: true };
      }

      const res = await axios.post(
        `${server}/shop/admin-bulk-sellers`,
        {
          sellerIds: selectedIds,
          action: bulkActionType,
          payload,
        },
        { withCredentials: true }
      );

      toast.success(res.data.message || "Bulk operation completed successfully!");
      setBulkActionModalOpen(false);
      setSelectedIds([]);
      dispatch(getAllSellers() as any);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Bulk action failed");
    } finally {
      setBulkSubmitting(false);
    }
  };

  // Submit Approval / Rejection from Inspector
  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e?.preventDefault();
    if (!selectedSeller) return;

    setSubmittingAction(true);
    try {
      let payload: any = {};

      if (decisionMode === "approve") {
        payload = {
          isVerified: true,
          verificationStatus: "Verified",
          badge: chosenBadge,
          commissionRate: Number(commissionRate),
          status: "active",
          verificationNotes:
            verificationNotes.trim() ||
            `Artisan verified by compliance administrator. Granted ${chosenBadge} badge.`,
        };
      } else if (decisionMode === "reject") {
        const presetObj = REJECTION_PRESETS.find((p) => p.id === rejectionPreset);
        const reasonText =
          verificationNotes.trim() ||
          presetObj?.text ||
          "Application did not meet compliance criteria.";

        payload = {
          isVerified: false,
          verificationStatus: "Rejected",
          status: "suspended",
          rejectionReason: reasonText,
          verificationNotes: reasonText,
        };
      } else if (decisionMode === "request_revision") {
        payload = {
          isVerified: false,
          verificationStatus: "Pending",
          status: "pending_verification",
          verificationNotes:
            verificationNotes.trim() ||
            "Additional document clarification requested by compliance administrator.",
        };
      }

      const res = await axios.put(
        `${server}/shop/admin-verify-seller/${selectedSeller._id}`,
        payload,
        { withCredentials: true }
      );

      toast.success(
        res.data.message ||
          (decisionMode === "approve"
            ? `Artisan ${selectedSeller.name} officially approved and verified!`
            : `Application updated for ${selectedSeller.name}`)
      );

      setInspectorOpen(false);
      setSelectedSeller(null);
      dispatch(getAllSellers() as any);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update seller verification status"
      );
    } finally {
      setSubmittingAction(false);
    }
  };

  // Quick 1-Click Verification from Table
  const handleQuickApprove = async (seller: any) => {
    try {
      await axios.put(
        `${server}/shop/admin-verify-seller/${seller._id}`,
        {
          isVerified: true,
          verificationStatus: "Verified",
          badge: seller.badge || "Bronze Artisan",
          status: "active",
          verificationNotes: "Quick verified by compliance administrator.",
        },
        { withCredentials: true }
      );
      toast.success(`Verified: ${seller.name}`);
      dispatch(getAllSellers() as any);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve seller");
    }
  };

  // Toggle Featured status
  const handleToggleFeatured = async (seller: any) => {
    const nextState = !seller.isFeatured;
    try {
      await axios.put(
        `${server}/shop/admin-verify-seller/${seller._id}`,
        { isFeatured: nextState },
        { withCredentials: true }
      );
      toast.success(
        nextState
          ? `â­ ${seller.name} is now a Featured Boutique!`
          : `${seller.name} removed from featured boutiques.`
      );
      dispatch(getAllSellers() as any);
    } catch (error: any) {
      toast.error("Failed to update featured status");
    }
  };

  // Quick Toggle Suspend / Active
  const handleToggleStatus = async (seller: any) => {
    const newStatus = seller.status === "suspended" ? "active" : "suspended";
    try {
      await axios.put(
        `${server}/shop/admin-verify-seller/${seller._id}`,
        { status: newStatus },
        { withCredentials: true }
      );
      toast.info(
        `Store ${seller.name} ${newStatus === "suspended" ? "suspended" : "reactivated"}`
      );
      dispatch(getAllSellers() as any);
    } catch (error: any) {
      toast.error("Failed to update status");
    }
  };

  // Submit Balance Adjustment
  const handleExecuteBalanceAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerForBalance || !balanceAdjAmount) return;
    const num = Number(balanceAdjAmount);
    if (isNaN(num) || num <= 0) {
      toast.error("Please provide a valid adjustment amount!");
      return;
    }

    setAdjustingBalance(true);
    try {
      await axios.put(
        `${server}/shop/admin-verify-seller/${sellerForBalance._id}`,
        {
          balanceAdjustment: {
            amount: num,
            type: balanceAdjType,
            reason: balanceAdjReason.trim() || `Administrative ${balanceAdjType} adjustment`,
          },
        },
        { withCredentials: true }
      );

      toast.success(`Balance adjusted: ${balanceAdjType === "credit" ? "+" : "-"}${num.toLocaleString()} ETB`);
      setBalanceModalOpen(false);
      setSellerForBalance(null);
      setBalanceAdjAmount("");
      setBalanceAdjReason("");
      dispatch(getAllSellers() as any);
      if (inspectorOpen && selectedSeller?._id === sellerForBalance._id) {
        fetchSellerDossier(sellerForBalance._id);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to adjust balance");
    } finally {
      setAdjustingBalance(false);
    }
  };

  // Submit Official Notice
  const handleSendNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerForNotice || !noticeTitle.trim() || !noticeMessage.trim()) {
      toast.error("Please fill in both title and notice message!");
      return;
    }

    setSendingNotice(true);
    try {
      await axios.post(
        `${server}/shop/admin-seller-send-notice/${sellerForNotice._id}`,
        {
          title: noticeTitle.trim(),
          message: noticeMessage.trim(),
          noticeType,
        },
        { withCredentials: true }
      );

      toast.success(`Official notice transmitted to ${sellerForNotice.name}`);
      setNoticeModalOpen(false);
      setSellerForNotice(null);
      setNoticeTitle("");
      setNoticeMessage("");
      if (inspectorOpen && selectedSeller?._id === sellerForNotice._id) {
        fetchSellerDossier(sellerForNotice._id);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to transmit notice");
    } finally {
      setSendingNotice(false);
    }
  };

  // Save Settings from Drawer
  const handleSaveDrawerSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeller) return;

    setSavingSettings(true);
    try {
      await axios.put(
        `${server}/shop/admin-verify-seller/${selectedSeller._id}`,
        {
          ...storeEditState,
          shippingSettings: {
            ...(selectedSeller.shippingSettings || {}),
            addisAbabaRate: Number(storeEditState.addisAbabaRate || 150),
            regionalRate: Number(storeEditState.regionalRate || 300),
            freeShippingThreshold: Number(storeEditState.freeShippingThreshold || 3000),
          },
        },
        { withCredentials: true }
      );

      toast.success(`Updated storefront settings for ${selectedSeller.name}!`);
      dispatch(getAllSellers() as any);
      fetchSellerDossier(selectedSeller._id);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update settings");
    } finally {
      setSavingSettings(false);
    }
  };

  // Delete Seller
  const handleDelete = async () => {
    if (!sellerToDelete) return;
    try {
      const res = await axios.delete(`${server}/shop/delete-seller/${sellerToDelete._id}`, {
        withCredentials: true,
      });
      toast.success(res.data.message || "Store account removed successfully!");
      setDeleteModalOpen(false);
      setSellerToDelete(null);
      dispatch(getAllSellers() as any);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete seller");
    }
  };

  // Export Registry CSV
  const handleExportCSV = () => {
    if (!sellers.length) return;
    const headers = [
      "ID",
      "Store Name",
      "Legal Owner",
      "Email",
      "Phone",
      "Business Type",
      "TIN",
      "Trade License",
      "Region",
      "City",
      "SubCity",
      "Verification Status",
      "Badge",
      "Commission Rate (%)",
      "Featured",
      "Available Balance (ETB)",
      "Escrow Balance (ETB)",
      "Created At",
    ];

    const rows = filteredSellers.map((s: any) => [
      `"${s._id}"`,
      `"${s.name || ""}"`,
      `"${s.legalOwnerName || ""}"`,
      `"${s.email || ""}"`,
      `"${s.phoneNumber || ""}"`,
      `"${s.businessType || ""}"`,
      `"${s.tinNumber || ""}"`,
      `"${s.businessRegistrationNumber || ""}"`,
      `"${s.stateOrRegion || ""}"`,
      `"${s.city || ""}"`,
      `"${s.subCity || ""}"`,
      `"${s.verificationStatus || ""}"`,
      `"${s.badge || ""}"`,
      `"${s.commissionRate ?? 10}"`,
      `"${s.isFeatured ? "Yes" : "No"}"`,
      `"${s.availableBalance || 0}"`,
      `"${s.pendingBalance || 0}"`,
      `"${new Date(s.createdAt).toISOString()}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Ethiopian_Artisan_Registry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Merchant registry downloaded as CSV!");
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. TOP HEADER & COMPLIANCE GOVERNANCE METRICS */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-stone-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2">
              <BsShieldCheck size={14} /> Ministry of Trade & Revenue Regulatory Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight">
              Artisan Merchant & Legal Compliance
            </h1>
            <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
              Verify 10-digit Ethiopian TIN numbers, inspect official Trade License and Kebele ID
              uploads, grant authenticated artisan trust badges, and govern domestic merchant
              settlements.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition shadow-2xs"
            >
              <BsDownload size={13} />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => dispatch(getAllSellers() as any)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm"
            >
              <RxReload size={14} className={isLoading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Governance KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 pt-5">
          {/* Total Artisans */}
          <div
            onClick={() => setFilterStatus("all")}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              filterStatus === "all"
                ? "bg-stone-900 text-white border-stone-900 shadow-md"
                : "bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider opacity-75">
                Total Stores
              </span>
              <BsShop size={16} />
            </div>
            <div className="text-2xl font-bold font-serif mt-2">{metrics.total}</div>
            <div className="text-[10px] opacity-75 mt-0.5">Registered Boutiques</div>
          </div>

          {/* Pending Review */}
          <div
            onClick={() => setFilterStatus("pending")}
            className={`p-4 rounded-2xl border cursor-pointer transition relative overflow-hidden ${
              filterStatus === "pending"
                ? "bg-amber-600 text-white border-amber-600 shadow-md"
                : "bg-amber-50/70 hover:bg-amber-100/70 border-amber-200 text-amber-900"
            }`}
          >
            {metrics.pending > 0 && (
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">
                Pending KYC
              </span>
              <BsClockHistory size={16} />
            </div>
            <div className="text-2xl font-bold font-serif mt-2">{metrics.pending}</div>
            <div className="text-[10px] opacity-80 mt-0.5">Awaiting Review</div>
          </div>

          {/* Verified Artisans */}
          <div
            onClick={() => setFilterStatus("verified")}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              filterStatus === "verified"
                ? "bg-emerald-700 text-white border-emerald-700 shadow-md"
                : "bg-emerald-50/70 hover:bg-emerald-100/70 border-emerald-200 text-emerald-900"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">
                Verified
              </span>
              <BsShieldCheck size={16} />
            </div>
            <div className="text-2xl font-bold font-serif mt-2">{metrics.verified}</div>
            <div className="text-[10px] opacity-80 mt-0.5">
              {metrics.total ? Math.round((metrics.verified / metrics.total) * 100) : 0}% Authenticated
            </div>
          </div>

          {/* Featured Stores */}
          <div
            onClick={() => setFilterStatus("featured")}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              filterStatus === "featured"
                ? "bg-amber-500 text-white border-amber-500 shadow-md"
                : "bg-amber-50/50 hover:bg-amber-100/50 border-amber-200 text-amber-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">
                Featured
              </span>
              <BsStarFill size={16} className="text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-serif mt-2">{metrics.featured}</div>
            <div className="text-[10px] opacity-80 mt-0.5">Artisan Spotlight</div>
          </div>

          {/* Suspended / Flagged */}
          <div
            onClick={() => setFilterStatus("suspended")}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              filterStatus === "suspended"
                ? "bg-rose-700 text-white border-rose-700 shadow-md"
                : "bg-rose-50/70 hover:bg-rose-100/70 border-rose-200 text-rose-900"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">
                Suspended
              </span>
              <BsShieldExclamation size={16} />
            </div>
            <div className="text-2xl font-bold font-serif mt-2">{metrics.suspended}</div>
            <div className="text-[10px] opacity-80 mt-0.5">Rejected / Flagged</div>
          </div>

          {/* Escrow Balances */}
          <div className="p-4 rounded-2xl border bg-stone-50 border-stone-200 text-stone-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                In Escrow
              </span>
              <BsCashCoin size={16} className="text-amber-600" />
            </div>
            <div className="text-xl font-bold font-mono mt-2 truncate">
              {Number(metrics.totalEscrow).toLocaleString()} <span className="text-xs">ETB</span>
            </div>
            <div className="text-[10px] text-stone-500 mt-0.5">Orders in Transit</div>
          </div>
        </div>
      </div>

      {/* 2. ADVANCED FILTER & SEARCH BAR */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-stone-200 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <BsSearch className="absolute left-3.5 top-3.5 text-stone-400" size={14} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by boutique, artisan representative, TIN, trade license, sub-city..."
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          {/* SubCity Selector */}
          <select
            value={filterSubCity}
            onChange={(e) => setFilterSubCity(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl border border-stone-300 text-xs font-semibold bg-white text-stone-700"
          >
            <option value="all">All Addis Ababa Sub-cities</option>
            {ETHIOPIAN_SUBCITIES.map((sc) => (
              <option key={sc} value={sc}>
                {sc}
              </option>
            ))}
          </select>

          {/* Region Selector */}
          <select
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl border border-stone-300 text-xs font-semibold bg-white text-stone-700"
          >
            <option value="all">All Regional States</option>
            <option value="Addis Ababa">Addis Ababa</option>
            <option value="Oromia">Oromia</option>
            <option value="Amhara">Amhara</option>
            <option value="Sidama">Sidama</option>
            <option value="Dire Dawa">Dire Dawa</option>
            <option value="Tigray">Tigray</option>
            <option value="Harari">Harari</option>
          </select>

          {/* Tax Status */}
          <select
            value={filterTax}
            onChange={(e) => setFilterTax(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl border border-stone-300 text-xs font-semibold bg-white text-stone-700"
          >
            <option value="all">All Tax Registrations</option>
            <option value="vat">VAT Registered (15%)</option>
            <option value="tot">TOT Registered (2%)</option>
            <option value="tin_only">TIN Verified Only</option>
          </select>

          {/* Entity Selector */}
          <select
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl border border-stone-300 text-xs font-semibold bg-white text-stone-700"
          >
            <option value="all">All Entity Types</option>
            <option value="Individual Artisan">Individual Artisan</option>
            <option value="Registered Boutique">Registered Boutique</option>
            <option value="Weaving Cooperative">Weaving Cooperative</option>
            <option value="Traditional Crafts Workshop">Traditional Crafts Workshop</option>
            <option value="Fashion House">Fashion House</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl border border-stone-300 text-xs font-semibold bg-white text-stone-700"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="balance">Highest Balance</option>
            <option value="name">Store Name (A-Z)</option>
          </select>
        </div>

        {/* BULK ACTIONS FLOATING TOOLBAR */}
        {selectedIds.length > 0 && (
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-300 flex flex-wrap items-center justify-between gap-3 text-xs animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-900 px-2.5 py-1 rounded-xl bg-amber-200">
                {selectedIds.length} of {filteredSellers.length} merchants selected
              </span>
              <button
                onClick={() => setSelectedIds([])}
                className="text-stone-500 hover:text-stone-800 underline text-[11px]"
              >
                Clear Selection
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setBulkActionType("verify");
                  setBulkActionModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition shadow-2xs"
              >
                Bulk Verify
              </button>
              <button
                onClick={() => {
                  setBulkActionType("commission");
                  setBulkActionModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-bold transition shadow-2xs"
              >
                Set Commission
              </button>
              <button
                onClick={() => {
                  setBulkActionType("badge");
                  setBulkActionModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition shadow-2xs"
              >
                Assign Badge
              </button>
              <button
                onClick={() => {
                  setBulkActionType("suspend");
                  setBulkActionModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold transition shadow-2xs"
              >
                Bulk Suspend
              </button>
              <button
                onClick={() => {
                  setBulkActionType("activate");
                  setBulkActionModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold transition shadow-2xs"
              >
                Reactivate
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. MERCHANTS COMPLIANCE TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-stone-500 text-xs flex flex-col items-center justify-center">
            <RxReload className="animate-spin text-amber-600 mb-3" size={24} />
            <span>Loading registered artisan accounts...</span>
          </div>
        ) : filteredSellers.length === 0 ? (
          <div className="p-16 text-center text-stone-500 text-xs">
            <BsShop className="mx-auto text-stone-300 mb-3" size={32} />
            <p className="font-semibold text-stone-700">No artisan stores match your filter criteria.</p>
            <p className="text-stone-400 mt-1">Try clearing search keywords or changing filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-600 text-[11px] uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="px-4 py-3.5 w-10 text-center">
                    <button
                      onClick={handleToggleSelectAll}
                      className="text-stone-500 hover:text-stone-800 transition"
                      title="Select / Deselect All"
                    >
                      {selectedIds.length === filteredSellers.length && filteredSellers.length > 0 ? (
                        <BsCheckSquare size={16} className="text-amber-700" />
                      ) : (
                        <BsSquare size={16} />
                      )}
                    </button>
                  </th>
                  <th className="px-5 py-3.5">Artisan Boutique & Owner</th>
                  <th className="px-5 py-3.5">Entity & Craft</th>
                  <th className="px-5 py-3.5">TIN & Location</th>
                  <th className="px-5 py-3.5">KYC Documents</th>
                  <th className="px-5 py-3.5">Verification & Trust</th>
                  <th className="px-5 py-3.5">Balances</th>
                  <th className="px-5 py-3.5 text-right">Actions & Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredSellers.map((seller: any) => {
                  const isStoreVerified =
                    seller.isVerified || seller.verificationStatus === "Verified";
                  const isPending =
                    seller.verificationStatus === "Pending" ||
                    (!seller.isVerified && (seller.tinNumber || seller.businessLicense?.url));
                  const isSuspended =
                    seller.status === "suspended" || seller.verificationStatus === "Rejected";

                  const hasLicense = Boolean(seller.businessLicense?.url);
                  const hasId = Boolean(seller.idCard?.url);
                  const docCount = (hasLicense ? 1 : 0) + (hasId ? 1 : 0);
                  const isSelected = selectedIds.includes(seller._id);

                  return (
                    <tr
                      key={seller._id}
                      className={`hover:bg-amber-50/30 transition-colors ${
                        isSelected ? "bg-amber-50/50" : isPending ? "bg-amber-50/20" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => handleToggleSelectOne(seller._id)}
                          className="text-stone-400 hover:text-stone-800 transition"
                        >
                          {isSelected ? (
                            <BsCheckSquare size={16} className="text-amber-700" />
                          ) : (
                            <BsSquare size={16} />
                          )}
                        </button>
                      </td>

                      {/* Name & Representative */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={seller.avatar?.url || "/photo.jpg"}
                            alt={seller.name}
                            className="w-11 h-11 rounded-2xl object-cover border border-stone-200 shadow-2xs"
                          />
                          <div>
                            <div className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                              <span>{seller.name}</span>
                              <button
                                onClick={() => handleToggleFeatured(seller)}
                                title={seller.isFeatured ? "Featured Boutique (Click to unfeature)" : "Click to Feature"}
                                className="text-amber-400 hover:scale-110 transition-transform"
                              >
                                {seller.isFeatured ? <BsStarFill size={13} /> : <BsStar size={13} className="text-stone-300" />}
                              </button>
                              {seller.badge && (
                                <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-mono font-medium">
                                  {seller.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-stone-500 font-medium">
                              Rep: {seller.legalOwnerName || seller.name}
                            </div>
                            <div className="text-[11px] text-stone-400 font-mono">
                              {seller.email} â€¢ {seller.phoneNumber}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Business Entity & Craft */}
                      <td className="px-5 py-3.5 text-xs text-stone-700">
                        <span className="font-semibold block text-stone-900">
                          {seller.businessType || "Individual Artisan"}
                        </span>
                        <span className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                          {seller.craftSpecialization?.join(", ") || "Authentic Ethiopian Handcraft"}
                        </span>
                        <div className="text-[10px] text-stone-400 mt-1">
                          Commission: <span className="font-bold text-stone-700">{seller.commissionRate ?? 10}%</span>
                        </div>
                      </td>

                      {/* TIN & Location */}
                      <td className="px-5 py-3.5 text-xs">
                        <div className="flex items-center gap-1.5 font-mono">
                          {seller.tinNumber ? (
                            <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              TIN: {seller.tinNumber}
                            </span>
                          ) : (
                            <span className="text-stone-400 italic">No TIN</span>
                          )}
                        </div>
                        <div className="text-stone-500 text-[11px] mt-1 flex items-center gap-1">
                          <BsGeoAlt size={11} className="text-amber-700" />
                          <span>
                            {seller.city || "Addis Ababa"}
                            {seller.subCity ? ` â€¢ ${seller.subCity}` : ""}
                          </span>
                        </div>
                      </td>

                      {/* Uploaded Documents Indicator */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold ${
                              docCount === 2
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : docCount === 1
                                ? "bg-amber-50 text-amber-800 border border-amber-200"
                                : "bg-stone-100 text-stone-500"
                            }`}
                          >
                            <BsFileEarmarkText size={13} />
                            <span>{docCount}/2 Scans</span>
                          </span>
                        </div>
                        <div className="text-[10px] text-stone-400 mt-0.5">
                          {hasLicense ? "License âœ“" : "License âœ—"} â€¢ {hasId ? "ID âœ“" : "ID âœ—"}
                        </div>
                      </td>

                      {/* Verification Status & Dynamic Trust Score */}
                      <td className="px-5 py-3.5 space-y-1.5">
                        <div>
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              isStoreVerified
                                ? "bg-emerald-100 text-emerald-800"
                                : isPending
                                ? "bg-amber-100 text-amber-800 ring-1 ring-amber-400"
                                : isSuspended
                                ? "bg-rose-100 text-rose-800"
                                : "bg-stone-100 text-stone-600"
                            }`}
                          >
                            {isStoreVerified ? (
                              <BsShieldCheck size={13} />
                            ) : isPending ? (
                              <BsClockHistory size={13} />
                            ) : (
                              <BsShieldExclamation size={13} />
                            )}
                            <span>
                              {seller.verificationStatus || (isStoreVerified ? "Verified" : "Unverified")}
                            </span>
                          </span>
                        </div>

                        {/* Dynamic Trust Score Button */}
                        {(() => {
                          const trustInfo = computeArtisanTrustScore(seller);
                          return (
                            <div>
                              <button
                                onClick={() => {
                                  setTrustSeller(seller);
                                  setTrustModalOpen(true);
                                }}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border transition hover:opacity-90 ${trustInfo.tierColor}`}
                                title="Click to audit Trust Score breakdown"
                              >
                                <span>{trustInfo.badgeIcon}</span>
                                <span>Trust: {trustInfo.score}/100</span>
                              </button>
                            </div>
                          );
                        })()}
                      </td>

                      {/* Financial Balance */}
                      <td className="px-5 py-3.5 font-bold text-stone-900 text-xs">
                        <div>{Number(seller.availableBalance || 0).toLocaleString()} ETB</div>
                        {seller.pendingBalance > 0 && (
                          <div className="text-[10px] text-amber-700 font-normal">
                            +{Number(seller.pendingBalance).toLocaleString()} escrow
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 360-Degree Inspector Button */}
                          <button
                            onClick={() => openInspector(seller, "dossier")}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs"
                            title="Inspect 360° Merchant Dossier"
                          >
                            <BsEye size={13} />
                            <span>Manage</span>
                          </button>

                          {/* Official Artisan Accreditation Certificate */}
                          <button
                            onClick={() => {
                              setCertificateSeller(seller);
                              setCertificateModalOpen(true);
                            }}
                            className="p-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 transition"
                            title="Generate Official Artisan Accreditation Certificate"
                          >
                            <BsAward size={15} />
                          </button>

                          {/* Quick 1-click Approve for Pending */}
                          {isPending && (
                            <button
                              onClick={() => handleQuickApprove(seller)}
                              className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
                              title="1-Click Approve"
                            >
                              <BsCheck2Circle size={16} />
                            </button>
                          )}

                          {/* Quick Balance Adjustment */}
                          <button
                            onClick={() => {
                              setSellerForBalance(seller);
                              setBalanceModalOpen(true);
                            }}
                            className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
                            title="Adjust Available Balance (Credit/Debit)"
                          >
                            <BsCashCoin size={15} />
                          </button>

                          {/* Send Official Notice */}
                          <button
                            onClick={() => {
                              setSellerForNotice(seller);
                              setNoticeModalOpen(true);
                            }}
                            className="p-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 transition"
                            title="Transmit Official Platform Notice"
                          >
                            <BsMegaphone size={14} />
                          </button>

                          {/* View Merchant Crafts in Admin Products */}
                          <Link
                            to={`/admin-products?seller=${seller._id}`}
                            className="p-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition"
                            title="Filter Products by this Artisan"
                          >
                            <FiShoppingBag size={15} />
                          </Link>

                          {/* Preview Public Boutique Storefront */}
                          <Link
                            to={`/shop/preview/${seller._id}`}
                            target="_blank"
                            className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
                            title="View Public Boutique Storefront"
                          >
                            <FiExternalLink size={14} />
                          </Link>

                          {/* Quick Toggle Suspend / Active */}
                          <button
                            onClick={() => handleToggleStatus(seller)}
                            className={`p-1.5 rounded-xl transition ${
                              seller.status === "suspended"
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                            }`}
                            title={seller.status === "suspended" ? "Reactivate Store" : "Suspend Store"}
                          >
                            <BsSliders size={14} />
                          </button>

                          {/* Delete Store */}
                          <button
                            onClick={() => {
                              setSellerToDelete(seller);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Remove Store"
                          >
                            <BsTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. EXPANDED 360-DEGREE MERCHANT DOSSIER & COMPLIANCE MODAL */}
      {inspectorOpen && selectedSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-5xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-stone-200 animate-scaleUp">
            {/* Modal Header */}
            <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedSeller.avatar?.url || "/photo.jpg"}
                  alt={selectedSeller.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-stone-700 shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold font-serif">{selectedSeller.name}</h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {selectedSeller.badge || "Bronze Artisan"}
                    </span>
                    {selectedSeller.isFeatured && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-stone-900">
                        â­ Featured
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-2">
                    <span>ID: {selectedSeller._id}</span>
                    <span>â€¢</span>
                    <span>{selectedSeller.email}</span>
                    <span>â€¢</span>
                    <span>{selectedSeller.phoneNumber}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCertificateSeller(selectedSeller);
                    setCertificateModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition shadow-2xs"
                  title="Generate Official Accreditation Certificate"
                >
                  <BsAward size={14} />
                  <span>Accreditation Certificate</span>
                </button>
                <Link
                  to={`/shop/preview/${selectedSeller._id}`}
                  target="_blank"
                  className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 transition"
                >
                  <FiExternalLink size={13} />
                  <span>Public Store</span>
                </Link>
                <button
                  onClick={() => setInspectorOpen(false)}
                  className="p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition"
                >
                  <RxCross1 size={18} />
                </button>
              </div>
            </div>

            {/* Inspector Navigation Tabs */}
            <div className="flex items-center border-b border-stone-200 bg-stone-50 px-6 gap-2 text-xs font-bold overflow-x-auto">
              {[
                { id: "dossier", label: "1. Legal Dossier & Tax", icon: <BsBuildingCheck /> },
                {
                  id: "documents",
                  label: `2. Document Lightbox (${
                    (selectedSeller.businessLicense?.url ? 1 : 0) +
                    (selectedSeller.idCard?.url ? 1 : 0)
                  }/2)`,
                  icon: <BsFileEarmarkText />,
                },
                { id: "payout", label: "3. Payout & Settlements", icon: <BsBank /> },
                {
                  id: "products",
                  label: `4. Crafts Catalog (${dossierData?.products?.length || 0})`,
                  icon: <FiLayers />,
                },
                {
                  id: "orders",
                  label: `5. Customer Orders (${dossierData?.orders?.length || 0})`,
                  icon: <FiShoppingBag />,
                },
                { id: "notices", label: "6. Official Notices", icon: <BsMegaphone /> },
                { id: "settings", label: "7. Storefront Settings", icon: <BsSliders /> },
                { id: "decision", label: "8. Governance Decision", icon: <BsShieldCheck /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setInspectorTab(tab.id)}
                  className={`py-3.5 px-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
                    inspectorTab === tab.id
                      ? "border-amber-600 text-amber-800"
                      : "border-transparent text-stone-500 hover:text-stone-900"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Modal Body Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-stone-800">
              {/* TAB 1: LEGAL DOSSIER & TAX */}
              {inspectorTab === "dossier" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Entity & Registration Box */}
                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
                      <span className="font-bold text-stone-900 text-sm block border-b border-stone-200 pb-1.5 flex items-center justify-between">
                        <span>Commercial Entity Profile</span>
                        <span className="text-[10px] text-amber-800 font-mono">
                          {selectedSeller.businessType}
                        </span>
                      </span>
                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-stone-500">Legal Business Name:</span>
                          <span className="font-semibold text-stone-800 font-mono">
                            {selectedSeller.legalBusinessName || selectedSeller.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">Representative / Manager:</span>
                          <span className="font-semibold text-stone-800">
                            {selectedSeller.legalOwnerName || selectedSeller.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">ID Verification Type:</span>
                          <span className="font-semibold text-stone-800 font-mono">
                            {selectedSeller.idType || "Kebele ID"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">ID Number:</span>
                          <span className="font-mono text-stone-800 font-bold">
                            {selectedSeller.idNumber || "Not recorded"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">Trade License / Reg No:</span>
                          <span className="font-mono text-stone-800 font-bold">
                            {selectedSeller.businessRegistrationNumber || "Not specified"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tax Compliance Box */}
                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
                      <span className="font-bold text-stone-900 text-sm block border-b border-stone-200 pb-1.5 flex items-center justify-between">
                        <span>Ethiopian Tax & Revenues</span>
                        <span className="text-[10px] text-emerald-800 font-bold">
                          Ministry of Revenues
                        </span>
                      </span>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-stone-500">10-Digit TIN:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {selectedSeller.tinNumber || "Not Registered"}
                            </span>
                            {selectedSeller.tinNumber && (
                              <button
                                onClick={() => handleCopy(selectedSeller.tinNumber, "TIN")}
                                className="text-stone-400 hover:text-stone-700 transition"
                                title="Copy 10-Digit TIN"
                              >
                                {copiedField === "TIN" ? <FiCheck className="text-emerald-600" size={13} /> : <FiCopy size={13} />}
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">VAT Status (15%):</span>
                          <span className="font-semibold">
                            {selectedSeller.vatRegistered ? (
                              <span className="text-emerald-700 font-bold">VAT Registered ({selectedSeller.vatNumber || "Active"})</span>
                            ) : (
                              <span className="text-stone-500">Non-VAT</span>
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">TOT Status (2%):</span>
                          <span className="font-semibold">
                            {selectedSeller.totRegistered ? "TOT Registered" : "Non-TOT"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">Tax Authority Branch:</span>
                          <span className="text-stone-700 font-medium">
                            {selectedSeller.taxOffice || "Federal / Regional Office"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Location & Workshop Address */}
                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
                      <span className="font-bold text-stone-900 text-sm block border-b border-stone-200 pb-1.5 flex items-center justify-between">
                        <span>Artisan Workshop Address</span>
                        <span className="text-[10px] text-amber-700">Addis Ababa & Regions</span>
                      </span>
                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-stone-500">Region / City:</span>
                          <span className="font-semibold text-stone-800">
                            {selectedSeller.stateOrRegion || selectedSeller.city || "Addis Ababa"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">Addis Ababa Sub-city:</span>
                          <span className="font-semibold text-stone-800 font-mono">
                            {selectedSeller.subCity || "Kirkos / Central"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">Woreda / Kebele:</span>
                          <span className="text-stone-800">Woreda {selectedSeller.woreda || "03"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">Physical Workshop Location:</span>
                          <span className="text-stone-700 line-clamp-1">{selectedSeller.address}</span>
                        </div>
                      </div>
                    </div>

                    {/* Performance & Fulfillment SLA */}
                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
                      <span className="font-bold text-stone-900 text-sm block border-b border-stone-200 pb-1.5">
                        Artisan Performance & SLA
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="p-2 rounded-xl bg-white border border-stone-200">
                          <div className="text-[10px] text-stone-500 font-medium">Fulfillment Rate</div>
                          <div className="text-base font-bold text-emerald-700 mt-0.5">
                            {selectedSeller.performanceMetrics?.fulfillmentRate ?? 100}%
                          </div>
                        </div>
                        <div className="p-2 rounded-xl bg-white border border-stone-200">
                          <div className="text-[10px] text-stone-500 font-medium">On-Time Dispatch</div>
                          <div className="text-base font-bold text-emerald-700 mt-0.5">
                            {selectedSeller.performanceMetrics?.onTimeDeliveryRate ?? 98}%
                          </div>
                        </div>
                        <div className="p-2 rounded-xl bg-white border border-stone-200">
                          <div className="text-[10px] text-stone-500 font-medium">Customer Rating</div>
                          <div className="text-base font-bold text-amber-600 mt-0.5">
                            {selectedSeller.ratings ?? 5.0} â˜…
                          </div>
                        </div>
                        <div className="p-2 rounded-xl bg-white border border-stone-200">
                          <div className="text-[10px] text-stone-500 font-medium">Disputes Logged</div>
                          <div className="text-base font-bold text-stone-700 mt-0.5">
                            {selectedSeller.performanceMetrics?.disputeCount ?? 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Heritage Story & Cultural Lineage */}
                  {selectedSeller.story && (
                    <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-2">
                      <span className="font-bold text-amber-950 text-xs block">
                        Cultural Heritage & Artisan Lineage
                      </span>
                      <p className="text-stone-700 leading-relaxed text-xs">
                        {selectedSeller.story}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: DOCUMENT LIGHTBOX & VISUAL INSPECTOR */}
              {inspectorTab === "documents" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between bg-stone-100 p-2 rounded-2xl">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setActiveDocType("license")}
                        className={`px-3 py-1.5 rounded-xl font-bold transition ${
                          activeDocType === "license"
                            ? "bg-white text-stone-900 shadow-xs"
                            : "text-stone-600 hover:text-stone-900"
                        }`}
                      >
                        Trade License Scan {selectedSeller.businessLicense?.url && "âœ“"}
                      </button>
                      <button
                        onClick={() => setActiveDocType("idCard")}
                        className={`px-3 py-1.5 rounded-xl font-bold transition ${
                          activeDocType === "idCard"
                            ? "bg-white text-stone-900 shadow-xs"
                            : "text-stone-600 hover:text-stone-900"
                        }`}
                      >
                        Kebele / National ID {selectedSeller.idCard?.url && "âœ“"}
                      </button>
                      <button
                        onClick={() => setActiveDocType("avatar")}
                        className={`px-3 py-1.5 rounded-xl font-bold transition ${
                          activeDocType === "avatar"
                            ? "bg-white text-stone-900 shadow-xs"
                            : "text-stone-600 hover:text-stone-900"
                        }`}
                      >
                        Store Avatar & Branding
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 text-stone-600">
                      <button
                        onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
                        className="p-1.5 rounded-lg hover:bg-stone-200 transition"
                        title="Zoom In"
                      >
                        <BsZoomIn size={14} />
                      </button>
                      <button
                        onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.5))}
                        className="p-1.5 rounded-lg hover:bg-stone-200 transition"
                        title="Zoom Out"
                      >
                        <BsZoomOut size={14} />
                      </button>
                      <button
                        onClick={() => setZoomLevel(1)}
                        className="px-2 py-1 rounded-lg text-[10px] font-mono hover:bg-stone-200 transition"
                      >
                        {Math.round(zoomLevel * 100)}%
                      </button>
                    </div>
                  </div>

                  {/* Document Display Area */}
                  <div className="relative min-h-[380px] max-h-[460px] bg-stone-900 rounded-2xl flex items-center justify-center overflow-hidden border border-stone-700">
                    {(() => {
                      const currentUrl =
                        activeDocType === "license"
                          ? selectedSeller.businessLicense?.url
                          : activeDocType === "idCard"
                          ? selectedSeller.idCard?.url
                          : selectedSeller.avatar?.url;

                      if (!currentUrl) {
                        return (
                          <div className="text-center text-stone-400 p-8 space-y-2">
                            <BsFileEarmarkText size={40} className="mx-auto text-stone-600" />
                            <div className="font-bold text-stone-300">Document Scan Not Uploaded</div>
                            <p className="text-xs max-w-sm mx-auto text-stone-500">
                              Artisan has not yet provided this document. You can request a compliance
                              resubmission in the Governance Decision tab.
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="overflow-auto max-h-[440px] w-full h-full flex items-center justify-center p-4">
                          <img
                            src={currentUrl}
                            alt="Document Scan"
                            style={{ transform: `scale(${zoomLevel})`, transition: "transform 0.15s ease-out" }}
                            className="max-h-[400px] object-contain rounded-lg shadow-2xl"
                          />
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* TAB 3: PAYOUT & SETTLEMENTS */}
              {inspectorTab === "payout" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                      <div className="text-[10px] uppercase font-bold text-emerald-700">Cleared Available</div>
                      <div className="text-2xl font-bold font-mono mt-1">
                        {Number(selectedSeller.availableBalance || 0).toLocaleString()} <span className="text-xs">ETB</span>
                      </div>
                      <div className="text-[10px] text-emerald-600 mt-1">Eligible for disbursal</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950">
                      <div className="text-[10px] uppercase font-bold text-amber-700">Locked In Escrow</div>
                      <div className="text-2xl font-bold font-mono mt-1">
                        {Number(selectedSeller.pendingBalance || 0).toLocaleString()} <span className="text-xs">ETB</span>
                      </div>
                      <div className="text-[10px] text-amber-600 mt-1">Releases upon order delivery</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900">
                      <div className="text-[10px] uppercase font-bold text-stone-500">Lifetime Disbursed</div>
                      <div className="text-2xl font-bold font-mono mt-1">
                        {Number(selectedSeller.totalWithdrawn || 0).toLocaleString()} <span className="text-xs">ETB</span>
                      </div>
                      <div className="text-[10px] text-stone-400 mt-1">Total completed payouts</div>
                    </div>
                  </div>

                  {/* Registered Payout Accounts */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                    <span className="font-bold text-stone-900 text-sm block border-b border-stone-200 pb-2">
                      Registered Ethiopian Payout Channels
                    </span>
                    {selectedSeller.payoutMethods?.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedSeller.payoutMethods.map((pm: any, idx: number) => (
                          <div key={idx} className="p-3 bg-white rounded-xl border border-stone-200 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-stone-900">{pm.methodType}</span>
                              {pm.isDefault && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="text-stone-600 font-mono text-xs">
                              Holder: <span className="font-semibold text-stone-800">{pm.accountName}</span>
                            </div>
                            {pm.accountNumber && (
                              <div className="text-stone-500 font-mono text-[11px]">
                                Account: {pm.accountNumber}
                              </div>
                            )}
                            {pm.phoneNumber && (
                              <div className="text-stone-500 font-mono text-[11px]">
                                Telebirr/Phone: {pm.phoneNumber}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-stone-500 italic p-3 bg-white rounded-xl border border-stone-200">
                        No custom payout methods registered yet. Legacy method: {selectedSeller.withdrawMethod?.bankName || "Telebirr"}
                      </div>
                    )}
                  </div>

                  {/* Interactive Escrow, Tax & Settlement Simulator Widget */}
                  <div className="p-5 rounded-3xl bg-stone-900 text-white border border-stone-800 space-y-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-800">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 font-bold">
                          <BsCalculator size={18} />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm font-serif text-amber-100">
                            Interactive Escrow, Tax & Settlement Simulator
                          </h4>
                          <p className="text-[11px] text-stone-400">
                            Simulate hypothetical customer order cash flow and fee deductions for {selectedSeller.name}
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-500/30">
                        Live Simulation Engine
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                      {/* Left: Interactive Controls */}
                      <div className="space-y-3.5">
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <label className="font-bold text-stone-300">Simulated Order Value (ETB)</label>
                            <span className="font-mono font-bold text-amber-400 text-sm">
                              {Number(simAmount).toLocaleString()} ETB
                            </span>
                          </div>
                          <input
                            type="range"
                            min="500"
                            max="50000"
                            step="500"
                            value={simAmount}
                            onChange={(e) => setSimAmount(Number(e.target.value))}
                            className="w-full accent-amber-500 cursor-pointer"
                          />
                          <div className="flex justify-between text-[10px] text-stone-500 font-mono mt-0.5">
                            <span>500 ETB</span>
                            <span>25,000 ETB</span>
                            <span>50,000 ETB</span>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <label className="font-bold text-stone-300">Commission Rate (%)</label>
                            <span className="font-mono font-bold text-amber-400 text-sm">
                              {simCommission}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="2"
                            max="25"
                            step="1"
                            value={simCommission}
                            onChange={(e) => setSimCommission(Number(e.target.value))}
                            className="w-full accent-amber-500 cursor-pointer"
                          />
                          <div className="flex justify-between text-[10px] text-stone-500 font-mono mt-0.5">
                            <span>2% (Special Co-op)</span>
                            <span>10% (Default)</span>
                            <span>25% (High Tier)</span>
                          </div>
                        </div>

                        <div className="p-3 rounded-2xl bg-stone-800/80 border border-stone-700 space-y-1.5 text-[11px]">
                          <div className="flex justify-between text-stone-300">
                            <span>Tax Regime:</span>
                            <span className="font-bold text-emerald-400">
                              {selectedSeller.vatRegistered
                                ? "VAT Registered (15%)"
                                : selectedSeller.totRegistered
                                ? "TOT Registered (2%)"
                                : "Standard Withholding (2%)"}
                            </span>
                          </div>
                          <div className="flex justify-between text-stone-300">
                            <span>Settlement Method:</span>
                            <span className="font-mono text-stone-200">
                              {selectedSeller.payoutMethods?.[0]?.methodType || "Telebirr / CBE Birr Direct"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Calculated Cascade */}
                      {(() => {
                        const gross = simAmount;
                        const commissionAmount = Math.round(gross * (simCommission / 100));
                        const taxRate = selectedSeller.vatRegistered ? 0.15 : 0.02;
                        const taxAmount = Math.round(gross * taxRate);
                        const netPayout = Math.max(0, gross - commissionAmount);

                        return (
                          <div className="p-4 rounded-2xl bg-stone-800 border border-stone-700 flex flex-col justify-between space-y-3">
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between items-center pb-2 border-b border-stone-700">
                                <span className="text-stone-400">Customer Payment (Gross):</span>
                                <span className="font-mono font-bold text-white text-sm">
                                  +{gross.toLocaleString()} ETB
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-amber-400">
                                <span>Platform Fee ({simCommission}%):</span>
                                <span className="font-mono font-bold">-{commissionAmount.toLocaleString()} ETB</span>
                              </div>
                              <div className="flex justify-between items-center text-stone-400">
                                <span>Tax Reference ({taxRate * 100}%):</span>
                                <span className="font-mono">{taxAmount.toLocaleString()} ETB</span>
                              </div>
                              <div className="flex justify-between items-center text-stone-400">
                                <span>Escrow Release:</span>
                                <span className="font-mono text-emerald-400">Upon Customer Handover</span>
                              </div>
                            </div>

                            <div className="pt-3 border-t border-stone-700 flex justify-between items-end">
                              <div>
                                <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                                  Net Merchant Payout
                                </span>
                                <span className="text-xl font-bold font-mono text-emerald-400">
                                  {netPayout.toLocaleString()} ETB
                                </span>
                              </div>
                              <span className="text-[10px] text-stone-400 italic">
                                Ready for Telebirr disbursal
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Fast Balance Adjustment Box */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-300 space-y-3">
                    <span className="font-bold text-amber-950 text-sm block">
                      Administrative Balance Adjustment
                    </span>
                    <p className="text-xs text-amber-800">
                      Credit or debit merchant cleared funds for promotional grants, fee adjustments, or manual escrow settlement.
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setSellerForBalance(selectedSeller);
                          setBalanceModalOpen(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs transition"
                      >
                        Adjust Available Balance
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: CRAFTS CATALOG */}
              {inspectorTab === "products" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-stone-900 text-sm">
                        Artisan Crafts Catalog ({dossierData?.products?.length || 0})
                      </h3>
                      <p className="text-xs text-stone-500">
                        Direct oversight of all items listed by {selectedSeller.name}
                      </p>
                    </div>
                    <Link
                      to={`/admin-products?seller=${selectedSeller._id}`}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition inline-flex items-center gap-1.5"
                    >
                      <span>Open in Admin Products</span>
                      <BsArrowRight size={13} />
                    </Link>
                  </div>

                  {loadingDossier ? (
                    <div className="p-12 text-center text-stone-400">Loading artisan crafts...</div>
                  ) : !dossierData?.products?.length ? (
                    <div className="p-12 text-center text-stone-500 bg-stone-50 rounded-2xl border border-stone-200">
                      <BsShop className="mx-auto text-stone-300 mb-2" size={28} />
                      <p className="font-semibold">No crafts created by this artisan yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto">
                      {dossierData.products.map((p: any) => (
                        <div key={p._id} className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex gap-3">
                          <img
                            src={p.images?.[0]?.url || "/photo.jpg"}
                            alt={p.name}
                            className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-stone-900 truncate text-xs">{p.name}</h4>
                            <div className="font-bold text-amber-800 text-xs mt-0.5 font-mono">
                              {Number(p.discountPrice || p.originalPrice).toLocaleString()} ETB
                            </div>
                            <div className="text-[10px] text-stone-500 mt-1 flex items-center gap-2">
                              <span>Stock: {p.stock ?? 0}</span>
                              <span>â€¢</span>
                              <span className="truncate">{p.category}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: ORDERS & FULFILLMENT */}
              {inspectorTab === "orders" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-stone-900 text-sm">
                        Customer Orders ({dossierData?.orders?.length || 0})
                      </h3>
                      <p className="text-xs text-stone-500">
                        Track dispatch SLA and escrow releases for this artisan
                      </p>
                    </div>
                    <Link
                      to="/Adminallorder"
                      className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold transition inline-flex items-center gap-1.5"
                    >
                      <span>Global Orders</span>
                      <BsArrowRight size={13} />
                    </Link>
                  </div>

                  {loadingDossier ? (
                    <div className="p-12 text-center text-stone-400">Loading order records...</div>
                  ) : !dossierData?.orders?.length ? (
                    <div className="p-12 text-center text-stone-500 bg-stone-50 rounded-2xl border border-stone-200">
                      <FiShoppingBag className="mx-auto text-stone-300 mb-2" size={28} />
                      <p className="font-semibold">No orders recorded for this workshop yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[420px] overflow-y-auto">
                      {dossierData.orders.map((ord: any) => (
                        <div key={ord._id} className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3">
                          <div>
                            <div className="font-bold text-stone-900 font-mono text-xs">
                              Order #{ord._id?.slice(-8).toUpperCase()}
                            </div>
                            <div className="text-[11px] text-stone-500 mt-0.5">
                              Date: {new Date(ord.createdAt).toLocaleDateString()} â€¢ Items: {ord.cart?.length || 1}
                            </div>
                            <div className="text-[10px] text-stone-400">
                              Payment: {ord.paymentInfo?.type || "Escrow"}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-bold text-stone-900 font-mono text-xs">
                              {Number(ord.totalPrice || ord.subTotal || 0).toLocaleString()} ETB
                            </div>
                            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                              {ord.status || "Processing"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: OFFICIAL NOTICES */}
              {inspectorTab === "notices" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-stone-900 text-sm">Official Platform Notices</h3>
                      <p className="text-xs text-stone-500">
                        Dispatch binding administrative notices, warnings, or commendations to {selectedSeller.name}
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSendNoticeSubmit} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                    <div>
                      <label className="block font-bold text-stone-700 text-xs mb-1">Notice Type</label>
                      <select
                        value={noticeType}
                        onChange={(e) => setNoticeType(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold bg-white"
                      >
                        <option value="info">Informational Bulletin</option>
                        <option value="warning">Fulfillment SLA Delay Warning</option>
                        <option value="compliance">Regulatory & Tax Document Request</option>
                        <option value="milestone">Top Seller Achievement & Commendation</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 text-xs mb-1">Notice Headline</label>
                      <input
                        type="text"
                        value={noticeTitle}
                        onChange={(e) => setNoticeTitle(e.target.value)}
                        placeholder="e.g. Urgent: Update Business License or Orders Will Be Paused"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 text-xs mb-1">Detailed Message</label>
                      <textarea
                        rows={3}
                        value={noticeMessage}
                        onChange={(e) => setNoticeMessage(e.target.value)}
                        placeholder="Detail the instructions or compliance actions required from the artisan..."
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={sendingNotice}
                      className="px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs transition disabled:opacity-50"
                    >
                      {sendingNotice ? "Transmitting Notice..." : "Transmit Official Notice"}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 7: STOREFRONT SETTINGS EDITOR */}
              {inspectorTab === "settings" && (
                <form onSubmit={handleSaveDrawerSettings} className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-stone-900 text-sm">Storefront Governance Settings</h3>
                      <p className="text-xs text-stone-500">
                        Admin direct configuration of boutique parameters and regional shipping
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition disabled:opacity-50"
                    >
                      {savingSettings ? "Saving Settings..." : "Save Settings"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-stone-700 text-xs mb-1">Boutique Name</label>
                      <input
                        type="text"
                        value={storeEditState.name || ""}
                        onChange={(e) => setStoreEditState({ ...storeEditState, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 text-xs mb-1">Contact Phone</label>
                      <input
                        type="text"
                        value={storeEditState.phoneNumber || ""}
                        onChange={(e) => setStoreEditState({ ...storeEditState, phoneNumber: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 text-xs mb-1">Addis Ababa Sub-city</label>
                      <select
                        value={storeEditState.subCity || ""}
                        onChange={(e) => setStoreEditState({ ...storeEditState, subCity: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-semibold"
                      >
                        <option value="">Select Sub-city</option>
                        {ETHIOPIAN_SUBCITIES.map((sc) => (
                          <option key={sc} value={sc}>
                            {sc}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 text-xs mb-1">Woreda / Kebele</label>
                      <input
                        type="text"
                        value={storeEditState.woreda || ""}
                        onChange={(e) => setStoreEditState({ ...storeEditState, woreda: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 text-xs mb-1">Platform Commission (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={storeEditState.commissionRate ?? 10}
                        onChange={(e) => setStoreEditState({ ...storeEditState, commissionRate: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 text-xs mb-1">Store Status</label>
                      <select
                        value={storeEditState.status || "active"}
                        onChange={(e) => setStoreEditState({ ...storeEditState, status: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-semibold"
                      >
                        <option value="active">Active (Full checkout)</option>
                        <option value="suspended">Suspended (Frozen)</option>
                        <option value="vacation_mode">Vacation Mode (Browse only)</option>
                        <option value="pending_verification">Pending Compliance</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 text-xs mb-1">Addis Ababa Delivery Rate (ETB)</label>
                      <input
                        type="number"
                        value={storeEditState.addisAbabaRate ?? 150}
                        onChange={(e) => setStoreEditState({ ...storeEditState, addisAbabaRate: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 text-xs mb-1">Regional Delivery Rate (ETB)</label>
                      <input
                        type="number"
                        value={storeEditState.regionalRate ?? 300}
                        onChange={(e) => setStoreEditState({ ...storeEditState, regionalRate: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="drawerFeatured"
                      checked={Boolean(storeEditState.isFeatured)}
                      onChange={(e) => setStoreEditState({ ...storeEditState, isFeatured: e.target.checked })}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <label htmlFor="drawerFeatured" className="text-xs font-bold text-stone-800 cursor-pointer">
                      Spotlight as a Featured Boutique on Marketplace Homepage
                    </label>
                  </div>
                </form>
              )}

              {/* TAB 8: GOVERNANCE DECISION */}
              {inspectorTab === "decision" && (
                <form onSubmit={handleDecisionSubmit} className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-3 gap-2 p-1.5 bg-stone-100 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setDecisionMode("approve")}
                      className={`py-2 rounded-xl font-bold text-xs transition ${
                        decisionMode === "approve"
                          ? "bg-emerald-700 text-white shadow-xs"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      Verify & Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => setDecisionMode("request_revision")}
                      className={`py-2 rounded-xl font-bold text-xs transition ${
                        decisionMode === "request_revision"
                          ? "bg-amber-600 text-white shadow-xs"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      Request Clarification
                    </button>
                    <button
                      type="button"
                      onClick={() => setDecisionMode("reject")}
                      className={`py-2 rounded-xl font-bold text-xs transition ${
                        decisionMode === "reject"
                          ? "bg-rose-700 text-white shadow-xs"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      Reject Application
                    </button>
                  </div>

                  {decisionMode === "approve" && (
                    <div className="space-y-4 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                      <div>
                        <label className="block font-bold text-stone-800 text-xs mb-1.5">
                          Assign Artisan Trust Tier Badge
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {BADGE_OPTIONS.map((b) => (
                            <div
                              key={b.id}
                              onClick={() => setChosenBadge(b.id)}
                              className={`p-3 rounded-xl border cursor-pointer transition ${
                                chosenBadge === b.id
                                  ? "bg-white border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs"
                                  : "bg-emerald-50/40 border-emerald-200/60 hover:bg-white"
                              }`}
                            >
                              <div className="font-bold text-stone-900 text-xs">{b.label}</div>
                              <div className="text-[10px] text-stone-500 mt-0.5">{b.desc}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-stone-800 text-xs mb-1">
                            Marketplace Platform Commission Rate (%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={commissionRate}
                            onChange={(e) => setCommissionRate(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {decisionMode === "reject" && (
                    <div className="space-y-3 p-4 rounded-2xl bg-rose-50/60 border border-rose-200">
                      <label className="block font-bold text-rose-950 text-xs">
                        Select Standard Ethiopian Compliance Rejection Ground
                      </label>
                      <div className="space-y-2">
                        {REJECTION_PRESETS.map((p) => (
                          <label
                            key={p.id}
                            className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition text-xs ${
                              rejectionPreset === p.id
                                ? "bg-white border-rose-600 ring-2 ring-rose-500/20"
                                : "bg-rose-50/30 border-rose-200 hover:bg-white"
                            }`}
                          >
                            <input
                              type="radio"
                              name="rejectionPreset"
                              value={p.id}
                              checked={rejectionPreset === p.id}
                              onChange={() => setRejectionPreset(p.id)}
                              className="mt-0.5 text-rose-600"
                            />
                            <div>
                              <div className="font-bold text-stone-900">{p.label}</div>
                              {p.text && <div className="text-[11px] text-stone-500 mt-0.5">{p.text}</div>}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block font-bold text-stone-800 text-xs mb-1">
                      Administrative Notes & Memo
                    </label>
                    <textarea
                      rows={3}
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                      placeholder="Enter specific feedback or compliance record notes..."
                      className="w-full p-3 rounded-2xl border border-stone-300 text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setInspectorOpen(false)}
                      className="px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingAction}
                      className={`px-6 py-2.5 rounded-2xl text-white text-xs font-bold transition shadow-sm ${
                        decisionMode === "approve"
                          ? "bg-emerald-700 hover:bg-emerald-800"
                          : decisionMode === "reject"
                          ? "bg-rose-700 hover:bg-rose-800"
                          : "bg-amber-600 hover:bg-amber-700"
                      }`}
                    >
                      {submittingAction
                        ? "Executing Governance Action..."
                        : decisionMode === "approve"
                        ? "Verify & Authorize Merchant"
                        : decisionMode === "reject"
                        ? "Issue Formal Rejection"
                        : "Request Compliance Update"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. DEDICATED BALANCE ADJUSTMENT MODAL */}
      {balanceModalOpen && sellerForBalance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-stone-200 animate-scaleUp space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-base font-serif">
                Adjust Merchant Balance
              </h3>
              <button
                onClick={() => setBalanceModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <RxCross1 size={16} />
              </button>
            </div>

            <div className="p-3 bg-stone-50 rounded-2xl text-xs space-y-1">
              <div className="font-bold text-stone-900">{sellerForBalance.name}</div>
              <div className="text-stone-500">
                Current Available:{" "}
                <span className="font-mono font-bold text-emerald-800">
                  {Number(sellerForBalance.availableBalance || 0).toLocaleString()} ETB
                </span>
              </div>
            </div>

            <form onSubmit={handleExecuteBalanceAdjustment} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Adjustment Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBalanceAdjType("credit")}
                    className={`py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                      balanceAdjType === "credit"
                        ? "bg-emerald-700 text-white shadow-xs"
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                    }`}
                  >
                    <BsPlusCircle size={13} />
                    <span>Credit (Add Funds)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBalanceAdjType("debit")}
                    className={`py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                      balanceAdjType === "debit"
                        ? "bg-rose-700 text-white shadow-xs"
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                    }`}
                  >
                    <BsDashCircle size={13} />
                    <span>Debit (Deduct Funds)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Amount (ETB)</label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={balanceAdjAmount}
                  onChange={(e) => setBalanceAdjAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Audit Reason</label>
                <input
                  type="text"
                  value={balanceAdjReason}
                  onChange={(e) => setBalanceAdjReason(e.target.value)}
                  placeholder="e.g. Artisan incentive grant / defect compensation"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBalanceModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustingBalance}
                  className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold transition disabled:opacity-50"
                >
                  {adjustingBalance ? "Processing..." : "Confirm Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. DEDICATED OFFICIAL NOTICE MODAL */}
      {noticeModalOpen && sellerForNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-stone-200 animate-scaleUp space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-base font-serif flex items-center gap-1.5">
                <BsMegaphone className="text-amber-700" size={16} />
                <span>Transmit Official Platform Notice</span>
              </h3>
              <button
                onClick={() => setNoticeModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <RxCross1 size={16} />
              </button>
            </div>

            <div className="p-3 bg-stone-50 rounded-2xl text-xs">
              <span className="text-stone-500">Artisan:</span>{" "}
              <span className="font-bold text-stone-900">{sellerForNotice.name}</span>
            </div>

            <form onSubmit={handleSendNoticeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Notice Type</label>
                <select
                  value={noticeType}
                  onChange={(e) => setNoticeType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold bg-white"
                >
                  <option value="info">Informational Memo</option>
                  <option value="warning">Fulfillment SLA Warning</option>
                  <option value="compliance">Document & Tax Clarification</option>
                  <option value="milestone">Sales Achievement Commendation</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Headline</label>
                <input
                  type="text"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="e.g. Delivery Delay Warning on Order #9482"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Message Content</label>
                <textarea
                  rows={3}
                  value={noticeMessage}
                  onChange={(e) => setNoticeMessage(e.target.value)}
                  placeholder="Detail the official memo..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNoticeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingNotice}
                  className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold transition disabled:opacity-50"
                >
                  {sendingNotice ? "Transmitting..." : "Send Official Notice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. BULK ACTIONS MODAL */}
      {bulkActionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-stone-200 animate-scaleUp space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-base font-serif capitalize">
                Bulk {bulkActionType} ({selectedIds.length} Stores)
              </h3>
              <button
                onClick={() => setBulkActionModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <RxCross1 size={16} />
              </button>
            </div>

            <p className="text-xs text-stone-600">
              You are about to execute the <strong>{bulkActionType}</strong> operation on{" "}
              <strong>{selectedIds.length}</strong> selected artisan accounts simultaneously.
            </p>

            {bulkActionType === "verify" && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Grant Badge</label>
                  <select
                    value={bulkBadge}
                    onChange={(e) => setBulkBadge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-semibold bg-white"
                  >
                    {BADGE_OPTIONS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Platform Commission (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={bulkCommissionRate}
                    onChange={(e) => setBulkCommissionRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono font-bold"
                  />
                </div>
              </div>
            )}

            {bulkActionType === "commission" && (
              <div className="text-xs">
                <label className="block font-bold text-stone-700 mb-1">New Commission Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={bulkCommissionRate}
                  onChange={(e) => setBulkCommissionRate(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono font-bold"
                />
              </div>
            )}

            {bulkActionType === "badge" && (
              <div className="text-xs">
                <label className="block font-bold text-stone-700 mb-1">Select Badge</label>
                <select
                  value={bulkBadge}
                  onChange={(e) => setBulkBadge(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 font-semibold bg-white"
                >
                  {BADGE_OPTIONS.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {bulkActionType === "suspend" && (
              <div className="text-xs">
                <label className="block font-bold text-stone-700 mb-1">Suspension Audit Reason</label>
                <textarea
                  rows={2}
                  value={bulkReason}
                  onChange={(e) => setBulkReason(e.target.value)}
                  placeholder="Reason for bulk suspension..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBulkActionModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkSubmit}
                disabled={bulkSubmitting}
                className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition disabled:opacity-50"
              >
                {bulkSubmitting ? "Executing Bulk Action..." : "Confirm & Execute"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && sellerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-stone-200 animate-scaleUp text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <BsTrash size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif text-stone-900">
                Remove Storefront Account?
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="font-bold text-stone-800">{sellerToDelete.name}</span>? This will
                permanently purge the merchant's store profile, listings, and verification records.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-5 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-sm"
              >
                Yes, Delete Store
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. ACCREDITATION CERTIFICATE MODAL */}
      {certificateModalOpen && certificateSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#fbf7ed] text-[#2c1d11] w-full max-w-3xl rounded-3xl p-6 sm:p-10 shadow-2xl border-8 border-[#7a2e1d] relative animate-scaleUp print:m-0 print:border-4 print:shadow-none print:w-full">
            {/* Decorative Corner Elements */}
            <div className="absolute top-2 left-2 text-[#7a2e1d] font-serif text-xs opacity-50 select-none">❖ ❖ ❖</div>
            <div className="absolute top-2 right-2 text-[#7a2e1d] font-serif text-xs opacity-50 select-none">❖ ❖ ❖</div>
            <div className="absolute bottom-2 left-2 text-[#7a2e1d] font-serif text-xs opacity-50 select-none">❖ ❖ ❖</div>
            <div className="absolute bottom-2 right-2 text-[#7a2e1d] font-serif text-xs opacity-50 select-none">❖ ❖ ❖</div>

            {/* Close button (hidden when printing) */}
            <div className="flex justify-between items-center pb-4 border-b border-[#7a2e1d]/20 print:hidden">
              <span className="text-xs font-bold uppercase tracking-widest text-[#7a2e1d]">
                Official Accreditation Document
              </span>
              <button
                onClick={() => setCertificateModalOpen(false)}
                className="p-1.5 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition"
              >
                <RxCross1 size={18} />
              </button>
            </div>

            {/* Certificate Header */}
            <div className="text-center space-y-2 mt-4">
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#7a2e1d] text-amber-200 flex items-center justify-center font-bold text-xl shadow-inner">
                  ✦
                </div>
              </div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-[#7a2e1d]/80">
                Federal Democratic Republic of Ethiopia
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#3b190f] uppercase tracking-wide">
                Certificate of Artisan Accreditation
              </h2>
              <div className="text-xs font-medium text-stone-600">
                Roha Heritage Craft Guild • Ministry of Trade & Regional Integration Co-Endorsement
              </div>
            </div>

            {/* Certificate Body */}
            <div className="my-6 text-center space-y-4 px-4 sm:px-8">
              <p className="text-xs italic text-stone-600">This official instrument certifies that</p>
              <div className="text-2xl sm:text-3xl font-bold font-serif text-[#7a2e1d] tracking-wide border-b-2 border-[#7a2e1d]/30 pb-2 inline-block max-w-full">
                {certificateSeller.name}
              </div>
              <p className="text-xs text-stone-700 leading-relaxed max-w-xl mx-auto">
                Represented by <strong>{certificateSeller.legalOwnerName || certificateSeller.name}</strong>, situated in{" "}
                <strong>{certificateSeller.subCity ? `${certificateSeller.subCity}, ` : ""}{certificateSeller.city || "Addis Ababa"}, Ethiopia</strong>,
                holding Taxpayer Identification Number{" "}
                <strong className="font-mono">{certificateSeller.tinNumber || "ET-PENDING"}</strong>.
              </p>
              <p className="text-xs text-stone-600 max-w-xl mx-auto leading-relaxed">
                Has demonstrated full compliance with statutory ethical standards, fair artisan wage practices, and heritage quality guidelines for:
              </p>
              <div className="px-4 py-2 bg-amber-100/70 border border-amber-300 rounded-2xl inline-block text-xs font-bold text-[#7a2e1d]">
                {certificateSeller.craftSpecialization?.join(" • ") || "Traditional Handloom Weaving & Authentic Ethiopian Crafts"}
              </div>
            </div>

            {/* Certificate Metadata & Stamps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#7a2e1d]/20 items-center text-center sm:text-left text-xs">
              <div>
                <div className="text-[10px] text-stone-500 uppercase font-bold">Accreditation ID</div>
                <div className="font-mono font-bold text-[#7a2e1d]">
                  ET-ROHA-{certificateSeller._id.slice(-8).toUpperCase()}
                </div>
                <div className="text-[10px] text-stone-500 mt-1">
                  Issued: {new Date(certificateSeller.createdAt || Date.now()).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </div>
                <div className="text-[10px] text-emerald-800 font-bold mt-0.5">
                  Badge: {certificateSeller.badge || "Certified Artisan"}
                </div>
              </div>

              {/* Official Seal Simulation */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full border-4 border-dashed border-[#7a2e1d] bg-[#7a2e1d]/10 flex flex-col items-center justify-center text-[#7a2e1d] p-1 text-center shadow-xs">
                  <span className="text-[9px] font-black uppercase tracking-tighter">ROHA GUILD</span>
                  <span className="text-lg">❖</span>
                  <span className="text-[8px] font-bold">VERIFIED</span>
                </div>
                <span className="text-[9px] text-stone-500 mt-1">Official Registry Seal</span>
              </div>

              {/* Digital Verification & Signatures */}
              <div className="sm:text-right space-y-1">
                <div className="text-[10px] text-stone-500 uppercase font-bold">Digital Verification</div>
                <div className="font-mono text-[10px] text-stone-700 break-all">
                  mep.et/artisan/{certificateSeller._id.slice(-6)}
                </div>
                <div className="pt-2 text-[10px] text-stone-500 italic border-t border-stone-300 mt-2">
                  Authorized by Board of Guild Curators
                </div>
              </div>
            </div>

            {/* Action Buttons (Hidden when printing) */}
            <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-[#7a2e1d]/20 print:hidden">
              <button
                onClick={() => setCertificateModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-[#7a2e1d] hover:bg-[#5f2416] text-white text-xs font-bold inline-flex items-center gap-1.5 transition shadow-sm"
              >
                <BsPrinter size={15} />
                <span>Print / Export PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. TRUST SCORE BREAKDOWN MODAL */}
      {trustModalOpen && trustSeller && (() => {
        const trustInfo = computeArtisanTrustScore(trustSeller);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
            <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-stone-200 animate-scaleUp space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{trustInfo.badgeIcon}</span>
                  <div>
                    <h3 className="font-bold text-stone-900 text-base font-serif">
                      Trust & Compliance Audit Score
                    </h3>
                    <p className="text-xs text-stone-500">{trustSeller.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setTrustModalOpen(false)}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-700"
                >
                  <RxCross1 size={16} />
                </button>
              </div>

              {/* Score Display Box */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div>
                  <div className="text-xs text-stone-500 font-medium">Composite Audit Rating</div>
                  <div className="text-2xl font-black font-serif text-stone-900 mt-0.5">
                    {trustInfo.score} <span className="text-sm font-sans font-normal text-stone-500">/ 100</span>
                  </div>
                  <div className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${trustInfo.tierColor}`}>
                    {trustInfo.tier}
                  </div>
                </div>
                <div className="text-right text-xs space-y-1">
                  <div className="text-stone-500">TIN: <strong className="text-stone-800">{trustSeller.tinNumber ? "Recorded" : "Missing"}</strong></div>
                  <div className="text-stone-500">License Scan: <strong className="text-stone-800">{trustSeller.businessLicense?.url ? "Uploaded" : "Pending"}</strong></div>
                  <div className="text-stone-500">Verification: <strong className="text-stone-800">{trustSeller.verificationStatus || "Unverified"}</strong></div>
                </div>
              </div>

              {/* Breakdown Items List */}
              <div className="space-y-2 text-xs">
                <span className="font-bold text-stone-700 block text-[11px] uppercase tracking-wider">
                  Audit Criteria Breakdown
                </span>
                {trustInfo.breakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      item.earned ? "bg-emerald-50/60 border-emerald-200 text-emerald-950" : "bg-stone-50 border-stone-200 text-stone-600"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold flex items-center gap-1.5">
                        <span>{item.earned ? "✓" : "✗"}</span>
                        <span>{item.label}</span>
                      </div>
                      <div className="text-[10px] text-stone-500">{item.detail}</div>
                    </div>
                    <span className={`font-mono font-bold ${item.earned ? "text-emerald-700" : "text-stone-400"}`}>
                      +{item.points}/{item.maxPoints}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                <button
                  onClick={() => {
                    setTrustModalOpen(false);
                    openInspector(trustSeller, "dossier");
                  }}
                  className="text-xs font-bold text-amber-800 hover:underline"
                >
                  Open 360° Inspector
                </button>
                <button
                  onClick={() => setTrustModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default AllSellers;
