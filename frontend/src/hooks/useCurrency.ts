import { useState, useEffect, useCallback } from "react";
import { CurrencyCode } from "../types";

const ETB_TO_USD_RATE = 0.008; // Estimated baseline conversion rate

export const useCurrency = () => {
  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    return (localStorage.getItem("mep_currency") as CurrencyCode) || "ETB";
  });

  useEffect(() => {
    const handleStorageChange = (e: CustomEvent<CurrencyCode>) => {
      if (e.detail) {
        setCurrency(e.detail);
      }
    };

    window.addEventListener("currencyChange" as any, handleStorageChange);
    return () => {
      window.removeEventListener("currencyChange" as any, handleStorageChange);
    };
  }, []);

  const toggleCurrency = useCallback(() => {
    const nextCur: CurrencyCode = currency === "ETB" ? "USD" : "ETB";
    setCurrency(nextCur);
    localStorage.setItem("mep_currency", nextCur);
    window.dispatchEvent(new CustomEvent("currencyChange", { detail: nextCur }));
  }, [currency]);

  const formatPrice = useCallback(
    (amountInEtb?: number | null) => {
      if (amountInEtb === undefined || amountInEtb === null || isNaN(amountInEtb)) {
        return currency === "ETB" ? "0 ETB" : "$0.00";
      }

      if (currency === "USD") {
        const usdVal = amountInEtb * ETB_TO_USD_RATE;
        return `$${usdVal.toFixed(2)}`;
      }

      return `${amountInEtb.toLocaleString()} ETB`;
    },
    [currency]
  );

  return { currency, toggleCurrency, formatPrice };
};
