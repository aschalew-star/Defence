
import React ,{useState} from 'react'
import { FaAngleUp } from "react-icons/fa6";
import { FaAngleDown } from "react-icons/fa6";
import { MdOutlineMenu } from "react-icons/md";
import { Link } from 'react-router-dom';

function DropDown() {
    const [dropdown,setDropdown]=useState(false);
  return (
    
<div
  className="relative w-1/5 bg-gray-50 h-[70px] md:h-[18px] ml-8 border-none rounded-t-md "
  onMouseEnter={() => setDropdown(true)}
  onMouseLeave={() => setDropdown(false)}
>
  {/* Dropdown Button */}
  <button className="w-full flex flex-row justify-between pt-1 ">
    <MdOutlineMenu className="ml-3  size-5 -mt-1 " />
    <div className="ml-3 -mt-2 hidden md:block">All Categories</div>

    {/* Dropdown Icon */}
    {dropdown ? (
      <FaAngleUp className="ml-auto mr-4 hidden md:block" />
    ) : (
      <FaAngleDown className="ml-auto mr-4 hidden md:block" />
    )}
  </button>

  {/* Dropdown Menu */}
  {dropdown && (
    <div className="absolute left-0  w-full bg-white border rounded-b-md -mt-1 shadow-lg z-50">
      <Link
 to="/product/category/Clothing" className="block px-4 py-2 hover:bg-gray-100">
        Clothing
      </Link>
      <Link to="/product/category/Footwear" className="block px-4 py-2 hover:bg-gray-100">
        Footwear
      </Link      >
      <Link to="/product/category/Jewelry"className="block px-4 py-2 hover:bg-gray-100">
        Jewelry
      </Link      >
      <Link to="/product/category/Bags & Wallets" className="block px-4 py-2 hover:bg-gray-100">
        Bags & Wallets
      </Link      >
      <Link to="/product/category/Textiles" className="block px-4 py-2 hover:bg-gray-100">
        Textiles
      </Link      >
    </div>
  )}
</div>

  )
}

export default DropDown

