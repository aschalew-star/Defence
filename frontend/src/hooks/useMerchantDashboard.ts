import { useState, useEffect, useMemo, useCallback, FormEvent } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { server } from "../server";
import { useAppDispatch, useAppSelector } from "./redux";
import { getAllOrdersOfShop } from "../redux/Action/order";
import { getAllProductsShop, deleteProduct } from "../redux/Action/productAction";
import { getAllEventsShop } from "../redux/Action/event";
import { IProduct, IOrder, IEvent } from "../types";

export interface UseMerchantDashboardReturn {
  seller: any;
  orders: IOrder[];
  products: IProduct[];
  events: IEvent[];
  stats: {
    totalRevenue: number;
    deliveredCount: number;
    pendingCount: number;
    totalOrders: number;
    totalProducts: number;
  };
  // Withdraw Modal State & Handlers
  withdrawModalOpen: boolean;
  setWithdrawModalOpen: (val: boolean) => void;
  withdrawAmount: string;
  setWithdrawAmount: (val: string) => void;
  payoutMethodType: "telebirr" | "bank_transfer";
  setPayoutMethodType: (val: "telebirr" | "bank_transfer") => void;
  accountNumber: string;
  setAccountNumber: (val: string) => void;
  accountHolderName: string;
  setAccountHolderName: (val: string) => void;
  submittingWithdraw: boolean;
  handleWithdrawSubmit: (e: FormEvent) => Promise<void>;
  // KYC Verification Modal State & Handlers
  verifyModalOpen: boolean;
  setVerifyModalOpen: (val: boolean) => void;
  tinNumber: string;
  setTinNumber: (val: string) => void;
  businessRegistrationNumber: string;
  setBusinessRegistrationNumber: (val: string) => void;
  businessType: string;
  setBusinessType: (val: string) => void;
  idType: string;
  setIdType: (val: string) => void;
  idNumber: string;
  setIdNumber: (val: string) => void;
  submittingVerify: boolean;
  handleVerifySubmit: (e: FormEvent) => Promise<void>;
  // Product Modals
  selectedProduct: IProduct | null;
  setSelectedProduct: (val: IProduct | null) => void;
  productModalOpen: boolean;
  setProductModalOpen: (val: boolean) => void;
  editModalOpen: boolean;
  setEditModalOpen: (val: boolean) => void;
  productToEdit: IProduct | null;
  setProductToEdit: (val: IProduct | null) => void;
  handleDeleteProduct: (id: string) => void;
}

