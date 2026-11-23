import React, { useEffect, useState, useMemo } from "react";
import { server } from "../../server";
import axios from "axios";
import {
  BsSearch,
  BsClockHistory,
  BsCodeSlash,
  BsPersonBadge,
  BsShieldLock,
} from "react-icons/bs";
import { RxCross1, RxReload } from "react-icons/rx";

const AdminActivityLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actorFilter, setActorFilter] = useState("all");

  const [activeLogPayload, setActiveLogPayload] = useState<any>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${server}/platform/admin-activity-logs`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        setLogs(res.data.logs || []);
      } else {
        setLogs([]);
      }
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        log.action?.toLowerCase().includes(q) ||
        log.actorName?.toLowerCase().includes(q) ||
        log.targetType?.toLowerCase().includes(q);

      if (!matchSearch) return false;
      if (actorFilter !== "all" && log.actorType !== actorFilter) return false;
      return true;
    });
  }, [logs, searchTerm, actorFilter]);

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold mb-2">
            <BsShieldLock size={14} /> Regulatory Audit & System Governance Trail
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight">
            Security & Compliance Audit Logs
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
            Immutable chronicle of all platform governance actions: merchant KYC approvals, status suspensions,
            escrow releases, dispute rulings, and financial balance adjustments.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition shadow-2xs self-start md:self-auto"
        >
          <RxReload size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-stone-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <BsSearch className="absolute left-3.5 top-3.5 text-stone-400" size={14} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit trail by action, administrator, or target..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>

        <select
          value={actorFilter}
          onChange={(e) => setActorFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-2xl border border-stone-300 text-xs font-semibold bg-white text-stone-700"
        >
          <option value="all">All Actors</option>
          <option value="Admin">Admin Personnel</option>
          <option value="System">Automated System Engines</option>
          <option value="Seller">Merchant Actions</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-stone-500 text-xs flex flex-col items-center justify-center">
            <RxReload className="animate-spin text-amber-600 mb-3" size={24} />
            <span>Loading security audit logs...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-16 text-center text-stone-500 text-xs">
            <BsClockHistory className="mx-auto text-stone-300 mb-3" size={32} />
            <p className="font-semibold text-stone-800">No audit events match your search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-600 text-[11px] uppercase tracking-wider border-b border-stone-200 font-bold">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Actor</th>
                  <th className="px-5 py-3.5">Governance Action</th>
                  <th className="px-5 py-3.5">Target Entity</th>
                  <th className="px-5 py-3.5 text-right">Details Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-xs">
                {filteredLogs.map((log) => {
                  const isAdmin = log.actorType === "Admin";
                  const isSystem = log.actorType === "System";

                  return (
                    <tr key={log._id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-stone-500">
                        <div>{new Date(log.createdAt).toLocaleDateString()}</div>
                        <div className="text-[10px] text-stone-400">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                          <BsPersonBadge size={13} className={isAdmin ? "text-amber-800" : "text-blue-700"} />
                          <span>{log.actorName}</span>
                        </div>
                        <span
                          className={`inline-block mt-0.5 px-2 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                            isAdmin
                              ? "bg-amber-100 text-amber-900"
                              : isSystem
                              ? "bg-blue-100 text-blue-900"
                              : "bg-stone-100 text-stone-700"
                          }`}
                        >
                          {log.actorType}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="font-mono font-bold text-stone-900 bg-stone-100 px-2.5 py-1 rounded-xl text-xs">
                          {log.action}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 font-semibold text-stone-700">
                        {log.targetType || "System Registry"}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => setActiveLogPayload(log)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition"
                        >
                          <BsCodeSlash size={13} />
                          <span>View JSON</span>
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

      {/* JSON PAYLOAD INSPECTOR MODAL */}
      {activeLogPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-stone-900 text-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-stone-800 animate-scaleUp space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <span className="font-bold text-amber-400 text-sm">
                Audit Event: {activeLogPayload.action}
              </span>
              <button
                onClick={() => setActiveLogPayload(null)}
                className="p-1 rounded-full text-stone-400 hover:text-white"
              >
                <RxCross1 size={16} />
              </button>
            </div>

            <div className="space-y-1 text-stone-300 text-[11px]">
              <div>Actor: {activeLogPayload.actorName} ({activeLogPayload.actorType})</div>
              <div>Time: {new Date(activeLogPayload.createdAt).toISOString()}</div>
              <div>Target: {activeLogPayload.targetType}</div>
            </div>

            <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800 max-h-60 overflow-y-auto text-emerald-400 text-[11px]">
              <pre>{JSON.stringify(activeLogPayload.details || {}, null, 2)}</pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveLogPayload(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminActivityLogs;
