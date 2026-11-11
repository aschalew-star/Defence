import React from "react";
import Products from "../component/Layout/Products";
import Navbar from "../component/Layout/Navbar";
import Footer from "../component/Layout/Footer";

function Product() {
  return (
    <div className="pt-28 md:pt-32 bg-gray-50/50 min-h-screen">
      <Navbar active={2} />
      <Products />
      <Footer />
    </div>
  );
}

export default Product;
