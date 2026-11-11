import React from "react";
import CreateProduct from "../../component/shop/ProductCreate";
import MerchantNavbar from "../../component/shop/MerchantNavbar";
import DashboardSideBar from "../../component/shop/DashboardSideBar";

function ProductCreatePage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <MerchantNavbar />
      <div className="flex w-full pt-16">
        <div className="w-[72px] md:w-[270px] flex-shrink-0">
          <DashboardSideBar active={4} />
        </div>
        <div className="flex-1 w-full min-w-0 p-4 sm:p-6 lg:p-8 overflow-hidden flex justify-center">
          <CreateProduct />
        </div>
      </div>
    </div>
  );
}

export default ProductCreatePage;
