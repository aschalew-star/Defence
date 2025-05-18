import React from 'react'
import Navbar from '../../component/Layout/Navbar';
import Adminsidebar from '../../component/Admin/Adminheader';
import AdminDashboardMain from '../../component/Admin/Admindashbord';
import AllProducts from '../../component/Admin/Allproducts';

function Allproductees() {
  return (
    <div  className="pt-48 md:pt-16 -mt-1">
        <Navbar/>
        <div className="flex  w-full mt-5">
        <div className="w-[80px] 800px:w-[330px]">
          <Adminsidebar active={5} className="" />
        </div>
        <div className=" ml-[1px] 800px:ml-[50px]">
         <AllProducts

 /> 
        </div>
      </div>
    </div>
  )
}

export default Allproductees




