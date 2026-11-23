import React, { useMemo, FC } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../hooks";
import { RxDashboard } from "react-icons/rx";
import {
  FiShoppingBag,
  FiPackage,
  FiPlusCircle,
  FiArrowLeft,
  FiSettings,
  FiTrendingUp,
  FiExternalLink,
  FiLogOut,
} from "react-icons/fi";
import { BiMessageSquareDetail } from "react-icons/bi";
import { MdOutlineLocalOffer } from "react-icons/md";
import {
  BsShieldCheck,
  BsShieldExclamation,
  BsReceipt,
  BsLightningCharge,
  BsShop,
  BsTicketPerforated,
  BsStar,
} from "react-icons/bs";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";

export interface DashboardSideBarProps {
  active?: number;
}

interface MenuItem {
  id: number;
  title: string;
  icon: any;
  link: string;
  badge?: string | number | null;
  badgeColor?: string;
}

interface MenuSection {
  heading: string;
  items: MenuItem[];
}

const DashboardSideBar: FC<DashboardSideBarProps> = ({ active }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = (location?.pathname || "").toLowerCase();

  const { seller } = useAppSelector((state) => state.seller);
  const { orders } = useAppSelector((state) => state.order);
  const { products } = useAppSelector((state) => state.products);
  const { events } = useAppSelector((state) => state.events);

  // Compute pending orders count
  const pendingOrdersCount = useMemo(() => {
    if (!Array.isArray(orders)) return 0;
    return orders.filter(
      (o) =>
        (o.status as string) === "Processing" ||
        (o.status as string) === "Transit" ||
        (o.status as string) === "Shipping" ||
        (o.status as string) === "Pending"
    ).length;
  }, [orders]);

  const totalProductsCount = Array.isArray(products) ? products.length : 0;
  const totalEventsCount = Array.isArray(events) ? events.length : 0;

  // Check if a menu item is currently active (via explicit active prop or URL matching)
  const isItemActive = (item: MenuItem): boolean => {
    // 1. Explicit active prop takes highest priority
    if (active !== undefined && active !== null && active > 0) {
      if (active === item.id) return true;
    }

    // 2. Exact or normalized pathname match
    const cleanPath = currentPath.replace(/\/+$/, "");
    const cleanLink = item.link.toLowerCase().replace(/\/+$/, "");
    if (cleanPath && cleanLink && cleanPath === cleanLink) return true;

    // 3. Fallback semantic route matching
    if (item.id === 13 && cleanPath.includes("dispute")) return true;
    if (item.id === 14 && cleanPath.includes("trust")) return true;
    if (item.id === 7 && cleanPath.includes("ledger")) return true;
    if (item.id === 9 && cleanPath.includes("coupon")) return true;
    if (item.id === 8 && cleanPath.includes("analytic")) return true;
    if (item.id === 10 && cleanPath.includes("review")) return true;
    if (item.id === 11 && (cleanPath.includes("message") || cleanPath.includes("inbox"))) return true;
    if (item.id === 12 && cleanPath.includes("setting")) return true;
    if (item.id === 4 && cleanPath.includes("create-product")) return true;
    if (item.id === 6 && cleanPath.includes("create-event")) return true;
    if (item.id === 3 && (cleanPath.includes("shop-all-products") || (cleanPath.includes("product") && !cleanPath.includes("create")))) return true;
    if (item.id === 5 && (cleanPath.includes("shop-all-events") || (cleanPath.includes("event") && !cleanPath.includes("create")))) return true;
    if (item.id === 2 && cleanPath.includes("order")) return true;
    if (item.id === 1 && (cleanPath === "/dashboard" || cleanPath === "")) return true;

    return false;
  };

  const isVerified =
    seller?.isVerified || seller?.verificationStatus === "Verified";

  const menuSections: MenuSection[] = [
    {
      heading: "Overview & Operations",
      items: [
        {
          id: 1,
          title: "Store Overview",
          icon: RxDashboard,
          link: "/dashboard",
        },
        {
          id: 2,
          title: "Store Orders",
          icon: FiShoppingBag,
          link: "/all-orders",
          badge: pendingOrdersCount > 0 ? pendingOrdersCount : null,
          badgeColor: "bg-amber-500 text-stone-950 font-black",
        },
        {
          id: 11,
          title: "Customer Inbox",
          icon: BiMessageSquareDetail,
          link: "/Message",
        },
      ],
    },
    {
      heading: "Crafts & Catalog",
      items: [
        {
          id: 3,
          title: "Craft Catalog",
          icon: FiPackage,
          link: "/shop-all-products",
          badge: totalProductsCount > 0 ? totalProductsCount : null,
          badgeColor: "bg-stone-100 text-stone-700",
        },
        {
          id: 4,
          title: "List New Craft",
          icon: FiPlusCircle,
          link: "/create-product",
        },
        {
          id: 5,
          title: "Event Campaigns",
          icon: BsLightningCharge,
          link: "/shop-all-events",
          badge: totalEventsCount > 0 ? totalEventsCount : null,
          badgeColor: "bg-rose-100 text-rose-800",
        },
        {
          id: 6,
          title: "Launch Flash Event",
          icon: MdOutlineLocalOffer,
          link: "/create-event",
        },
        {
          id: 9,
          title: "Holiday Coupons",
          icon: BsTicketPerforated,
          link: "/dashboard/coupons",
        },
      ],
    },
    {
      heading: "Escrow & Performance",
      items: [
        {
          id: 7,
          title: "Financial Ledger",
          icon: BsReceipt,
          link: "/dashboard/ledger",
        },
        {
          id: 13,
          title: "Disputes & Claims",
          icon: BsShieldExclamation,
          link: "/dashboard/disputes",
        },
        {
          id: 14,
          title: "Trust Score & KYC",
          icon: BsShieldCheck,
          link: "/dashboard/trust-score",
        },
        {
          id: 10,
          title: "Customer Reviews",
          icon: BsStar,
          link: "/dashboard/reviews",
        },
        {
          id: 8,
          title: "Sales & Analytics",
          icon: FiTrendingUp,
          link: "/dashboard/analytics",
        },
      ],
    },
    {
      heading: "Configuration",
      items: [
        {
          id: 12,
          title: "Store Settings",
          icon: FiSettings,
          link: "/shop-settings",
          badge: !isVerified ? "KYC" : null,
          badgeColor: "bg-amber-100 text-amber-900",
        },
      ],
    },
  ];

  const handleLogout = async () => {
    try {
      await axios.get(`${server}/shop/logout`, { withCredentials: true });
      toast.success("Artisan session closed");
      navigate("/shop-login");
      window.location.reload();
    } catch (err: any) {
      toast.error("Logout failed");
    }
  };

  return (
    <aside className="w-full h-full min-h-[calc(100vh-64px)] bg-white border-r border-stone-200 py-4 px-2 md:px-3 flex flex-col justify-between select-none">
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {/* Merchant Store Header / Monogram Card */}
        <div className="p-2.5 rounded-2xl bg-stone-50 border border-stone-200/80 shadow-2xs">
          <div className="flex items-center gap-3">
            {seller?.avatar?.url ? (
              <img
                src={seller.avatar.url}
                alt={seller?.name || "Store"}
                className="w-10 h-10 rounded-xl object-cover border border-amber-300 shadow-2xs shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-700 to-amber-950 text-white flex items-center justify-center font-serif font-black text-sm shadow-2xs shrink-0">
                {seller?.name ? seller.name.charAt(0).toUpperCase() : "A"}
              </div>
            )}

            <div className="hidden md:block min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-stone-900 truncate block">
                  {seller?.name || "Artisan Workshop"}
                </span>
                {isVerified ? (
                  <BsShieldCheck
                    className="text-emerald-700 shrink-0"
                    size={13}
                    title="Verified Ethiopian Merchant"
                  />
                ) : (
                  <BsShieldExclamation
                    className="text-amber-600 shrink-0"
                    size={13}
                    title="KYC Pending Verification"
                  />
                )}
              </div>
              <div className="text-[10px] text-stone-500 truncate mt-0.5">
                {seller?.subCity ? `${seller.subCity}, Addis Ababa` : "Artisan Studio"}
              </div>
            </div>
          </div>

          {/* Quick Storefront Link for Desktop */}
          {seller?._id && (
            <div className="hidden md:block mt-2 pt-2 border-t border-stone-200/60">
              <Link
                to={`/shop/storefront/${seller._id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 hover:text-amber-950 transition-colors"
              >
                <BsShop size={11} />
                <span>View Public Storefront</span>
                <FiExternalLink size={10} />
              </Link>
            </div>
          )}
        </div>

        {/* Grouped Menu Navigation */}
        <nav className="space-y-4">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="hidden md:block px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                {section.heading}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = isItemActive(item);
                  return (
                    <Link
                      key={item.id}
                      to={item.link}
                      className={`relative flex items-center justify-center md:justify-between px-2.5 md:px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                        isActive
                          ? "bg-gradient-to-r from-amber-800 to-amber-950 text-white shadow-xs font-bold"
                          : "text-stone-700 hover:bg-stone-100 hover:text-stone-900"
                      }`}
                      title={item.title}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon
                          size={17}
                          className={`shrink-0 transition-transform group-hover:scale-110 ${
                            isActive
                              ? "text-white"
                              : "text-stone-500 group-hover:text-stone-900"
                          }`}
                        />
                        <span className="hidden md:inline-block truncate">
                          {item.title}
                        </span>
                      </div>

                      {/* Badge Indicator */}
                      {item.badge !== null && item.badge !== undefined && (
                        <>
                          <span
                            className={`hidden md:inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isActive
                                ? "bg-white text-amber-900"
                                : item.badgeColor || "bg-stone-200 text-stone-700"
                            }`}
                          >
                            {item.badge}
                          </span>
                          <span className="md:hidden absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500" />
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Links & Logout */}
      <div className="pt-3 border-t border-stone-200 space-y-1">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-all"
          title="Back to Marketplace"
        >
          <FiArrowLeft size={16} className="shrink-0" />
          <span className="hidden md:inline-block truncate">Marketplace Home</span>
        </Link>

        <button
          onClick={handleLogout}
          type="button"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all text-left"
          title="Sign Out"
        >
          <FiLogOut size={16} className="shrink-0" />
          <span className="hidden md:inline-block truncate">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default DashboardSideBar;
