import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AiOutlineDelete } from "react-icons/ai";
import { RxCross1 } from "react-icons/rx";
import { getAllUsers } from "../../redux/Action/user";
import axios from "axios";
import { toast } from "react-toastify";

const AllUsers = () => {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.user);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const handleDelete = async (id) => {
    await axios
      .delete(`http://localhost:5000/user/delete-user/${id}`, { withCredentials: true })
      .then((res) => {
        toast.success(res.data.message);
      });

    dispatch(getAllUsers());
  };

  return (
    <div className="w-full flex justify-center pt-5">
      <div className="w-[97%]">
        <h3 className="text-[22px] font-medium pb-4">All Users</h3>
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full text-sm text-left border border-gray-200">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 border">User ID</th>
                <th className="px-4 py-3 border">Name</th>
                <th className="px-4 py-3 border">Email</th>
                <th className="px-4 py-3 border">Role</th>
                <th className="px-4 py-3 border">Joined At</th>
                <th className="px-4 py-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users &&
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{user._id}</td>
                    <td className="px-4 py-2 border">{user.name}</td>
                    <td className="px-4 py-2 border">{user.email}</td>
                    <td className="px-4 py-2 border">{user.role}</td>
                    <td className="px-4 py-2 border">
                      {user.createdAt.slice(0, 10)}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      <button
                        onClick={() => {
                          setUserId(user._id);
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

        {open && (
          <div className="fixed top-0 left-0 w-full h-screen bg-black bg-opacity-40 flex items-center justify-center z-[999]">
            <div className="bg-white rounded shadow w-[95%] 800px:w-[40%] p-5">
              <div className="flex justify-end">
                <RxCross1
                  size={25}
                  onClick={() => setOpen(false)}
                  className="cursor-pointer"
                />
              </div>
              <h3 className="text-[24px] text-center py-5 font-semibold text-gray-800">
                Are you sure you want to delete this user?
              </h3>
              <div className="flex justify-center space-x-4">
                <button
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded"
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

export default AllUsers;
