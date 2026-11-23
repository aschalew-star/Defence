import React from "react";
import Navbar from "../../component/Layout/Navbar";
import Footer from "../../component/Layout/Footer";
import ShopStorefront from "../../component/shop/ShopStorefront";

function ShopStorefrontPage() {
  return (
    <div className="pt-28 md:pt-32 bg-gray-50/50 min-h-screen flex flex-col justify-between">
      <Navbar />
      <div className="flex-1">
        <ShopStorefront />
      </div>
      <Footer />
    </div>
  );
}

export default ShopStorefrontPage;

