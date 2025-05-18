import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfAdmin } from "../../redux/Action/order";

const AdminDashboardOrders = () => {
  const dispatch = useDispatch();

  const { adminOrders } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(getAllOrdersOfAdmin());
  }, [dispatch]);

  const rows =
    adminOrders?.map((item) => ({
      id: item._id,
      itemsQty: item?.cart?.reduce((acc, i) => acc + i.qty, 0),
      total: `${item?.totalPrice} $`,
      status: item?.status,
      createdAt: item?.createdAt?.slice(0, 10),
    })) || [];

  return (
    <div>
      <div>
        <div>
          <div className="w-full min-h-[45vh] pt-5 px-4">
            <div className="bg-white shadow rounded-lg overflow-x-auto">
              <table className="min-w-full table-auto border border-gray-200 text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border">Order ID</th>
                    <th className="px-4 py-2 border">Status</th>
                    <th className="px-4 py-2 border">Items Qty</th>
                    <th className="px-4 py-2 border">Total</th>
                    <th className="px-4 py-2 border">Order Date</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border">{order.id}</td>
                      <td
                        className={`px-4 py-2 border font-semibold ${
                          order.status === "Delivered"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {order.status}
                      </td>
                      <td className="px-4 py-2 border">{order.itemsQty}</td>
                      <td className="px-4 py-2 border">{order.total}</td>
                      <td className="px-4 py-2 border">{order.createdAt}</td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center py-4 text-gray-500"
                      >
                        No orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardOrders;
