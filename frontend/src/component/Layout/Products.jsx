import React, { useState ,useEffect} from "react";
import { useSelector, useDispatch } from "react-redux";
import { fechAllProducts } from "../../redux/Action/productAction";
import Productcard from "../Products/Productcard";

function Products() {
   const { allProducts, isLoading, error } = useSelector(
      (state) => state.products
    );
    console.log(allProducts)

   const [data,setdata]= useState([])
  
   useEffect(()=>{
    setdata(allProducts);
   },[allProducts])
 
  if (isLoading) {
    return <div className="py-16 text-center text-[50px]">Loading ...</div>;
  }


  if (error) {
    return <div className="py-16 text-center text-[50px]">{error}</div>;
  }
  return (
    <div>
      <div className="justify-center flex items-center pb-5">
        <div className="text-[44px] text-black">All Products</div>
      </div>
      <div className="mx-24 md:mx-16 my-10">
        <div className="flex flex-wrap w-full">
        {data.length === 0 ? (
          <div className="py-16 text-center text-[50px]">Product loading</div>
        ) : (
          data.map((item) => <Productcard key={item.id} item={item} />)
        )}
        </div>
      </div>
    </div>
  );
}

export default Products;
