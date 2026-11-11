import React, { useEffect, useState } from "react";
import axios from "axios";
import { server } from "../../server";
import { useSelector } from "react-redux";
import DashboardSideBar from "./DashboardSideBar";
import ShopHeader from "./ShopHeader";
import {
  BsShieldCheck,
  BsArrowDownLeft,
  BsArrowUpRight,
  BsReceipt,
  BsDownload,
  BsFilter,
} from "react-icons/bs";

function ShopLedger() {
  const { seller } = useSelector((state) => state.seller);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("");

  useEffect(() => {
    const fetchLedger = async () => {
      setLoading(true);
      try {
        const query = filterType ? `?entryType=${filterType}` : "";
        const res = await axios.get(`${server}/shop/ledger${query}`, {
          withCredentials: true,
        });
        if (res.data?.success) {
          setEntries(res.data.entries || []);
        }
      } catch (err) {
        console.error("Failed to load merchant ledger:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLedger();
  }, [filterType]);

  const getEntryBadge = (type) => {
    switch (type) {
      case "ESCROW_HOLD":
        return {
          bg: "bg-blue-50 text-blue-700 border-blue-200",
          label: "Escrow Hold (Pending)",
        };
      case "ESCROW_RELEASE":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          label: "Escrow Released (Available)",
        };
      case "PLATFORM_COMMISSION":
        return {
          bg: "bg-amber-50 text-amber-800 border-amber-200",
          label: "Platform Commission",
        };
      case "PAYOUT_REQUEST":
        return {
          bg: "bg-purple-50 text-purple-700 border-purple-200",
          label: "Payout Requested",
        };
      case "PAYOUT_COMPLETED":
        return {
          bg: "bg-gray-100 text-gray-800 border-gray-300",
          label: "Payout Disbursed",
        };
      case "PAYOUT_REJECTED":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          label: "Payout Rejected",
        };
      case "REFUND_DEDUCTION":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          label: "Refund Deduction",
        };
      default:
        return {
          bg: "bg-gray-50 text-gray-700 border-gray-200",
          label: type,
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <ShopHeader />

      <div className="flex">
        {/* Sidebar */}
        <div className="w-[80px] 800px:w-[280px]">
          <DashboardSideBar active={7} />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-4 sm:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Header Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md">
                  Audit & Statements
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-serif mt-2">
                  Merchant Financial Ledger
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  Immutable accounting record of escrow settlements, commissions, and bank disbursements
                </p>
              </div>

              {/* Balances Quick Snapshot */}
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/50 text-right">
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">Pending Escrow</span>
                  <span className="text-lg font-black text-amber-900">
                    {seller?.pendingBalance?.toLocaleString() || 0} ETB
                  </span>
                </div>

                <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200/50 text-right">
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">Available for Payout</span>
                  <span className="text-lg font-black text-emerald-900">
                    {seller?.availableBalance?.toLocaleString() || 0} ETB
                  </span>
                </div>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <BsFilter /> Filter:
                </span>
                {[
                  { label: "All Records", val: "" },
                  { label: "Escrow Holds", val: "ESCROW_HOLD" },
                  { label: "Escrow Releases", val: "ESCROW_RELEASE" },
                  { label: "Platform Commissions", val: "PLATFORM_COMMISSION" },
                  { label: "Payouts", val: "PAYOUT_COMPLETED" },
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => setFilterType(item.val)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
                      filterType === item.val
                        ? "bg-amber-800 text-white shadow-xs"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <span className="text-xs text-gray-400 font-medium hidden sm:inline">
                {entries.length} Ledger Entries
              </span>
            </div>

            {/* Ledger Records Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              {loading ? (
                <div className="py-20 text-center text-xs text-gray-400">Loading immutable ledger...</div>
              ) : entries.length === 0 ? (
                <div className="py-20 text-center space-y-2">
                  <BsReceipt className="text-4xl text-gray-300 mx-auto" />
                  <p className="text-sm font-semibold text-gray-600">No ledger transactions found</p>
                  <p className="text-xs text-gray-400">Transactions appear automatically when customer orders are placed or fulfilled.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50/80 uppercase font-bold text-gray-400 text-[10px] tracking-wider border-b border-gray-100">
                      <tr>
                        <th className="py-3.5 px-6">Date & Time</th>
                        <th className="py-3.5 px-6">Entry Type</th>
                        <th className="py-3.5 px-6">Reference</th>
                        <th className="py-3.5 px-6">Description</th>
                        <th className="py-3.5 px-6 text-right">Amount (ETB)</th>
                        <th className="py-3.5 px-6 text-right">Balance Snapshot</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {entries.map((entry) => {
                        const badge = getEntryBadge(entry.entryType);
                        const isCredit = entry.amount > 0;
                        return (
                          <tr key={entry._id} className="hover:bg-amber-50/20 transition">
                            <td className="py-4 px-6 text-gray-500 whitespace-nowrap">
                              {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : "—"}
                            </td>
                            <td className="py-4 px-6 whitespace-nowrap">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}
                              >
                                {badge.label}
                              </span>
                            </td>
                            <td className="py-4 px-6 font-mono text-[11px] text-gray-600 whitespace-nowrap">
                              {entry.referenceCode || "—"}
                            </td>
                            <td className="py-4 px-6 text-gray-800 font-medium max-w-xs truncate">
                              {entry.description}
                            </td>
                            <td
                              className={`py-4 px-6 text-right font-black text-sm whitespace-nowrap ${
                                isCredit ? "text-emerald-700" : "text-gray-900"
                              }`}
                            >
                              {isCredit ? `+${entry.amount.toLocaleString()}` : entry.amount.toLocaleString()} ETB
                            </td>
                            <td className="py-4 px-6 text-right text-gray-500 font-mono text-[11px] whitespace-nowrap">
                              {entry.balanceAfter !== undefined ? `${entry.balanceAfter.toLocaleString()} ETB` : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShopLedger;

