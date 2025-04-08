import React, { useState, useEffect } from "react";
import { MdOutlineMessage } from "react-icons/md";
import { TbJewishStar } from "react-icons/tb";
import { TbJewishStarFilled } from "react-icons/tb";
import { FaRegHeart } from "react-icons/fa";
import { LuScanEye } from "react-icons/lu";
import { MdAddShoppingCart } from "react-icons/md";
import ProductDetail from "./productDetail";
import { useSelector, useDispatch } from "react-redux";
import { addTocart, removeFromCart } from "../../redux/Action/cartAction";
import { addToWishlist, removeFromwish } from "../../redux/Action/Wishlist";

function Productcard({ item }) {
  const short = item.description.split("").slice(0, 23);
  const [popup, setpopup] = useState(false);
  const [active, setactive] = useState(false);
  const [wishs, setwish] = useState(false);

  const dispatch = useDispatch();

  const { cart } = useSelector((state) => state.Cart);
  const { wish } = useSelector((state) => state.Wish);

  console.log(cart);

  const wishHandler = (item, setwish) => {
    if (!wish || !Array.isArray(wish)) {
      console.log("wish is not initialized correctly", wish);
      return;
    }

    const isItemExists = wish && wish.find((i) => i._id === item._id);

    if (isItemExists) {
      console.log("Removing from wish:", wish);
      dispatch(removeFromwish(item));
      setwish(false);
    } else {
      const data = { ...item, qty: 1 };
      console.log("Adding to wish:", data);

      dispatch(addToWishlist(data));
      setwish(true);
    }
  };

  const cartHandler = (item, setactive) => {
    if (!cart || !Array.isArray(cart)) {
      // console.error("Cart is not initialized correctly", cart);
      return;
    }

    const isItemExists = cart && cart.find((i) => i._id === item._id);

    if (isItemExists) {
      // console.log("Removing from cart:", item);
      dispatch(removeFromCart(item));
      setactive(false);
    } else {
      const data = { ...item, qty: 1 };
      // console.log("Adding to cart:", data);

      dispatch(addTocart(data));
      setactive(true);
    }
  };

  return (
    <div className="">
      <div className="shadow-md mx-5 h-[280px] w-[190px] mb-8">
        <div className="h-[200px] w-[180px] overflow-hidden ">
          <img
            src={`${item && item.images[0]?.url}`}
            className="h-[200px] w-[180px] object-cover break-words"
            alt="image"
          />
        </div>
        <div>
          <div className="text-wrap text-[16px]">{short}...</div>
        </div>
        <div className="flex">
          <div className=" flex ">
            <MdOutlineMessage className="ml-1 mt-1 size-5" title="message" />
            <div className="w-14 h-6 overflow-hidden text-[11px] my-0 line-clamp-2 leading-none ">
              {item.shop.name}
            </div>
          </div>
          <div className="ml-0 text-[10px]"> solds {item.sold_out}</div>
          <div onClick={() => wishHandler(item, setwish)}>
            <div className="flex pl-1 pt-1">
              <TbJewishStar className="size-3" />
              <TbJewishStar className="size-3" />
              <TbJewishStarFilled className="size-3" />
              <TbJewishStarFilled className="size-3" />
              <FaRegHeart
                title="add to wishlist"
                className={`${
                  wishs ? "text-rose-800" : " text-blue-800 "
                } size-6  -mt-1 text-blue-800`}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center  ">
          <div className="flex gap-1">
            <div>{item.originalPrice} </div>
            <div>Birr</div>
          </div>
          <div className="flex text-red-800 pl-1">
            <div>-{item.discount} </div>
            <div>%</div>
          </div>
          <div className="ml-4 pt-1" onClick={() => setpopup(!popup)}>
            <LuScanEye className="size-6 text-blue-800 " title="preveiw" />
          </div>
          <div
            className="ml-6 pt-1"
            onClick={() => cartHandler(item, setactive)}
          >
            <MdAddShoppingCart
              className={`${
                active ? "text-rose-800" : " text-blue-800 "
              } size-6`}
              title="add to cart"
            />
          </div>
        </div>
      </div>
      {popup ? <ProductDetail item={item} setpopup={setpopup} /> : null}
    </div>
  );
}

export default Productcard;
