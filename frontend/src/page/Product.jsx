import React from "react";
import Products from "../component/Layout/Products";
import Navbar from "../component/Layout/Navbar";
import Footer from "../component/Layout/Footer";


function Product() {
  return (
    <div  className='className=" pt-64 md:pt-28'>
        <Navbar active={2}/>
      <Products />
      <Footer/>
    </div>
  );
}

export default Product;
