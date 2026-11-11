import "./App.css";
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
} from "./Routs/Route";

import {
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
} from "./Routs/Shop";
import Store from "./redux/Store/Store";
import { loadSeller, loadUser } from "./redux/Action/user";
import Usermessage from "./page/Usermessage";
import Mesage from "../src/page/shop/Mssage";
import ProtectedRoute from "./Routs/protetedRout";
import SellerProtectedRoute from "./Routs/sellerProtectedRout";

function App() {
  useEffect(() => {
    Store.dispatch(loadUser());
    Store.dispatch(loadSeller());
  }, []);

  return (
    <BrowserRouter>
      <ToastContainer
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

      <Routes>
        <Route path="/" element={<Home />} />
        
        {/* User Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/LOgin" element={<Navigate to="/login" replace />} />
        <Route path="/signup" element={<Signuppage />} />
        <Route path="/Signup" element={<Navigate to="/signup" replace />} />

        {/* User Pages */}
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/Profile" element={<Navigate to="/profile" replace />} />
        <Route path="/shops" element={<ArtisanDirectoryPage />} />
        <Route path="/artisans" element={<ArtisanDirectoryPage />} />
        <Route path="/shop/storefront/:id" element={<ShopStorefrontPage />} />
        <Route path="/shop/preview/:id" element={<ShopStorefrontPage />} />
        <Route path="/inbox" element={<ProtectedRoute><Usermessage /></ProtectedRoute>} />
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
        <Route path="/product/category/:category" element={<Daynamicproduct />} />
        <Route path="/Seccess/:tx_ref" element={<Seccess />} />
        <Route path="/success/:tx_ref" element={<Seccess />} />

        {/* Shop Routes */}
        <Route path="/shop-create" element={<ShopCreatee />} />
        <Route path="/shop-login" element={<ShopLogin />} />
        <Route path="/ShopLogin" element={<ShopLogin />} />
        <Route path="/dashboard" element={<SellerProtectedRoute><Dashbord /></SellerProtectedRoute>} />
        <Route path="/Dashboard" element={<SellerProtectedRoute><Dashbord /></SellerProtectedRoute>} />
        <Route path="/create-product" element={<SellerProtectedRoute><ProductCreate /></SellerProtectedRoute>} />
        <Route path="/create-event" element={<SellerProtectedRoute><CreateEvant /></SellerProtectedRoute>} />
        <Route path="/AllOrders" element={<SellerProtectedRoute><AllOrderss /></SellerProtectedRoute>} />
        <Route path="/all-orders" element={<SellerProtectedRoute><AllOrderss /></SellerProtectedRoute>} />
        <Route path="/Shopallprodcts" element={<SellerProtectedRoute><Shopallprodcts /></SellerProtectedRoute>} />
        <Route path="/shop-all-products" element={<SellerProtectedRoute><Shopallprodcts /></SellerProtectedRoute>} />
        <Route path="/shop/order/:id" element={<SellerProtectedRoute><Orderdtal /></SellerProtectedRoute>} />
        <Route path="/dashboard/ledger" element={<SellerProtectedRoute><ShopLedgerPage /></SellerProtectedRoute>} />
        <Route path="/shop-ledger" element={<SellerProtectedRoute><ShopLedgerPage /></SellerProtectedRoute>} />
        <Route path="/Message" element={<SellerProtectedRoute><Mesage /></SellerProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/AdminAllproduct" element={<Allproductees />} />
        <Route path="/Adminallorder" element={<Adminallorder />} />
        <Route path="/Allseller" element={<Allseller />} />
        <Route path="/Alluser" element={<Alluser />} />
        <Route path="/admin-withdraw-request" element={<AdminWithdraw />} />
        <Route path="/AdminWithdraw" element={<AdminWithdraw />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
