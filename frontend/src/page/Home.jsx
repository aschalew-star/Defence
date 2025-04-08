import React from "react";
import Navbar from "../component/Layout/Navbar";
import Hero from "../component/Layout/Hero";
import Moretolove from "../component/Layout/Moretolove";
import Footer from "../component/Layout/Footer";

function Home() {
  return (
    <div className='className=" pt-36 mt-4 md:mt-0 md:pt-12'>
      <Navbar active={1} />
      <Hero />
      <Moretolove />
      <Footer/>
    </div>
  );
}

export default Home;
