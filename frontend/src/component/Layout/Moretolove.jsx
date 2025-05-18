import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import fechAllProducts from "../../redux/Action/productAction";
import Productcard from "../Products/Productcard";

function Moretolove() {
  const [data, setdata] = useState([]);

  const { allProducts, isLoading, error } = useSelector(
    (state) => state.products
  );

  useEffect(() => {
    if (allProducts.length > 0) {
      const pro = [...allProducts].sort((a, b) => b.totalSell - a.totalSell);
      setdata(pro);
    }
  }, [allProducts]);

  if (isLoading) {
    return <div className="py-16 text-center text-[50px]">Loading ...</div>;
  }


  if (error) {
    return <div className="py-16 text-center text-[50px]">{error}</div>;
  }

  return (
    <div className="-mt-8">
      <div className="justify-center flex items-center pb-8">
        <div className="text-[44px] text-black">More To Love</div>
      </div>
      <div className="mx-5 md:mx-16 my-10">
        <div className="flex flex-wrap mx-auto w-full">
        {data.length === 0 ? (
          <div className="py-16 text-center text-[50px]">No Product </div>
        ) : (
          data.map((item) => <Productcard key={item._id} item={item} />
        
        )
        )}
        </div>
      </div>
    </div>
  );
}

export default Moretolove;
