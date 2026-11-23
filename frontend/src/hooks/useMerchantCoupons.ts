import { useState, useEffect, useMemo, useCallback, FormEvent } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { server } from "../server";
import { useAppSelector } from "./redux";
import { ICoupon, CouponDiscountType } from "../types";

export interface HolidayPreset {
  code: string;
  title: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderAmount: number;
  desc: string;
}

export const HOLIDAY_PRESETS: HolidayPreset[] = [
  {
    code: "MESKEL15",
    title: "Meskel Festival Heritage Promo",
    discountType: "percentage",
    discountValue: 15,
    minOrderAmount: 2000,
    desc: "15% off handwoven Kemis and Netela for Meskel feast",
  },
  {
    code: "ENKUTATASH20",
    title: "Enkutatash Ethiopian New Year Sale",
    discountType: "percentage",
    discountValue: 20,
    minOrderAmount: 2500,
    desc: "20% off authentic workshop items for the new dawn",
  },
  {
    code: "TIMKAT10",
    title: "Timkat Epiphany Pure White Collection",
    discountType: "percentage",
    discountValue: 10,
    minOrderAmount: 1500,
    desc: "10% off white cotton garments and scarves",
  },
  {
    code: "FASIKA500",
    title: "Fasika Easter Special Voucher",
    discountType: "fixed",
    discountValue: 500,
    minOrderAmount: 4000,
    desc: "500 ETB flat discount on festive handcrafted outfits",
  },
];

export interface UseMerchantCouponsReturn {
  coupons: ICoupon[];
  filteredCoupons: ICoupon[];
  loading: boolean;
  search: string;
  setSearch: (val: string) => void;
  copiedCode: string | null;
  copyToClipboard: (code: string) => void;
  createModalOpen: boolean;
  setCreateModalOpen: (val: boolean) => void;
  submitting: boolean;
  code: string;
  setCode: (val: string) => void;
  title: string;
  setTitle: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  discountType: CouponDiscountType;
  setDiscountType: (val: CouponDiscountType) => void;
  discountValue: string;
  setDiscountValue: (val: string) => void;
  minOrderAmount: string;
  setMinOrderAmount: (val: string) => void;
  maxDiscountAmount: string;
  setMaxDiscountAmount: (val: string) => void;
  usageLimit: string;
  setUsageLimit: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  applyPreset: (preset: HolidayPreset) => void;
  fetchCoupons: () => Promise<void>;
  handleCreateCoupon: (e: FormEvent) => Promise<void>;
  handleDeleteCoupon: (id: string) => Promise<void>;
}

export const useMerchantCoupons = (): UseMerchantCouponsReturn => {
  const { seller } = useAppSelector((state) => state.seller);
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Create Modal State
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [code, setCode] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [discountType, setDiscountType] = useState<CouponDiscountType>("percentage");
  const [discountValue, setDiscountValue] = useState<string>("");
  const [minOrderAmount, setMinOrderAmount] = useState<string>("");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<string>("");
  const [usageLimit, setUsageLimit] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const fetchCoupons = useCallback(async () => {
    if (!seller?._id) return;
    setLoading(true);
    try {
      const res = await axios.get(`${server}/coupon/get-coupon/${seller._id}`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        setCoupons(res.data.couponCodes || []);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }, [seller?._id]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const copyToClipboard = (cCode: string) => {
    navigator.clipboard.writeText(cCode);
    setCopiedCode(cCode);
    toast.success(`Coupon code "${cCode}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const applyPreset = (preset: HolidayPreset) => {
    setCode(preset.code);
    setTitle(preset.title);
    setDescription(preset.desc);
    setDiscountType(preset.discountType);
    setDiscountValue(String(preset.discountValue));
    setMinOrderAmount(String(preset.minOrderAmount));

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    setEndDate(futureDate.toISOString().split("T")[0]);

    setCreateModalOpen(true);
  };

  const handleCreateCoupon = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) {
      toast.error("Please fill in coupon code and discount value");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: code.trim().toUpperCase(),
        title: title.trim(),
        description: description.trim(),
        discountType,
        value: Number(discountValue),
        minAmount: minOrderAmount ? Number(minOrderAmount) : undefined,
        maxAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
        usageLimit: usageLimit ? Number(usageLimit) : undefined,
        endDate: endDate || undefined,
        shopId: seller._id,
      };

      const res = await axios.post(`${server}/coupon/create-coupon-code`, payload, {
        withCredentials: true,
      });

      if (res.data?.success) {
        toast.success("Coupon code created successfully!");
        setCreateModalOpen(false);
        setCode("");
        setTitle("");
        setDescription("");
        setDiscountValue("");
        setMinOrderAmount("");
        setMaxDiscountAmount("");
        setUsageLimit("");
        setEndDate("");
        fetchCoupons();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create coupon");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!window.confirm("Are you sure you want to deactivate and remove this coupon?")) {
      return;
    }

    try {
      const res = await axios.delete(`${server}/coupon/delete-coupon/${id}`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        toast.success("Coupon deleted successfully");
        setCoupons((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete coupon");
    }
  };

  const filteredCoupons = useMemo(() => {
    if (!search.trim()) return coupons;
    const q = search.toLowerCase();
    return coupons.filter(
      (c) =>
        c.code?.toLowerCase().includes(q) ||
        (c as any).name?.toLowerCase().includes(q) ||
        c.title?.toLowerCase().includes(q)
    );
  }, [coupons, search]);

  return {
    coupons,
    filteredCoupons,
    loading,
    search,
    setSearch,
    copiedCode,
    copyToClipboard,
    createModalOpen,
    setCreateModalOpen,
    submitting,
    code,
    setCode,
    title,
    setTitle,
    description,
    setDescription,
    discountType,
    setDiscountType,
    discountValue,
    setDiscountValue,
    minOrderAmount,
    setMinOrderAmount,
    maxDiscountAmount,
    setMaxDiscountAmount,
    usageLimit,
    setUsageLimit,
    endDate,
    setEndDate,
    applyPreset,
    fetchCoupons,
    handleCreateCoupon,
    handleDeleteCoupon,
  };
};

export default useMerchantCoupons;
