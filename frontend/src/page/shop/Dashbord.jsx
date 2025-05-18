import React from "react";
import Dashboard from "../../component/shop/Dashboard";
import Navbar from "../../component/Layout/Navbar";
import DashboardSideBar from "../../component/shop/DashboardSideBar";

function Dashbord() {
  return (
    <div className="pt-48 md:pt-16 -mt-1">
      <Navbar show={7} />
      <div className="flex  w-full">
        <div className="w-[80px] 800px:w-[330px]">
          <DashboardSideBar active={1} className="" />
        </div>
        <div className=" ml-[10px] 800px:ml-[100px]">
          <Dashboard />
        </div>
      </div>
    </div>
  );
}

export default Dashbord;
