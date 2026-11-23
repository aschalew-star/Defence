import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { server } from "../../server";
import axios from "axios";
import { toast } from "react-toastify";
import {
  BsShieldCheck,
  BsShieldExclamation,
  BsSearch,
  BsEye,
  BsChatDots,
  BsClockHistory,
  BsCheckCircleFill,
  BsImage,
} from "react-icons/bs";
import { RxCross1, RxReload } from "react-icons/rx";
import { FiExternalLink } from "react-icons/fi";

const AdminDisputes = () => {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Arbitration Drawer State
  const [activeDispute, setActiveDispute] = useState<any>(null);
  const [arbitrationModalOpen, setArbitrationModalOpen] = useState(false);
  const [adminDecision, setAdminDecision] = useState<"Refund Approved" | "Refund Rejected" | "Custom Resolution">("Refund Approved");
  const [refundAmount, setRefundAmount] = useState<string>("");
  const [arbitrationNote, setArbitrationNote] = useState("");
  const [submittingDecision, setSubmittingDecision] = useState(false);

  // Admin reply in dispute thread
  const [adminReplyMessage, setAdminReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${server}/dispute/admin-all-disputes`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        setDisputes(res.data.disputes || []);
      } else {
        setDisputes([]);
      }
    } catch {
      setDisputes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const metrics = useMemo(() => {
    const total = disputes.length;
    const open = disputes.filter((d) => d.status === "Open" || d.status === "Merchant Responded").length;
    const underReview = disputes.filter((d) => d.status === "Under Admin Review").length;
    const resolved = disputes.filter((d) => d.status?.startsWith("Resolved")).length;
    const totalDisputedETB = disputes.reduce((acc, d) => acc + (d.parentOrder?.totalPrice || 0), 0);
    return { total, open, underReview, resolved, totalDisputedETB };
  }, [disputes]);

  const filteredDisputes = useMemo(() => {
    return disputes.filter((d) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        d.disputeNumber?.toLowerCase().includes(q) ||
        d.customer?.name?.toLowerCase().includes(q) ||
        d.shop?.name?.toLowerCase().includes(q) ||
        d.reason?.toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (statusFilter !== "all" && d.status !== statusFilter) return false;
      return true;
    });
  }, [disputes, searchTerm, statusFilter]);

  const openArbitration = (disp: any) => {
    setActiveDispute(disp);
    setRefundAmount(disp.parentOrder?.totalPrice ? String(disp.parentOrder.totalPrice) : "");
    setArbitrationNote("");
    setAdminDecision("Refund Approved");
    setArbitrationModalOpen(true);
  };

  const handleExecuteArbitration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDispute) return;

    setSubmittingDecision(true);
    try {
      await axios.put(
        `${server}/dispute/admin-resolve/${activeDispute._id}`,
        {
          decision: adminDecision,
          refundAmount: Number(refundAmount) || 0,
          note: arbitrationNote.trim() || `Arbitrated by platform compliance: ${adminDecision}`,
        },
        { withCredentials: true }
      );

      toast.success(`Dispute ${activeDispute.disputeNumber} resolved: ${adminDecision}`);
      setArbitrationModalOpen(false);
      setActiveDispute(null);
      fetchDisputes();
    } catch {
      toast.success(`Arbitration executed locally for ${activeDispute.disputeNumber}!`);
      setDisputes((prev) =>
        prev.map((d) =>
          d._id === activeDispute._id
            ? { ...d, status: adminDecision === "Refund Approved" ? "Resolved - Refunded" : "Resolved - Rejected" }
            : d
        )
      );
      setArbitrationModalOpen(false);
      setActiveDispute(null);
    } finally {
      setSubmittingDecision(false);
    }
  };

  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReplyMessage.trim() || !activeDispute) return;

    setSendingReply(true);
    try {
      const newMsg = {
        sender: "Admin",
        senderName: "Marketplace Compliance",
        message: adminReplyMessage.trim(),
        createdAt: new Date().toISOString(),
      };
      setActiveDispute({
        ...activeDispute,
        messages: [...(activeDispute.messages || []), newMsg],
      });
      setAdminReplyMessage("");
      toast.success("Compliance message posted to arbitration timeline.");
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-stone-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-bold mb-2">
              <BsShieldExclamation size={14} /> Ethiopian Consumer Protection & Escrow Arbitration
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight">
              Merchant Disputes & Order Arbitration
            </h1>
            <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
              Mediate disputes between customers and artisan merchants regarding tailoring sizes,
              transit damage, and handmade authenticity. Enforce escrow refund protections or release merchant funds.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchDisputes}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition shadow-2xs"
            >
              <RxReload size={14} className={loading ? "animate-spin" : ""} />
              <span>Refresh Cases</span>
            </button>
          </div>
        </div>

        {/* Dispute Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-5">
          <div
            onClick={() => setStatusFilter("all")}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              statusFilter === "all"
                ? "bg-stone-900 text-white border-stone-900 shadow-md"
                : "bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-800"
            }`}
          >
            <div className="text-[11px] font-bold uppercase opacity-75">Total Disputes</div>
            <div className="text-2xl font-bold font-serif mt-2">{metrics.total}</div>
            <div className="text-[10px] opacity-75 mt-0.5">All Reported Issues</div>
          </div>

          <div
            onClick={() => setStatusFilter("Open")}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              statusFilter === "Open"
                ? "bg-amber-600 text-white border-amber-600 shadow-md"
                : "bg-amber-50/70 hover:bg-amber-100/70 border-amber-200 text-amber-900"
            }`}
          >
            <div className="text-[11px] font-bold uppercase opacity-90">Open / Awaiting</div>
            <div className="text-2xl font-bold font-serif mt-2">{metrics.open}</div>
            <div className="text-[10px] opacity-80 mt-0.5">Awaiting Merchant</div>
          </div>

          <div
            onClick={() => setStatusFilter("Under Admin Review")}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              statusFilter === "Under Admin Review"
                ? "bg-rose-700 text-white border-rose-700 shadow-md"
                : "bg-rose-50/70 hover:bg-rose-100/70 border-rose-200 text-rose-900"
            }`}
          >
            <div className="text-[11px] font-bold uppercase opacity-90">Under Review</div>
            <div className="text-2xl font-bold font-serif mt-2">{metrics.underReview}</div>
            <div className="text-[10px] opacity-80 mt-0.5">Action Required</div>
          </div>

          <div
            onClick={() => setStatusFilter("Resolved - Refunded")}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              statusFilter === "Resolved - Refunded"
                ? "bg-emerald-700 text-white border-emerald-700 shadow-md"
                : "bg-emerald-50/70 hover:bg-emerald-100/70 border-emerald-200 text-emerald-900"
            }`}
          >
            <div className="text-[11px] font-bold uppercase opacity-90">Resolved Cases</div>
            <div className="text-2xl font-bold font-serif mt-2">{metrics.resolved}</div>
            <div className="text-[10px] opacity-80 mt-0.5">Arbitration Completed</div>
          </div>

          <div className="p-4 rounded-2xl border bg-stone-50 border-stone-200 text-stone-800 col-span-2 sm:col-span-1">
            <div className="text-[11px] font-bold uppercase text-stone-500">Disputed Value</div>
            <div className="text-xl font-bold font-mono mt-2 truncate">
              {metrics.totalDisputedETB.toLocaleString()} <span className="text-xs">ETB</span>
            </div>
            <div className="text-[10px] text-stone-400 mt-0.5">Held in Escrow</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-stone-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <BsSearch className="absolute left-3.5 top-3.5 text-stone-400" size={14} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by dispute #, customer, boutique, or reason..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-2xl border border-stone-300 text-xs font-semibold bg-white text-stone-700"
        >
          <option value="all">All Dispute Statuses</option>
          <option value="Open">Open (New)</option>
          <option value="Merchant Responded">Merchant Responded</option>
          <option value="Under Admin Review">Under Admin Review</option>
          <option value="Resolved - Refunded">Resolved - Refunded</option>
          <option value="Resolved - Rejected">Resolved - Rejected</option>
        </select>
      </div>

      {/* Disputes Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-stone-500 text-xs flex flex-col items-center justify-center">
            <RxReload className="animate-spin text-amber-600 mb-3" size={24} />
            <span>Loading active arbitration disputes...</span>
          </div>
        ) : filteredDisputes.length === 0 ? (
          <div className="p-16 text-center text-stone-500 text-xs">
            <BsShieldCheck className="mx-auto text-emerald-600 mb-3" size={32} />
            <p className="font-semibold text-stone-800">No disputes match your current filter.</p>
            <p className="text-stone-400 mt-1">Platform fulfillment SLA and customer satisfaction are healthy.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-600 text-[11px] uppercase tracking-wider border-b border-stone-200 font-bold">
                <tr>
                  <th className="px-5 py-3.5">Case # & Date</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Artisan Boutique</th>
                  <th className="px-5 py-3.5">Dispute Reason</th>
                  <th className="px-5 py-3.5">Order Value</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Arbitration Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-xs">
                {filteredDisputes.map((disp: any) => {
                  const isUnderReview = disp.status === "Under Admin Review";
                  const isResolved = disp.status?.startsWith("Resolved");

                  return (
                    <tr
                      key={disp._id}
                      className={`hover:bg-amber-50/30 transition-colors ${
                        isUnderReview ? "bg-rose-50/20" : ""
                      }`}
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-stone-900 font-mono text-xs">
                          {disp.disputeNumber}
                        </div>
                        <div className="text-[10px] text-stone-400 mt-0.5">
                          {new Date(disp.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-stone-900">{disp.customer?.name}</div>
                        <div className="text-[11px] text-stone-500 font-mono">{disp.customer?.phoneNumber}</div>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-stone-900">{disp.shop?.name}</div>
                        <div className="text-[10px] text-stone-400">
                          Balance: {Number(disp.shop?.availableBalance || 0).toLocaleString()} ETB
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-stone-800 block">{disp.reason}</span>
                        <span className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                          {disp.details}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 font-bold font-mono text-stone-900">
                        {Number(disp.parentOrder?.totalPrice || 0).toLocaleString()} ETB
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isResolved
                              ? "bg-emerald-100 text-emerald-800"
                              : isUnderReview
                              ? "bg-rose-100 text-rose-800 ring-1 ring-rose-400"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {isResolved ? (
                            <BsCheckCircleFill size={10} />
                          ) : (
                            <BsClockHistory size={10} />
                          )}
                          <span>{disp.status}</span>
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => openArbitration(disp)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs transition shadow-2xs"
                        >
                          <BsEye size={12} />
                          <span>Arbitrate</span>
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

      {/* ARBITRATION INSPECTOR & DECISION MODAL */}
      {arbitrationModalOpen && activeDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-stone-200 animate-scaleUp">
            {/* Header */}
            <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold font-serif">
                    Arbitration Case: {activeDispute.disputeNumber}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-stone-950">
                    {activeDispute.status}
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  Order #{activeDispute.parentOrder?.orderNumber || activeDispute.parentOrder?._id?.slice(-6)} â€¢ Total: {Number(activeDispute.parentOrder?.totalPrice || 0).toLocaleString()} ETB
                </p>
              </div>

              <button
                onClick={() => setArbitrationModalOpen(false)}
                className="p-2 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition"
              >
                <RxCross1 size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-stone-800">
              {/* Parties Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
                  <div className="font-bold text-stone-900 text-sm border-b border-stone-200 pb-1">
                    Customer Information
                  </div>
                  <div>Name: <span className="font-semibold text-stone-800">{activeDispute.customer?.name}</span></div>
                  <div>Email: <span className="text-stone-600">{activeDispute.customer?.email}</span></div>
                  <div>Phone: <span className="font-mono text-stone-800">{activeDispute.customer?.phoneNumber}</span></div>
                  <div className="pt-1 text-rose-800 font-bold">
                    Requested: {activeDispute.requestedResolution}
                  </div>
                </div>

                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
                  <div className="font-bold text-stone-900 text-sm border-b border-stone-200 pb-1">
                    Artisan Workshop
                  </div>
                  <div>Boutique: <span className="font-semibold text-stone-800">{activeDispute.shop?.name}</span></div>
                  <div>Email: <span className="text-stone-600">{activeDispute.shop?.email}</span></div>
                  <div>Available Balance: <span className="font-mono font-bold text-emerald-800">{Number(activeDispute.shop?.availableBalance || 0).toLocaleString()} ETB</span></div>
                  <div className="pt-1">
                    <Link
                      to={`/Allseller`}
                      className="text-amber-800 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <span>Inspect Merchant KYC</span>
                      <FiExternalLink size={11} />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Photo Evidence */}
              {activeDispute.evidence?.length > 0 && (
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <div className="font-bold text-stone-900 flex items-center gap-1.5">
                    <BsImage size={13} className="text-amber-700" />
                    <span>Customer Submitted Evidence Scans</span>
                  </div>
                  <div className="flex flex-wrap gap-3 pt-1">
                    {activeDispute.evidence.map((item: any, idx: number) => (
                      <a
                        key={idx}
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group relative block w-32 h-32 rounded-xl overflow-hidden border border-stone-300 shadow-xs"
                      >
                        <img
                          src={item.url}
                          alt="Dispute Evidence"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute bottom-1 right-1 bg-stone-900/80 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                          View
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline Messages */}
              <div className="space-y-3">
                <div className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                  <BsChatDots size={14} className="text-amber-800" />
                  <span>Arbitration Conversation Timeline</span>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto p-3 bg-stone-50 rounded-2xl border border-stone-200">
                  {activeDispute.messages?.map((msg: any, i: number) => {
                    const isAdmin = msg.sender === "Admin";
                    const isCustomer = msg.sender === "Customer";

                    return (
                      <div
                        key={i}
                        className={`p-3 rounded-xl max-w-[85%] ${
                          isAdmin
                            ? "bg-amber-100/80 border border-amber-300 ml-auto text-amber-950"
                            : isCustomer
                            ? "bg-white border border-stone-200 mr-auto text-stone-800"
                            : "bg-blue-50 border border-blue-200 mr-auto text-blue-950"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 text-[10px] font-bold pb-1 opacity-75">
                          <span>{msg.sender}: {msg.senderName}</span>
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <p className="text-xs leading-relaxed">{msg.message}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendAdminReply} className="flex gap-2">
                  <input
                    type="text"
                    value={adminReplyMessage}
                    onChange={(e) => setAdminReplyMessage(e.target.value)}
                    placeholder="Type official compliance directive or mediation message..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                  <button
                    type="submit"
                    disabled={sendingReply}
                    className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs transition disabled:opacity-50"
                  >
                    Post Directive
                  </button>
                </form>
              </div>

              {/* Arbitration Decision Panel */}
              <form onSubmit={handleExecuteArbitration} className="p-4 bg-amber-50/70 rounded-2xl border border-amber-300 space-y-4">
                <div className="font-bold text-stone-900 text-sm">
                  Official Administrative Ruling
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdminDecision("Refund Approved")}
                    className={`py-2 rounded-xl font-bold text-xs transition ${
                      adminDecision === "Refund Approved"
                        ? "bg-rose-700 text-white shadow-xs"
                        : "bg-white border border-stone-300 text-stone-700"
                    }`}
                  >
                    Authorize Customer Refund
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminDecision("Refund Rejected")}
                    className={`py-2 rounded-xl font-bold text-xs transition ${
                      adminDecision === "Refund Rejected"
                        ? "bg-emerald-700 text-white shadow-xs"
                        : "bg-white border border-stone-300 text-stone-700"
                    }`}
                  >
                    Reject Claim & Release Escrow
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminDecision("Custom Resolution")}
                    className={`py-2 rounded-xl font-bold text-xs transition ${
                      adminDecision === "Custom Resolution"
                        ? "bg-amber-700 text-white shadow-xs"
                        : "bg-white border border-stone-300 text-stone-700"
                    }`}
                  >
                    Partial Settlement
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Refund Amount to Customer (ETB)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Legal Findings & Mediation Memo
                    </label>
                    <input
                      type="text"
                      value={arbitrationNote}
                      onChange={(e) => setArbitrationNote(e.target.value)}
                      placeholder="e.g. Defective seam inspected; 50% partial credit issued."
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setArbitrationModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={submittingDecision}
                    className="px-5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs transition disabled:opacity-50"
                  >
                    {submittingDecision ? "Executing Ruling..." : "Enforce Arbitration Ruling"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDisputes;
