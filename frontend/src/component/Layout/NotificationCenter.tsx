import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { server } from "../../server";
import { useAppSelector } from "../../hooks";
import { INotification } from "../../types";
import {
  BsBell,
  BsCheck2All,
  BsBagCheck,
  BsChatDots,
  BsWallet2,
  BsTag,
  BsLightningCharge,
  BsShieldExclamation,
  BsShieldCheck,
  BsTruck,
  BsGear,
} from "react-icons/bs";

interface NotificationCenterProps {
  variant?: "light" | "dark";
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ variant = "light" }) => {
  const { user } = useAppSelector((state) => state.user);
  const { seller } = useAppSelector((state) => state.seller);
  const activeEntity = user || seller;

  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchUnread = async () => {
    if (!activeEntity?._id) return;
    try {
      const res = await axios.get(`${server}/notification/unread-count`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      // silent
    }
  };

  const fetchNotifications = async () => {
    if (!activeEntity?._id) return;
    try {
      setLoading(true);
      const res = await axios.get(`${server}/notification`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 45000); // Poll unread counter every 45s
    return () => clearInterval(interval);
  }, [activeEntity?._id]);

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await axios.put(
        `${server}/notification/read-all`,
        {},
        { withCredentials: true }
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      // silent
    }
  };

  const handleNotificationClick = async (notif: INotification) => {
    if (!notif.isRead) {
      axios
        .put(
          `${server}/notification/read/${notif._id}`,
          {},
          { withCredentials: true }
        )
        .catch(() => {});
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setOpen(false);
  };

  if (!activeEntity) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "order_update":
        return <BsBagCheck className="text-amber-800" />;
      case "payout_processed":
        return <BsWallet2 className="text-emerald-600" />;
      case "dispute_update":
        return <BsShieldExclamation className="text-rose-600" />;
      case "delivery_confirmed":
      case "buyer_protection_expiring":
        return <BsShieldCheck className="text-teal-600" />;
      case "qa_reply":
      case "review_reply":
        return <BsChatDots className="text-blue-600" />;
      case "wallet_credit":
        return <BsWallet2 className="text-emerald-600" />;
      case "price_drop":
        return <BsTag className="text-rose-600" />;
      case "flash_deal":
        return <BsLightningCharge className="text-amber-500" />;
      default:
        return <BsBell className="text-stone-600" />;
    }
  };

  const buttonStyle =
    variant === "dark"
      ? "relative p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-all cursor-pointer"
      : "relative p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-amber-900 transition-all cursor-pointer";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className={buttonStyle}
        title="Notifications"
        aria-label="Notification center"
      >
        <BsBell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white font-black text-[9px] rounded-full flex items-center justify-center shadow-xs animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-stone-200/80 z-50 overflow-hidden animate-fadeIn text-stone-800">
          {/* Header */}
          <div className="p-3.5 bg-stone-50/90 border-b border-stone-200/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-amber-300">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 transition cursor-pointer"
                >
                  <BsCheck2All /> Mark read
                </button>
              )}
              <Link
                to="/profile?tab=7"
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition"
                title="Notification Preferences"
              >
                <BsGear size={13} />
              </Link>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
            {loading ? (
              <div className="p-6 text-center text-xs text-stone-400">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400">
                No notifications right now. Order updates, payouts, and alerts will appear here!
              </div>
            ) : (
              notifications.map((n) => {
                const targetLink =
                  n.actionUrl ||
                  n.referenceUrl ||
                  (seller ? "/Dashboard" : "/profile");

                return (
                  <Link
                    key={n._id}
                    to={targetLink}
                    onClick={() => handleNotificationClick(n)}
                    className={`block p-3.5 hover:bg-stone-50 transition text-left ${
                      !n.isRead ? "bg-amber-50/40" : "bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center shrink-0 text-sm mt-0.5">
                        {getIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-1">
                          <h5
                            className={`text-xs truncate ${
                              !n.isRead
                                ? "font-bold text-stone-900"
                                : "font-medium text-stone-700"
                            }`}
                          >
                            {n.title}
                          </h5>
                          <span className="text-[9px] text-stone-400 shrink-0">
                            {new Date(n.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 line-clamp-2 mt-0.5">
                          {n.message}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
