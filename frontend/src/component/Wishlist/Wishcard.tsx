import React from "react";
import { LuPlus, LuMinus } from "react-icons/lu";
import { useAppSelector, useAppDispatch } from "../../hooks";
import { removeFromwish, addToWishlist } from "../../redux/Action/Wishlist";

export interface WishcardProps {
  item: any;
}

const Wishcard: React.FC<WishcardProps> = ({ item }) => {
  const dispatch = useAppDispatch();
  const { wish } = useAppSelector((state) => state.Wish);

  const increment = () => {
    const items = { ...item, qty: (item.qty || 1) + 1 };
    dispatch(addToWishlist(items) as any);
  };

  const decrement = () => {
    if (item.qty === 1) {
      dispatch(removeFromwish(item) as any);
      return;
    }
    const newItem = { ...item, qty: (item.qty || 1) - 1 };
    dispatch(addToWishlist(newItem) as any);
  };

  return (
    <div className="flex mx-20 mt-4">
      <div className="flex gap-12">
        <div>
          <img src={item.image || item.images?.[0]?.url || "/placeholder.jpg"} alt="image" className="h-32 w-32 object-cover rounded-xl" />
        </div>
        <div>
          <div className="font-medium">{item.description}</div>
          <div className="font-light">{item.name}</div>
          <div className="font-light">Shop {item.shop?.name || item.shop}</div>
          <div className="flex">
            <div className="w-16 md:w-80 mr-32">
              <div className="flex items-center gap-2 mt-2">
                <button onClick={decrement} className="p-1 border rounded hover:bg-gray-100">
                  <LuMinus />
                </button>
                <span>{item.qty || 1}</span>
                <button onClick={increment} className="p-1 border rounded hover:bg-gray-100">
                  <LuPlus />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wishcard;
