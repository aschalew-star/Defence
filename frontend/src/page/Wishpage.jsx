import React ,{useState} from "react";
import Wish from "../component/Wishlist/Wish";
import Navbar from "../component/Layout/Navbar";
import Footer from "../component/Layout/Footer";

function Wishpage() {
    const [show , setshow]=useState(false)
  return (
    <div className="pt-48 md:pt-28 -mt-1">
      <Navbar active={5}/>
      <Wish />
      <Footer />

    </div>
  );
}

export default Wishpage;
