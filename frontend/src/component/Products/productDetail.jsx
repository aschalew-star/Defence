import axios from "axios";
import React from "react";
import { RxCross2 } from "react-icons/rx";
import { TbJewishStar, TbJewishStarFilled } from "react-icons/tb";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";



function ProductDetail({ item, setpopup }) {

  const { user} = useSelector((state) => state.user);


  const navigate=useNavigate();
  const handleMessageSubmit = async () => {
    const groupTitle = item._id + user._id;
    const userId = user._id;
    const sellerId = item.shop._id;
  
    try {
      const res = await axios.post(`http://localhost:5000/conversation/create-new-conversation`, {
        groupTitle,
        userId,
        sellerId,
      });
  
      const conversationId = res.data?.conversation?._id;
  
      if (conversationId) {
        navigate(`/inbox?conversationId=${conversationId}`);
      } else {
        toast.error("Conversation ID missing.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };
  

  // ✅ Early check: if item is missing, return nothing
  if (!item) return null;

  const imageUrl = item?.images?.[0]?.url || "/placeholder.jpg";
  const originalPrice = item?.originalPrice || 0;
  const discountPrice = item?.discountPrice || 0;
  const rating = item?.rating || 0;
  const sold = item?.sold_out || 0;
  const stock = item?.stock || 0;
  const shopName = item?.shop?.name || "Unknown";
  const description = item?.description || "No description available";

  return (
    <div className="fixed inset-0 mx-auto h-[100vh] w-full z-50 bg-black bg-opacity-30 flex justify-center items-center">
      <div className="w-3/4 relative h-[70vh] rounded-lg bg-white">
        {/* Close Button */}
        <div className="absolute top-0 right-0 rounded-full bg-black size-8 -mt-4 -mr-4 flex justify-center items-center">
          <RxCross2
            className="text-white size-5 mt-1 cursor-pointer"
            onClick={() => setpopup(false)}
          />
        </div>

        {/* Product Content */}
        <div className="flex justify-between mr-10 ml-14 mt-12 gap-10">
          {/* Image Section */}
          <div>
            <img
              src={imageUrl}
              className="h-[310px] w-[250px] object-cover"
              alt="Product"
            />
          </div>

          {/* Details Section */}
          <div className="ml-5 flex-1">
            <div className="flex gap-4">
              <div className="text-[40px] font-bold">{originalPrice} Birr</div>
              <div className="text-[20px] font-normal text-red-900 mt-5 ml-2">
                {discountPrice}% off
              </div>
            </div>
            <div className="text-[20px] pt-6">{description}</div>

            <div className="flex text-red-800 mt-6 gap-1">
              <TbJewishStar className="size-4" />
              <TbJewishStar className="size-4" />
              <TbJewishStarFilled className="size-4" />
              <TbJewishStarFilled className="size-4" />
              <div className="-mt-1 pl-2">Rating: {rating}%</div>
              <div className="-mt-1 pl-2">Sold: {sold}</div>
            </div>

            <div className="pt-1">Stock: {stock}</div>
            <div className="pt-1">Shop Name: {shopName}</div>

            <div className="mt-10 text-[25px]">Preview</div>
          </div>

          {/* Side Panel */}
          <div>
            <div className="border border-slate-300 w-[230px] h-[250px] p-4">
              <div className="pt-8 text-[20px]">
                Total Price: {originalPrice}
              </div>
              <div className="mt-6">
                <div className="text-[16px]">Quantity</div>
                {/* Add quantity control here if needed */}
              </div>
            </div>
            <div
              className="mt-16 flex justify-center"
              onClick={handleMessageSubmit}
            >
              <div className="bg-blue-600 py-2 px-4 rounded-lg text-white font-medium">
                Send message
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
