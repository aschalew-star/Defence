import React from "react";
import Signup from "../component/Signup/Signup";
import Navbar from "../component/Layout/Navbar";

function Signuppage() {
  return (
    <div className="min-h-screen bg-stone-100/70 pt-32 sm:pt-36 md:pt-40 pb-16 px-4 flex flex-col justify-center items-center">
      <Navbar show={7}/>
      <Signup />
    </div>
  );
}

export default Signuppage;
