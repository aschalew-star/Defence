import React, { useState } from "react";
import { IoMdSearch } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import { BsCart4 } from "react-icons/bs";
import DropDown from "./DropDown";
import Navitem from "../../static/Navitem";
import { Link } from "react-router-dom";
// import Productdata from "../../static/Productdata";
import { useSelector, useDispatch } from "react-redux";

function Navbar({ active, show }) {
  const { allProducts } = useSelector((state) => state.products);
  const { cart } = useSelector((state) => state.Cart);
  const [search, setSearch] = useState("");
  const [searchData, setSearchData] = useState([]);

    const { user } = useSelector((state) => state.user);
    
   console.log(user);

  const handleSearch = (e) => {
    const value = e.target.value.trim();
    setSearch(value);

    if (!value) {
      setSearchData([]);
      return;
    }

    // Check if the input is a valid number (not just a string containing numbers)
    if (!isNaN(value) && !isNaN(parseFloat(value))) {
      // Search by price
      const filteredProducts = allProducts?.filter((product) =>
        product.originalPrice.toString().includes(value)
      );
      setSearchData(filteredProducts);
    } else {
      // Search by name
      const filteredProducts = allProducts?.filter((product) =>
        product.name.toLowerCase().includes(value.toLowerCase())
      );
      setSearchData(filteredProducts);
    }
  };

  // console.log(searchData);

  const total = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <div className="fixed top-0 left-0 right-0 z-10 bg-white shadow-md">
      <div className="flex flex-col md:flex-row items-center justify-between px-4 h-[100px] md:h-[38px] mb-5 md:mb-2  md:pt-2">
        {/* Logo */}
        <div className="flex items-center ">
          <Link to={"/"}>
            <div className="text-blue-800 font-extrabold text-4xl md:text-5xl mr-1 ">
              MEP
            </div>
          </Link>

          <div className="text-blue-800 text-sm md:text-base">
            <div className="text-center -mb-2 ">ETHIOPIAN</div>
            <div className="w-40"> TRADITIONAL CLOTH</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative flex items-center w-full md:w-1/2 border border-black rounded-md h-7 px-3   md:my-0">
          <input
            className="w-full outline-none "
            placeholder="Search..."
            onChange={handleSearch}
            value={search}
          />
          <IoMdSearch className="absolute right-3 text-xl" />
          <div className="mt-8 absolute  z-50">
            {Array.isArray(searchData) && searchData.length > 0 ? (
              <div className="absolute min-h-[30vh] bg-slate-50 shadow-sm  w-72  scroll-smooth ">
                {searchData &&
                  searchData.map((item) => {
                    return (
                      // <Link to={`/product/category/${(!isNaN(search) && !isNaN(parseFloat(search)))?item.originalPrice:item.originalPrice}`}>
                        <Link to={`/product/category/${(!isNaN(search) && isNaN(parseFloat(search)) === false) ? item.originalPrice:item.name }`}>

                        {/* "/product/category/Clothing" */}
                        <div
                          className="w-full flex items-start py-2"
                          key={item._id}
                        >
                          <img
                            src={`${item && item.images[0]?.url}`}
                            alt=""
                            className="w-[40px] h-[40px] mr-[15px]"
                          />
                          <h1>{item.name}</h1>
                        </div>
                      </Link>
                    );
                  })}
              </div>
            ) : null}
          </div>
        </div>

        {/* Profile & Cart */}
        <div className="flex    gap-6 mr-2  ">
        <Link to={"/Order"}>
            <div className="flex items-center text-[17px] hover:text-red-600  mt-4">
              Orders
            </div>
          </Link>
          <Link to={"/login"}>
            <div className="flex items-center   mt-2">
              <CgProfile className="text-2xl " />
              <p className="text-xs ">
                <small>WELCOME</small>
                <br />
                LOGIN/REGISTER
              </p>
            </div>
          </Link>

          <Link to="/cart">
            <div className="flex items-center  mt-2 ml-1 mr-2">
              <BsCart4 className="text-2xl" />
              <div>
                <p className="text-white bg-black rounded-md px-3  text-center">
                  {total}
                </p>
                <small className="text-base -mt-1">Cart</small>
              </div>
            </div>
          </Link>

          {/* Become Seller Button */}
          <div className=" ">
            {" "}
            <Link to={"/shop-create"}>
              <div className="border  bg-blue-800 leading-4 my-3 text-center -mr-2 px-0 rounded-md text-white">
                Become- <br />
                seller
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className={`${show == 7 ? "hidden" : "block"}`}>
        <div className="h-[70px] md:h-[20px] items-center   flex mt-4 md:mt-0 bg-blue-800">
          {/* ghajdbcsm,<data value=""></data> */}

          <DropDown />
          <div className="flex items-center justify-center w-2/3 flex-wrap md:flex-nowrap ">
            <Link to={"/"}>
              <div
                className={`${
                  Navitem[0].id === active
                    ? "text-lime-600 underline"
                    : "text-white"
                } mx-4 font-medium text-[18px] md:text-[13px]`}
              >
                {Navitem[0].label}
              </div>
            </Link>
            <Link to={"/products"}>
              <div
                className={`${
                  Navitem[1].id === active
                    ? "text-lime-600 underline"
                    : "text-white"
                } mx-4 font-medium text-[18px] md:text-[13px]`}
              >
                {Navitem[1].label}
              </div>
            </Link>

            <Link to={"/Event"}>
              <div
                className={`${
                  Navitem[3].id === active
                    ? "text-lime-600 underline"
                    : "text-white"
                } mx-4 font-medium text-[18px] md:text-[13px]`}
              >
                {" "}
                {Navitem[3].label}
              </div>
            </Link>

            <Link to={"/Wishlist"}>
              <div
                className={`${
                  Navitem[4].id === active
                    ? "text-lime-600 underline"
                    : "text-white"
                } mx-4 font-medium text-[18px] md:text-[13px]`}
              >
                {Navitem[4].label}
              </div>
            </Link>
            <Link to={"/faq"}>
              <div
                className={`${
                  Navitem[5].id === active
                    ? "text-lime-600 underline"
                    : "text-white"
                } mx-4 font-medium text-[18px] md:text-[13px]`}
              >
                {" "}
                {Navitem[5].label}
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
