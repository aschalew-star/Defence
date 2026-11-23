import "./App.css";
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LanguageProvider } from "./context/LanguageContext";
import {
  Home,
  LoginPage,
  Signuppage,
  CartPage,
  Checkoutpage,
  Orders,
  Daynamicproduct,
  Product,
  Faq,
  Wishpage,
  Payments,
  Event,
  EventDetailsPage,
  Seccess,
  ProductDetailsPage,
  ProfilePage,
  ShopCreatee,
  ProductCreate,
  ShopLogin,
  Dashbord,
  Orderdtal,
  Adminallorder,
  Alluser,
  Allseller,
  Allproductees,
  AdminDashboard,
  AllOrderss,
  Shopallprodcts,
  CreateEvant,
  AdminWithdraw,
  ShopStorefrontPage,
  ArtisanDirectoryPage,
  ShopLedgerPage,
  ShopAllEventsPage,
  ShopSettingsPage,
  ShopProductEditPage,
  ShopEventEditPage,
  ShopAnalyticsPage,
  ShopCouponsPage,
  ShopReviewsPage,
  AdminDisputesPage,
  AdminLedgerPage,
  AdminSettingsPage,
  AdminCategoriesPage,
  AdminPromotionsPage,
  AdminActivityLogsPage,
  UserResolutionCenter,
  RewardsPage,
  MerchantDisputesPage,
  MerchantTrustScorePage,
  AdminReturnsPage,
  ProtectedRoute,
  SellerProtectedRoute,
  // AdminProtectedRoute, // Commented out for test mode as requested
} from "./routes";
import Store from "./redux/Store/Store";
import { loadSeller, loadUser } from "./redux/Action/user";
import Usermessage from "./page/Usermessage";
import Mesage from "./page/shop/Mssage";
import CraftLoader from "./component/Layout/CraftLoader";