export const useMerchantDashboard = (): UseMerchantDashboardReturn => {
  const dispatch = useAppDispatch();
  const { orders } = useAppSelector((state) => state.order);
  const { seller } = useAppSelector((state) => state.seller);
  const { products } = useAppSelector((state) => state.products);
  const { events } = useAppSelector((state) => state.events);

  const effectiveSeller: any = seller;
  const effectiveOrders = useMemo(() => orders || [], [orders]);
  const effectiveProducts = useMemo(() => products || [], [products]);

  // Withdraw state
  const [withdrawModalOpen, setWithdrawModalOpen] = useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [payoutMethodType, setPayoutMethodType] = useState<"telebirr" | "bank_transfer">("telebirr");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [accountHolderName, setAccountHolderName] = useState<string>("");
  const [submittingWithdraw, setSubmittingWithdraw] = useState<boolean>(false);

  // KYC Verification state
  const [verifyModalOpen, setVerifyModalOpen] = useState<boolean>(false);
  const [tinNumber, setTinNumber] = useState<string>(effectiveSeller?.tinNumber || "");
  const [businessRegistrationNumber, setBusinessRegistrationNumber] = useState<string>(
    effectiveSeller?.businessRegistrationNumber || ""
  );
  const [businessType, setBusinessType] = useState<string>(effectiveSeller?.businessType || "Sole Proprietor / Artisan Guild");
  const [idType, setIdType] = useState<string>(effectiveSeller?.idType || "Kebele / National ID");
  const [idNumber, setIdNumber] = useState<string>(effectiveSeller?.idNumber || "");
  const [submittingVerify, setSubmittingVerify] = useState<boolean>(false);

  // Product modals
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [productModalOpen, setProductModalOpen] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [productToEdit, setProductToEdit] = useState<IProduct | null>(null);

  useEffect(() => {
    if (effectiveSeller?._id) {
      dispatch(getAllOrdersOfShop(effectiveSeller._id) as any);
      dispatch(getAllProductsShop(effectiveSeller._id) as any);
      dispatch(getAllEventsShop(effectiveSeller._id) as any);
    }
  }, [dispatch, effectiveSeller?._id]);

  const stats = useMemo(() => {
    const orderList: IOrder[] = Array.isArray(effectiveOrders) ? effectiveOrders : [];
    const prodList: IProduct[] = Array.isArray(effectiveProducts) ? effectiveProducts : [];

    const totalRevenue = orderList.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);
    const deliveredCount = orderList.filter((o) => o.status === "Delivered").length;
    const pendingCount = orderList.filter(
      (o) =>
        o.status === "Processing" ||
        o.status === "Tailoring & Handweaving" ||
        o.status === "Transferred to delivery partner" ||
        o.status === "Out for delivery"
    ).length;

    return {
      totalRevenue,
      deliveredCount,
      pendingCount,
      totalOrders: orderList.length,
      totalProducts: prodList.length,
    };
  }, [effectiveOrders, effectiveProducts]);

  const handleDeleteProduct = useCallback(
    (id: string) => {
      if (window.confirm("Are you sure you want to remove this craft from your store?")) {
        dispatch(deleteProduct(id) as any);
        toast.success("Craft removed successfully");
      }
    },
    [dispatch]
  );

  const handleWithdrawSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);
    if (!amountNum || amountNum <= 0) {
      toast.error("Please enter a valid payout amount");
      return;
    }

    if (amountNum > (seller?.availableBalance || 0)) {
      toast.error("Withdrawal amount exceeds your available balance");
      return;
    }

    setSubmittingWithdraw(true);
    try {
      const res = await axios.post(
        `${server}/withdraw/create-withdraw-request`,
        {
          amount: amountNum,
          payoutMethod: {
            type: payoutMethodType,
            accountNumber,
            accountHolderName,
          },
        },
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.success("Withdrawal request submitted successfully!");
        setWithdrawModalOpen(false);
        setWithdrawAmount("");
        setAccountNumber("");
        setAccountHolderName("");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit withdrawal request");
    } finally {
      setSubmittingWithdraw(false);
    }
  };

  const handleVerifySubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmittingVerify(true);
    try {
      const res = await axios.put(
        `${server}/shop/update-seller-info`,
        {
          tinNumber,
          businessRegistrationNumber,
          businessType,
          idType,
          idNumber,
        },
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.success("Verification credentials submitted for review!");
        setVerifyModalOpen(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Verification submission failed");
    } finally {
      setSubmittingVerify(false);
    }
  };

  return {
    seller: effectiveSeller,
    orders: effectiveOrders,
    products: effectiveProducts,
    events: (events as any) || [],
    stats,
    withdrawModalOpen,
    setWithdrawModalOpen,
    withdrawAmount,
    setWithdrawAmount,
    payoutMethodType,
    setPayoutMethodType,
    accountNumber,
    setAccountNumber,
    accountHolderName,
    setAccountHolderName,
    submittingWithdraw,
    handleWithdrawSubmit,
    verifyModalOpen,
    setVerifyModalOpen,
    tinNumber,
    setTinNumber,
    businessRegistrationNumber,
    setBusinessRegistrationNumber,
    businessType,
    setBusinessType,
    idType,
    setIdType,
    idNumber,
    setIdNumber,
    submittingVerify,
    handleVerifySubmit,
    selectedProduct,
    setSelectedProduct,
    productModalOpen,
    setProductModalOpen,
    editModalOpen,
    setEditModalOpen,
    productToEdit,
    setProductToEdit,
    handleDeleteProduct,
  };
};

export default useMerchantDashboard;
