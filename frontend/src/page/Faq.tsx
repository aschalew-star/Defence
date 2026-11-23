import React from "react";
import FAQ from "../component/FAQ";
import Footer from "../component/Layout/Footer";
import Navbar from "../component/Layout/Navbar";

function Faq() {
  return (
    <div className="pt-28 md:pt-32 bg-gray-50/50 min-h-screen flex flex-col justify-between">
      <Navbar active={6} />
      <div className="flex-1">
        <FAQ />
      </div>
      <Footer />
    </div>
  );
}

export default Faq;
