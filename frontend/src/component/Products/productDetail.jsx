import React from "react";
import { RxCross2 } from "react-icons/rx";
import { TbJewishStar } from "react-icons/tb";
import { TbJewishStarFilled } from "react-icons/tb";

function productDetail({ item, setpopup }) {
  return (
    <div className="fixed inset-0 mx-auto  h-[100vh] w-full  rounded-lg z-50 bg-black bg-opacity-30 flex justify-center items-center">
      <div className=" w-3/4 relative h-[70vh] rounded-lg  bg-white  ">
        <div>
          <div className="absolute top-0 right-0 rounded-full bg-black size-8 -mt-4 -mr-4 flex justify-center item-center ">
            <RxCross2
              className="text-white size-5 mt-2"
              onClick={() => setpopup(false)}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between mr-10 ml-14 mt-12 gap-10 ">
            <div className="">
              <img
                src={`${item.images[0]?.url}`}
                className="h-[310px] w-[250px]"
                alt=""
              />
            </div>
            <div className="ml-5">
              <div className="flex gap-4  ">
                <div className="text-[40px] font-bold">{item.originalPrice} Birr</div>
                <div className="text-[20px] font-normal text-red-900 mt-5 ml-2">
                  {item.discountPrice}% off
                </div>
              </div>
              <div>
                <div className="text-[20px] pt-6">{item.description}</div>
              </div>
              <div className="flex text-red-800  mt-6 gap-1">
                <TbJewishStar className="size-4 text-red-800" />
                <TbJewishStar className="size-4  text-red-800" />
                <TbJewishStarFilled className="size-4  text-red-800" />
                <TbJewishStarFilled className="size-4  text-red-800" />
                <div className="-mt-1 pl-2">rating {item.rating}%</div>
                <div className="-mt-1 pl-2">sold {item.sold_out}</div>
              </div>
              <div className="pt-1">stock: {item.stock}</div>

              <div className="pt-1">Shop Name: {item.shop.name}</div>
              <div className="mt-10 text-[25px]">Preveiw</div>
            </div>
            <div>
              <div className="border border-slate-300 w-[230px] h-[350px]">
                <div className="ml-4">
                  <div className="pt-8 text-[20px]">Total Price:  {item.originalPrice}</div>
                </div>
                <div className="ml-4">
                  <div>Quantity</div>
                  <div>
                    <div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default productDetail;
