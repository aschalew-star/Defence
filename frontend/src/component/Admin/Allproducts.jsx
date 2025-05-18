import React, { useEffect, useState } from "react";
import { AiOutlineEye } from "react-icons/ai";
import axios from "axios";
// import productDetail from "../Products/productDetail";
import ProductDetail from "../Products/productDetail";



const AllProducts = () => {
  const [data, setData] = useState([]);
  const [popup, setPopup] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/product/admin-all-products`, { withCredentials: true })
      .then((res) => {
        setData(res.data.products);
      });
  }, []);

  // const rows = data?.map((item) => ({
  //   id: item._id,
  //   name: item.name,
  //   price: `${item.discountPrice} Birr`,
  //   stock: item.stock,
  //   sold: item?.sold_out,
  //   full: item, // Store full product data for popup
  // })) || [];

  return (
    <div className="w-full px-4 pt-4 mt-10 bg-white">
      <h2 className="text-xl font-semibold mb-4">All Products</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-4 py-2 border">Product ID</th>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Price</th>
              <th className="px-4 py-2 border">Stock</th>
              <th className="px-4 py-2 border">Sold Out</th>
              <th className="px-4 py-2 border">Preview</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{item._id}</td>
                <td className="px-4 py-2 border">{item.name}</td>
                <td className="px-4 py-2 border">{`${item.discountPrice} Birr`}</td>
                <td className="px-4 py-2 border">{item.stock}</td>
                <td className="px-4 py-2 border">{item?.sold_out}</td>
                <td className="px-4 py-2 border">
                <button
                    className="p-2 rounded-full hover:bg-gray-200"
                    onClick={() => {
                      setSelectedProduct(item);
                      setPopup(true);
                    }}
                  >
                    <AiOutlineEye size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Popup for product preview */}
      {popup && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <ProductDetail item={selectedProduct} setpopup={setPopup} />
        </div>
      )}
    </div>
  );
};

export default AllProducts;
