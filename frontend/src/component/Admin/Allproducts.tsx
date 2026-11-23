import React, { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { server } from "../../server";
import { AiOutlineEye, AiOutlineDelete } from "react-icons/ai";
import { FiPackage, FiExternalLink, FiDownload } from "react-icons/fi";
import { BsSearch, BsShop, BsCashCoin, BsExclamationTriangle, BsBoxSeam } from "react-icons/bs";
import axios from "axios";
import { toast } from "react-toastify";
import ProductDetail from "../Products/productDetail";

const ETHIOPIAN_CATEGORIES = [
  "Ethiopian Traditional Dresses (Habesha Kemis)",
  "Men's Traditional Attire (Yebahl Libs)",
  "Traditional Shawls & Blankets (Netela & Gabi)",
  "Handcrafted Footwear & Leather",
  "Traditional Jewelry & Accessories",
  "Handwoven Textiles & Home Decor",
  "Cultural Crafts & Mesob",
];

const AllProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const sellerParam = searchParams.get("seller") || "all";

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sellerFilter, setSellerFilter] = useState(sellerParam);
  const [stockFilter, setStockFilter] = useState("all"); // "all", "in_stock", "low_stock", "out_of_stock"
  const [popup, setPopup] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

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

  useEffect(() => {
    if (sellerParam) {
      setSellerFilter(sellerParam);
    }
  }, [sellerParam]);

  // Unique sellers list from products
  const uniqueSellers = useMemo(() => {
    const map = new Map();
    data.forEach((p) => {
      if (p.shop?._id && !map.has(p.shop._id)) {
        map.set(p.shop._id, p.shop.name || "Artisan Shop");
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [data]);

  // Catalog Metrics
  const metrics = useMemo(() => {
    const total = data.length;
    const lowStock = data.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) <= 5).length;
    const outOfStock = data.filter((p) => !p.stock || p.stock <= 0).length;
    const totalSold = data.reduce((acc, p) => acc + (p.sold_out || 0), 0);
    const totalCatalogValue = data.reduce(
      (acc, p) => acc + (Number(p.discountPrice || p.originalPrice || 0) * (p.stock || 0)),
      0
    );
    return { total, lowStock, outOfStock, totalSold, totalCatalogValue };
  }, [data]);

  // Moderation: Delete Craft
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from the marketplace?`)) {
      return;
    }

    try {
      const res = await axios.delete(`${server}/product/delete-shop-product/${id}`, {
        withCredentials: true,
      });
      toast.success(res.data?.message || "Craft removed from marketplace catalog");
      setData((prev) => prev.filter((p) => p._id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to remove product");
    }
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return data.filter((item) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        item.name?.toLowerCase().includes(q) ||
        item.sku?.toLowerCase().includes(q) ||
        item.shop?.name?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q);

      if (!matchSearch) return false;

      // Category filter
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;

      // Seller filter
      if (sellerFilter !== "all" && item.shop?._id !== sellerFilter) return false;

      // Stock filter
      const stock = item.stock || 0;
      if (stockFilter === "in_stock" && stock <= 5) return false;
      if (stockFilter === "low_stock" && (stock <= 0 || stock > 5)) return false;
      if (stockFilter === "out_of_stock" && stock > 0) return false;

      return true;
    });
  }, [data, searchTerm, categoryFilter, sellerFilter, stockFilter]);

  // Export CSV
  const handleExportCSV = () => {
    if (!filteredProducts.length) return;
    const headers = ["ID", "Title", "Artisan Boutique", "Category", "Price ETB", "Stock", "Units Sold", "SKU"];
    const rows = filteredProducts.map((p) => [
      `"${p._id}"`,
      `"${p.name || ""}"`,
      `"${p.shop?.name || ""}"`,
      `"${p.category || ""}"`,
      p.discountPrice || p.originalPrice || 0,
      p.stock || 0,
      p.sold_out || 0,
      `"${p.sku || ""}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Marketplace_Catalog_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Catalog exported to CSV!");
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2">
            <FiPackage size={14} /> Global Catalog Governance & Moderation
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            Marketplace Craft & Apparel Catalog
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
            Audit authentic handloom products, inspect artisan craft specifications, monitor inventory health across all Ethiopian workshops, and enforce cultural quality standards.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition shadow-2xs"
          >
            <FiDownload size={13} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={fetchProducts}
            className="px-4 py-2.5 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition shadow-sm"
          >
            Refresh Catalog
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Crafts</span>
            <div className="p-2 rounded-2xl bg-stone-100 text-stone-700">
              <BsBoxSeam size={16} />
            </div>
          </div>
          <div className="text-2xl font-black font-serif text-stone-900">{metrics.total}</div>
          <span className="text-[11px] text-stone-500">Across {uniqueSellers.length} boutiques</span>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Artisans</span>
            <div className="p-2 rounded-2xl bg-blue-50 text-blue-700">
              <BsShop size={16} />
            </div>
          </div>
          <div className="text-2xl font-black font-serif text-stone-900">{uniqueSellers.length}</div>
          <span className="text-[11px] text-blue-700 font-medium">Verified studios</span>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Units Sold</span>
            <div className="p-2 rounded-2xl bg-emerald-50 text-emerald-700">
              <BsCashCoin size={16} />
            </div>
          </div>
          <div className="text-2xl font-black font-serif text-emerald-900">{metrics.totalSold}</div>
          <span className="text-[11px] text-emerald-700 font-medium">Customer purchases</span>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Stock Alerts</span>
            <div className="p-2 rounded-2xl bg-amber-50 text-amber-700">
              <BsExclamationTriangle size={16} />
            </div>
          </div>
          <div className="text-2xl font-black font-serif text-amber-900">
            {metrics.lowStock + metrics.outOfStock}
          </div>
          <span className="text-[11px] text-amber-800 font-medium">
            {metrics.lowStock} low • {metrics.outOfStock} sold out
          </span>
        </div>
      </div>

      {/* Multi-Dimensional Filter Bar */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200 space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="relative w-full lg:max-w-md">
            <BsSearch className="absolute left-4 top-3.5 text-stone-400" size={14} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, SKU, artisan boutique, or fabric..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-700"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl border border-stone-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-700 text-stone-700"
            >
              <option value="all">All Categories</option>
              {ETHIOPIAN_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Seller / Boutique Filter */}
            <select
              value={sellerFilter}
              onChange={(e) => {
                setSellerFilter(e.target.value);
                if (e.target.value === "all") {
                  searchParams.delete("seller");
                  setSearchParams(searchParams);
                } else {
                  setSearchParams({ seller: e.target.value });
                }
              }}
              className="px-3.5 py-2.5 rounded-2xl border border-stone-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-700 text-stone-700 max-w-[180px]"
            >
              <option value="all">All Artisans ({uniqueSellers.length})</option>
              {uniqueSellers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Stock Status Filter */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl border border-stone-300 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-700 text-stone-700"
            >
              <option value="all">All Stock Statuses</option>
              <option value="in_stock">In Stock (&gt; 5)</option>
              <option value="low_stock">Low Stock (1 - 5)</option>
              <option value="out_of_stock">Sold Out (0)</option>
            </select>

            {(categoryFilter !== "all" || sellerFilter !== "all" || stockFilter !== "all" || searchTerm) && (
              <button
                onClick={() => {
                  setCategoryFilter("all");
                  setSellerFilter("all");
                  setStockFilter("all");
                  setSearchTerm("");
                  setSearchParams({});
                }}
                className="px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-800"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {sellerFilter !== "all" && (
          <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <BsShop className="text-amber-800" />
            <span>
              Filtering crafts by:{" "}
              <strong>{uniqueSellers.find((s) => s.id === sellerFilter)?.name || sellerFilter}</strong>
            </span>
            <button
              onClick={() => {
                setSellerFilter("all");
                setSearchParams({});
              }}
              className="ml-auto text-xs underline font-bold"
            >
              Show all artisans
            </button>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-stone-500 text-xs space-y-2">
            <div className="w-8 h-8 border-4 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Loading craft catalog...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center text-stone-500 text-xs space-y-1">
            <FiPackage className="mx-auto text-3xl text-stone-300" />
            <p className="text-sm font-semibold text-stone-700">No products found matching filters</p>
            <p className="text-stone-400">Try adjusting your category, artisan, or search parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider border-b border-stone-200 font-bold">
                <tr>
                  <th className="px-5 py-4">Craft Title & SKU</th>
                  <th className="px-5 py-4">Artisan Boutique</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Price (ETB)</th>
                  <th className="px-5 py-4">Stock Health</th>
                  <th className="px-5 py-4">Sold</th>
                  <th className="px-5 py-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-xs">
                {filteredProducts.map((item) => {
                  const stock = item.stock || 0;
                  const price = Number(item.discountPrice || item.originalPrice || 0);
                  const origPrice = Number(item.originalPrice || 0);

                  return (
                    <tr key={item._id} className="hover:bg-stone-50/80 transition-colors">
                      {/* Product Title */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              item.featuredImage?.url ||
                              item.images?.[0]?.url ||
                              "/photo.jpg"
                            }
                            alt={item.name}
                            className="w-12 h-12 rounded-2xl object-cover border border-stone-200 shrink-0 bg-stone-100"
                          />
                          <div>
                            <div className="font-bold text-stone-900 line-clamp-1 font-serif text-sm">
                              {item.name}
                            </div>
                            <div className="text-[11px] font-mono text-stone-400 mt-0.5">
                              SKU: {item.sku || item._id.slice(-6).toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Artisan Boutique */}
                      <td className="px-5 py-4">
                        <Link
                          to={`/Allseller?search=${encodeURIComponent(item.shop?.name || "")}`}
                          className="font-bold text-stone-900 hover:text-amber-800 transition block"
                        >
                          {item.shop?.name || "Independent Artisan"}
                        </Link>
                        <span className="text-[11px] text-stone-500 font-mono">
                          ID: {item.shop?._id?.slice(-6) || "N/A"}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4 text-stone-600">
                        <span className="line-clamp-1">{item.category || "Traditional Apparel"}</span>
                      </td>

                      {/* Price */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-stone-900 font-serif text-sm">
                          {price.toLocaleString()} ETB
                        </div>
                        {origPrice > price && (
                          <div className="text-[10px] text-stone-400 line-through">
                            {origPrice.toLocaleString()} ETB
                          </div>
                        )}
                      </td>

                      {/* Stock Health */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            stock > 5
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : stock > 0
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-rose-50 text-rose-800 border border-rose-200"
                          }`}
                        >
                          {stock > 5 ? `${stock} in stock` : stock > 0 ? `Low: ${stock} left` : "Sold Out"}
                        </span>
                      </td>

                      {/* Units Sold */}
                      <td className="px-5 py-4 font-semibold text-stone-700">
                        {item.sold_out || 0}
                      </td>

                      {/* Moderation Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedProduct(item);
                              setPopup(true);
                            }}
                            className="p-2 rounded-xl text-stone-600 hover:text-amber-800 hover:bg-stone-100 transition"
                            title="Inspect Craft Details"
                          >
                            <AiOutlineEye size={17} />
                          </button>

                          <Link
                            to={`/product/${item._id}`}
                            target="_blank"
                            className="p-2 rounded-xl text-stone-600 hover:text-emerald-700 hover:bg-stone-100 transition inline-block"
                            title="View Public Marketplace Page"
                          >
                            <FiExternalLink size={15} />
                          </Link>

                          <button
                            onClick={() => handleDeleteProduct(item._id, item.name)}
                            className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition"
                            title="Moderate / Delete from Marketplace"
                          >
                            <AiOutlineDelete size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
