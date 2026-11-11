import React from "react";
import Navbar from "../component/Layout/Navbar";
import Footer from "../component/Layout/Footer";
import ProductDetailsView from "../component/Products/ProductDetailsView";

function ProductDetailsPage() {
  return (
    <div className="pt-28 md:pt-32 bg-gray-50/50 min-h-screen flex flex-col justify-between">
      <Navbar show={2} />
      <div className="flex-1">
        <ProductDetailsView />
      </div>
      <Footer />
    </div>
  );
}

export default ProductDetailsPage;

