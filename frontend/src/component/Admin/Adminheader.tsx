import React, { FC } from "react";
import { Link, useLocation } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";
import {
  FiShoppingBag,
  FiPackage,
  FiArrowLeft,
} from "react-icons/fi";
import { GrWorkshop } from "react-icons/gr";
import { HiOutlineUserGroup } from "react-icons/hi";
import { CiMoneyBill } from "react-icons/ci";
import {
  BsShieldCheck,
  BsShieldExclamation,
  BsCashCoin,
  BsSliders,
  BsTags,
  BsGift,
  BsClockHistory,
} from "react-icons/bs";

export interface AdminSidebarProps {
  active?: number;
}

const Adminsidebar: FC<AdminSidebarProps> = ({ active }) => {
  const location = useLocation();
  const currentPath = (location?.pathname || "").toLowerCase();

  const navSections = [
    {
      label: "Marketplace Operations",
      items: [
        { id: 1, title: "Executive Dashboard", icon: RxDashboard, link: "/AdminDashboard" },
        { id: 3, title: "Artisan Merchants", icon: GrWorkshop, link: "/Allseller" },
        { id: 2, title: "Orders & Escrow", icon: FiShoppingBag, link: "/Adminallorder" },
        { id: 5, title: "Crafts & Products", icon: FiPackage, link: "/AdminAllproduct" },
      ],
    },
    {
      label: "Finance & Arbitration",
      items: [
        { id: 7, title: "Merchant Disbursals", icon: CiMoneyBill, link: "/admin-withdraw-request" },
        { id: 8, title: "Disputes & Arbitration", icon: BsShieldExclamation, link: "/admin-disputes" },
        { id: 14, title: "Customer Returns Desk", icon: BsShieldCheck, link: "/admin-returns" },
        { id: 9, title: "Escrow Vault & Ledger", icon: BsCashCoin, link: "/admin-ledger" },
      ],
    },
    {
      label: "Platform Governance",
      items: [
        { id: 10, title: "Platform Settings", icon: BsSliders, link: "/admin-settings" },
        { id: 11, title: "Craft Categories", icon: BsTags, link: "/admin-categories" },
        { id: 12, title: "Promotions & Events", icon: BsGift, link: "/admin-promotions" },
        { id: 13, title: "Security & Audit Logs", icon: BsClockHistory, link: "/admin-activity-logs" },
        { id: 4, title: "Marketplace Users", icon: HiOutlineUserGroup, link: "/Alluser" },
      ],
    },
  ];

  const isItemActive = (item: { id: number; link: string }) => {
    // 1. Explicit prop match
    if (active !== undefined && active !== null && active > 0) {
      if (active === item.id) return true;
    }

    // 2. Exact match against pathname
    const cleanPath = currentPath.replace(/\/+$/, "");
    const cleanLink = item.link.toLowerCase().replace(/\/+$/, "");
    if (cleanPath && cleanLink && cleanPath === cleanLink) return true;

    // 3. Semantic keyword matching
    if (item.id === 8 && cleanPath.includes("dispute")) return true;
    if (item.id === 14 && cleanPath.includes("return")) return true;
    if (item.id === 9 && cleanPath.includes("ledger")) return true;
    if (item.id === 7 && (cleanPath.includes("withdraw") || cleanPath.includes("disbursal"))) return true;
    if (item.id === 10 && cleanPath.includes("setting")) return true;
    if (item.id === 11 && cleanPath.includes("categor")) return true;
    if (item.id === 12 && cleanPath.includes("promotion")) return true;
    if (item.id === 13 && (cleanPath.includes("activity") || cleanPath.includes("log"))) return true;
    if (item.id === 3 && (cleanPath.includes("seller") || cleanPath.includes("artisan"))) return true;
    if (item.id === 4 && (cleanPath.includes("user") || cleanPath.includes("customer"))) return true;
    if (item.id === 2 && cleanPath.includes("order")) return true;
    if (item.id === 5 && cleanPath.includes("product")) return true;
    if (item.id === 1 && (cleanPath === "/admindashboard" || cleanPath === "/admin")) return true;

    return false;
  };

  return (
    <aside className="w-full h-full min-h-[calc(100vh-64px)] bg-white border-r border-stone-200 py-4 px-2 md:px-3 flex flex-col justify-between select-none">
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {/* Admin Brand / Console Monogram */}
        <div className="p-2.5 rounded-2xl bg-stone-50 border border-stone-200/80 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-900 text-white flex items-center justify-center font-serif font-black text-sm shadow-2xs shrink-0">
              M
            </div>
            <div className="hidden md:block min-w-0 flex-1">
              <div className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5 truncate">
                <span>MEP Console</span>
                <BsShieldCheck className="text-emerald-700 shrink-0" size={13} title="Official Governance" />
              </div>
              <div className="text-[10px] text-stone-500 truncate mt-0.5">Marketplace Governance</div>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="space-y-4">
          {navSections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              <div className="hidden md:block px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                {sec.label}
              </div>
              <div className="space-y-0.5">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = isItemActive(item);
                  return (
                    <Link
                      key={item.id}
                      to={item.link}
                      className={`relative flex items-center justify-center md:justify-between px-2.5 md:px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                        isActive
                          ? "bg-gradient-to-r from-emerald-800 to-teal-950 text-white shadow-xs font-bold"
                          : "text-stone-700 hover:bg-stone-100 hover:text-stone-900"
                      }`}
                      title={item.title}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon
                          size={17}
                          className={`shrink-0 transition-transform group-hover:scale-110 ${
                            isActive ? "text-white" : "text-stone-500 group-hover:text-stone-900"
                          }`}
                        />
                        <span className="hidden md:inline-block truncate">{item.title}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Return to Marketplace */}
      <div className="pt-3 border-t border-stone-200 space-y-1">
        <Link
          to="/"
          className="flex items-center justify-center md:justify-start gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-all"
          title="Back to Marketplace"
        >
          <FiArrowLeft size={16} className="shrink-0" />
          <span className="hidden md:inline-block truncate">Marketplace Home</span>
        </Link>
      </div>
    </aside>
  );
};

export default Adminsidebar;
