import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/Store/Store";
import { getAllUsers } from "../../redux/Action/user";
import { server } from "../../server";
import axios from "axios";
import { toast } from "react-toastify";
import {
  HiOutlineUserGroup,
  HiOutlineShieldCheck,
} from "react-icons/hi";
import { BsSearch, BsTrash, BsPerson, BsCashCoin } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";

const AllUsers = () => {
  const dispatch = useAppDispatch();
  const { users, usersLoading, user: currentUser } = useAppSelector(
    (state) => state.user
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [roleUpdatingId, setRoleUpdatingId] = useState<any>(null);

  // Admin Deposit to User Wallet state
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositUser, setDepositUser] = useState<any>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositDescription, setDepositDescription] = useState("CBE Bank Transfer Confirmed");
  const [depositCoins, setDepositCoins] = useState("0");
  const [depositTxRef, setDepositTxRef] = useState("");
  const [userWalletData, setUserWalletData] = useState<any>(null);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [submittingDeposit, setSubmittingDeposit] = useState(false);

  useEffect(() => {
    dispatch(getAllUsers() as any);
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
      dispatch(getAllUsers() as any);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete user account");
    }
  };

  const handleRoleChange = async (targetUser: any) => {
    const role = targetUser.role === "admin" ? "user" : "admin";
    const action = role === "admin" ? "promote" : "demote";
    if (!window.confirm(`Are you sure you want to ${action} ${targetUser.name}?`)) {
      return;
    }

    setRoleUpdatingId(targetUser._id);
    try {
      const { data } = await axios.put(
        `${server}/user/admin-user-role/${targetUser._id}`,
        { role },
        { withCredentials: true }
      );
      toast.success(data.message || "User role updated.");
      dispatch(getAllUsers() as any);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update user role");
    } finally {
      setRoleUpdatingId(null);
    }
  };

  const openDepositModal = async (targetUser: any) => {
    setDepositUser(targetUser);
    setDepositAmount("");
    setDepositDescription("CBE Bank Transfer Confirmed");
    setDepositCoins("0");
    setDepositTxRef(`DEP-TX-${Math.floor(100000 + Math.random() * 900000)}`);
    setUserWalletData(null);
    setDepositModalOpen(true);
    setLoadingWallet(true);
    try {
      const res = await axios.get(`${server}/wallet/admin/user-wallet/${targetUser._id}`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        setUserWalletData(res.data.wallet);
      }
    } catch (err) {
      console.warn("Could not load user wallet preview:", err);
    } finally {
      setLoadingWallet(false);
    }
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid deposit amount greater than 0");
      return;
    }
    setSubmittingDeposit(true);
    try {
      const res = await axios.post(
        `${server}/wallet/admin/deposit-to-user`,
        {
          userId: depositUser._id,
          amount: amt,
          description: depositDescription,
          bonusCoins: parseInt(depositCoins, 10) || 0,
          transactionRef: depositTxRef,
        },
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.success(res.data.message || "Deposit credited to user wallet successfully!");
        setDepositModalOpen(false);
        setDepositUser(null);
        dispatch(getAllUsers() as any);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to credit user wallet");
    } finally {
      setSubmittingDeposit(false);
    }
  };

  const filteredUsers =
    users?.filter((u: any) => {
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
            <HiOutlineUserGroup size={14} /> User Identity & Wallet Management
          </div>
          <h1 className="text-2xl font-bold font-serif text-stone-900">
            Registered Marketplace Users
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Directory of all registered buyers, customers, and administrative staff accounts. Inspect wallets and authorize deposits.
          </p>
        </div>

        <button
          onClick={() => dispatch(getAllUsers() as any)}
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
        {usersLoading ? (
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
                {filteredUsers.map((u: any) => (
                  <tr key={u._id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {u.avatar?.url ? (
                          <img
                            src={u.avatar.url}
                            alt={u.name}
                            className="w-9 h-9 rounded-full object-cover border border-stone-200"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center font-bold text-xs">
                            <BsPerson size={18} />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-stone-900">{u.name}</div>
                          <div className="text-xs text-stone-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-stone-700 font-mono">
                      {u.phoneNumber || "N/A"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                          u.role === "admin" || u.role === "superadmin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-stone-100 text-stone-700"
                        }`}
                      >
                        {["admin", "superadmin"].includes(u.role) && (
                          <HiOutlineShieldCheck size={13} />
                        )}
                        {u.role || "user"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-stone-600">
                      {u.addresses?.length || 0} address(es)
                    </td>
                    <td className="px-5 py-3.5 text-xs text-stone-500">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "2024"}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      {/* Deposit to User Wallet Button */}
                      <button
                        onClick={() => openDepositModal(u)}
                        className="inline-flex items-center gap-1 mr-2 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition shadow-2xs"
                        title="Deposit / Credit Funds to User Wallet"
                      >
                        <BsCashCoin size={13} className="text-amber-700" />
                        <span>Deposit</span>
                      </button>

                      {currentUser?.role === "superadmin" &&
                        u.role !== "superadmin" &&
                        u._id !== currentUser._id && (
                          <button
                            onClick={() => handleRoleChange(u)}
                            disabled={roleUpdatingId === u._id}
                            className="mr-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-purple-800 hover:bg-purple-50 disabled:opacity-50"
                            title={u.role === "admin" ? "Remove admin role" : "Grant admin role"}
                          >
                            {roleUpdatingId === u._id
                              ? "Saving..."
                              : u.role === "admin"
                                ? "Remove admin"
                                : "Make admin"}
                          </button>
                        )}
                      {u.role !== "superadmin" &&
                        u._id !== currentUser?._id &&
                        (u.role !== "admin" || currentUser?.role === "superadmin") && (
                        <button
                          onClick={() => {
                            setSelectedUser(u);
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

      {/* Admin Deposit / Credit Wallet Modal */}
      {depositModalOpen && depositUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center text-lg">
                  <BsCashCoin />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 font-serif">
                    Deposit to User Wallet
                  </h3>
                  <p className="text-xs text-stone-500">
                    Recipient: <strong className="text-stone-900">{depositUser.name}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDepositModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              >
                <RxCross1 size={18} />
              </button>
            </div>

            {/* Current Wallet Balance Preview */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Current Balance</span>
                <span className="text-base font-black text-emerald-800 font-mono">
                  {loadingWallet ? "Loading..." : `${Number(userWalletData?.balance || 0).toLocaleString()} ETB`}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Loyalty Coins</span>
                <span className="font-bold text-amber-900 font-mono">
                  {loadingWallet ? "..." : `${userWalletData?.loyaltyCoins || 0} Coins`}
                </span>
              </div>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Deposit Amount (ETB) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Deposit Description / Purpose *
                </label>
                <input
                  type="text"
                  required
                  value={depositDescription}
                  onChange={(e) => setDepositDescription(e.target.value)}
                  placeholder="e.g. CBE Bank Transfer Confirmed, Dispute Refund, etc."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-700"
                />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {[
                    "CBE Bank Deposit Confirmed",
                    "Telebirr Deposit Verified",
                    "Customer Compensation",
                    "Promotional Credit",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDepositDescription(preset)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-600 transition"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Bonus Coins (Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={depositCoins}
                    onChange={(e) => setDepositCoins(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Receipt / Ref #
                  </label>
                  <input
                    type="text"
                    value={depositTxRef}
                    onChange={(e) => setDepositTxRef(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setDepositModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDeposit || !depositAmount}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-800 hover:bg-amber-900 text-white shadow-sm transition disabled:opacity-50"
                >
                  {submittingDeposit ? "Processing Deposit..." : "Confirm & Deposit Funds"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
