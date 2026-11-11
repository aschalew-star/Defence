import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiFillStar, AiOutlineStar, AiFillHeart, AiOutlineHeart, AiOutlineEye } from "react-icons/ai";
import { BsBagPlus, BsBagCheck, BsShop, BsArrowUpRight } from "react-icons/bs";
import ProductDetail from "./productDetail";
import { useSelector, useDispatch } from "react-redux";
import { addTocart, removeFromCart } from "../../redux/Action/cartAction";
import { addToWishlist, removeFromwish } from "../../redux/Action/Wishlist";
import { toast } from "react-toastify";

function Productcard({ item }) {
  const [popup, setpopup] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cart } = useSelector((state) => state.Cart);
  const { wish } = useSelector((state) => state.Wish);

  if (!item) return null;

  const isInWish = (wish || []).some((i) => i._id === item._id);
  const isInCart = (cart || []).some((i) => i._id === item._id);

  const goToDetails = (e) => {
    if (e) e.stopPropagation();
    if (item.isEvent) {
      navigate(`/event/${item._id}`);
    } else {
      navigate(`/product/${item._id}`);
    }
  };

  const wishHandler = (e) => {
    e.stopPropagation();
    if (isInWish) {
      dispatch(removeFromwish(item));
      toast.info("Removed from Wishlist");
    } else {
      dispatch(addToWishlist({ ...item, qty: 1 }));
      toast.success("Added to Wishlist!");
    }
  };

  const cartHandler = (e) => {
    e.stopPropagation();
    if (isInCart) {
      dispatch(removeFromCart(item));
      toast.info("Removed from Cart");
    } else {
      if (item.stock < 1) {
        toast.error("Product is currently out of stock!");
        return;
      }
      dispatch(addTocart({ ...item, qty: 1 }));
      toast.success("Added to Cart!");
    }
  };

  const discountPercent =
    item.originalPrice && item.discountPrice && item.originalPrice > item.discountPrice
      ? Math.round(((item.originalPrice - item.discountPrice) / item.originalPrice) * 100)
      : null;

  const ratingValue = item.ratings || 5;

  return (
    <>
      <div 
        onClick={goToDetails}
        className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
      >
        {/* Top Image Section */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-100">
          <img
            src={
              item.featuredImage?.url ||
              item.images?.find((img) => img.isFeatured)?.url ||
              item.images?.[0]?.url ||
              "/placeholder.jpg"
            }
            alt={item.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />

          {/* Multiple Photos Indicator */}
          {item.images?.length > 1 && (
            <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-2xs pointer-events-none">
              {item.images.length} photos
            </span>
          )}

          {/* Discount Badge */}
          {discountPercent ? (
            <span className="absolute top-3 left-3 bg-rose-600 text-white font-bold text-[11px] px-2.5 py-1 rounded-full shadow-md uppercase tracking-wider">
              -{discountPercent}%
            </span>
          ) : item.stock < 5 ? (
            <span className="absolute top-3 left-3 bg-amber-500 text-white font-bold text-[11px] px-2.5 py-1 rounded-full shadow-md">
              Low Stock
            </span>
          ) : null}

          {/* Floating Actions on Hover */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
            {/* Wishlist Button */}
            <button
              onClick={wishHandler}
              className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md backdrop-blur-md transition ${
                isInWish
                  ? "bg-rose-50 text-rose-600"
                  : "bg-white/90 text-gray-700 hover:text-rose-600 hover:bg-white"
              }`}
              title={isInWish ? "Remove from wishlist" : "Add to wishlist"}
            >
              {isInWish ? <AiFillHeart className="text-xl" /> : <AiOutlineHeart className="text-xl" />}
            </button>

            {/* View Full Product Page */}
            <button
              onClick={goToDetails}
              className="w-9 h-9 rounded-full bg-white/90 text-gray-700 hover:text-amber-800 hover:bg-white flex items-center justify-center shadow-md backdrop-blur-md transition opacity-0 group-hover:opacity-100"
              title="View Product Page"
            >
              <BsArrowUpRight className="text-sm font-bold" />
            </button>
          </div>
        </div>

        {/* Card Details Section */}
        <div className="p-4 flex flex-col flex-1 justify-between">
          <div>
            {/* Artisan Shop Name */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
              <BsShop className="text-amber-700 text-xs" />
              <span className="truncate font-medium">{item.shop?.name || "Habesha Artisan"}</span>
            </div>

            {/* Product Title */}
            <h3
              className="text-sm font-semibold text-gray-900 line-clamp-2 hover:text-amber-800 transition leading-snug"
              title={item.name}
            >
              {item.name}
            </h3>

            {/* Ratings & Sold Count */}
            <div className="flex items-center gap-1.5 mt-2">
              <div className="flex items-center text-amber-500 text-xs">
                {[1, 2, 3, 4, 5].map((star) =>
                  ratingValue >= star ? (
                    <AiFillStar key={star} />
                  ) : (
                    <AiOutlineStar key={star} />
                  )
                )}
              </div>
              <span className="text-[11px] text-gray-500 font-medium">
                ({item.sold_out || 0} sold)
              </span>
            </div>
          </div>

          {/* Price & Action Button */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-base font-extrabold text-amber-900 leading-none">
                {item.discountPrice || item.originalPrice} ETB
              </span>
              {item.discountPrice && item.originalPrice && item.discountPrice < item.originalPrice && (
                <span className="text-xs text-gray-400 line-through mt-0.5">
                  {item.originalPrice} ETB
                </span>
              )}
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={cartHandler}
              className={`p-2.5 rounded-xl font-medium text-xs flex items-center gap-1.5 transition ${
                isInCart
                  ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                  : "bg-gray-900 text-white hover:bg-amber-800 shadow-sm"
              }`}
              title={isInCart ? "In your cart" : "Add to cart"}
            >
              {isInCart ? <BsBagCheck className="text-base" /> : <BsBagPlus className="text-base" />}
              <span className="hidden sm:inline">{isInCart ? "Added" : "Add"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fallback Quick View Popup Modal (if triggered) */}
      {popup && <ProductDetail item={item} setpopup={setpopup} />}
    </>
  );
}

export default Productcard;
