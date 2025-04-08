import React from "react";
import Signup from "../component/Signup/Signup";
import Navbar from "../component/Layout/Navbar";

function Signuppage() {
  return (
    <div className="pt-48 md:pt-16 -mt-2">
      <Navbar show={7}/>
      <Signup />
    </div>
  );
}

export default Signuppage;
