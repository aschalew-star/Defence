import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfShop } from "../../redux/Action/order";
import { getAllProductsShop } from "../../redux/Action/productAction";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import {
  BsShieldCheck,
  BsShieldExclamation,
  BsCashCoin,
  BsHourglassSplit,
  BsBagCheck,
  BsBoxSeam,
  BsArrowRight,
  BsSendCheck,
} from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";

function Dashboard() {
  const dispatch = useDispatch();
  const { orders } = useSelector((state) => state.order);
  const { seller } = useSelector((state) => state.seller);
  const { products } = useSelector((state) => state.products);

  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [payoutMethodType, setPayoutMethodType] = useState("telebirr");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);

  // Verification form state
  const [tinNumber, setTinNumber] = useState(seller?.tinNumber || "");
  const [businessReg, setBusinessReg] = useState(seller?.businessRegistrationNumber || "");
  const [submittingVerify, setSubmittingVerify] = useState(false);

  useEffect(() => {
    if (seller?._id) {
      dispatch(getAllOrdersOfShop(seller._id));
      dispatch(getAllProductsShop(seller._id));
    }
  }, [dispatch, seller]);

  const availableBalance = seller?.availableBalance || 0;
  const pendingBalance = seller?.pendingBalance || 0;
  const totalOrders = orders?.length || 0;
  const deliveredOrders = orders?.filter((o) => o.status === "Delivered") || [];
  const grossSales = deliveredOrders.reduce((acc, item) => acc + (item.totalPrice || 0), 0);

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    const amountNum = Number(withdrawAmount);

    if (!amountNum || amountNum <= 0) {
      toast.error("Please enter a valid payout amount");
      return;
    }

    if (amountNum > availableBalance) {
      toast.error(`Requested amount exceeds available balance (${availableBalance.toLocaleString()} ETB)`);
      return;
    }

    setSubmittingWithdraw(true);
    try {
      const payload = {
        amount: amountNum,
        payoutMethod: {
          type: payoutMethodType,
          accountNumber: accountNumber || seller?.phoneNumber || "",
          accountHolderName: accountHolderName || seller?.name || "",
          telebirrNumber: payoutMethodType === "telebirr" ? (accountNumber || seller?.phoneNumber) : undefined,
        },
      };

      const res = await axios.post(`${server}/withdraw/create-withdraw-request`, payload, {
        withCredentials: true,
      });

      toast.success(res.data.message || "Withdrawal request submitted successfully!");
      setWithdrawModalOpen(false);
      setWithdrawAmount("");
      // Refresh seller data
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit withdrawal request");
    } finally {
      setSubmittingWithdraw(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!tinNumber) {
      toast.error("Please enter your Ethiopian Tax Identification Number (TIN)");
      return;
    }

    setSubmittingVerify(true);
    try {
      const res = await axios.put(
        `${server}/shop/update-verification`,
        { tinNumber, businessRegistrationNumber: businessReg },
        { withCredentials: true }
      );
      toast.success(res.data.message || "Verification submitted for review!");
      setVerifyModalOpen(false);
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update verification");
    } finally {
      setSubmittingVerify(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-stone-50 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Merchant Header & Verification Status */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-serif text-stone-900">
              {seller?.name || "Merchant Dashboard"}
            </h1>
            {seller?.isVerified ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                <BsShieldCheck size={13} /> Verified Artisan
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                <BsShieldExclamation size={13} /> Unverified Store
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Registered Seller ID: <span className="font-mono">{seller?._id}</span> • Member since{" "}
            {seller?.createdAt ? new Date(seller.createdAt).toLocaleDateString() : "2024"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!seller?.isVerified && (
            <button
              onClick={() => setVerifyModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold text-xs transition-all shadow-sm"
            >
              Verify TIN & Business ID
            </button>
          )}
          <Link
            to="/create-product"
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-all shadow-sm"
          >
            + Add New Craft
          </Link>
        </div>
      </div>

      {/* Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Available Balance</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <BsCashCoin size={20} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-stone-900 font-serif">
              {Number(availableBalance).toLocaleString()} <span className="text-sm font-sans font-medium text-stone-500">ETB</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">Cleared funds ready for disbursement</p>
          </div>
          <button
            onClick={() => setWithdrawModalOpen(true)}
            className="mt-4 inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-all"
          >
            <BsSendCheck size={14} /> Request Payout
          </button>
        </div>

        {/* Pending Escrow */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Escrow</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <BsHourglassSplit size={20} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-stone-900 font-serif">
              {Number(pendingBalance).toLocaleString()} <span className="text-sm font-sans font-medium text-stone-500">ETB</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">Held in escrow until order delivery</p>
          </div>
          <div className="mt-4 py-2 text-center text-xs text-stone-400">
            Auto-clears upon order completion
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <BsBagCheck size={20} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-stone-900 font-serif">
              {totalOrders}
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">{deliveredOrders.length} orders delivered</p>
          </div>
          <Link
            to="/AllOrders"
            className="mt-4 inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-all"
          >
            View All Orders <BsArrowRight size={13} />
          </Link>
        </div>

        {/* Listed Products */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Listed Crafts</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <BsBoxSeam size={20} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-stone-900 font-serif">
              {products?.length || 0}
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">Active items in marketplace</p>
          </div>
          <Link
            to="/Shopallprodcts"
            className="mt-4 inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-all"
          >
            Manage Catalog <BsArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-5 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold font-serif text-stone-900">Recent Customer Orders</h3>
            <p className="text-xs text-stone-500">Track and fulfill customer orders</p>
          </div>
          <Link to="/AllOrders" className="text-xs font-semibold text-emerald-700 hover:underline">
            View All ({totalOrders})
          </Link>
        </div>

        {orders && orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="px-5 py-3">Order ID</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Total (ETB)</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {orders.slice(0, 6).map((order) => (
                  <tr key={order._id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-stone-600">
                      {order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-5 py-3 text-stone-900 font-medium">
                      {order.user?.name || "Customer"}
                    </td>
                    <td className="px-5 py-3 text-stone-600 text-xs">
                      {order.cart?.length || 0} item(s)
                    </td>
                    <td className="px-5 py-3 font-bold text-stone-900">
                      {Number(order.totalPrice || 0).toLocaleString()} ETB
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          order.status === "Delivered"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        to={`/shop/order/${order._id}`}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-stone-500 text-sm">
            No orders received yet. Once buyers order your creations, they will appear here!
          </div>
        )}
      </div>

      {/* Payout Withdrawal Modal */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <h2 className="text-lg font-bold font-serif text-stone-900">Request Merchant Payout</h2>
              <button
                onClick={() => setWithdrawModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all"
              >
                <RxCross1 size={18} />
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="mt-4 space-y-4">
              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-xs text-emerald-900">
                Available to withdraw:{" "}
                <span className="font-bold">{Number(availableBalance).toLocaleString()} ETB</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Payout Method
                </label>
                <select
                  value={payoutMethodType}
                  onChange={(e) => setPayoutMethodType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="telebirr">Telebirr (Instant mobile transfer)</option>
                  <option value="cbe">CBE Birr / Commercial Bank of Ethiopia</option>
                  <option value="bank">Other Ethiopian Bank Account</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Amount (ETB) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="50"
                  max={availableBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="e.g. 2500"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  {payoutMethodType === "telebirr" ? "Telebirr Mobile Number" : "Account Number"}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder={
                    payoutMethodType === "telebirr" ? "0912345678" : "1000123456789"
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Account Holder Full Name
                </label>
                <input
                  type="text"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  placeholder={seller?.name || "e.g. Abebe Kebede"}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setWithdrawModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingWithdraw}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  {submittingWithdraw ? "Submitting..." : "Submit Payout Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {verifyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <h2 className="text-lg font-bold font-serif text-stone-900">Artisan Store Verification</h2>
              <button
                onClick={() => setVerifyModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all"
              >
                <RxCross1 size={18} />
              </button>
            </div>

            <form onSubmit={handleVerifySubmit} className="mt-4 space-y-4">
              <p className="text-xs text-stone-600">
                Verified merchants earn a verified badge, priority listing rankings, and higher buyer trust.
              </p>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Tax Identification Number (TIN) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={tinNumber}
                  onChange={(e) => setTinNumber(e.target.value)}
                  placeholder="e.g. 0012345678"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Business Registration / Trade License No. (Optional)
                </label>
                <input
                  type="text"
                  value={businessReg}
                  onChange={(e) => setBusinessReg(e.target.value)}
                  placeholder="e.g. BL/AA/2016/9821"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setVerifyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingVerify}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  {submittingVerify ? "Submitting..." : "Submit for Verification"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
