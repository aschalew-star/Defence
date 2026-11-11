import React from "react";
import MerchantNavbar from "../../component/shop/MerchantNavbar";
import DashboardSideBar from "../../component/shop/DashboardSideBar";
import CreateEvent from "../../component/shop/Eventcreate";

function CreateEventPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <MerchantNavbar />
      <div className="flex w-full pt-16">
        <div className="w-[72px] md:w-[270px] flex-shrink-0">
          <DashboardSideBar active={6} />
        </div>
        <div className="flex-1 w-full min-w-0 p-4 sm:p-6 lg:p-8 overflow-hidden flex justify-center">
          <CreateEvent />
        </div>
      </div>
    </div>
  );
}

export default CreateEventPage;
