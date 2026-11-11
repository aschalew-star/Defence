import React, { useEffect, useState } from "react";
import { BsBagCheck, BsScissors, BsTruck, BsShieldCheck } from "react-icons/bs";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfUser } from "../redux/Action/order";
import { RxCross1 } from "react-icons/rx";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import axios from "axios";
import { toast } from "react-toastify";
import { server } from "../server";

const UserOrderDetails = () => {
  const { orders } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [rating, setRating] = useState(5);

  // Dispute state
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("Damaged item");
  const [disputeDetails, setDisputeDetails] = useState("");
  const [submittingDispute, setSubmittingDispute] = useState(false);

  // Legal Tax Invoice Modal state
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  const { id } = useParams();

  useEffect(() => {
    if (user?._id) {
      dispatch(getAllOrdersOfUser(user._id));
    }
  }, [dispatch, user?._id]);

  const data = orders && orders.find((item) => item._id === id);

  const reviewHandler = async () => {
    try {
      const res = await axios.put(
        `${server}/product/create-new-review`,
        {
          user,
          rating,
          comment,
          productId: selectedItem?._id,
          orderId: id,
        },
        { withCredentials: true }
      );
      toast.success(res.data.message || "Review submitted successfully!");
      if (user?._id) {
        dispatch(getAllOrdersOfUser(user._id));
      }
      setOpen(false);
      setComment("");
      setRating(5);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error submitting review");
    }
  };

  const refundHandler = async () => {
    try {
      const res = await axios.put(
        `${server}/order/order-refund/${id}`,
        {
          status: "Processing refund",
        },
        { withCredentials: true }
      );
      toast.success(res.data.message || "Refund requested!");
      if (user?._id) {
        dispatch(getAllOrdersOfUser(user._id));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Refund request failed");
    }
  };

  const disputeHandler = async (e) => {
    e.preventDefault();
    if (!disputeDetails.trim()) {
      toast.error("Please explain your dispute or tailoring discrepancy!");
      return;
    }
    setSubmittingDispute(true);
    try {
      await axios.post(
        `${server}/dispute/raise-dispute`,
        {
          orderId: id,
          shopId: data?.cart?.[0]?.shopId || data?.cart?.[0]?.shop?._id,
          reason: disputeReason,
          details: disputeDetails,
        },
        { withCredentials: true }
      );
      toast.success("Dispute raised. Platform arbitrator and merchant have been notified.");
      setDisputeOpen(false);
      setDisputeDetails("");
      if (user?._id) {
        dispatch(getAllOrdersOfUser(user._id));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to raise dispute");
    } finally {
      setSubmittingDispute(false);
    }
  };

  const confirmDeliveryHandler = async () => {
    try {
      const res = await axios.post(
        `${server}/order/confirm-delivery/${id}`,
        {},
        { withCredentials: true }
      );
      toast.success(res.data.message || "Delivery confirmed! Escrow released to artisan.");
      if (user?._id) {
        dispatch(getAllOrdersOfUser(user._id));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to confirm delivery");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Shipping":
      case "On the way":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "In Tailoring":
      case "Crafting":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Processing refund":
      case "Refund Success":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // If no specific order ID is requested, show list of all user orders
  if (!id) {
    return (
      <div className="py-10 px-4 md:px-8 min-h-screen max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100/70 text-amber-800 flex items-center justify-center text-xl shadow-sm">
              <BsBagCheck />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Craft Orders</h1>
              <p className="text-xs text-gray-500">Track and review your handcrafted Habesha apparel orders</p>
            </div>
          </div>
          <Link
            to="/products"
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 transition border border-amber-200/60"
          >
            Explore Catalog →
          </Link>
        </div>

        {!orders || orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-amber-100/60 p-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-3xl">
              🛍️
            </div>
            <h2 className="text-xl font-bold text-gray-900">No Orders Placed Yet</h2>
            <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
              You haven't ordered any handcrafted Habesha kemis or cultural attire yet.
            </p>
            <Link to="/products">
              <button className="mt-6 px-6 py-2.5 bg-gradient-to-r from-amber-700 to-amber-900 text-white rounded-xl font-semibold shadow hover:from-amber-800 hover:to-amber-950 transition text-sm">
                Start Exploring
              </button>
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-200/80">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 text-sm text-left">
                <thead className="bg-amber-50/50 text-gray-600 uppercase text-[11px] font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Order Ref</th>
                    <th className="px-6 py-4">Placed Date</th>
                    <th className="px-6 py-4">Crafts</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Total Amount</th>
                    <th className="px-6 py-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((o) => (
                    <tr key={o._id} className="hover:bg-amber-50/20 transition">
                      <td className="px-6 py-4 font-mono font-bold text-gray-900 text-xs">
                        {o.orderNumber || `#${o._id?.slice(-8).toUpperCase()}`}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-6 py-4 text-gray-700 font-medium">
                        {o.cart?.length || 0} craft(s)
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 text-[11px] font-bold rounded-full border ${getStatusBadge(
                            o.status
                          )}`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-amber-900">
                        {Number(o.totalPrice || 0).toLocaleString()} <span className="text-xs text-amber-700 font-bold">ETB</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/order/${o._id}`}>
                          <button className="px-3.5 py-1.5 text-xs bg-gray-900 hover:bg-black text-white rounded-lg font-semibold transition shadow-sm">
                            View Order
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // If order details is requested for specific ID
  return (
    <div className="py-10 px-4 md:px-8 min-h-screen max-w-5xl mx-auto">
      <div className="w-full flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100/70 text-amber-800 flex items-center justify-center text-xl shadow-sm">
            <BsBagCheck />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Order Details</h1>
            <p className="text-xs text-gray-500">
              Ref: <span className="font-mono font-bold text-gray-800">{data?.orderNumber || `#${data?._id?.slice(-8).toUpperCase()}`}</span>
            </p>
          </div>
        </div>
        <Link to="/order">
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-xs transition">
            ← Back to Orders
          </button>
        </Link>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-200/80 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">Placed On</span>
            <p className="font-semibold text-gray-900 text-sm mt-0.5">
              {data?.createdAt ? new Date(data.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">Status:</span>
            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusBadge(data?.status)}`}>
              {data?.status}
            </span>
          </div>
        </div>

        {/* Order items */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Ordered Crafts</h3>
          <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
            {data &&
              data?.cart?.map((item, index) => {
                return (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-amber-50/20 transition gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.images?.[0]?.url || "/placeholder.jpg"}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-xl border border-gray-100 shadow-sm"
                      />
                      <div>
                        <h5 className="text-sm font-bold text-gray-900">{item.name}</h5>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {Number(item.discountPrice || item.originalPrice || 0).toLocaleString()} ETB × {item.qty}
                        </p>
                        {item.size && (
                          <span className="inline-block mt-1 text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            Size: {item.size}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <span className="font-black text-amber-900 text-sm">
                        {(Number(item.discountPrice || item.originalPrice || 0) * (item.qty || 1)).toLocaleString()} ETB
                      </span>
                      {!item.isReviewed && data?.status === "Delivered" && (
                        <button
                          className="px-3.5 py-1.5 text-xs bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-semibold transition shadow-sm cursor-pointer"
                          onClick={() => {
                            setOpen(true);
                            setSelectedItem(item);
                          }}
                        >
                          Write Review
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Total Price */}
        <div className="p-4 bg-amber-50/60 rounded-2xl flex items-center justify-between border border-amber-200/40">
          <span className="text-sm font-bold text-gray-700">Total Paid</span>
          <span className="text-2xl font-black text-amber-900">
            {Number(data?.totalPrice || 0).toLocaleString()} <span className="text-base text-amber-700 font-bold">ETB</span>
          </span>
        </div>

        {/* Custom Measurements Card (if present) */}
        {data?.customMeasurements && (data.customMeasurements.bust || data.customMeasurements.waist || data.customMeasurements.hips || data.customMeasurements.length) && (
          <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50/40 rounded-2xl border border-amber-200/60">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-3">
              <BsScissors className="text-amber-700" />
              <span>Custom Tailoring Specifications</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-2xs">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Bust</span>
                <span className="font-bold text-gray-800 text-sm">{data.customMeasurements.bust || "—"}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-2xs">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Waist</span>
                <span className="font-bold text-gray-800 text-sm">{data.customMeasurements.waist || "—"}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-2xs">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Hips</span>
                <span className="font-bold text-gray-800 text-sm">{data.customMeasurements.hips || "—"}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-2xs">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Length</span>
                <span className="font-bold text-gray-800 text-sm">{data.customMeasurements.length || "—"}</span>
              </div>
            </div>
            {data.customMeasurements.notes && (
              <p className="mt-3 text-xs text-gray-600 bg-white/80 p-2.5 rounded-lg border border-amber-100">
                <strong className="text-amber-900">Artisan Notes:</strong> {data.customMeasurements.notes}
              </p>
            )}
          </div>
        )}

        {/* Shipping, Delivery & Payment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
          <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/70">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
              <BsTruck className="text-gray-700" />
              <span>Delivery & Shipping</span>
            </h4>
            <p className="text-sm font-semibold text-gray-900">
              {data?.shippingAddress?.address1 ? `${data.shippingAddress.address1} ${data.shippingAddress.address2 || ""}` : "Not specified"}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {data?.shippingAddress?.city}, {data?.shippingAddress?.country || "Ethiopia"}
            </p>
            <p className="text-xs text-gray-600 mt-1">Recipient Phone: {data?.user?.phoneNumber || "N/A"}</p>

            {data?.deliveryDetails?.trackingCode && (
              <div className="mt-4 pt-3 border-t border-gray-200/60">
                <span className="text-[10px] uppercase font-bold text-gray-400">Tracking Code</span>
                <p className="font-mono text-xs font-bold text-emerald-800 mt-0.5">
                  {data.deliveryDetails.provider ? `${data.deliveryDetails.provider} — ` : ""}{data.deliveryDetails.trackingCode}
                </p>
              </div>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/70">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
              <BsShieldCheck className="text-gray-700" />
              <span>Payment Details</span>
            </h4>
            <div className="space-y-1.5 text-xs text-gray-600">
              <p>
                Status: <span className="font-bold text-emerald-700">{data?.paymentInfo?.status || "Paid"}</span>
              </p>
              <p>
                Method: <span className="font-semibold text-gray-900">{data?.paymentInfo?.type || "Chapa / Telebirr"}</span>
              </p>
              {data?.paymentInfo?.id && (
                <p className="font-mono text-[11px] text-gray-500 truncate">
                  Ref: {data.paymentInfo.id}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-4">
              <button
                className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl font-semibold text-xs shadow-xs transition"
                onClick={() => setInvoiceModalOpen(true)}
              >
                📜 View Tax E-Invoice (MoR Receipt)
              </button>

              {(data?.status === "Delivered - Pending Inspection" || data?.status === "Transferred to delivery partner" || data?.status === "Out for delivery") && (
                <button
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition"
                  onClick={confirmDeliveryHandler}
                >
                  ✓ Confirm Quality & Release Escrow
                </button>
              )}

              {data?.status === "Delivered" && (
                <button
                  className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl font-semibold text-xs transition"
                  onClick={refundHandler}
                >
                  Request Order Refund
                </button>
              )}
              {data?.status !== "Cancelled" && (
                <button
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-semibold text-xs border border-rose-200 transition"
                  onClick={() => setDisputeOpen(true)}
                >
                  Open Dispute / Tailoring Claim
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Dialog */}
      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 animate-fadeIn border border-gray-100">
            <div className="w-full flex justify-between items-center pb-4 border-b border-gray-100">
              <h2 className="text-lg font-black text-gray-900">
                Review Handcrafted Craft
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <RxCross1 size={18} />
              </button>
            </div>

            <div className="flex items-center gap-4 py-4 border-b border-gray-100">
              <img
                src={selectedItem?.images?.[0]?.url || "/placeholder.jpg"}
                alt=""
                className="w-14 h-14 object-cover rounded-xl border border-gray-100 shadow-2xs"
              />
              <div>
                <p className="text-sm font-bold text-gray-900">{selectedItem?.name}</p>
                <p className="text-xs text-amber-700 font-bold">
                  {selectedItem?.discountPrice || selectedItem?.originalPrice} ETB
                </p>
              </div>
            </div>

            <div className="pt-4">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                Your Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((i) =>
                  rating >= i ? (
                    <AiFillStar
                      key={i}
                      className="cursor-pointer text-amber-500 hover:scale-110 transition"
                      size={28}
                      onClick={() => setRating(i)}
                    />
                  ) : (
                    <AiOutlineStar
                      key={i}
                      className="cursor-pointer text-gray-300 hover:scale-110 transition"
                      size={28}
                      onClick={() => setRating(i)}
                    />
                  )
                )}
              </div>
            </div>

            <div className="pt-4">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                Feedback for the Artisan Weaver
              </label>
              <textarea
                rows="4"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts on the tibeb embroidery, cotton softness, fit, or craftsmanship..."
                className="w-full border border-gray-200 p-3 rounded-xl text-sm outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-bold text-xs shadow transition"
                onClick={reviewHandler}
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {disputeOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 animate-fadeIn border border-gray-100">
            <div className="w-full flex justify-between items-center pb-4 border-b border-gray-100">
              <h2 className="text-lg font-black text-gray-900 font-serif">
                Open Arbitration Dispute
              </h2>
              <button
                onClick={() => setDisputeOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <RxCross1 size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-500 py-3">
              If your garment arrived damaged, has sizing discrepancies, or was not received,
              our platform arbitration committee will review your claim and hold or refund your escrow.
            </p>

            <form onSubmit={disputeHandler} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                  Reason for Dispute
                </label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-xs outline-none focus:border-amber-600 font-semibold"
                >
                  <option value="Damaged item">Damaged item / Defective weaving</option>
                  <option value="Item not as described">Item not as described</option>
                  <option value="Wrong size / tailoring">Wrong size / custom tailoring discrepancy</option>
                  <option value="Late delivery">Late courier delivery</option>
                  <option value="Item not received">Item not received</option>
                  <option value="Quality issue">Gold Tibeb embroidery quality issue</option>
                  <option value="Other">Other reason</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                  Claim Explanation & Evidence Details
                </label>
                <textarea
                  rows="4"
                  value={disputeDetails}
                  onChange={(e) => setDisputeDetails(e.target.value)}
                  placeholder="Describe what went wrong with the garment or delivery so the merchant and arbitrator can investigate..."
                  className="w-full border border-gray-200 p-3 rounded-xl text-xs outline-none focus:border-amber-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setDisputeOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDispute}
                  className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold text-xs shadow transition disabled:bg-gray-300"
                >
                  {submittingDispute ? "Submitting..." : "Submit Dispute Claim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrderDetails;
