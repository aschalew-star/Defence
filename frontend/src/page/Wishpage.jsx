import React from "react";
import Wish from "../component/Wishlist/Wish";
import Navbar from "../component/Layout/Navbar";
import Footer from "../component/Layout/Footer";

function Wishpage() {
  return (
    <div className="pt-28 md:pt-32 bg-gray-50/50 min-h-screen flex flex-col justify-between">
      <Navbar active={5} />
      <Wish />
      <Footer />
    </div>
  );
}

export default Wishpage;
