import React from "react";
import ShopSettings from "../../component/shop/ShopSettings";
import MerchantNavbar from "../../component/shop/MerchantNavbar";
import DashboardSideBar from "../../component/shop/DashboardSideBar";

function ShopSettingsPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <MerchantNavbar />
      <div className="flex w-full pt-16">
        <div className="w-[72px] md:w-[270px] flex-shrink-0">
          <DashboardSideBar active={12} />
        </div>
        <div className="flex-1 w-full min-w-0 p-4 sm:p-6 lg:p-8 overflow-hidden">
          <ShopSettings />
        </div>
      </div>
    </div>
  );
}

export default ShopSettingsPage;
