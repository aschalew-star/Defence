import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AiOutlineDelete, AiOutlineEye } from "react-icons/ai";
import { RxCross1 } from "react-icons/rx";
import axios from "axios";
import { getAllSellers } from "../../redux/Action/Seller";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const AllSellers = () => {
  const dispatch = useDispatch();
  const { sellers } = useSelector((state) => state.seller);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    dispatch(getAllSellers());
  }, [dispatch]);

  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(`http://localhost:5000/shop/delete-seller/${id}`, {
        withCredentials: true,
      });
      toast.success(res.data.message);
      dispatch(getAllSellers());
    } catch (error) {
      toast.error("Error deleting seller");
    }
  };

  return (
    <div className="w-full flex justify-center pt-5">
      <div className="w-[97%]">
        <h3 className="text-[22px] font-semibold pb-2">All Sellers</h3>
        <div className="w-full min-h-[45vh] bg-white rounded overflow-x-auto shadow">
          <table className="min-w-full border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border text-left">Seller ID</th>
                <th className="px-4 py-2 border text-left">Name</th>
                <th className="px-4 py-2 border text-left">Email</th>
                <th className="px-4 py-2 border text-left">Address</th>
                <th className="px-4 py-2 border text-left">Joined At</th>
                {/* <th className="px-4 py-2 border text-center">Preview Shop</th> */}
                <th className="px-4 py-2 border text-center">Delete Seller</th>
              </tr>
            </thead>
            <tbody>
              {sellers &&
                sellers.map((seller) => (
                  <tr key={seller._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{seller._id}</td>
                    <td className="px-4 py-2 border">{seller.name}</td>
                    <td className="px-4 py-2 border">{seller.email}</td>
                    <td className="px-4 py-2 border">{seller.address}</td>
                    <td className="px-4 py-2 border">
                      {seller.createdAt?.slice(0, 10)}
                    </td>
                    {/* <td className="px-4 py-2 border text-center">
                      <Link
                        to={`/shop/preview/${seller._id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <AiOutlineEye size={20} />
                      </Link>
                    </td> */}
                    <td className="px-4 py-2 border text-center">
                      <button
                        onClick={() => {
                          setUserId(seller._id);
                          setOpen(true);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <AiOutlineDelete size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Delete Confirmation Modal */}
        {open && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-md p-6">
              <div className="flex justify-end">
                <RxCross1
                  size={25}
                  className="cursor-pointer"
                  onClick={() => setOpen(false)}
                />
              </div>
              <h3 className="text-xl font-semibold text-center text-gray-800 py-4">
                Are you sure you want to delete this user?
              </h3>
              <div className="flex justify-center gap-6 mt-4">
                <button
                  className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded"
                  onClick={() => {
                    setOpen(false);
                    handleDelete(userId);
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllSellers;
