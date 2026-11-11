import React from "react";
import AdminNavbar from "../../component/Admin/AdminNavbar";
import Adminsidebar from "../../component/Admin/Adminheader";
import AllProducts from "../../component/Admin/Allproducts";

function Allproductees() {
  return (
    <div className="min-h-screen bg-stone-50">
      <AdminNavbar />
      <div className="flex w-full pt-16">
        <div className="w-[72px] md:w-[270px] flex-shrink-0">
          <Adminsidebar active={5} />
        </div>
        <div className="flex-1 w-full min-w-0 p-4 sm:p-6 lg:p-8 overflow-hidden">
          <AllProducts />
        </div>
      </div>
    </div>
  );
}

export default Allproductees;
