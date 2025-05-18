import React, { useEffect, useState } from "react";
import { AiOutlineArrowRight, AiOutlineMoneyCollect } from "react-icons/ai";
import { MdBorderClear } from "react-icons/md";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfAdmin } from "../../redux/Action/order";
import { getAllSellers } from "../../redux/Action/Seller";



const AdminDashboardMain = () => {
  const dispatch = useDispatch();

  const { adminOrders, adminOrderLoading } = useSelector((state) => state.order);
  const { sellers } = useSelector((state) => state.seller);

  useEffect(() => {
    dispatch(getAllOrdersOfAdmin());
    dispatch(getAllSellers());
  }, []);

  const adminEarning =
    adminOrders && adminOrders.reduce((acc, item) => acc + item.totalPrice * 0.1, 0);
  const adminBalance = adminEarning?.toFixed(2);

  const rows =
    adminOrders?.map((item) => ({
      id: item._id,
      itemsQty: item?.cart?.reduce((acc, i) => acc + i.qty, 0),
      total: `${item?.totalPrice}  Birr`,
      status: item?.status,
      createdAt: item?.createdAt.slice(0, 10),
    })) || [];

  return (
    <>
      {adminOrderLoading ? (
        <div>laoding</div>
      ) : (
        <div className="w-full p-4">
          <h3 className="text-[22px] font-semibold pb-2">Overview</h3>
          <div className="w-full block 800px:flex items-center justify-between">
            {/* Total Earning */}
            <div className="w-full mb-4 800px:w-[30%] min-h-[20vh] bg-white shadow rounded px-2 py-5">
              <div className="flex items-center">
                <AiOutlineMoneyCollect size={30} className="mr-2 text-gray-600" />
                <h3 className="text-[18px] font-normal text-gray-600 leading-5">Total Earning</h3>
              </div>
              <h5 className="pt-2 pl-[36px] text-[22px] font-medium">{adminBalance}</h5>
            </div>

            {/* All Sellers */}
            <div className="w-full mb-4 800px:w-[30%] min-h-[20vh] bg-white shadow rounded px-2 py-5">
              <div className="flex items-center">
                <MdBorderClear size={30} className="mr-2 text-gray-600" />
                <h3 className="text-[18px] font-normal text-gray-600 leading-5">All Sellers</h3>
              </div>
              <h5 className="pt-2 pl-[36px] text-[22px] font-medium">{sellers?.length}</h5>
              <Link to="/admin-sellers">
                <h5 className="pt-4 pl-2 text-[#077f9c]">View Sellers</h5>
              </Link>
            </div>

            {/* All Orders */}
            <div className="w-full mb-4 800px:w-[30%] min-h-[20vh] bg-white shadow rounded px-2 py-5">
              <div className="flex items-center">
                <AiOutlineMoneyCollect size={30} className="mr-2 text-gray-600" />
                <h3 className="text-[18px] font-normal text-gray-600 leading-5">All Orders</h3>
              </div>
              <h5 className="pt-2 pl-[36px] text-[22px] font-medium">{adminOrders?.length}</h5>
              <Link to="/admin-orders">
                <h5 className="pt-4 pl-2 text-[#077f9c]">View Orders</h5>
              </Link>
            </div>
          </div>

          {/* Latest Orders */}
          <br />
          <h3 className="text-[22px] font-semibold pb-2">Latest Orders</h3>
          <div className="w-full min-h-[45vh] bg-white rounded p-4 overflow-x-auto">
            <table className="min-w-full table-auto border border-gray-200">
              <thead>
                <tr className="bg-gray-100 text-left">
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
                      className={`px-4 py-2 border ${
                        order.status === "Delivered" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {order.status}
                    </td>
                    <td className="px-4 py-2 border">{order.itemsQty}</td>
                    <td className="px-4 py-2 border">{order.total}</td>
                    <td className="px-4 py-2 border">{order.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboardMain;
