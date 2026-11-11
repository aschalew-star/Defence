import React, { useEffect, useState } from "react";
import { BsFillBagFill, BsTruck, BsScissors, BsPerson, BsTelephone, BsGeoAlt } from "react-icons/bs";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfShop } from "../../redux/Action/order";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";

const ORDER_STATUS_STEPS = [
  "Processing",
  "Tailoring & Handweaving",
  "Quality Checked",
  "Transferred to delivery partner",
  "On the way",
  "Delivered",
];

const OrderDetails = () => {
  const { orders } = useSelector((state) => state.order);
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const [status, setStatus] = useState("");
  const [deliveryProvider, setDeliveryProvider] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (seller?._id) dispatch(getAllOrdersOfShop(seller._id));
  }, [dispatch, seller]);

  const data = orders && orders.find((item) => item._id === id);

  useEffect(() => {
    if (data) {
      setStatus(data.status || "Processing");
      setDeliveryProvider(data.deliveryProvider || "");
      setTrackingCode(data.trackingCode || "");
    }
  }, [data]);

  const orderUpdateHandler = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const res = await axios.put(
        `${server}/order/update-order-status/${id}`,
        {
          status,
          deliveryProvider,
          trackingCode,
        },
        { withCredentials: true }
      );

      toast.success("Order status and tracking updated successfully!");
      if (seller?._id) dispatch(getAllOrdersOfShop(seller._id));
      navigate("/AllOrders");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update order");
    } finally {
      setUpdating(false);
    }
  };

  const refundOrderUpdateHandler = async () => {
    setUpdating(true);
    try {
      await axios.put(
        `${server}/order/order-refund-success/${id}`,
        { status },
        { withCredentials: true }
      );
      toast.success("Refund processed successfully!");
      if (seller?._id) dispatch(getAllOrdersOfShop(seller._id));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to process refund");
    } finally {
      setUpdating(false);
    }
  };

  if (!data) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center p-8">
        <p className="text-stone-500 text-sm">Loading order details...</p>
      </div>
    );
  }

  const isRefundMode = data.status === "Processing refund" || data.status === "Refund Success";
  const customMeasurements = data.customMeasurements || {};
  const hasMeasurements =
    customMeasurements.bust ||
    customMeasurements.waist ||
    customMeasurements.hips ||
    customMeasurements.length;

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-800">
            <BsFillBagFill size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-stone-900">
              Order #{data.orderNumber || data._id?.slice(-8).toUpperCase()}
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Placed on {new Date(data.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>

        <Link
          to="/AllOrders"
          className="self-start sm:self-auto px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-all"
        >
          ← Back to All Orders
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Order Items & Measurements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-stone-900 font-serif">Purchased Items</h3>

            <div className="divide-y divide-stone-100">
              {data.cart?.map((item, idx) => (
                <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                  <img
                    src={item.images?.[0]?.url || "/photo.jpg"}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover border border-stone-200"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-stone-900 truncate">{item.name}</h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Price: {Number(item.discountPrice || item.originalPrice || 0).toLocaleString()} ETB × {item.qty || 1}
                    </p>
                    {item.selectedSize && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[11px] font-medium">
                        Size: {item.selectedSize}
                      </span>
                    )}
                  </div>
                  <div className="text-right font-bold text-stone-900 text-sm">
                    {Number((item.discountPrice || item.originalPrice || 0) * (item.qty || 1)).toLocaleString()} ETB
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-stone-200 flex justify-between items-center text-sm">
              <span className="font-semibold text-stone-700">Order Total Amount:</span>
              <span className="text-lg font-bold text-emerald-800">
                {Number(data.totalPrice || 0).toLocaleString()} ETB
              </span>
            </div>
          </div>

          {/* Custom Tailoring Measurements if provided */}
          {hasMeasurements && (
            <div className="bg-amber-50/60 rounded-2xl border border-amber-200 p-6 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm">
                <BsScissors size={18} />
                <span>Custom Body Measurements (Custom Tailoring)</span>
              </div>
              <p className="text-xs text-stone-600">
                The buyer requested custom tailored fitting for this traditional garment.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                {customMeasurements.bust && (
                  <div className="bg-white p-2.5 rounded-xl border border-amber-200/80">
                    <div className="text-stone-500 font-medium">Bust</div>
                    <div className="font-bold text-stone-900 text-sm mt-0.5">{customMeasurements.bust} cm/in</div>
                  </div>
                )}
                {customMeasurements.waist && (
                  <div className="bg-white p-2.5 rounded-xl border border-amber-200/80">
                    <div className="text-stone-500 font-medium">Waist</div>
                    <div className="font-bold text-stone-900 text-sm mt-0.5">{customMeasurements.waist} cm/in</div>
                  </div>
                )}
                {customMeasurements.hips && (
                  <div className="bg-white p-2.5 rounded-xl border border-amber-200/80">
                    <div className="text-stone-500 font-medium">Hips</div>
                    <div className="font-bold text-stone-900 text-sm mt-0.5">{customMeasurements.hips} cm/in</div>
                  </div>
                )}
                {customMeasurements.length && (
                  <div className="bg-white p-2.5 rounded-xl border border-amber-200/80">
                    <div className="text-stone-500 font-medium">Length</div>
                    <div className="font-bold text-stone-900 text-sm mt-0.5">{customMeasurements.length} cm/in</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Delivery & Shipping Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 space-y-3">
            <h3 className="text-base font-bold text-stone-900 font-serif flex items-center gap-2">
              <BsGeoAlt size={16} className="text-stone-600" /> Shipping & Customer Details
            </h3>

            <div className="text-xs space-y-1.5 text-stone-700">
              <div className="flex items-center gap-2">
                <BsPerson className="text-stone-400" />
                <span className="font-semibold text-stone-900">{data.user?.name || "Customer"}</span>
                <span className="text-stone-400">({data.user?.email || "No email"})</span>
              </div>
              <div className="flex items-center gap-2">
                <BsTelephone className="text-stone-400" />
                <span>{data.user?.phoneNumber || data.shippingAddress?.phoneNumber || "No phone provided"}</span>
              </div>
              <div className="pt-2 text-stone-600">
                <div className="font-medium text-stone-900">Destination:</div>
                <div>{data.shippingAddress?.address1} {data.shippingAddress?.address2}</div>
                <div>{data.shippingAddress?.city}, {data.shippingAddress?.country || "Ethiopia"}</div>
              </div>
              {data.deliveryNotes && (
                <div className="mt-2 p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-600">
                  <span className="font-semibold text-stone-800">Customer Note:</span> {data.deliveryNotes}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Status & Fulfillment Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-stone-900 font-serif flex items-center gap-2">
              <BsTruck size={18} className="text-emerald-700" /> Fulfillment & Status
            </h3>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
              <div className="text-xs text-stone-500 font-medium">Current Status</div>
              <div className="text-sm font-bold text-emerald-800 capitalize">{data.status}</div>
              <div className="text-[11px] text-stone-400">
                Payment: {data.paymentInfo?.status || "Pending"}
              </div>
            </div>

            {!isRefundMode ? (
              <form onSubmit={orderUpdateHandler} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Update Order Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    {ORDER_STATUS_STEPS.map((step) => (
                      <option key={step} value={step}>
                        {step}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Delivery Courier / Partner
                  </label>
                  <input
                    type="text"
                    value={deliveryProvider}
                    onChange={(e) => setDeliveryProvider(e.target.value)}
                    placeholder="e.g. Ethiopian Post, Addis Express"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Tracking Number / Waybill
                  </label>
                  <input
                    type="text"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    placeholder="e.g. ET-POST-98234"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-all shadow-sm"
                >
                  {updating ? "Saving Changes..." : "Save Order Status"}
                </button>
              </form>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
                  Buyer requested a refund for this order.
                </div>
                <button
                  onClick={refundOrderUpdateHandler}
                  disabled={updating}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-all shadow-sm"
                >
                  {updating ? "Processing..." : "Approve & Complete Refund"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
