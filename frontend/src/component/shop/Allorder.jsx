import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getAllOrdersOfShop } from "../../redux/Action/order";
import { AiOutlineArrowRight } from "react-icons/ai";

function Allorder() {
  
    
      const { orders, isLoading } = useSelector((state) => state.order);
      const { seller } = useSelector((state) => state.seller);
    
      const dispatch = useDispatch();
    
      useEffect(() => {
        if (seller?._id) {
          dispatch(getAllOrdersOfShop(seller._id));
        }
      }, [dispatch, seller?._id]);
    
      const rows =
        orders?.map((order) => ({
          id: order._id,
          itemsQty: order.cart.length,
          total: ` ${order.totalPrice}  Birr`,
          status: order.status,
        })) || [];
    
      return (
        <div className="w-full px-4 md:px-8 pt-4 mt-10 z-50">
          {isLoading ? (
            <div className="text-center text-gray-500 py-10">Loading orders...</div>
          ) : (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <h2 className="text-xl font-semibold px-6 pt-6 pb-4 border-b border-gray-200">
                All Orders
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-gray-100 border-b text-gray-600 uppercase text-xs">
                    <tr>
                      <th className="px-6 py-3">Order ID</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Items Qty</th>
                      <th className="px-6 py-3">Total</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length > 0 ? (
                      rows.map((row) => (
                        <tr key={row.id} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-4">{row.id}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`font-medium px-2 py-1 rounded-full text-xs ${
                                row.status === "Delivered"
                                  ? "bg-green-100 text-green-600"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">{row.itemsQty}</td>
                          <td className="px-6 py-4">{row.total}</td>
                          <td className="px-6 py-4 text-right">
                            <Link to={`/order/${row.id}`}>
                              <button className="text-blue-600 hover:text-blue-800 p-1 rounded-full transition">
                                <AiOutlineArrowRight size={20} />
                              </button>
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="text-center text-gray-500 py-6 text-sm"
                        >
                          No orders found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

    
  )
}

export default Allorder




