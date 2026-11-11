import React from "react";
import Navbar from "../component/Layout/Navbar";
import Order from "../component/Order";
import Footer from "../component/Layout/Footer";

function Orders() {
  return (
    <div className="pt-28 md:pt-32 bg-gray-50/50 min-h-screen flex flex-col justify-between">
      <Navbar show={7} />
      <div className="flex-1">
        <Order />
      </div>
      <Footer />
    </div>
  );
}

export default Orders;
