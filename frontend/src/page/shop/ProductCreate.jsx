import React from "react";
import CreateProduct from "../../component/shop/ProductCreate";
import Navbar from "../../component/Layout/Navbar";
import DashboardSideBar from "../../component/shop/DashboardSideBar";

function Dashbord() {
  return (
    <div className="pt-48 md:pt-16 -mt-1">
      <Navbar show={7} />
      <div className="flex items-center justify-between w-full">
            <div className="w-[80px] 800px:w-[330px]">
              <DashboardSideBar active={4} />
            </div>
            <div className="w-full justify-center  flex">
                <CreateProduct/>
            </div>
          </div>
    </div>
  );
}

export default Dashbord;

