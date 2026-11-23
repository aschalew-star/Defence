import React, { useEffect, useState, useMemo } from "react";
import { server } from "../../server";
import axios from "axios";
import { toast } from "react-toastify";
import {
  BsCashCoin,
  BsSearch,
  BsDownload,
  BsCheckCircleFill,
  BsClockHistory,
  BsShieldCheck,
  BsArrowDownRight,
  BsArrowUpRight,
} from "react-icons/bs";
import { RxReload } from "react-icons/rx";

const AdminLedger = () => {
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
  const [vaultMetrics, setVaultMetrics] = useState<any>({
    totalEscrowPool: 0,
    totalAvailableBalance: 0,
    totalLifetimeDisbursed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${server}/platform/admin-ledger`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        setLedgerEntries(res.data.ledgerEntries || []);
        if (res.data.vaultMetrics) {
          setVaultMetrics(res.data.vaultMetrics);
        }
      } else {
        setLedgerEntries([]);
      }
    } catch {
      setLedgerEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const filteredEntries = useMemo(() => {
    return ledgerEntries.filter((item) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        item.reference?.toLowerCase().includes(q) ||
        item.shop?.name?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      return true;
    });
  }, [ledgerEntries, searchTerm, typeFilter]);

  const handleExportCSV = () => {
    if (!ledgerEntries.length) return;
    const headers = ["Reference ID", "Date", "Merchant", "Type", "Amount (ETB)", "Status", "Description"];
    const rows = filteredEntries.map((e) => [
      `"${e.reference || e._id}"`,
      `"${new Date(e.createdAt).toISOString()}"`,
      `"${e.shop?.name || "System"}"`,
      `"${e.type}"`,
      `"${e.amount}"`,
      `"${e.status}"`,
      `"${(e.description || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Marketplace_Financial_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Financial ledger exported to CSV!");
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-stone-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2">
              <BsShieldCheck size={14} /> Immutable Financial Double-Entry Accounting
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight">
              Escrow Vault & Marketplace Ledger
            </h1>
            <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
              Transparent, immutable ledger tracking customer order deposits, held escrow funds,
              10% platform commission retained, and multichannel merchant payouts across Ethiopia.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition shadow-2xs"
            >
              <BsDownload size={13} />
              <span>Export CSV</span>
            </button>
            <button
              onClick={fetchLedger}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm"
            >
              <RxReload size={14} className={loading ? "animate-spin" : ""} />
              <span>Refresh Vault</span>
            </button>
          </div>
        </div>

        {/* Vault Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-5">
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-amber-800">Escrow Vault Pool</span>
              <BsClockHistory size={16} className="text-amber-700" />
            </div>
            <div className="text-2xl font-bold font-mono mt-2 truncate">
              {Number(vaultMetrics.totalEscrowPool || 0).toLocaleString()} <span className="text-xs">ETB</span>
            </div>
            <div className="text-[10px] text-amber-700 mt-0.5">Held for in-transit orders</div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-950">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-emerald-800">Cleared Artisan Funds</span>
              <BsCheckCircleFill size={16} className="text-emerald-700" />
            </div>
            <div className="text-2xl font-bold font-mono mt-2 truncate">
              {Number(vaultMetrics.totalAvailableBalance || 0).toLocaleString()} <span className="text-xs">ETB</span>
            </div>
            <div className="text-[10px] text-emerald-700 mt-0.5">Available for merchant payout</div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-stone-500">Total Lifetime Disbursed</span>
              <BsCashCoin size={16} className="text-amber-600" />
            </div>
            <div className="text-2xl font-bold font-mono mt-2 truncate">
              {Number(vaultMetrics.totalLifetimeDisbursed || 0).toLocaleString()} <span className="text-xs">ETB</span>
            </div>
            <div className="text-[10px] text-stone-500 mt-0.5">Disbursed via Telebirr & CBE</div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-stone-500">Total Ledger Entries</span>
              <span className="font-mono text-xs font-bold text-amber-800">Audit Trail</span>
            </div>
            <div className="text-2xl font-bold font-mono mt-2 truncate">
              {ledgerEntries.length}
            </div>
            <div className="text-[10px] text-stone-500 mt-0.5">Immutable Double-Entry records</div>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-stone-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <BsSearch className="absolute left-3.5 top-3.5 text-stone-400" size={14} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by reference ID, merchant workshop, or order description..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-2xl border border-stone-300 text-xs font-semibold bg-white text-stone-700"
        >
          <option value="all">All Transaction Types</option>
          <option value="PAYOUT_RELEASE">Payout / Escrow Releases</option>
          <option value="FEE_DEDUCTION">Platform Commission Fees</option>
        </select>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-stone-500 text-xs flex flex-col items-center justify-center">
            <RxReload className="animate-spin text-amber-600 mb-3" size={24} />
            <span>Loading immutable financial ledger...</span>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-16 text-center text-stone-500 text-xs">
            <BsCashCoin className="mx-auto text-stone-300 mb-3" size={32} />
            <p className="font-semibold text-stone-800">No ledger transactions match this filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-600 text-[11px] uppercase tracking-wider border-b border-stone-200 font-bold">
                <tr>
                  <th className="px-5 py-3.5">Reference ID & Date</th>
                  <th className="px-5 py-3.5">Merchant Boutique</th>
                  <th className="px-5 py-3.5">Transaction Type</th>
                  <th className="px-5 py-3.5">Audit Description</th>
                  <th className="px-5 py-3.5 text-right">Amount (ETB)</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-xs">
                {filteredEntries.map((entry: any) => {
                  const isFee = entry.type === "FEE_DEDUCTION";

                  return (
                    <tr key={entry._id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-stone-900 font-mono text-xs">
                          {entry.reference || entry._id.slice(-8).toUpperCase()}
                        </div>
                        <div className="text-[10px] text-stone-400 mt-0.5">
                          {new Date(entry.createdAt).toLocaleString()}
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-stone-900">
                          {entry.shop?.name || "Marketplace Treasury"}
                        </div>
                        <div className="text-[10px] text-stone-500 font-mono">
                          {entry.shop?.email || "treasury@mep.et"}
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isFee
                              ? "bg-purple-100 text-purple-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {isFee ? <BsArrowDownRight size={10} /> : <BsArrowUpRight size={10} />}
                          <span>{entry.type === "FEE_DEDUCTION" ? "10% Platform Fee" : "Merchant Escrow Release"}</span>
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-stone-600 max-w-sm leading-relaxed">
                        {entry.description}
                      </td>

                      <td className="px-5 py-3.5 text-right font-mono font-bold text-sm">
                        <span className={isFee ? "text-purple-700" : "text-emerald-700"}>
                          {isFee ? "-" : "+"}{Number(entry.amount || 0).toLocaleString()} ETB
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {entry.status || "COMPLETED"}
                        </span>
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
};

export default AdminLedger;
