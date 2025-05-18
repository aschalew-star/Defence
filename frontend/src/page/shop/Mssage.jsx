import React from "react";
import Navbar from "../../component/Layout/Navbar";
import DashboardSideBar from "../../component/shop/DashboardSideBar";
import Message from "../../page/Message"


function Mesage() {
  return (
    <div className="pt-48 md:pt-28 -mt-1">
      <Navbar show={7} />
      <div className="flex items-center justify-between w-full">
            <div className="w-[80px] 800px:w-[330px]">
              <DashboardSideBar active={6} />
            </div>
            <div className="w-full justify-center pt-10 flex">
                <Message/>
            </div>
          </div>
    </div>
  );
}

export default Mesage;

