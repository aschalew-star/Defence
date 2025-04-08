import React from "react";

const CheckoutSteps = ({ active }) => {
  console.log(active);
  return (
    <div className="w-full flex items-center justify-center">
      <div className="w-[90%] 800px:w-[50%] flex items-center justify-center flex-wrap">
        <div className="flex items-center">
          <div className="px-[20px] h-[38px] rounded-[20px] bg-[#f63b60] flex items-center justify-center cursor-pointer">
            <span className="text-[#fff] text-[16px] font-[600]">
              1.Shipping
            </span>
          </div>
          <div
            className={`${
              active > 1
                ? "w-[30px] 800px:w-[70px] h-[4px] !bg-[#f63b60]"
                : "w-[30px] 800px:w-[70px] h-[4px] !bg-[#FDE1E6]"
            }`}
          />
        </div>

        <div className="flex items-center">
          <div
            className={`${
              active > 1
                ? `px-[20px] h-[38px] rounded-[20px] bg-[#f63b60] flex items-center justify-center cursor-pointer`
                : ` !bg-[#FDE1E6]`
            }`}
          >
            <span
              className={`${
                active > 1
                  ? `text-[#fff] text-[16px] font-[600]`
                  : ` !text-[#f63b60]`
              }`}
            >
              2.Payment
            </span>
          </div>
        </div>

        <div className="flex items-center">
          <div
            className={`${
              active > 3
                ? "w-[30px] 800px:w-[70px] h-[4px] !bg-[#f63b60]"
                : "w-[30px] 800px:w-[70px] h-[4px] !bg-[#FDE1E6]"
            }`}
          />
          <div
            className={`${
              active > 2
                ? `px-[20px] h-[38px] rounded-[20px] bg-[#f63b60] flex items-center justify-center cursor-pointer`
                : ` !bg-[#FDE1E6]`
            }`}
          >
            <span
              className={`${
                active > 2
                  ? `text-[#fff] text-[16px] font-[600]`
                  : ` !text-[#f63b60]`
              }`}
            >
              3.Success
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSteps;
