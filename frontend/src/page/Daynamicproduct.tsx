import React from "react";
import Productdynamic from "../component/Productdynamic";
import Navbar from "../component/Layout/Navbar";
import Footer from "../component/Layout/Footer";

function Daynamicproduct() {
  return (
    <div className="pt-28 md:pt-32 bg-gray-50/50 min-h-screen flex flex-col justify-between">
      <Navbar show={7} />
      <div className="flex-1">
        <Productdynamic />
      </div>
      <Footer />
    </div>
  );
}

export default Daynamicproduct;
