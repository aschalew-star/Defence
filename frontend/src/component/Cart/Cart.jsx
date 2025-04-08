import React from "react";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import CartCard from "./CartCard";
import { Link } from "react-router-dom";

function Cart() {
  const { cart } = useSelector((state) => state.Cart);
  const [cartData, setCartData] = useState([]);

  const total = cart.reduce((acc, item) => acc + item.
  originalPrice * item.qty, 0);

  useEffect(() => {
    const data = cart;
    setCartData(data);
  }, [cart]);

  const dispatch = useDispatch();

  console.log(cartData);

  return (
    <div className="relative flex flex-col-reverse md:flex md:flex-row gap-0 md:gap-8 mx-0 md:mx-12 justify-between ">
      <div>
        <div>
          <div className="flex flex-col w-full pt-52 md:pt-0">
            <div className="mx-2 text-[30px] font-bold text-center  ">Cart</div>
            {cartData.length === 0 ? (
              <div className="py-48 mt-32 text-center mx-auto text-[50px]">
                No Product in the cart{" "}
              </div>
            ) : (
              cartData.map((item) => <CartCard key={item.id} item={item} />)
            )}
          </div>
        </div>
      </div>
      <div className="fixed right-0 top-8">
        <div className="bg-gray-50 shadow-lg border border-gray-200 p-7 rounded-lg w-[250px] h-[300px]  mt-16 mr-0 md:mr-24">
          <div className="flex flex-col justify-between">
            <div className="font-bold text-[33px] -mt-3 ">
              Summary <hr className="text-black" />
            </div>
            <div className="mt-8 flex font-medium  text-[13px] mb-20">
              <div className="  text-[13px] mr-2 ">Total price</div>
              <div className=" font-Poppins ml-16">{total} Birr</div>
              <hr />
            </div>
            <div className="">
            <Link to={"/checkout"} className="">
              <div className="justify-center flex  ">
                <div className="text-white font-medium w-full bg-rose-500 rounded-[7px] py-2 shadow-lg text-center ">
                  Check out
                </div>
              </div>
            </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
