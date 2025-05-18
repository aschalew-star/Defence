import React from 'react'
import Shopallproduct from '../../component/shop/Shopallproduct'
import DashboardSideBar from "../../component/shop/DashboardSideBar"
import Navbar from '../../component/Layout/Navbar'

function Shopallprodcts() {
  return (
    <div  className="pt-48 md:pt-28 -mt-1">
        <Navbar  show={7}/>
        <div className="flex justify-between w-full">
            <div className="w-[80px] 800px:w-[330px]">
              <DashboardSideBar active={3} />
            </div>
            <div className="w-full justify-center flex z-50">
                <Shopallproduct />
            </div>
          </div>
    </div>
  )
}

export default Shopallprodcts;

