import { server } from "../../server";
import axios from "axios";
import React, { useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { AiFillStar, AiOutlineStar, AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { BsBagPlus, BsChatDots, BsShop, BsCheck2 } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { addTocart } from "../../redux/Action/cartAction";
import { addToWishlist, removeFromwish } from "../../redux/Action/Wishlist";

function ProductDetail({ item, setpopup }) {
  const { user } = useSelector((state) => state.user);
  const { wish } = useSelector((state) => state.Wish);
  const [count, setCount] = useState(1);
  const [selectedImg, setSelectedImg] = useState(0);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  if (!item) return null;

  const isInWish = (wish || []).some((i) => i._id === item._id);

  const handleMessageSubmit = async () => {
    if (!user) {
      toast.error("Please login first to chat with the shop!");
      navigate("/login");
      return;
    }
    const sellerId = item?.shop?._id || item?.shopId;
    if (!sellerId) {
      toast.error("Artisan shop information is not available.");
      return;
    }
    const groupTitle = item._id + user._id;
    const userId = user._id;

    try {
      const res = await axios.post(`${server}/conversation/create-new-conversation`, {
        groupTitle,
        userId,
        sellerId,
      });

      const conversationId = res.data?.conversation?._id;
      if (conversationId) {
        navigate(`/inbox?conversationId=${conversationId}`);
      } else {
        toast.error("Could not start conversation.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to start conversation");
    }
  };

  const handleAddToCart = () => {
    if (item.stock < count) {
      toast.error("Requested quantity exceeds available stock!");
      return;
    }
    dispatch(addTocart({ ...item, qty: count }));
    toast.success("Added to shopping bag!");
  };

  const handleToggleWish = () => {
    if (isInWish) {
      dispatch(removeFromwish(item));
      toast.info("Removed from Wishlist");
    } else {
      dispatch(addToWishlist({ ...item, qty: 1 }));
      toast.success("Added to Wishlist!");
    }
  };

  const images = item.images && item.images.length > 0 ? item.images : [{ url: "/placeholder.jpg" }];
  const currentPrice = item.discountPrice || item.originalPrice;
  const hasDiscount = item.originalPrice && item.discountPrice && item.originalPrice > item.discountPrice;
  const ratingValue = item.ratings || 5;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-gray-100 my-8">
        {/* Close Button */}
        <button
          onClick={() => setpopup(false)}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition"
          title="Close"
        >
          <RxCross2 className="text-xl" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Image Gallery */}
          <div className="p-6 sm:p-8 bg-gray-50 flex flex-col justify-between">
            <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100">
              <img
                src={images[selectedImg]?.url || "/placeholder.jpg"}
                alt={item.name}
                className="w-full h-full object-cover object-center"
              />
              {hasDiscount && (
                <span className="absolute top-3 left-3 bg-rose-600 text-white font-bold text-xs px-3 py-1 rounded-full shadow">
                  SALE
                </span>
              )}
            </div>

            {/* Thumbnails if multiple images exist */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1 no-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImg(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition ${
                      selectedImg === idx ? "border-amber-700 scale-105" : "border-transparent opacity-70"
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info & Actions */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Category & Shop Header */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span className="uppercase font-bold tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md">
                  {item.category || "Traditional Craft"}
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <BsShop className="text-amber-700" />
                  {item.shop?.name || "Habesha Artisan"}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-serif leading-tight">
                {item.name}
              </h2>

              {/* Ratings & Sold */}
              <div className="flex items-center gap-2 mt-3">
                <div className="flex text-amber-500 text-sm">
                  {[1, 2, 3, 4, 5].map((star) =>
                    ratingValue >= star ? <AiFillStar key={star} /> : <AiOutlineStar key={star} />
                  )}
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  ({item.sold_out || 0} orders completed)
                </span>
                <span className="text-gray-300">•</span>
                <span className={`text-xs font-bold ${item.stock > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {item.stock > 0 ? `In Stock (${item.stock} available)` : "Out of Stock"}
                </span>
              </div>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-3xl font-black text-amber-900">
                  {currentPrice} ETB
                </span>
                {hasDiscount && (
                  <span className="text-base text-gray-400 line-through">
                    {item.originalPrice} ETB
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  About this garment
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed max-h-36 overflow-y-auto">
                  {item.description}
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
              {/* Quantity Selector */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-gray-500">Quantity</span>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                  <button
                    onClick={() => setCount((prev) => Math.max(1, prev - 1))}
                    className="w-10 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-200 font-bold"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-gray-900">
                    {count}
                  </span>
                  <button
                    onClick={() => setCount((prev) => (item.stock && prev < item.stock ? prev + 1 : prev))}
                    className="w-10 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-200 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={item.stock < 1}
                  className="flex-1 py-3.5 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 disabled:bg-gray-300 text-white font-bold rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition"
                >
                  <BsBagPlus className="text-lg" />
                  <span>Add {count > 1 ? `(${count})` : ""} to Bag</span>
                </button>

                <button
                  onClick={handleToggleWish}
                  className={`p-3.5 rounded-xl border transition ${
                    isInWish
                      ? "bg-rose-50 border-rose-300 text-rose-600"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-rose-600"
                  }`}
                  title={isInWish ? "Remove from wishlist" : "Save to wishlist"}
                >
                  {isInWish ? <AiFillHeart className="text-xl" /> : <AiOutlineHeart className="text-xl" />}
                </button>
              </div>

              {/* Chat with Seller & Full Page Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleMessageSubmit}
                  className="flex-1 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <BsChatDots className="text-sm" />
                  <span>Message Artisan</span>
                </button>

                <button
                  onClick={() => {
                    setpopup(false);
                    navigate(`/product/${item._id}`);
                  }}
                  className="flex-1 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <span>View Full Product Page →</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
