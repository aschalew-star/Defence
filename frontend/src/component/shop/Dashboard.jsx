import React, { useEffect } from "react";
import { AiOutlineArrowRight, AiOutlineMoneyCollect } from "react-icons/ai";
import { Link } from "react-router-dom";
import { MdBorderClear } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfShop } from "../../redux/Action/order";
import { getAllProductsShop } from "../../redux/Action/productAction";

function Dashboard() {
  const dispatch = useDispatch();
  const { orders } = useSelector((state) => state.order);
  const { seller } = useSelector((state) => state.seller);
  const { products } = useSelector((state) => state.products);

  useEffect(() => {
    if (seller?._id) {
      dispatch(getAllOrdersOfShop(seller._id));
      dispatch(getAllProductsShop(seller._id));
    }
  }, [dispatch, seller]);

const money = (orders?.reduce((acc, item) => acc + item.totalPrice, 0) || 0).toFixed(2);




  const availableBalance = seller?.availableBalance
    ? seller.availableBalance.toFixed(2)
    : "0.00";

  return (
    <div className="w-full p-8">
      <h3 className="text-[22px] text-center font-Poppins pb-2">Overview</h3>
      <div className="w-full block 800px:flex items-center justify-between gap-5 mt-10">
        {/* Account Balance Card */}
        <div className="w-full mb-4 800px:w-[30%] min-h-[20vh] bg-white shadow rounded px-4 py-5">
          <div className="flex items-center">
            <AiOutlineMoneyCollect size={30} className="mr-2 text-gray-500" />
            <h3 className="text-[18px] leading-5 font-normal text-gray-500">
              Account Balance{" "}
              <span className="text-[16px]">(with out 3.14% service charge)</span>
            </h3>
          </div>
          <h5 className="pt-2 pl-[36px] text-[22px] font-medium">
            {money}  Birr
          </h5>
          <Link to="/dashboard-withdraw-money">
            <h5 className="pt-4 text-blue-600 hover:underline cursor-pointer">
              Withdraw Money
            </h5>
          </Link>
        </div>

        {/* All Orders Card */}
        <div className="w-full mb-4 800px:w-[30%] min-h-[20vh] bg-white shadow rounded px-4 py-5">
          <div className="flex items-center">
            <MdBorderClear size={30} className="mr-2 text-gray-500" />
            <h3 className="text-[18px] leading-5 font-normal text-gray-500">
              All User Orders
            </h3>
          </div>
          <h5 className="pt-2 pl-[36px] text-[22px] font-medium">
            {orders?.length || 0}
          </h5>
          <Link to="/AllOrders">
            <h5 className="pt-4 text-blue-600 hover:underline cursor-pointer">
              View  Orders
            </h5>
          </Link>
        </div>

        {/* All Products Card */}
        <div className="w-full mb-4 800px:w-[30%] min-h-[20vh] bg-white shadow rounded px-4 py-5">
          <div className="flex items-center">
            <AiOutlineMoneyCollect size={30} className="mr-2 text-gray-500" />
            <h3 className="text-[18px] leading-5 font-normal text-gray-500">
              All Products
            </h3>
          </div>
          <h5 className="pt-2 pl-[36px] text-[22px] font-medium">
            {products?.length || 0}
          </h5>
          <Link to="/Shopallprodcts">
            <h5 className="pt-4 text-blue-600 hover:underline cursor-pointer">
              View Products
            </h5>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
