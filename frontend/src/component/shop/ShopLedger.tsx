import React, { useEffect, useState } from "react";
import axios from "axios";
import { server } from "../../server";
import { useSelector } from "react-redux";
import {
  BsShieldCheck,
  BsArrowDownLeft,
  BsArrowUpRight,
  BsReceipt,
  BsDownload,
  BsFilter,
} from "react-icons/bs";

import { useAppSelector, useCurrency } from "../../hooks";

const ShopLedger: React.FC = () => {
  const { seller } = useAppSelector((state) => state.seller);
  const { formatPrice } = useCurrency();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>("");

  const displayEntries = entries;

  const handleExportCSV = () => {
    const list = displayEntries;
    if (list.length === 0) return;

    const headers = ["Transaction ID", "Type", "Amount (ETB)", "Order Ref", "Description", "Date"];
    const rows = list.map((e) => [
      e._id,
      e.entryType,
      e.amount,
      e.orderId || "N/A",
      `"${e.description || ""}"`,
      new Date(e.createdAt).toLocaleDateString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `artisan-ledger-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const fetchLedger = async () => {
      setLoading(true);
      try {
        const query = filterType ? `?entryType=${filterType}` : "";
        const res = await axios.get(`${server}/shop/ledger${query}`, {
          withCredentials: true,
        });
        if (res.data?.success && res.data.entries) {
          setEntries(res.data.entries);
        } else {
          setEntries([]);
        }
      } catch (err: any) {
        setEntries([]);
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
    <div className="w-full space-y-6">
      {/* Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md">
            Audit & Statements
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-serif mt-2">
            Merchant Financial Ledger
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Immutable accounting record of escrow settlements, commissions, and bank disbursements
          </p>
        </div>

        {/* Balances Quick Snapshot */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/50 text-right">
            <span className="text-[10px] uppercase font-bold text-stone-500 block">Pending Escrow</span>
            <span className="text-lg font-black text-amber-900">
              {seller?.pendingBalance?.toLocaleString() || 0} ETB
            </span>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200/50 text-right">
            <span className="text-[10px] uppercase font-bold text-stone-500 block">Available for Payout</span>
            <span className="text-lg font-black text-emerald-900">
              {seller?.availableBalance?.toLocaleString() || 0} ETB
            </span>
          </div>

          <button
            onClick={handleExportCSV}
            className="p-3 bg-stone-100 hover:bg-stone-200 rounded-2xl border border-stone-300 text-stone-700 text-xs font-bold transition inline-flex items-center gap-1.5 shadow-2xs self-center"
            title="Download CSV Statement"
          >
            <BsDownload size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1">
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
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-stone-400 font-medium hidden sm:inline">
          {entries.length} Ledger Entries
        </span>
      </div>

      {/* Ledger Records Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-stone-400">Loading immutable ledger...</div>
        ) : entries.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <BsReceipt className="text-4xl text-stone-300 mx-auto" />
            <p className="text-sm font-semibold text-stone-600">No ledger transactions found</p>
            <p className="text-xs text-stone-400">Transactions appear automatically when customer orders are placed or fulfilled.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 uppercase font-bold text-stone-500 text-[10px] tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-6">Date & Time</th>
                  <th className="py-3.5 px-6">Entry Type</th>
                  <th className="py-3.5 px-6">Reference</th>
                  <th className="py-3.5 px-6">Description</th>
                  <th className="py-3.5 px-6 text-right">Amount (ETB)</th>
                  <th className="py-3.5 px-6 text-right">Balance Snapshot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {entries.map((entry) => {
                  const badge = getEntryBadge(entry.entryType);
                  const isCredit = entry.amount > 0;
                  return (
                    <tr key={entry._id} className="hover:bg-amber-50/20 transition">
                      <td className="py-4 px-6 text-stone-500 whitespace-nowrap">
                        {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : "—"}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-[11px] text-stone-600 whitespace-nowrap">
                        {entry.referenceCode || "—"}
                      </td>
                      <td className="py-4 px-6 text-stone-800 font-medium max-w-xs truncate">
                        {entry.description}
                      </td>
                      <td
                        className={`py-4 px-6 text-right font-black text-sm whitespace-nowrap ${
                          isCredit ? "text-emerald-700" : "text-stone-900"
                        }`}
                      >
                        {isCredit ? `+${entry.amount.toLocaleString()}` : entry.amount.toLocaleString()} ETB
                      </td>
                      <td className="py-4 px-6 text-right text-stone-500 font-mono text-[11px] whitespace-nowrap">
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
  );
}

export default ShopLedger;
