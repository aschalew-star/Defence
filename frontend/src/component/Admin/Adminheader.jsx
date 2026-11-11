import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  RxDashboard,
  RxPerson,
} from "react-icons/rx";
import {
  FiShoppingBag,
  FiPackage,
  FiArrowLeft,
} from "react-icons/fi";
import { GrWorkshop } from "react-icons/gr";
import { HiOutlineUserGroup } from "react-icons/hi";
import { CiMoneyBill } from "react-icons/ci";
import { BsShieldCheck } from "react-icons/bs";

const Adminsidebar = ({ active }) => {
  const navItems = [
    {
      id: 1,
      title: "Dashboard",
      icon: RxDashboard,
      link: "/AdminDashboard",
    },
    {
      id: 2,
      title: "All Orders",
      icon: FiShoppingBag,
      link: "/Adminallorder",
    },
    {
      id: 3,
      title: "Artisans & Sellers",
      icon: GrWorkshop,
      link: "/Allseller",
    },
    {
      id: 4,
      title: "Marketplace Users",
      icon: HiOutlineUserGroup,
      link: "/Alluser",
    },
    {
      id: 5,
      title: "All Crafts & Products",
      icon: FiPackage,
      link: "/AdminAllproduct",
    },
    {
      id: 7,
      title: "Merchant Withdrawals",
      icon: CiMoneyBill,
      link: "/admin-withdraw-request",
    },
  ];

  return (
    <aside className="w-full h-full min-h-[calc(100vh-80px)] bg-white border-r border-stone-200 py-6 px-3 flex flex-col justify-between select-none">
      <div className="space-y-6">
        {/* Admin Brand / Badge */}
        <div className="px-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-serif font-bold text-sm shadow-sm">
              M
            </div>
            <div className="hidden md:block">
              <div className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                MEP Admin <BsShieldCheck className="text-emerald-700" size={13} />
              </div>
              <div className="text-[11px] text-stone-500">Marketplace Control Panel</div>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <Link
                key={item.id}
                to={item.link}
                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? "bg-emerald-700 text-white shadow-sm"
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

      {/* Footer Switcher */}
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

export default Adminsidebar;
