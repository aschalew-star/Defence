import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { server } from "../server";
import { useAppDispatch, useAppSelector } from "./redux";
import { useCurrency } from "./useCurrency";
import { getAllOrdersOfShop, getAllOrdersOfUser } from "../redux/Action/order";
import { IOrder } from "../types";

export const ORDER_STATUS_STEPS = [
  "Processing",
  "Tailoring & Handweaving",
  "Quality Checked",
  "Transferred to delivery partner",
  "Out for delivery",
  "Delivered",
] as const;

export const useMerchantOrderDetails = (orderId?: string) => {
  const routeParams = useParams<{ id: string }>();
  const id = orderId || routeParams.id;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const { seller } = useAppSelector((state) => state.seller);
  const { orders } = useAppSelector((state) => state.order);

  const [order, setOrder] = useState<IOrder | any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [status, setStatus] = useState<string>("");
  const [deliveryProvider, setDeliveryProvider] = useState<string>("");
  const [trackingCode, setTrackingCode] = useState<string>("");
  const [statusNote, setStatusNote] = useState<string>("");
  const [updating, setUpdating] = useState<boolean>(false);

  // OTP Verification
  const [otpInput, setOtpInput] = useState<string>("");
  const [verifyingOtp, setVerifyingOtp] = useState<boolean>(false);

  // Pre-shipment proof upload
  const [proofPhoto, setProofPhoto] = useState<string>("");
  const [proofNote, setProofNote] = useState<string>("");
  const [uploadingProof, setUploadingProof] = useState<boolean>(false);
  const [showProofModal, setShowProofModal] = useState<boolean>(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState<boolean>(false);

  // Load order data
  useEffect(() => {
    if (seller?._id) {
      dispatch(getAllOrdersOfShop(seller._id));
    }
  }, [dispatch, seller?._id]);

  useEffect(() => {
    if (orders && id) {
      const found = orders.find((o: any) => o._id === id || o.orderNumber === id);
      if (found) {
        setOrder(found);
        setStatus(found.status || "Processing");
        setDeliveryProvider(found.deliveryProvider || "");
        setTrackingCode(found.trackingCode || "");
      }
      setLoading(false);
    } else if (orders) {
      setLoading(false);
    }
  }, [orders, id]);

  // Update order status
  const handleUpdateStatus = useCallback(async () => {
    if (!id || !status) return;
    setUpdating(true);
    try {
      const res = await axios.put(
        `${server}/order/update-order-status/${id}`,
        {
          status,
          deliveryProvider,
          trackingCode,
          statusNote,
        },
        { withCredentials: true }
      );

      if (res.data?.success) {
        toast.success("Order status and delivery tracking updated successfully!");
        if (seller?._id) {
          dispatch(getAllOrdersOfShop(seller._id));
        }
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update order status");
    } finally {
      setUpdating(false);
    }
  }, [id, status, deliveryProvider, trackingCode, statusNote, seller?._id, dispatch]);

  // Verify OTP
  const handleVerifyOtp = useCallback(async () => {
    if (!otpInput.trim()) {
      toast.error("Please enter the 6-digit delivery confirmation OTP");
      return;
    }
    setVerifyingOtp(true);
    try {
      const res = await axios.post(
        `${server}/order/verify-delivery-otp/${id}`,
        { otp: otpInput.trim() },
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.success("OTP Verified! Order marked as officially delivered.");
        setOtpInput("");
        if (seller?._id) {
          dispatch(getAllOrdersOfShop(seller._id));
        }
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Invalid delivery confirmation OTP code");
    } finally {
      setVerifyingOtp(false);
    }
  }, [id, otpInput, seller?._id, dispatch]);

  // Upload proof
  const handleProofUpload = useCallback(async () => {
    if (!proofPhoto) {
      toast.error("Please provide or upload a photo of the completed garment");
      return;
    }
    setUploadingProof(true);
    try {
      const res = await axios.post(
        `${server}/order/upload-shipment-proof/${id}`,
        { proofPhoto, proofNote },
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.success("Pre-shipment artisan proof photo uploaded successfully!");
        setShowProofModal(false);
        setProofPhoto("");
        setProofNote("");
        if (seller?._id) {
          dispatch(getAllOrdersOfShop(seller._id));
        }
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to upload shipment proof");
    } finally {
      setUploadingProof(false);
    }
  }, [id, proofPhoto, proofNote, seller?._id, dispatch]);

  return {
    order,
    loading,
    status,
    setStatus,
    deliveryProvider,
    setDeliveryProvider,
    trackingCode,
    setTrackingCode,
    statusNote,
    setStatusNote,
    updating,
    handleUpdateStatus,
    // OTP
    otpInput,
    setOtpInput,
    verifyingOtp,
    handleVerifyOtp,
    // Proof
    proofPhoto,
    setProofPhoto,
    proofNote,
    setProofNote,
    uploadingProof,
    showProofModal,
    setShowProofModal,
    handleProofUpload,
    // Invoice
    invoiceModalOpen,
    setInvoiceModalOpen,
    formatPrice,
    navigate,
    seller,
  };
};

export const useUserOrderDetails = (orderId?: string) => {
  const routeParams = useParams<{ id: string }>();
  const id = orderId || routeParams.id;
  const dispatch = useAppDispatch();
  const { formatPrice } = useCurrency();

  const { orders, isLoading } = useAppSelector((state) => state.order);
  const { user } = useAppSelector((state) => state.user);

  const [reviewOpen, setReviewOpen] = useState<boolean>(false);
  const [comment, setComment] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [rating, setRating] = useState<number>(5);

  // Dispute state
  const [disputeOpen, setDisputeOpen] = useState<boolean>(false);
  const [disputeReason, setDisputeReason] = useState<string>("Damaged item");
  const [disputeDetails, setDisputeDetails] = useState<string>("");
  const [submittingDispute, setSubmittingDispute] = useState<boolean>(false);

  // Invoice modal
  const [invoiceModalOpen, setInvoiceModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (user?._id) {
      dispatch(getAllOrdersOfUser(user._id));
    }
  }, [dispatch, user?._id]);

  const order = orders
    ? orders.find((item: any) => item._id === id || item.orderNumber === id)
    : null;

  const handleReviewSubmit = useCallback(async () => {
    try {
      const pId = selectedItem?._id || selectedItem?.id;
      const res = await axios.post(
        `${server}/review/create-review`,
        {
          rating,
          comment,
          productId: pId,
          orderId: id,
        },
        { withCredentials: true }
      );
      toast.success(res.data?.message || "Review submitted successfully!");
      setReviewOpen(false);
      setComment("");
      if (user?._id) {
        dispatch(getAllOrdersOfUser(user._id));
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to submit review");
    }
  }, [rating, comment, selectedItem, id, user?._id, dispatch]);

  const handleDisputeSubmit = useCallback(async () => {
    if (!disputeDetails.trim()) {
      toast.error("Please provide details for your dispute claim");
      return;
    }
    setSubmittingDispute(true);
    try {
      const res = await axios.post(
        `${server}/order/order-refund/${id}`,
        {
          status: "Processing refund",
          reason: disputeReason,
          details: disputeDetails,
        },
        { withCredentials: true }
      );
      toast.success(res.data?.message || "Dispute claim submitted for mediator review!");
      setDisputeOpen(false);
      setDisputeDetails("");
      if (user?._id) {
        dispatch(getAllOrdersOfUser(user._id));
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to submit dispute claim");
    } finally {
      setSubmittingDispute(false);
    }
  }, [id, disputeReason, disputeDetails, user?._id, dispatch]);

  const handleRefundRequest = useCallback(async () => {
    try {
      const res = await axios.put(
        `${server}/order/order-refund/${id}`,
        { status: "Processing refund" },
        { withCredentials: true }
      );
      toast.success(res.data?.message || "Refund requested!");
      if (user?._id) {
        dispatch(getAllOrdersOfUser(user._id));
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Refund request failed");
    }
  }, [id, user?._id, dispatch]);

  const handleConfirmDelivery = useCallback(async () => {
    try {
      const res = await axios.post(
        `${server}/order/confirm-delivery/${id}`,
        {},
        { withCredentials: true }
      );
      toast.success(res.data?.message || "Delivery confirmed! Escrow released to artisan.");
      if (user?._id) {
        dispatch(getAllOrdersOfUser(user._id));
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to confirm delivery");
    }
  }, [id, user?._id, dispatch]);

  return {
    id,
    order,
    orders,
    loading: isLoading,
    user,
    // Review
    reviewOpen,
    setReviewOpen,
    comment,
    setComment,
    selectedItem,
    setSelectedItem,
    rating,
    setRating,
    handleReviewSubmit,
    // Dispute
    disputeOpen,
    setDisputeOpen,
    disputeReason,
    setDisputeReason,
    disputeDetails,
    setDisputeDetails,
    submittingDispute,
    handleDisputeSubmit,
    handleRefundRequest,
    handleConfirmDelivery,
    // Invoice
    invoiceModalOpen,
    setInvoiceModalOpen,
    formatPrice,
  };
};