const App: React.FC = () => {
  useEffect(() => {
    Store.dispatch(loadUser() as any);
    Store.dispatch(loadSeller() as any);
  }, []);

  return (
    <LanguageProvider>
      <BrowserRouter>
      <ToastContainer
        aria-label="Notifications"
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <React.Suspense fallback={<CraftLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* User Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/LOgin" element={<Navigate to="/login" replace />} />
          <Route path="/signup" element={<Signuppage />} />
          <Route path="/Signup" element={<Navigate to="/signup" replace />} />

          {/* User Pages */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/Profile" element={<Navigate to="/profile" replace />} />
          <Route path="/shops" element={<ArtisanDirectoryPage />} />
          <Route path="/artisans" element={<ArtisanDirectoryPage />} />
          <Route path="/shop/storefront/:id" element={<ShopStorefrontPage />} />
          <Route path="/shop/preview/:id" element={<ShopStorefrontPage />} />
          <Route
            path="/inbox"
            element={
              <ProtectedRoute>
                <Usermessage />
              </ProtectedRoute>
            }
          />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/order" element={<Orders />} />
          <Route path="/Order" element={<Orders />} />
          <Route path="/order/:id" element={<Orders />} />
          <Route path="/checkout" element={<Checkoutpage />} />
          <Route path="/event" element={<Event />} />
          <Route path="/Event" element={<Event />} />
          <Route path="/event/:id" element={<EventDetailsPage />} />
          <Route path="/event-details/:id" element={<EventDetailsPage />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/Payments" element={<Payments />} />
          <Route path="/products" element={<Product />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/product-details/:id" element={<ProductDetailsPage />} />
          <Route path="/wishlist" element={<Wishpage />} />
          <Route path="/Wishlist" element={<Wishpage />} />
          <Route
            path="/product/category/:category"
            element={<Daynamicproduct />}
          />
          <Route path="/Seccess/:tx_ref" element={<Seccess />} />
          <Route path="/success/:tx_ref" element={<Seccess />} />

          {/* Buyer Protection & Resolution Center */}
          <Route path="/resolution-center" element={<UserResolutionCenter />} />
          <Route path="/user/disputes" element={<UserResolutionCenter />} />
          <Route path="/user/returns" element={<UserResolutionCenter />} />

          {/* Habesha Rewards & Digital Wallet Hub */}
          <Route path="/rewards" element={<RewardsPage />} />
          <Route path="/user/rewards" element={<RewardsPage />} />
          <Route path="/user/wallet" element={<RewardsPage />} />

          {/* Shop Routes */}
          <Route path="/shop-create" element={<ShopCreatee />} />
          <Route path="/shop-login" element={<ShopLogin />} />
          <Route path="/ShopLogin" element={<ShopLogin />} />
          <Route
            path="/dashboard"
            element={
              <SellerProtectedRoute>
                <Dashbord />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/Dashboard"
            element={
              <SellerProtectedRoute>
                <Dashbord />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/create-product"
            element={
              <SellerProtectedRoute>
                <ProductCreate />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/create-event"
            element={
              <SellerProtectedRoute>
                <CreateEvant />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/AllOrders"
            element={
              <SellerProtectedRoute>
                <AllOrderss />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/all-orders"
            element={
              <SellerProtectedRoute>
                <AllOrderss />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/dashboard/orders"
            element={
              <SellerProtectedRoute>
                <AllOrderss />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/Shopallprodcts"
            element={
              <SellerProtectedRoute>
                <Shopallprodcts />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/shop-all-products"
            element={
              <SellerProtectedRoute>
                <Shopallprodcts />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/dashboard/products"
            element={
              <SellerProtectedRoute>
                <Shopallprodcts />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/dashboard/edit-product/:id"
            element={
              <SellerProtectedRoute>
                <ShopProductEditPage />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/edit-product/:id"
            element={
              <SellerProtectedRoute>
                <ShopProductEditPage />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/shop-all-events"
            element={
              <SellerProtectedRoute>
                <ShopAllEventsPage />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/ShopAllEvents"
            element={
              <SellerProtectedRoute>
                <ShopAllEventsPage />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/dashboard/events"
            element={
              <SellerProtectedRoute>
                <ShopAllEventsPage />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/dashboard/edit-event/:id"
            element={
              <SellerProtectedRoute>
                <ShopEventEditPage />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/edit-event/:id"
            element={
              <SellerProtectedRoute>
                <ShopEventEditPage />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/shop/order/:id"
            element={
              <SellerProtectedRoute>
                <Orderdtal />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/dashboard/ledger"
            element={
              <SellerProtectedRoute>
                <ShopLedgerPage />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/shop-ledger"
            element={
              <SellerProtectedRoute>
                <ShopLedgerPage />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/Message"
            element={
              <SellerProtectedRoute>
                <Mesage />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/dashboard/messages"
            element={
              <SellerProtectedRoute>
                <Mesage />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/dashboard/inbox"
            element={
              <SellerProtectedRoute>
                <Mesage />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/dashboard/analytics"
            element={
              <SellerProtectedRoute>
                <ShopAnalyticsPage />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/dashboard/coupons"
            element={
              <SellerProtectedRoute>
                <ShopCouponsPage />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/shop-coupons"
            element={
              <SellerProtectedRoute>
                <ShopCouponsPage />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/dashboard/reviews"
            element={
              <SellerProtectedRoute>
                <ShopReviewsPage />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/shop-reviews"
            element={
              <SellerProtectedRoute>
                <ShopReviewsPage />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/shop-settings"
            element={
              <SellerProtectedRoute>
                <ShopSettingsPage />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <SellerProtectedRoute>
                <ShopSettingsPage />
              </SellerProtectedRoute>
            }
          />

          {/* Merchant Disputes & Claims */}
          <Route
            path="/dashboard/disputes"
            element={
              <SellerProtectedRoute>
                <MerchantDisputesPage />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/dashboard-disputes"
            element={
              <SellerProtectedRoute>
                <MerchantDisputesPage />
              </SellerProtectedRoute>
            }
          />

          {/* Merchant Trust Score & Badging */}
          <Route
            path="/dashboard/trust-score"
            element={
              <SellerProtectedRoute>
                <MerchantTrustScorePage />
              </SellerProtectedRoute>
            }
          />
          <Route
            path="/dashboard-trust-score"
            element={
              <SellerProtectedRoute>
                <MerchantTrustScorePage />
              </SellerProtectedRoute>
            }
          />

          {/* Admin Routes (Authentication & Authorization commented out for test) */}
          <Route
            path="/AdminDashboard"
            element={<AdminDashboard />}
          />
          <Route
            path="/admin-dashboard"
            element={<AdminDashboard />}
          />
          <Route
            path="/admin"
            element={<AdminDashboard />}
          />
          <Route
            path="/AdminAllproduct"
            element={<Allproductees />}
          />
          <Route
            path="/admin-products"
            element={<Allproductees />}
          />
          <Route
            path="/admin/products"
            element={<Allproductees />}
          />
          <Route
            path="/Adminallorder"
            element={<Adminallorder />}
          />
          <Route
            path="/admin-orders"
            element={<Adminallorder />}
          />
          <Route
            path="/admin/orders"
            element={<Adminallorder />}
          />
          <Route
            path="/Allseller"
            element={<Allseller />}
          />
          <Route
            path="/admin-sellers"
            element={<Allseller />}
          />
          <Route
            path="/admin/sellers"
            element={<Allseller />}
          />
          <Route
            path="/Alluser"
            element={<Alluser />}
          />
          <Route
            path="/admin-users"
            element={<Alluser />}
          />
          <Route
            path="/admin/users"
            element={<Alluser />}
          />
          <Route
            path="/admin-withdraw-request"
            element={<AdminWithdraw />}
          />
          <Route
            path="/AdminWithdraw"
            element={<AdminWithdraw />}
          />
          <Route
            path="/admin-withdrawals"
            element={<AdminWithdraw />}
          />
          <Route
            path="/admin/withdrawals"
            element={<AdminWithdraw />}
          />

          {/* New Comprehensive Admin & Governance Routes */}
          <Route
            path="/admin-disputes"
            element={<AdminDisputesPage />}
          />
          <Route
            path="/admin/disputes"
            element={<AdminDisputesPage />}
          />
          <Route
            path="/AdminDisputes"
            element={<AdminDisputesPage />}
          />

          {/* Admin Returns & Inspection Desk */}
          <Route
            path="/admin-returns"
            element={<AdminReturnsPage />}
          />
          <Route
            path="/admin/returns"
            element={<AdminReturnsPage />}
          />
          <Route
            path="/AdminReturns"
            element={<AdminReturnsPage />}
          />

          <Route
            path="/admin-ledger"
            element={<AdminLedgerPage />}
          />
          <Route
            path="/admin/ledger"
            element={<AdminLedgerPage />}
          />
          <Route
            path="/AdminLedger"
            element={<AdminLedgerPage />}
          />

          <Route
            path="/admin-settings"
            element={<AdminSettingsPage />}
          />
          <Route
            path="/admin/settings"
            element={<AdminSettingsPage />}
          />
          <Route
            path="/AdminSettings"
            element={<AdminSettingsPage />}
          />

          <Route
            path="/admin-categories"
            element={<AdminCategoriesPage />}
          />
          <Route
            path="/admin/categories"
            element={<AdminCategoriesPage />}
          />
          <Route
            path="/AdminCategories"
            element={<AdminCategoriesPage />}
          />

          <Route
            path="/admin-promotions"
            element={<AdminPromotionsPage />}
          />
          <Route
            path="/admin/promotions"
            element={<AdminPromotionsPage />}
          />
          <Route
            path="/AdminPromotions"
            element={<AdminPromotionsPage />}
          />

          <Route
            path="/admin-activity-logs"
            element={<AdminActivityLogsPage />}
          />
          <Route
            path="/admin/logs"
            element={<AdminActivityLogsPage />}
          />
          <Route
            path="/admin-logs"
            element={<AdminActivityLogsPage />}
          />
          <Route
            path="/AdminLogs"
            element={<AdminActivityLogsPage />}
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  </LanguageProvider>
  );
};

export default App;
