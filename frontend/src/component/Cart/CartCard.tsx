import React, { FC } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiMinus, FiTrash2 } from "react-icons/fi";
import { useCartLogic } from "../../hooks";
import { ICartItem } from "../../types";

export interface CartCardProps {
  item: ICartItem & { isEvent?: boolean };
}

const CartCard: FC<CartCardProps> = ({ item }) => {
  const { increment, decrement, removeItem, formatPrice } = useCartLogic();

  const price = item.discountPrice || item.originalPrice || 0;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition gap-4">
      {/* Product Image & Info */}
      <div className="flex items-center gap-4 flex-1">
        <Link to={item.isEvent ? `/event/${item._id}` : `/product/${item._id}`}>
          <img
            src={item.featuredImage?.url || item.images?.[0]?.url || "/placeholder.jpg"}
            alt={item.name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border border-gray-100 shrink-0 hover:opacity-90 transition"
          />
        </Link>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">
              {item.shop?.name || "Habesha Artisan"}
            </span>
            {item.isEvent && (
              <span className="bg-rose-50 text-rose-700 text-[10px] font-black px-1.5 py-0.2 rounded border border-rose-200">
                FLASH DEAL
              </span>
            )}
          </div>
          <Link to={item.isEvent ? `/event/${item._id}` : `/product/${item._id}`}>
            <h4 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-1 hover:text-amber-800 transition">
              {item.name}
            </h4>
          </Link>
          <span className="text-xs font-extrabold text-amber-900 mt-1">
            {formatPrice(price)}
          </span>
        </div>
      </div>

      {/* Quantity & Delete Controls */}
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-50">
        <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50/50 p-1">
          <button
            onClick={() => decrement(item)}
            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition"
            title="Decrease quantity"
          >
            <FiMinus className="text-xs" />
          </button>
          <span className="w-8 text-center text-xs font-bold text-gray-900">
            {item.qty || 1}
          </span>
          <button
            onClick={() => increment(item)}
            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition"
            title="Increase quantity"
          >
            <FiPlus className="text-xs" />
          </button>
        </div>

        <button
          onClick={() => removeItem(item)}
          className="text-gray-400 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition"
          title="Remove from cart"
        >
          <FiTrash2 className="text-base" />
        </button>
      </div>
    </div>
  );
};

export default CartCard;
