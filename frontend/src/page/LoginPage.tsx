import React from "react";
import Login from "../component/Login/Login";
import Navbar from "../component/Layout/Navbar";

function LoginPage() {
  return (
    <div className="min-h-screen bg-stone-100/70 pt-32 sm:pt-36 md:pt-40 pb-16 px-4 flex flex-col justify-center items-center">
      <Navbar show={7} />
      <Login />
    </div>
  );
}

export default LoginPage;
