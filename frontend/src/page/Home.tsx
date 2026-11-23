import React, { FC, useEffect } from "react";
import Navbar from "../component/Layout/Navbar";
import Hero from "../component/Layout/Hero";
import Moretolove from "../component/Layout/Moretolove";
import Footer from "../component/Layout/Footer";

const Home: FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-28 md:pt-32 bg-gray-50/50 min-h-screen flex flex-col justify-between">
      <Navbar active={1} />
      <main className="flex-1">
        <Hero />
        <Moretolove />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
