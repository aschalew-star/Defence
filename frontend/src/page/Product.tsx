import React, { FC, useEffect } from "react";
import Products from "../component/Layout/Products";
import Navbar from "../component/Layout/Navbar";
import Footer from "../component/Layout/Footer";

const Product: FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-28 md:pt-32 bg-gray-50/50 min-h-screen flex flex-col justify-between">
      <Navbar active={2} />
      <main className="flex-1">
        <Products />
      </main>
      <Footer />
    </div>
  );
};

export default Product;
