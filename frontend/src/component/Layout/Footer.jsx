import React from "react";
import {
  AiFillFacebook,
  AiFillInstagram,
  AiFillYoutube,
  AiOutlineTwitter,
} from "react-icons/ai";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className="bg-[#000] text-white">
      <div className="md:flex md:justify-between md:items-center h-auto md:h-[40px] sm:px-12 px-4 bg-[#342ac8] py-7">
        <h1 className="lg:text-2xl text-3xl md:mb-0 mb-6 lg:leading-6 font-semibold md:w-2/5">
          <span className="text-[#56d879]">Subscribe</span> us for get news{" "}
          <br />
          events and offers
        </h1>
        <div>
          <input
            type="text"
            required
            placeholder="Enter your email..."
            className="text-gray-800
                sm:w-72 w-full sm:mr-5 mr-1 lg:mb-0 mb-4 py-1 rounded px-2 focus:outline-none"
          />
          <button className="bg-[#56d879] hover:bg-teal-500 duration-300 px-2 py-1 rounded-md text-whie md:w-auto w-full">
            Submit
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:gird-cols-3 lg:grid-cols-4 gap-6 sm:px-8 px-5 pt-6 sm:text-center">
        <ul className="px-5 text-center sm:text-start flex sm:block flex-col items-center">
          <div className="text-[50px] font-bold">MEP</div>
          <br />
          <p>The home and elements needeed to create beatiful products.</p>
          <div className="justify-center items-center pt-4"> Follow Us:</div>

          <div className="flex items-center mt-[15px]">
            <AiFillFacebook size={25} className="cursor-pointer" />
            <AiOutlineTwitter
              size={25}
              style={{ marginLeft: "15px", cursor: "pointer" }}
            />
            <AiFillInstagram
              size={25}
              style={{ marginLeft: "15px", cursor: "pointer" }}
            />
            <AiFillYoutube
              size={25}
              style={{ marginLeft: "15px", cursor: "pointer" }}
            />
          </div>
        </ul>
        <div>
          <div className="justify-start">
            <div className="text-[25px] pb-3">📞 Contact Us:</div>
            <div className="-ml-2">Email: asche@gmail.com</div>
            <div className="ml-2 pt-1">Phone: +251 900 3429 4000</div>
            <div className="-ml-3 pt-1">Location: adise ketema</div>
          </div>
        </div>
        <div>
          <div className="justify-start">
            <div className="text-[25px] "> 🛍️ Our Services:</div>
            <div className="">Buy & Sell Ethiopian Traditional Cloth</div>
            <div className="">Secure Transactions</div>
            <div className="">Verified Merchants</div>
            <div className="">Fast & Reliable Shipping</div>
          </div>
        </div>
        <div>
          <div className="justify-start">
            <div className="text-[25px] "> 🔗 Quick Links:</div>
            <div className="">Home</div>

            <div className="">About Us</div>
            <div className="">Browse Merchants</div>
            <div className="">Sell with Us</div>
            <div className="">Contact us</div>
          </div>
        </div>
      </div>

      <div
        className=" 
         text-center  text-gray-400 
         text-sm pb-8"
      >
       
        <span>© 2017 MEP. All rights reserved.</span>
        <span>Terms · Privacy Policy</span>
      </div>
    </div>
  );
};

export default Footer;
