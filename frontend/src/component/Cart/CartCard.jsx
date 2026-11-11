import React from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiMinus, FiTrash2 } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { removeFromCart, addTocart } from "../../redux/Action/cartAction";
import { toast } from "react-toastify";

function CartCard({ item }) {
  const dispatch = useDispatch();

  const price = item.discountPrice || item.originalPrice || 0;

  const increment = () => {
    if (item.stock && item.qty >= item.stock) {
      toast.error("Maximum available stock reached!");
      return;
    }
    dispatch(addTocart({ ...item, qty: item.qty + 1 }));
  };

  const decrement = () => {
    if (item.qty === 1) {
      dispatch(removeFromCart(item));
      toast.info("Item removed from cart");
      return;
    }
    dispatch(addTocart({ ...item, qty: item.qty - 1 }));
  };

  const handleRemove = () => {
    dispatch(removeFromCart(item));
    toast.info("Item removed from cart");
  };

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
          <span className="text-xs text-gray-500 mt-0.5">
            Unit Price: <strong className="text-gray-800">{price} ETB</strong>
          </span>
          {item.selectedSize && (
            <span className="text-[11px] text-amber-800 font-semibold mt-0.5">
              Size: {item.selectedSize} {item.selectedColor ? `• ${item.selectedColor}` : ""}
            </span>
          )}
          {item.customMeasurements?.bust && (
            <span className="text-[10px] bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200 mt-1 self-start">
              Custom Tailored Measurements Attached
            </span>
          )}
          <span className="text-xs font-semibold text-amber-900 mt-1 sm:hidden">
            Total: {price * (item.qty || 1)} ETB
          </span>
        </div>
      </div>

      {/* Quantity & Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
        {/* Quantity Controls */}
        <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
          <button
            onClick={decrement}
            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition"
          >
            <FiMinus className="text-xs" />
          </button>
          <span className="w-8 text-center text-xs font-bold text-gray-800">
            {item.qty}
          </span>
          <button
            onClick={increment}
            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition"
          >
            <FiPlus className="text-xs" />
          </button>
        </div>

        {/* Item Total Price */}
        <div className="hidden sm:block text-right min-w-[100px]">
          <span className="text-base font-black text-amber-950">
            {price * (item.qty || 1)} ETB
          </span>
        </div>

        {/* Delete Button */}
        <button
          onClick={handleRemove}
          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
          title="Remove from Cart"
        >
          <FiTrash2 className="text-lg" />
        </button>
      </div>
    </div>
  );
}

export default CartCard;
