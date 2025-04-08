import React from "react";
import { LuPlus } from "react-icons/lu";
import { LuMinus } from "react-icons/lu";
import { useSelector, useDispatch } from "react-redux";
import { removeFromCart, addTocart } from "../../redux/Action/cartAction";

function CartCard({ item }) {
  const dispatch = useDispatch();

  const { cart } = useSelector((state) => state.Cart);

  const increment = () => {
    const items = { ...item, qty: item.qty + 1 };

    dispatch(addTocart(items));
  };

  const decrement = () => {
    if (item.qty === 1) {
      dispatch(removeFromCart(item));
      return;
    }
    const newItem = { ...item, qty: item.qty - 1 };

    dispatch(addTocart(newItem));
  };

  return (
    <div className=" flex mr-20  w-full md:w-[300] mt-4">
      <div className="flex gap-6 ">
        <div className=" ">
          <img
            src={`${item && item.images[0]?.url}`}
            alt="image"
            className="h-32  w-28"
          />
        </div>
        <div className="leading-5">
          <div className="font-normal text-[14px]">{item.description}</div>
          <div className="font-thin text-[12px]">{item.name}</div>
          <div className="font-thin text-[12px]">Shop {item.shop.name}</div>
          <div className="flex ">
            <div className="w-16 md:w-60 mr-32 ">
              <div className="text-rose-800 font-thin text-[12px] space-y-0 ">
                {item.price} Birr
              </div>
              <div className="text-rose-800 font-thin text-[12px] space-y-0">
                {item.rating} rating
              </div>
            </div>
            <div className="-mt-4">
              <div onClick={increment}>
                <LuPlus />
              </div>
              <div className="ml-1">{item.qty}</div>
              <div onClick={decrement}>
                <LuMinus />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartCard;
