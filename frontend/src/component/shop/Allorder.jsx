import React from 'react'

function Allorder() {
  return (
    <div>Allorder</div>
  )
}

export default Allorder





// import React, { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { Link } from "react-router-dom";
// import Loader from "../Layout/Loader";
// import { getAllOrdersOfShop } from "../../redux/actions/order";
// import { AiOutlineArrowRight } from "react-icons/ai";

// const AllOrders = () => {
//   const { orders, isLoading } = useSelector((state) => state.order);
//   const { seller } = useSelector((state) => state.seller);

//   const dispatch = useDispatch();

//   useEffect(() => {
//     if (seller?._id) {
//       dispatch(getAllOrdersOfShop(seller._id));
//     }
//   }, [dispatch, seller?._id]);

//   const rows = orders?.map((order) => ({
//     id: order._id,
//     itemsQty: order.cart.length,
//     total: `US$ ${order.totalPrice}`,
//     status: order.status,
//   })) || [];

//   return (
//     <>
//       {isLoading ? (
//         <Loader />
//       ) : (
//         <div className="w-full px-4 md:px-8 pt-4 mt-10 bg-white rounded-xl shadow">
//           <h2 className="text-xl font-semibold mb-4">All Orders</h2>
//           <div className="overflow-x-auto">
//             <table className="min-w-full text-sm text-left">
//               <thead className="bg-gray-100 border-b text-gray-600 uppercase text-xs">
//                 <tr>
//                   <th className="px-4 py-3">Order ID</th>
//                   <th className="px-4 py-3">Status</th>
//                   <th className="px-4 py-3">Items Qty</th>
//                   <th className="px-4 py-3">Total</th>
//                   <th className="px-4 py-3 text-right">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {rows.map((row) => (
//                   <tr key={row.id} className="border-b hover:bg-gray-50">
//                     <td className="px-4 py-3">{row.id}</td>
//                     <td className="px-4 py-3">
//                       <span
//                         className={`font-medium px-2 py-1 rounded-full text-xs ${
//                           row.status === "Delivered"
//                             ? "bg-green-100 text-green-600"
//                             : "bg-red-100 text-red-600"
//                         }`}
//                       >
//                         {row.status}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3">{row.itemsQty}</td>
//                     <td className="px-4 py-3">{row.total}</td>
//                     <td className="px-4 py-3 text-right">
//                       <Link to={`/order/${row.id}`}>
//                         <button className="text-blue-600 hover:text-blue-800 p-1 rounded-full transition">
//                           <AiOutlineArrowRight size={20} />
//                         </button>
//                       </Link>
//                     </td>
//                   </tr>
//                 ))}
//                 {rows.length === 0 && (
//                   <tr>
//                     <td colSpan="5" className="text-center py-6 text-gray-500">
//                       No orders found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default AllOrders;

