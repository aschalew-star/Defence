import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllSellers } from "../../redux/Action/Seller";
import { server } from "../../server";
import axios from "axios";
import { toast } from "react-toastify";
import {
  BsShieldCheck,
  BsShieldExclamation,
  BsTrash,
  BsPencil,
  BsSearch,
  BsFileEarmarkText,
  BsCheck2Circle,
} from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";

const AllSellers = () => {
  const dispatch = useDispatch();
  const { sellers, isLoading } = useSelector((state) => state.seller || {});

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);

  // Verification modal state
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyingSeller, setVerifyingSeller] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("Verified");
  const [verificationNotes, setVerificationNotes] = useState("");
  const [submittingVerification, setSubmittingVerification] = useState(false);

  useEffect(() => {
    dispatch(getAllSellers());
  }, [dispatch]);

  const handleDelete = async () => {
    if (!selectedSeller) return;
    try {
      const res = await axios.delete(
        `${server}/shop/delete-seller/${selectedSeller._id}`,
        { withCredentials: true }
      );
      toast.success(res.data.message || "Artisan store removed successfully!");
      setDeleteModalOpen(false);
      setSelectedSeller(null);
      dispatch(getAllSellers());
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete seller");
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!verifyingSeller) return;

    setSubmittingVerification(true);
    try {
      const res = await axios.put(
        `${server}/shop/admin-verify-seller/${verifyingSeller._id}`,
        {
          isVerified,
          verificationStatus,
          verificationNotes,
        },
        { withCredentials: true }
      );

      toast.success(res.data.message || "Seller verification updated!");
      setVerifyModalOpen(false);
      setVerifyingSeller(null);
      dispatch(getAllSellers());
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update seller verification");
    } finally {
      setSubmittingVerification(false);
    }
  };

  const openVerifyModal = (seller) => {
    setVerifyingSeller(seller);
    setIsVerified(seller.isVerified || false);
    setVerificationStatus(seller.verificationStatus || "Pending");
    setVerificationNotes(seller.verificationNotes || "");
    setVerifyModalOpen(true);
  };

  const filteredSellers =
    sellers?.filter((seller) => {
      const matchSearch =
        seller.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.tinNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.businessType?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;

      if (filterStatus === "verified") {
        return seller.isVerified || seller.verificationStatus === "Verified";
      }
      if (filterStatus === "pending") {
        return seller.verificationStatus === "Pending";
      }
      if (filterStatus === "unverified") {
        return !seller.isVerified && seller.verificationStatus !== "Verified";
      }
      return true;
    }) || [];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2">
            <BsShieldCheck size={14} /> Artisan Governance & Compliance
          </div>
          <h1 className="text-2xl font-bold font-serif text-stone-900">
            Registered Artisans & Merchant Boutiques
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Review Ethiopian TIN credentials, verify traditional boutiques, and manage merchant accounts.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {["all", "verified", "pending", "unverified"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                filterStatus === status
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              {status === "all" ? `All (${sellers?.length || 0})` : status}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <BsSearch className="absolute left-3.5 top-3 text-stone-400" size={14} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by store name, email, TIN, or business type..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <button
          onClick={() => dispatch(getAllSellers())}
          className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-all whitespace-nowrap"
        >
          Refresh List
        </button>
      </div>

      {/* Sellers Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-stone-500 text-xs">Loading artisan accounts...</div>
        ) : filteredSellers.length === 0 ? (
          <div className="p-12 text-center text-stone-500 text-xs">
            No artisan merchants found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="px-5 py-3.5">Artisan / Boutique</th>
                  <th className="px-5 py-3.5">Business Type</th>
                  <th className="px-5 py-3.5">TIN & Location</th>
                  <th className="px-5 py-3.5">Verification</th>
                  <th className="px-5 py-3.5">Balance</th>
                  <th className="px-5 py-3.5">Joined</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredSellers.map((seller) => {
                  const isStoreVerified =
                    seller.isVerified || seller.verificationStatus === "Verified";
                  const isPending = seller.verificationStatus === "Pending";

                  return (
                    <tr key={seller._id} className="hover:bg-stone-50 transition-colors">
                      {/* Name & Avatar */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={seller.avatar?.url || "/photo.jpg"}
                            alt={seller.name}
                            className="w-10 h-10 rounded-xl object-cover border border-stone-200"
                          />
                          <div>
                            <div className="font-semibold text-stone-900 line-clamp-1">
                              {seller.name}
                            </div>
                            <div className="text-xs text-stone-500">{seller.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Business Type */}
                      <td className="px-5 py-3.5 text-xs text-stone-700">
                        <span className="font-medium">
                          {seller.businessType || "Individual Artisan"}
                        </span>
                      </td>

                      {/* TIN & Location */}
                      <td className="px-5 py-3.5 text-xs">
                        <div className="font-mono text-stone-800">
                          {seller.tinNumber ? `TIN: ${seller.tinNumber}` : "No TIN submitted"}
                        </div>
                        <div className="text-stone-500 text-[11px] mt-0.5">
                          {seller.city || "Addis Ababa"}, {seller.phoneNumber}
                        </div>
                      </td>

                      {/* Verification Status */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isStoreVerified
                              ? "bg-emerald-100 text-emerald-800"
                              : isPending
                              ? "bg-amber-100 text-amber-800"
                              : "bg-stone-100 text-stone-600"
                          }`}
                        >
                          {isStoreVerified ? (
                            <BsShieldCheck size={12} />
                          ) : (
                            <BsShieldExclamation size={12} />
                          )}
                          {seller.verificationStatus || (isStoreVerified ? "Verified" : "Unverified")}
                        </span>
                      </td>

                      {/* Balance */}
                      <td className="px-5 py-3.5 font-bold text-stone-900 text-xs">
                        {Number(seller.availableBalance || 0).toLocaleString()} ETB
                        {seller.pendingBalance > 0 && (
                          <div className="text-[11px] text-amber-700 font-normal">
                            +{Number(seller.pendingBalance).toLocaleString()} escrow
                          </div>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="px-5 py-3.5 text-xs text-stone-500">
                        {seller.createdAt
                          ? new Date(seller.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "2024"}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right space-x-1">
                        <button
                          onClick={() => openVerifyModal(seller)}
                          title="Review Verification"
                          className="p-2 rounded-xl text-emerald-700 hover:bg-emerald-50 transition-colors"
                        >
                          <BsPencil size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSeller(seller);
                            setDeleteModalOpen(true);
                          }}
                          title="Delete Account"
                          className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <BsTrash size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Verification Review Modal */}
      {verifyModalOpen && verifyingSeller && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <h2 className="text-lg font-bold font-serif text-stone-900 flex items-center gap-2">
                <BsShieldCheck className="text-emerald-700" /> Review Artisan Verification
              </h2>
              <button
                onClick={() => setVerifyModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all"
              >
                <RxCross1 size={18} />
              </button>
            </div>

            <form onSubmit={handleVerifySubmit} className="mt-4 space-y-4 text-xs">
              {/* Merchant Details Box */}
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-500">Store Name:</span>
                  <span className="font-semibold text-stone-900">{verifyingSeller.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Email:</span>
                  <span className="font-mono text-stone-900">{verifyingSeller.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Phone:</span>
                  <span className="text-stone-900">{verifyingSeller.phoneNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Business Type:</span>
                  <span className="font-semibold text-stone-900">
                    {verifyingSeller.businessType || "Individual Artisan"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Tax ID (TIN):</span>
                  <span className="font-mono font-bold text-emerald-800">
                    {verifyingSeller.tinNumber || "Not provided"}
                  </span>
                </div>
                {verifyingSeller.businessRegistrationNumber && (
                  <div className="flex justify-between">
                    <span className="text-stone-500">Trade License No:</span>
                    <span className="font-mono text-stone-900">
                      {verifyingSeller.businessRegistrationNumber}
                    </span>
                  </div>
                )}
              </div>

              {/* Uploaded Documents Preview */}
              {(verifyingSeller.businessLicense?.url || verifyingSeller.idCard?.url) && (
                <div className="space-y-2 pt-2">
                  <label className="block font-semibold text-stone-700 uppercase tracking-wider">
                    Uploaded Verification Documents
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {verifyingSeller.businessLicense?.url && (
                      <a
                        href={verifyingSeller.businessLicense.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 rounded-xl border border-stone-200 hover:border-emerald-600 bg-stone-50 text-center block transition-all"
                      >
                        <BsFileEarmarkText size={24} className="mx-auto text-emerald-700 mb-1" />
                        <span className="text-[11px] font-medium text-stone-800">
                          Trade License Doc ↗
                        </span>
                      </a>
                    )}
                    {verifyingSeller.idCard?.url && (
                      <a
                        href={verifyingSeller.idCard.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 rounded-xl border border-stone-200 hover:border-emerald-600 bg-stone-50 text-center block transition-all"
                      >
                        <BsFileEarmarkText size={24} className="mx-auto text-emerald-700 mb-1" />
                        <span className="text-[11px] font-medium text-stone-800">
                          National ID Doc ↗
                        </span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Decision Controls */}
              <div className="pt-2 space-y-3">
                <div>
                  <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Verification Decision
                  </label>
                  <select
                    value={verificationStatus}
                    onChange={(e) => {
                      const val = e.target.value;
                      setVerificationStatus(val);
                      setIsVerified(val === "Verified");
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="Verified">Verified (Approve & Grant Trust Badge)</option>
                    <option value="Pending">Pending (Under Additional Review)</option>
                    <option value="Rejected">Rejected (Incomplete or Invalid Credentials)</option>
                    <option value="Unverified">Unverified</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isVerifiedCheckbox"
                    checked={isVerified}
                    onChange={(e) => setIsVerified(e.target.checked)}
                    className="w-4 h-4 accent-emerald-700"
                  />
                  <label htmlFor="isVerifiedCheckbox" className="font-semibold text-stone-800">
                    Grant Verified Artisan badge publicly on marketplace
                  </label>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Admin Review Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="Feedback or rationale visible internally and to the artisan"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setVerifyModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-stone-700 hover:bg-stone-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingVerification}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-sm transition-all"
                >
                  {submittingVerification ? "Saving..." : "Save Verification Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedSeller && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-sm w-full p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <BsTrash size={22} />
            </div>
            <h3 className="text-base font-bold text-stone-900 font-serif">
              Remove Artisan Store?
            </h3>
            <p className="text-xs text-stone-600 mt-1">
              Are you sure you want to delete <span className="font-semibold text-stone-900">{selectedSeller.name}</span>? This will deactivate their store account and listings.
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

export default AllSellers;
