import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { server } from "../server";
import { useAppDispatch, useAppSelector } from "./redux";
import { useCurrency } from "./useCurrency";

export type PaymentMethodType = "chapa" | "telebirr";

export const ETHIOPIAN_DELIVERY_ZONES = [
  "Bole Sub-City",
  "Kirkos Sub-City",
  "Arada / Shiro Meda Area",
  "Yeka Sub-City",
  "Lideta Sub-City",
  "Nifas Silk-Lafto",
  "Gullele Sub-City",
  "Kolfe Keranio",
  "Akaky Kaliti",
  "Lemi Kura Sub-City",
  "Regional Delivery (Outside Addis)",
];

export const usePaymentLogic = () => {
  const navigate = useNavigate();
  useAppDispatch();
  const { formatPrice } = useCurrency();
  const { user } = useAppSelector((state) => state.user);

  const [orderData, setOrderData] = useState<any | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>("chapa");
  const [loading, setLoading] = useState<boolean>(false);

  // Phone number for Telebirr / SMS transaction alerts
  const [telebirrNumber, setTelebirrNumber] = useState<string>(
    user?.phoneNumber ? String(user.phoneNumber) : ""
  );
  const [selectedSubCity, setSelectedSubCity] = useState<string>(ETHIOPIAN_DELIVERY_ZONES[0]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("latestOrder");
      if (stored) {
        setOrderData(JSON.parse(stored));
      } else {
        toast.info("No active order found. Please proceed to checkout first.");
        navigate("/cart");
      }
    } catch (e: any) {
      console.error("Failed to parse latest order:", e);
    }
  }, [navigate]);

  useEffect(() => {
    if (user?.phoneNumber && !telebirrNumber) {
      setTelebirrNumber(String(user.phoneNumber));
    }
  }, [user, telebirrNumber]);

  // Primary Chapa Payment Gateway (Natively supports Telebirr, CBEBirr, Awash, Cards)
  const handleChapaPayment = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!orderData || !user) {
        toast.error("Order or customer profile information is missing!");
        return;
      }

      setLoading(true);
      const tx_ref = "tx-chapa-" + Date.now();
      const return_url = `${window.location.origin}/Seccess/${tx_ref}`;

      const nameParts = (user.name || "Customer Habesha").trim().split(" ");
      const firstName = nameParts[0] || "Customer";
      const lastName = nameParts.slice(1).join(" ") || "Customer";

      try {
        const response = await axios.post(`${server}/payment/init`, {
          amount: orderData.totalPrice,
          currency: "ETB",
          first_name: firstName,
          last_name: lastName,
          email: user.email || "customer@mep.et",
          phone_number: telebirrNumber.trim() || user.phoneNumber || undefined,
          tx_ref,
          return_url,
          customization: {
            title: "MEP Crafts",
            description: "Escrow payment for artisan craft order.",
          },
        });

        if (response.data?.data?.checkout_url) {
          // Redirect buyer to official Chapa secure checkout
          window.location.href = response.data.data.checkout_url;
        } else {
          toast.error("Failed to initiate Chapa checkout session");
        }
      } catch (err: any) {
        toast.error(
          err?.response?.data?.error?.message ||
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            "Chapa payment initiation failed. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [orderData, user, telebirrNumber]
  );

  // Telebirr Option (Routes smoothly through Chapa's official Telebirr channel)
  const handleTelebirrPayment = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!orderData || !user) {
        toast.error("Order or customer profile information is missing!");
        return;
      }

      if (telebirrNumber && !/^0[79]\d{8}$/.test(telebirrNumber.replace(/\s+/g, ""))) {
        toast.warning("Please provide a valid 10-digit Ethiopian mobile number (e.g. 0912345678)");
      }

      setLoading(true);
      const tx_ref = "tx-tb-" + Date.now();
      const return_url = `${window.location.origin}/Seccess/${tx_ref}`;

      const nameParts = (user.name || "Customer Habesha").trim().split(" ");
      const firstName = nameParts[0] || "Customer";
      const lastName = nameParts.slice(1).join(" ") || "Customer";

      try {
        const response = await axios.post(`${server}/payment/init`, {
          amount: orderData.totalPrice,
          currency: "ETB",
          first_name: firstName,
          last_name: lastName,
          email: user.email || "customer@mep.et",
          phone_number: telebirrNumber.trim() || user.phoneNumber || undefined,
          tx_ref,
          return_url,
          customization: {
            title: "MEP Telebirr",
            description: "Telebirr payment for craft order.",
          },
        });

        if (response.data?.data?.checkout_url) {
          window.location.href = response.data.data.checkout_url;
        } else {
          toast.error("Failed to initiate Telebirr gateway");
        }
      } catch (err: any) {
        toast.error(
          err?.response?.data?.error?.message ||
            err?.response?.data?.message ||
            "Telebirr initiation failed"
        );
      } finally {
        setLoading(false);
      }
    },
    [orderData, user, telebirrNumber]
  );

  return {
    orderData,
    user,
    selectedMethod,
    setSelectedMethod,
    loading,
    telebirrNumber,
    setTelebirrNumber,
    selectedSubCity,
    setSelectedSubCity,
    handleChapaPayment,
    handleTelebirrPayment,
    formatPrice,
    navigate,
  };
};

export default usePaymentLogic;
