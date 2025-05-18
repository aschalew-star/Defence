import React, { useEffect ,useState} from "react";
import { AiOutlineDelete, AiOutlineEye } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getAllProductsShop, deleteProduct } from "../../redux/Action/productAction";
import ProductDetail from "../Products/productDetail";

function Shopallproduct() {


  const { products, isLoading } = useSelector((state) => state.products);
  const { seller } = useSelector((state) => state.seller);
  const [popup, setPopup] = useState(false);
const [selectedProduct, setSelectedProduct] = useState(null);


  const dispatch = useDispatch();

  // useEffect(() => {
  //   dispatch(getAllProductsShop(seller._id));
  // }, [dispatch]);

  useEffect(() => {
    if (seller && seller._id) {
      dispatch(getAllProductsShop(seller._id));
    }
  }, [dispatch, seller]);
  

  const handleDelete = (id) => {
    dispatch(deleteProduct(id));
    dispatch(getAllProductsShop(seller._id));

    window.location.reload();
  };
  
  console.log(seller);
  

  return (
    <>
      {isLoading ? (
        <div>Loading</div>
      ) : (
        <div className="w-full mx-8 pt-1 mt-10 overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-700 border border-gray-200 rounded-lg">
            <thead className="bg-gray-100 text-xs uppercase text-gray-600">
              <tr>
                <th className="py-3 px-4">Product ID</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Sold Out</th>
                <th className="py-3 px-4">Preview</th>
                <th className="py-3 px-4">Delete</th>
              </tr>
            </thead>
            <tbody>
              {products &&
                products.map((item) => (
                  <tr
                    key={item._id}
                    className="bg-white border-t hover:bg-gray-50 transition"
                  >
                    <td className="py-2 px-4">{item._id}</td>
                    <td className="py-2 px-4">{item.name}</td>
                    <td className="py-2 px-4">US$ {item.discountPrice}</td>
                    <td className="py-2 px-4">{item.stock}</td>
                    <td className="py-2 px-4">{item.sold_out}</td>
                    <td className="py-2 px-4">
                      <Link
                        to={``}

                        className="text-blue-500 hover:text-blue-700"
                      >
                        <button className="p-2 rounded-full hover:bg-gray-200"  onClick={() => {
    setSelectedProduct(item); // set the clicked product
    setPopup(true); // open popup
  }}>
                          <AiOutlineEye size={20} />
                        </button>
                      </Link>
                    </td>
                    <td className="py-2 px-4">
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-2 text-red-500 rounded-full hover:bg-red-100"
                      >
                        <AiOutlineDelete size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {popup && selectedProduct && (
  <ProductDetail item={selectedProduct} setpopup={setPopup} />
)}

        </div>
      )}
    </>
  )
}

export default Shopallproduct