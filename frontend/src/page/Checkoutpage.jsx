import React from "react";
import Chekout from "../component/Checkout/Chekout";
import CheckoutSteps from "../component/Checkout/Checkoutprocess";
import Navbar from "../component/Layout/Navbar";

function Checkoutpage() {
  return (
    <div className="pt-48 md:pt-20 -mt-1 mb-24">
          <Navbar show={7}/>
          <CheckoutSteps active={1}/>
          <Chekout/>
          {/* <Footer /> */}
    
        </div>
  );

}

export default Checkoutpage;



