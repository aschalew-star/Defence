import React from "react";
import Login from "../component/Login/Login";
import Navbar from "../component/Layout/Navbar";

function LoginPage() {
  return (
    <div className="pt-48 md:pt-1 -mt-1">
      <Navbar show={7}/>
      <Login />
    </div>
  );
}

export default LoginPage;
