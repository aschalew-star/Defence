import React, { useEffect, useState } from "react";
import { AiOutlineDelete, AiOutlineEye } from "react-icons/ai";
import { FiPlus, FiPackage } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getAllProductsShop, deleteProduct } from "../../redux/Action/productAction";
import ProductDetail from "../Products/productDetail";

function Shopallproduct() {
  const { products, isLoading } = useSelector((state) => state.products || {});
  const { seller } = useSelector((state) => state.seller);
  const [popup, setPopup] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => {
    if (seller?._id) {
      dispatch(getAllProductsShop(seller._id));
    }
  }, [dispatch, seller]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to remove this craft from your store?")) {
      dispatch(deleteProduct(id));
      if (seller?._id) dispatch(getAllProductsShop(seller._id));
    }
  };

  return (
    <div className="w-full min-h-screen bg-stone-50 py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2">
            <FiPackage size={13} /> Artisan Store Catalog
          </div>
          <h1 className="text-2xl font-bold font-serif text-stone-900">
            All Listed Products & Crafts
          </h1>
          <p className="text-xs text-stone-600 mt-1">
            Manage your inventory, pricing, stock levels, and preview how items look to buyers.
          </p>
        </div>

        <Link
          to="/create-product"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-sm transition-all"
        >
          <FiPlus size={16} /> Add New Craft
        </Link>
      </div>

      {/* Catalog Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-stone-500 text-sm">Loading your catalog...</div>
        ) : !products || products.length === 0 ? (
          <div className="p-12 text-center text-stone-500">
            <p className="text-base font-semibold text-stone-800">No products in your catalog yet</p>
            <p className="text-xs text-stone-500 mt-1">Start by listing your first authentic handmade creation.</p>
            <Link
              to="/create-product"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-semibold"
            >
              <FiPlus size={14} /> Add Product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-5">Craft</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">Price (ETB)</th>
                  <th className="py-3.5 px-5">Stock</th>
                  <th className="py-3.5 px-5">Sold</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {products.map((item) => (
                  <tr key={item._id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={
                              item.featuredImage?.url ||
                              item.images?.find((img) => img.isFeatured)?.url ||
                              item.images?.[0]?.url ||
                              "/photo.jpg"
                            }
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover border border-stone-200"
                          />
                          {item.images?.length > 1 && (
                            <span className="absolute -bottom-1 -right-1 bg-stone-900 text-white text-[9px] font-bold px-1 rounded-sm shadow">
                              {item.images.length}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-stone-900 line-clamp-1">{item.name}</div>
                          <div className="text-[11px] font-mono text-stone-400">SKU: {item.sku || item._id.slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-stone-600">
                      {item.category || "Traditional Apparel"}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="font-bold text-stone-900">
                        {Number(item.discountPrice || item.originalPrice || 0).toLocaleString()} ETB
                      </span>
                      {item.discountPrice && item.originalPrice && item.discountPrice < item.originalPrice && (
                        <div className="text-[11px] text-stone-400 line-through">
                          {Number(item.originalPrice).toLocaleString()} ETB
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          (item.stock || 0) > 5
                            ? "bg-emerald-50 text-emerald-800"
                            : (item.stock || 0) > 0
                            ? "bg-amber-50 text-amber-800"
                            : "bg-rose-50 text-rose-800"
                        }`}
                      >
                        {item.stock || 0} in stock
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-stone-600 font-medium">
                      {item.sold_out || 0} sold
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-1">
                      <button
                        title="Preview"
                        onClick={() => {
                          setSelectedProduct(item);
                          setPopup(true);
                        }}
                        className="p-2 rounded-lg text-stone-600 hover:text-emerald-700 hover:bg-stone-100 transition-colors"
                      >
                        <AiOutlineEye size={18} />
                      </button>
                      <button
                        title="Delete"
                        onClick={() => handleDelete(item._id)}
                        className="p-2 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <AiOutlineDelete size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {popup && selectedProduct && (
        <ProductDetail item={selectedProduct} setpopup={setPopup} />
      )}
    </div>
  );
}

export default Shopallproduct;
