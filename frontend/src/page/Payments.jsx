import React from "react";
import Payment from "../component/payment/Payment";
import Navbar from "../component/Layout/Navbar";
import CheckoutSteps from "../component/Checkout/Checkoutprocess";
import Footer from "../component/Layout/Footer";

function Payments() {
  return (
    <div className="pt-28 md:pt-32 bg-gray-50/50 min-h-screen flex flex-col justify-between">
      <Navbar show={7} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        <CheckoutSteps active={2} />
        <Payment />
      </div>
      <Footer />
    </div>
  );
}

export default Payments;
