import React from "react";
import Adminsidebar from "../../component/Admin/Adminheader";
import Navbar from "../../component/Layout/Navbar";
import AdminDashboardOrders from "../../component/Admin/Adminallorer";

function Adminallorder() {
  return (
    <div className="pt-48 md:pt-16 -mt-1">
      <Navbar />
      <div className="flex  w-full mt-5">
        <div className="w-[80px] 800px:w-[330px]">
          <Adminsidebar active={2} className="" />
        </div>
        <div className=" ml-[1px] 800px:ml-[50px]">
          <AdminDashboardOrders />
        </div>
      </div>
    </div>
  );
}

export default Adminallorder;
