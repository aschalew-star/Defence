// import logo from './logo.svg';
import "./App.css";
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Home,
  LoginPage,
  Signuppage,
  CartPage,
  Checkoutpage,Orders,
Daynamicproduct,
Product,Faq,
  Wishpage,Payments,Event,Seccess
} from "./Routs/Route";

import { ShopCreatee, ProductCreate ,ShopLogin,Dashbord,Orderdtal,
Adminallorder,
Alluser,
Allseller,
Allproductees,
AdminDashboard,
AllOrderss,Shopallprodcts,CreateEvant,
} from "./Routs/Shop";
import Store from "./redux/Store/Store";
import { fechAllProducts } from "./redux/Action/productAction";
import {loadSeller, loadUser } from "./redux/Action/user"
import { useSelector } from "react-redux";
import Usermessage from "./page/Usermessage";
import Mesage from "../src/page/shop/Mssage";

function App() {
  useEffect(() => {
    Store.dispatch(fechAllProducts());
      Store.dispatch(loadUser());
      Store.dispatch(loadSeller());
    
  }, []);
    const { user } = useSelector((state) => state.user);
  
 console.log(user);
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
        <Route path="/" element={<Home />}/>
        <Route path="/LOgin" element={<LoginPage />} />
        <Route path="/Signup" element={<Signuppage />} />
        <Route path="/inbox" element={<Usermessage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/Order" element={<Orders />} />
        <Route path="/Message" element={<Mesage/>} />

        <Route path="/checkout" element={<Checkoutpage />} />
        <Route path="/Event" element={<Event />} />
        <Route path="/Payments" element={<Payments />} />
        <Route path="/products" element={<Product />} />
        <Route path="/Wishlist" element={<Wishpage />} />
        <Route path="/shop-create" element={<ShopCreatee />} />
        <Route path="/create-product" element={<ProductCreate />} />
        <Route path="/ShopLogin" element={<ShopLogin />} />
        <Route path="/Dashboard" element={<Dashbord />} />
        <Route path="/AllOrders" element={<AllOrderss />} />
        <Route path="/Shopallprodcts" element={<Shopallprodcts />} />
        <Route path="/create-event" element={<CreateEvant/>} />
        <Route path="/product/category/:category" element={<Daynamicproduct/>} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
        <Route path="/AdminAllproduct" element={<Allproductees />} />
        <Route path="/Adminallorder" element={<Adminallorder />} />
        <Route path="/Allseller" element={<Allseller />} />
        <Route path="/Alluser" element={<Alluser />} />

        <Route
          path="/order/:id"
          element={
              <Orderdtal />
          }
        />

        <Route path="/Seccess/:tx_ref" element={<Seccess/>} />



      </Routes>
    </BrowserRouter>
  );
}

export default App;
