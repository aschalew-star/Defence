import React, { useEffect, useState } from "react";
import { server } from "../../server";
import { AiOutlineEye } from "react-icons/ai";
import { FiPackage } from "react-icons/fi";
import { BsSearch } from "react-icons/bs";
import axios from "axios";
import ProductDetail from "../Products/productDetail";

const AllProducts = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [popup, setPopup] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = () => {
    setLoading(true);
    axios
      .get(`${server}/product/admin-all-products`, { withCredentials: true })
      .then((res) => {
        setData(res.data.products || []);
      })
      .catch((err) => {
        console.error("Failed to fetch admin products:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts =
    data.filter((item) => {
      const matchSearch =
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.shop?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;
      if (categoryFilter === "all") return true;
      return item.category?.toLowerCase() === categoryFilter.toLowerCase();
    }) || [];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2">
            <FiPackage size={14} /> Catalog Inspection & Moderation
          </div>
          <h1 className="text-2xl font-bold font-serif text-stone-900">
            All Marketplace Crafts & Garments
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Global catalog inventory across all registered artisans, cooperatives, and traditional boutiques.
          </p>
        </div>

        <button
          onClick={fetchProducts}
          className="self-start md:self-auto px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-all whitespace-nowrap"
        >
          Refresh Catalog
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <BsSearch className="absolute left-3.5 top-3 text-stone-400" size={14} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, SKU, seller name, or category..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="text-xs text-stone-500 font-medium">
          Total Products: <span className="font-bold text-stone-900">{data.length}</span>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-500 text-xs">Loading craft catalog...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-stone-500 text-xs">
            No products found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="px-5 py-3.5">Product Title</th>
                  <th className="px-5 py-3.5">Seller / Boutique</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Price (ETB)</th>
                  <th className="px-5 py-3.5">Stock</th>
                  <th className="px-5 py-3.5">Sold</th>
                  <th className="px-5 py-3.5 text-right">Preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredProducts.map((item) => (
                  <tr key={item._id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-5 py-3.5">
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
                            className="w-11 h-11 rounded-xl object-cover border border-stone-200"
                          />
                          {item.images?.length > 1 && (
                            <span className="absolute -bottom-1 -right-1 bg-stone-900 text-white text-[9px] font-bold px-1 rounded-sm shadow">
                              {item.images.length}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-stone-900 line-clamp-1">{item.name}</div>
                          <div className="text-[11px] font-mono text-stone-400">
                            SKU: {item.sku || item._id.slice(-6)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-stone-700">
                      <div className="font-medium">{item.shop?.name || "Merchant"}</div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-stone-600">
                      {item.category || "Traditional Apparel"}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-stone-900 text-sm">
                      {Number(item.discountPrice || item.originalPrice || 0).toLocaleString()} ETB
                    </td>
                    <td className="px-5 py-3.5">
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
                    <td className="px-5 py-3.5 text-xs text-stone-600 font-medium">
                      {item.sold_out || 0}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedProduct(item);
                          setPopup(true);
                        }}
                        className="p-2 rounded-xl text-stone-600 hover:text-emerald-700 hover:bg-stone-100 transition-colors"
                        title="Preview Product"
                      >
                        <AiOutlineEye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Popup Preview */}
      {popup && selectedProduct && (
        <ProductDetail item={selectedProduct} setpopup={setPopup} />
      )}
    </div>
  );
};

export default AllProducts;
