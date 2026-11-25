import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { server } from "../server";
import { useAppSelector } from "./redux";
import { useCurrency } from "./useCurrency";

export const ETHIOPIAN_CITIES = [
  "Addis Ababa",
  "Hawassa",
  "Bahir Dar",
  "Gondar",
  "Dire Dawa",
  "Mekelle",
  "Adama (Nazret)",
  "Bishoftu (Debre Zeyit)",
  "Jimma",
  "Harar",
  "Dessie",
  "Other Region",
] as const;

export const ADDIS_ABABA_SUBCITIES = [
  "Bole",
  "Yeka",
  "Kirkos",
  "Arada",
  "Lideta",
  "Nifas Silk-Lafto",
  "Kolfe Keranio",
  "Gullele",
  "Akaky Kaliti",
  "Addis Ketema",
  "Lemi Kura",
] as const;

export const useCheckoutLogic = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.user);
  const { cart } = useAppSelector((state) => state.Cart);
  const { formatPrice } = useCurrency();

  // Shipping information
  const [country, setCountry] = useState<string>("Ethiopia");
  const [city, setCity] = useState<string>("Addis Ababa");
  const [subCity, setSubCity] = useState<string>("Bole");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [address1, setAddress1] = useState<string>("");
  const [address2, setAddress2] = useState<string>("");
  const [zipCode, setZipCode] = useState<string>("1000");

  // Traditional Custom Tailoring
  const [includeCustomMeasurements, setIncludeCustomMeasurements] = useState<boolean>(false);
  const [bust, setBust] = useState<string>("");
  const [waist, setWaist] = useState<string>("");
  const [hips, setHips] = useState<string>("");
  const [length, setLength] = useState<string>("");
  const [tailoringNotes, setTailoringNotes] = useState<string>("");

  // Coupon state
  const [couponCode, setCouponCode] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [applyingCoupon, setApplyingCoupon] = useState<boolean>(false);

  // Autofill user's saved traditional sizing profile
  const handleAutofillMeasurements = useCallback(() => {
    if (!user?.customMeasurements || (!user.customMeasurements.bust && !user.customMeasurements.waist)) {
      toast.info("No saved sizing profile found in your account!");
      return;
    }
    const cm = user.customMeasurements;
    setBust(cm.bust || "");
    setWaist(cm.waist || "");
    setHips(cm.hips || "");
    setLength(cm.length || cm.height || "");
    setTailoringNotes(cm.notes || "");
    setIncludeCustomMeasurements(true);
    toast.success("Autofilled from your saved traditional sizing profile!");
  }, [user]);

  // Autofill user shipping if exists
  useEffect(() => {
    if (user?.phoneNumber) {
      setPhoneNumber(String(user.phoneNumber));
    }
    if (user?.addresses && user.addresses.length > 0) {
      const defaultAddr = user.addresses[0];
      setAddress1(defaultAddr.address1 || "");
      setAddress2(defaultAddr.address2 || "");
      setCountry(defaultAddr.country || "Ethiopia");
      setCity(defaultAddr.city || "Addis Ababa");
      setZipCode(String(defaultAddr.zipCode ?? "1000"));
    }
  }, [user]);

  // Price calculations
  const subTotalPrice = useMemo(() => {
    return (cart || []).reduce((acc: number, item: any) => {
      const price = Number(item.discountPrice || item.originalPrice || 0);
      const q = Number(item.qty || 1);
      return acc + price * q;
    }, 0);
  }, [cart]);

  // Standard Ethiopian Flat Shipping or free over 5,000 ETB
  const shippingPrice = useMemo(() => {
    if (subTotalPrice === 0) return 0;
    if (subTotalPrice >= 5000) return 0;
    return country === "Ethiopia" ? 200 : 1500;
  }, [subTotalPrice, country]);

  const totalPrice = useMemo(() => {
    const raw = subTotalPrice + shippingPrice - discountAmount;
    return Math.max(0, raw);
  }, [subTotalPrice, shippingPrice, discountAmount]);

  // Apply Ethiopian Promotional Coupon
  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setApplyingCoupon(true);
    try {
      const res = await axios.get(`${server}/coupon/get-coupon-value/${couponCode.trim()}`);
      const coupon = res.data?.couponCode;

      if (!coupon) {
        toast.error("Coupon code does not exist!");
        return;
      }

      // Check min/max amount
      if (coupon.minAmount && subTotalPrice < coupon.minAmount) {
        toast.error(`Order minimum must be at least ${coupon.minAmount} ETB for this coupon!`);
        return;
      }

      let discount = 0;
      if (coupon.value) {
        discount = (subTotalPrice * Number(coupon.value)) / 100;
        if (coupon.maxAmount && discount > coupon.maxAmount) {
          discount = coupon.maxAmount;
        }
      }

      setDiscountAmount(discount);
      setAppliedCoupon(coupon);
      toast.success(`Coupon applied! Saved ${discount.toLocaleString()} ETB`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Invalid coupon code");
    } finally {
      setApplyingCoupon(false);
    }
  }, [couponCode, subTotalPrice]);

  const handleRemoveCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode("");
    toast.info("Coupon removed");
  }, []);

  // Submit Order to Payment step
  const handleProceedToPayment = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!address1.trim() || !phoneNumber.trim()) {
        toast.error("Please complete all required shipping fields!");
        return;
      }

      if (!cart || cart.length === 0) {
        toast.error("Your shopping bag is empty!");
        return;
      }

      const shippingAddress = {
        country,
        city,
        subCity,
        address1,
        address2,
        zipCode,
        phoneNumber,
      };

      const orderData = {
        cart,
        totalPrice,
        subTotalPrice,
        shipping: shippingPrice,
        discountPrice: discountAmount,
        shippingAddress,
        user,
        customMeasurements: includeCustomMeasurements
          ? { bust, waist, hips, length, tailoringNotes }
          : undefined,
      };

      // Store in localStorage for payment retrieval
      localStorage.setItem("latestOrder", JSON.stringify(orderData));
      navigate("/payments");
    },
    [
      address1,
      phoneNumber,
      cart,
      country,
      city,
      subCity,
      address2,
      zipCode,
      totalPrice,
      subTotalPrice,
      shippingPrice,
      discountAmount,
      user,
      includeCustomMeasurements,
      bust,
      waist,
      hips,
      length,
      tailoringNotes,
      navigate,
    ]
  );

  return {
    cart,
    user,
    // Shipping fields
    country,
    setCountry,
    city,
    setCity,
    subCity,
    setSubCity,
    phoneNumber,
    setPhoneNumber,
    address1,
    setAddress1,
    address2,
    setAddress2,
    zipCode,
    setZipCode,
    // Custom tailoring
    includeCustomMeasurements,
    setIncludeCustomMeasurements,
    bust,
    setBust,
    waist,
    setWaist,
    hips,
    setHips,
    length,
    setLength,
    tailoringNotes,
    setTailoringNotes,
    handleAutofillMeasurements,
    // Coupon
    couponCode,
    setCouponCode,
    appliedCoupon,
    discountAmount,
    applyingCoupon,
    handleApplyCoupon,
    handleRemoveCoupon,
    // Prices
    subTotalPrice,
    shippingPrice,
    totalPrice,
    formattedSubTotal: formatPrice(subTotalPrice),
    formattedShipping: shippingPrice === 0 ? "FREE" : formatPrice(shippingPrice),
    formattedDiscount: formatPrice(discountAmount),
    formattedTotal: formatPrice(totalPrice),
    // Submit
    handleProceedToPayment,
    navigate,
  };
};

export default useCheckoutLogic;
