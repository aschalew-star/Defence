import React from "react";
import SSeccess from "../component/payment/SSeccess";
import Navbar from "../component/Layout/Navbar";
import Footer from "../component/Layout/Footer";

const Seccess: React.FC = () => {
  return (
    <div className="pt-32 sm:pt-36 md:pt-40 bg-[#FAF8F5] min-h-screen flex flex-col justify-between select-none">
      <Navbar show={7} />
      <main className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 w-full flex-1 pb-12">
        <SSeccess />
      </main>
      <Footer />
    </div>
  );
};

export default Seccess;
