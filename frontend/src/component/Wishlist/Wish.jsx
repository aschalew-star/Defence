import React from "react";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Wishcard from "./Wishcard";
import { Link } from "react-router-dom";
import Productcard from "../Products/Productcard";

function Cart() {
  const { wish } = useSelector((state) => state.Wish);
  const [cartData, setCartData] = useState([]);

  useEffect(() => {
    if (wish && Array.isArray(wish)) {
        setCartData(wish);
  }}, [wish]);

  const dispatch = useDispatch();
  //   const total = wish.reduce((acc, item) => acc + item.price * item.qty, 0);

  console.log(cartData);

  return (
    <div className="relative flex gap-8 mx-auto md:mx-24 justify-between mt-8">
      <div>
        <div>
          <div className="flex flex-col w-full">
            <div className="mx-24 text-[40px] font-bold text-center mt-1 mb-2">Wishlist</div>
            <div className="flex flex-wrap">
            {cartData?.length === 0 ? (
              <div className="py-48 mt-32 text-center mx-auto text-[50px]">
                No Product in the wish{" "}
              </div>
            ) : (
              cartData &&
              cartData.map((item) => <Productcard key={item.id} item={item} />)
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
