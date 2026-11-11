import React from "react";
import Navbar from "../component/Layout/Navbar";
import Hero from "../component/Layout/Hero";
import Moretolove from "../component/Layout/Moretolove";
import Footer from "../component/Layout/Footer";

function Home() {
  return (
    <div className="pt-28 md:pt-32 bg-gray-50/50 min-h-screen">
      <Navbar active={1} />
      <Hero />
      <Moretolove />
      <Footer />
    </div>
  );
}

export default Home;
