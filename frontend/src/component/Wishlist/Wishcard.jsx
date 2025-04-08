import React from "react";
import { LuPlus } from "react-icons/lu";
import { LuMinus } from "react-icons/lu";
import { useSelector, useDispatch } from "react-redux";
import { removeFromwish, addToWishlist } from "../../redux/Action/Wishlist";

function Wishcard({ item }) {
  const dispatch = useDispatch();

  const { wish } = useSelector((state) => state.Wish);

  const increment = () => {
    const items = { ...item, qty: item.qty + 1 };

    dispatch(addToWishlist(items));
  };

  const decrement = () => {
    if (item.qty === 1) {
      dispatch(removeFromwish(item));
      return;
    }
    const newItem = { ...item, qty: item.qty - 1 }; 


    dispatch(addToWishlist(newItem));
  };

  return (
    <div className=" flex mx-20  mt-4">
      <div className="flex gap-12 ">
        <div className=" ">
          <img src={item.image} alt="image" className="h-32  w-32" />
        </div>
        <div>
          <div className="font-medium">{item.description}</div>
          <div className="font-light">{item.name}</div>
          <div className="font-light">Shop {item.shop}</div>
          <div className="flex ">
            <div className="w-16 md:w-80 mr-32">
              <div className="text-rose-800 font-thin space-y-0 ">
                {item.price} Birr
              </div>
              <div className="text-rose-800 font-thin space-y-0">
                {item.rating} rating
              </div>
            </div>
            <div>
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

export default Wishcard;
