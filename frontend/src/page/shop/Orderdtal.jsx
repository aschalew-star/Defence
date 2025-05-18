import React from 'react'
import DashboardSideBar from '../../component/shop/DashboardSideBar'
import Navbar from '../../component/Layout/Navbar';
import OrderDetails from '../../component/shop/Orderdetail';

const Orderdtal = () => {
  return (
        <div className="pt-48 md:pt-28 -mt-1">
            <Navbar show={7} />
            <div className="flex justify-between w-full">
                <div className="w-[80px] 800px:w-[330px]">
                  <DashboardSideBar active={2} />
                </div>
                <div className="w-full justify-center flex ">
                   <OrderDetails />
                </div>
              </div>
        </div>
  )
}

export default Orderdtal;