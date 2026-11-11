import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getAllOrdersOfShop } from "../../redux/Action/order";
import { AiOutlineArrowRight } from "react-icons/ai";
import { FiShoppingBag } from "react-icons/fi";

function Allorder() {
  const { orders, isLoading } = useSelector((state) => state.order);
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();

  useEffect(() => {
    if (seller?._id) {
      dispatch(getAllOrdersOfShop(seller._id));
    }
  }, [dispatch, seller?._id]);

  return (
    <div className="w-full min-h-screen bg-stone-50 py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2">
          <FiShoppingBag size={13} /> Order Management
        </div>
        <h1 className="text-2xl font-bold font-serif text-stone-900">
          Store Orders & Customer Fulfillments
        </h1>
        <p className="text-xs text-stone-600 mt-1">
          Review orders, track handweaving and delivery status, and coordinate customer custom sizing.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-stone-500 text-sm">Loading orders...</div>
        ) : !orders || orders.length === 0 ? (
          <div className="p-12 text-center text-stone-500 text-sm">
            No orders placed yet. When buyers order your apparel or crafts, they will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-5">Order ID</th>
                  <th className="py-3.5 px-5">Customer</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Items</th>
                  <th className="py-3.5 px-5">Total (ETB)</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-xs text-stone-600">
                      #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-5 text-stone-900 font-medium">
                      {order.user?.name || "Customer"}
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          order.status === "Delivered"
                            ? "bg-emerald-100 text-emerald-800"
                            : order.status === "Processing refund"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-stone-600 text-xs">
                      {order.cart?.length || 0} item(s)
                    </td>
                    <td className="py-3.5 px-5 font-bold text-stone-900">
                      {Number(order.totalPrice || 0).toLocaleString()} ETB
                    </td>
                    <td className="py-3.5 px-5 text-xs text-stone-500">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <Link
                        to={`/shop/order/${order._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-emerald-50 hover:text-emerald-700 text-stone-700 text-xs font-semibold transition-all"
                      >
                        Details <AiOutlineArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Allorder;
