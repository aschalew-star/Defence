import axios from "axios";
import React, { useEffect, useState } from "react";
import { server } from "../../server";
import { BsPencil } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import styles from "../../styles/styles";
import { toast } from "react-toastify";

const AllWithdraw = () => {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [withdrawData, setWithdrawData] = useState(null);
  const [withdrawStatus, setWithdrawStatus] = useState("Processing");

  useEffect(() => {
    axios
      .get(`${server}/withdraw/get-all-withdraw-request`, {
        withCredentials: true,
      })
      .then((res) => {
        setData(res.data.withdraws);
      })
      .catch((error) => {
        console.log(error.response?.data?.message);
      });
  }, []);

  const handleSubmit = async () => {
    await axios
      .put(
        `${server}/withdraw/update-withdraw-request/${withdrawData.id}`,
        {
          sellerId: withdrawData.shopId,
        },
        { withCredentials: true }
      )
      .then((res) => {
        toast.success("Withdraw request updated successfully!");
        setData(res.data.withdraws);
        setOpen(false);
      });
  };

  return (
    <div className="w-full flex justify-center pt-5">
      <div className="w-[95%] bg-white rounded shadow overflow-x-auto">
        <h3 className="text-[22px] font-Poppins p-4">All Withdraw Requests</h3>
        <table className="min-w-full border border-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Withdraw ID</th>
              <th className="px-4 py-2 border">Shop Name</th>
              <th className="px-4 py-2 border">Shop ID</th>
              <th className="px-4 py-2 border">Amount</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Requested At</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data &&
              data.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{item._id}</td>
                  <td className="px-4 py-2 border">{item.seller.name}</td>
                  <td className="px-4 py-2 border">{item.seller._id}</td>
                  <td className="px-4 py-2 border">US$ {item.amount}</td>
                  <td className="px-4 py-2 border capitalize">{item.status}</td>
                  <td className="px-4 py-2 border">{item.createdAt.slice(0, 10)}</td>
                  <td className="px-4 py-2 border text-center">
                    {item.status === "Processing" && (
                      <BsPencil
                        size={18}
                        className="text-blue-600 cursor-pointer hover:text-blue-800 inline-block"
                        onClick={() => {
                          setWithdrawData({
                            id: item._id,
                            shopId: item.seller._id,
                            status: item.status,
                          });
                          setWithdrawStatus("Succeed");
                          setOpen(true);
                        }}
                      />
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed top-0 left-0 w-full h-screen bg-black bg-opacity-40 z-[9999] flex items-center justify-center">
          <div className="bg-white rounded shadow p-6 w-[90%] md:w-[50%]">
            <div className="flex justify-end">
              <RxCross1
                size={25}
                className="cursor-pointer"
                onClick={() => setOpen(false)}
              />
            </div>
            <h2 className="text-[22px] font-Poppins text-center mb-4">
              Update Withdraw Status
            </h2>
            <div className="flex flex-col items-center">
              <select
                value={withdrawStatus}
                onChange={(e) => setWithdrawStatus(e.target.value)}
                className="border rounded px-4 py-2 mb-4 w-[200px]"
              >
                <option value="Succeed">Succeed</option>
              </select>
              <button
                className={`${styles.button} text-white text-[18px] !h-[42px]`}
                onClick={handleSubmit}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllWithdraw;
