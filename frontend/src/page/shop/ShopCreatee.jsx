import React from "react";
import ShopCreate from "../../component/shop/Shopcreateee";
import Navbar from "../../component/Layout/Navbar";

function ShopCreatee() {
  return (
    <div className="pt-48 md:pt-3 -mt-1">

      <Navbar show={7}/>
      <ShopCreate />
    </div>
  );
}

export default ShopCreatee;