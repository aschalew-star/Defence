import React, { useEffect ,useState} from 'react'
import { useParams } from "react-router-dom";
import Productcard from './Products/Productcard';
import { useSelector } from 'react-redux';


function Productdynamic() {
    const { category } = useParams();
    console.log(category);

    const [data, setdata] = useState([]);

  const { allProducts } = useSelector(
    (state) => state.products
  );

  useEffect(() => {
    if (!isNaN(category) && !isNaN(parseFloat(category))) {
        const filteredProducts = allProducts?.filter((product) =>
            product.originalPrice.toString().includes(category)
          );
          setdata(filteredProducts);

    }
    else{
    if (allProducts.length > 0) {{
        
      const filteredProducts = allProducts.filter(product => 
        product.category.toLowerCase() === category.toLowerCase()
      );
      
      if (filteredProducts.length > 0) {
        setdata(filteredProducts);
      } else {
        const fallbackProducts = allProducts.filter(product => 
          product.name.toLowerCase() === category.toLowerCase()
        );
        setdata(fallbackProducts);
      }
      
      
  }}}}, [allProducts]);

   
  return (
    <div className="mt-2">
    <div className="justify-center flex items-center pb-8">
      <div className="text-[44px] text-black">{category}</div>
    </div>
    <div className="mx-5 md:mx-16 my-6">
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
  )
}

export default Productdynamic