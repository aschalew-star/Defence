import React from "react";
import Chekout from "../component/Checkout/Chekout";
import CheckoutSteps from "../component/Checkout/Checkoutprocess";
import Navbar from "../component/Layout/Navbar";
import Footer from "../component/Layout/Footer";

function Checkoutpage() {
  return (
    <div className="pt-28 md:pt-32 bg-stone-50 min-h-screen flex flex-col justify-between font-sans">
      <Navbar show={7} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 pb-16 space-y-6">
        <CheckoutSteps active={1} />
        <Chekout />
      </div>
      <Footer />
    </div>
  );
}

export default Checkoutpage;
