export interface NavItemConfig {
  label: string;
  path: string;
  id: number;
}

export const MAIN_NAV_ITEMS: NavItemConfig[] = [
  { label: "Home", path: "/", id: 1 },
  { label: "All Products", path: "/products", id: 2 },
  { label: "Cultural Events", path: "/event", id: 4 },
  { label: "Wishlist", path: "/wishlist", id: 5 },
  { label: "FAQ", path: "/faq", id: 6 },
];

export const MERCHANT_NAV_ITEMS = [
  { id: 1, label: "Overview", path: "/dashboard", icon: "dashboard" },
  { id: 2, label: "Active Orders", path: "/dashboard-orders", icon: "orders" },
  { id: 3, label: "Craft Catalog", path: "/dashboard-products", icon: "products" },
  { id: 4, label: "Create Product", path: "/dashboard-create-product", icon: "create" },
  { id: 5, label: "Cultural Events", path: "/dashboard-events", icon: "events" },
  { id: 6, label: "Create Event", path: "/dashboard-create-event", icon: "create-event" },
  { id: 7, label: "Finance & Ledger", path: "/dashboard-withdraw-money", icon: "ledger" },
  { id: 8, label: "Store Analytics", path: "/dashboard/analytics", icon: "analytics" },
  { id: 9, label: "Holiday Coupons", path: "/dashboard/coupons", icon: "coupons" },
  { id: 10, label: "Artisan Reputation", path: "/dashboard/reviews", icon: "reviews" },
  { id: 11, label: "Client Inquiries", path: "/dashboard-messages", icon: "messages" },
  { id: 12, label: "Workshop Profile", path: "/dashboard-settings", icon: "settings" },
];
