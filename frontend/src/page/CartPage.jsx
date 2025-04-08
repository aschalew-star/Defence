import React ,{useState} from "react";
import Cart from "../component/Cart/Cart";
import Navbar from "../component/Layout/Navbar";
// import Footer from "../component/Layout/Footer";

function CartPage() {
    const [show , setshow]=useState(false)
  return (
    <div className="pt-48 md:pt-16 -mt-1 mb-24">
      <Navbar show={7}/>
      <Cart />
      {/* <Footer /> */}

    </div>
  );
}

export default CartPage;
