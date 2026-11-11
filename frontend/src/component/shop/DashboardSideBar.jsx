import React from "react";
import { Link } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";
import {
  FiShoppingBag,
  FiPackage,
  FiPlusCircle,
  FiArrowLeft,
} from "react-icons/fi";
import { BiMessageSquareDetail } from "react-icons/bi";
import { MdOutlineLocalOffer } from "react-icons/md";
import { BsShieldCheck, BsReceipt } from "react-icons/bs";

const DashboardSideBar = ({ active }) => {
  const menuItems = [
    {
      id: 1,
      title: "Store Overview",
      icon: RxDashboard,
      link: "/Dashboard",
    },
    {
      id: 2,
      title: "Store Orders",
      icon: FiShoppingBag,
      link: "/AllOrders",
    },
    {
      id: 3,
      title: "Craft Catalog",
      icon: FiPackage,
      link: "/Shopallprodcts",
    },
    {
      id: 4,
      title: "List New Craft",
      icon: FiPlusCircle,
      link: "/create-product",
    },
    {
      id: 7,
      title: "Financial Ledger",
      icon: BsReceipt,
      link: "/dashboard/ledger",
    },
    {
      id: 6,
      title: "Flash Events & Sales",
      icon: MdOutlineLocalOffer,
      link: "/create-event",
    },
    {
      id: 8,
      title: "Customer Inbox",
      icon: BiMessageSquareDetail,
      link: "/Message",
    },
  ];

  return (
    <aside className="w-full h-full min-h-[calc(100vh-80px)] bg-white border-r border-stone-200 py-6 px-3 flex flex-col justify-between select-none">
      <div className="space-y-6">
        {/* Merchant Portal Branding */}
        <div className="px-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-serif font-bold text-sm shadow-sm">
              A
            </div>
            <div className="hidden md:block">
              <div className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                Artisan Portal <BsShieldCheck className="text-emerald-700" size={13} />
              </div>
              <div className="text-[11px] text-stone-500">Merchant Store Manager</div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <Link
                key={item.id}
                to={item.link}
                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-stone-700 hover:bg-stone-100 hover:text-stone-900"
                }`}
                title={item.title}
              >
                <Icon
                  size={20}
                  className={`flex-shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? "text-white" : "text-stone-500 group-hover:text-stone-900"
                  }`}
                />
                <span className="hidden md:inline-block truncate">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Back Link */}
      <div className="pt-6 border-t border-stone-200 space-y-2">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-all"
        >
          <FiArrowLeft size={18} className="flex-shrink-0" />
          <span className="hidden md:inline-block">Back to Marketplace</span>
        </Link>
      </div>
    </aside>
  );
};

export default DashboardSideBar;
