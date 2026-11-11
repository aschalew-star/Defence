import React from "react";
import Cart from "../component/Cart/Cart";
import Navbar from "../component/Layout/Navbar";
import Footer from "../component/Layout/Footer";

function CartPage() {
  return (
    <div className="pt-28 md:pt-32 bg-gray-50/50 min-h-screen flex flex-col justify-between">
      <Navbar show={7} />
      <Cart />
      <Footer />
    </div>
  );
}

export default CartPage;
