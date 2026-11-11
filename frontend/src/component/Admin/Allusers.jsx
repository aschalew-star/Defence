import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "../../redux/Action/user";
import { server } from "../../server";
import axios from "axios";
import { toast } from "react-toastify";
import {
  HiOutlineUserGroup,
  HiOutlineShieldCheck,
} from "react-icons/hi";
import { BsSearch, BsTrash, BsPerson } from "react-icons/bs";

const AllUsers = () => {
  const dispatch = useDispatch();
  const { users, isLoading } = useSelector((state) => state.user || {});

  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      const res = await axios.delete(
        `${server}/user/delete-user/${selectedUser._id}`,
        { withCredentials: true }
      );
      toast.success(res.data.message || "User account removed successfully!");
      setDeleteModalOpen(false);
      setSelectedUser(null);
      dispatch(getAllUsers());
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user account");
    }
  };

  const filteredUsers =
    users?.filter((u) => {
      const matchName = u.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchEmail = u.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole = u.role?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchName || matchEmail || matchRole;
    }) || [];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2">
            <HiOutlineUserGroup size={14} /> User Identity Management
          </div>
          <h1 className="text-2xl font-bold font-serif text-stone-900">
            Registered Marketplace Users
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Directory of all registered buyers, customers, and administrative staff accounts.
          </p>
        </div>

        <button
          onClick={() => dispatch(getAllUsers())}
          className="self-start md:self-auto px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-all whitespace-nowrap"
        >
          Refresh Users
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <BsSearch className="absolute left-3.5 top-3 text-stone-400" size={14} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by name, email, or role..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
        <div className="text-xs text-stone-500 font-medium">
          Total Users: <span className="font-bold text-stone-900">{users?.length || 0}</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-stone-500 text-xs">Loading user accounts...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-stone-500 text-xs">
            No users found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Contact Phone</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Saved Addresses</th>
                  <th className="px-5 py-3.5">Registered</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {user.avatar?.url ? (
                          <img
                            src={user.avatar.url}
                            alt={user.name}
                            className="w-9 h-9 rounded-full object-cover border border-stone-200"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center font-bold text-xs">
                            <BsPerson size={18} />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-stone-900">{user.name}</div>
                          <div className="text-xs text-stone-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-stone-700 font-mono">
                      {user.phoneNumber || "N/A"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                          user.role === "admin" || user.role === "superadmin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-stone-100 text-stone-700"
                        }`}
                      >
                        {user.role === "admin" && <HiOutlineShieldCheck size={13} />}
                        {user.role || "user"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-stone-600">
                      {user.addresses?.length || 0} address(es)
                    </td>
                    <td className="px-5 py-3.5 text-xs text-stone-500">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "2024"}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {user.role !== "admin" && (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setDeleteModalOpen(true);
                          }}
                          className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete User"
                        >
                          <BsTrash size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete User Modal */}
      {deleteModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-sm w-full p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <BsTrash size={22} />
            </div>
            <h3 className="text-base font-bold text-stone-900 font-serif">
              Remove User Account?
            </h3>
            <p className="text-xs text-stone-600 mt-1">
              Are you sure you want to delete <span className="font-semibold text-stone-900">{selectedUser.name}</span> ({selectedUser.email})?
            </p>
            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUsers;
