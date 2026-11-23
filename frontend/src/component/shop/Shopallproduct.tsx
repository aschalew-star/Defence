import React, { useMemo } from "react";
import { AiOutlineDelete, AiOutlineEye, AiOutlineSearch } from "react-icons/ai";
import {
  FiPlus,
  FiPackage,
  FiGrid,
  FiList,
  FiExternalLink,
  FiTrendingUp,
  FiAlertTriangle,
  FiCheckCircle,
  FiEdit,
  FiDownload,
} from "react-icons/fi";
import { BsBoxSeam, BsCashCoin } from "react-icons/bs";
import { Link } from "react-router-dom";
import { getAllProductsShop } from "../../redux/Action/productAction";
import MerchantProductDetailModal from "./MerchantProductDetailModal";
import MerchantProductEditModal from "./MerchantProductEditModal";
import { toast } from "react-toastify";

import { useAppDispatch } from "../../hooks";
import { useMerchantProducts } from "../../hooks";

const Shopallproduct: React.FC = () => {
  const {
    products,
    isLoading,
    seller,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    selectedIds,
    toggleSelectAll,
    toggleSelectOne,
    clearSelection,
    bulkLoading,
    handleBulkRestock,
    handleBulkDiscount,
    handleExportCSV,
    handleDelete,
    filteredProducts,
    metrics,
    popup,
    setPopup,
    selectedProduct,
    setSelectedProduct,
    editModalOpen,
    setEditModalOpen,
    productToEdit,
    setProductToEdit,
  } = useMerchantProducts();
  const dispatch = useAppDispatch();

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter(Boolean))),
    [products]
  );

  const handleToggleSelect = toggleSelectOne;
  const handleSelectAll = toggleSelectAll;
  const handleProductUpdated = (updatedItem) => {
    setSelectedProduct(updatedItem);
    if (seller?._id) dispatch(getAllProductsShop(seller._id) as any);
  };

  return (
    <div className="w-full min-h-screen bg-stone-50 py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold mb-2">
            <FiPackage size={13} className="text-emerald-700" />
            <span>Artisan Store Inventory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            Craft Catalog & Inventory
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
            Manage your authentic handmade creations, monitor live inventory health, track units sold,
            and inspect detailed product specifications.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold text-xs transition"
            title="Download CSV spreadsheet of inventory"
          >
            <FiDownload size={14} className="text-stone-500" />
            <span>Export CSV</span>
          </button>

          <Link
            to="/shop-all-events"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold text-xs transition"
          >
            <span>View Flash Events</span>
          </Link>

          <Link
            to="/create-product"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-sm transition-all"
          >
            <FiPlus size={16} /> Add New Craft
          </Link>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
          <div className="text-[11px] font-bold text-stone-500 uppercase flex items-center gap-1.5">
            <BsBoxSeam className="text-stone-700" /> Total Crafts
          </div>
          <div className="text-2xl font-bold font-serif text-stone-900 mt-1">
            {metrics.total}
          </div>
          <div className="text-[10px] text-stone-500">Active catalog items</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
          <div className="text-[11px] font-bold text-emerald-700 uppercase flex items-center gap-1.5">
            <FiCheckCircle className="text-emerald-600" /> In Good Stock
          </div>
          <div className="text-2xl font-bold font-serif text-emerald-700 mt-1">
            {metrics.inStock}
          </div>
          <div className="text-[10px] text-stone-500">&gt; 5 units available</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
          <div className="text-[11px] font-bold text-amber-700 uppercase flex items-center gap-1.5">
            <FiAlertTriangle className="text-amber-600" /> Low Stock
          </div>
          <div className="text-2xl font-bold font-serif text-amber-700 mt-1">
            {metrics.lowStock}
          </div>
          <div className="text-[10px] text-stone-500">1 - 5 units left</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
          <div className="text-[11px] font-bold text-rose-700 uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Out of Stock
          </div>
          <div className="text-2xl font-bold font-serif text-rose-700 mt-1">
            {metrics.outOfStock}
          </div>
          <div className="text-[10px] text-stone-500">Requires restocking</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
          <div className="text-[11px] font-bold text-stone-500 uppercase flex items-center gap-1.5">
            <FiTrendingUp className="text-blue-600" /> Units in Stock
          </div>
          <div className="text-2xl font-bold font-serif text-stone-900 mt-1">
            {metrics.inStock}
          </div>
          <div className="text-[10px] text-stone-500">Available in inventory</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm">
          <div className="text-[11px] font-bold text-stone-500 uppercase flex items-center gap-1.5">
            <BsCashCoin className="text-emerald-700" /> Inventory Value
          </div>
          <div className="text-xl font-bold font-serif text-stone-900 mt-1 truncate">
            {Number(metrics.inventoryValue).toLocaleString()}{" "}
            <span className="text-[10px] font-normal text-stone-500">ETB</span>
          </div>
          <div className="text-[10px] text-stone-500">Asset valuation</div>
        </div>
      </div>

      {/* Low Stock Warning Alert */}
      {metrics.lowStock > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <FiAlertTriangle className="text-amber-600 shrink-0" size={18} />
            <div>
              <span className="font-bold">Inventory Notice: </span>
              <span>
                You have <strong>{metrics.lowStock} craft(s)</strong> with low remaining inventory (3 or fewer pieces).
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setStatusFilter("lowStock");
            }}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition shrink-0"
          >
            Filter Low-Stock Items
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <AiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-base" />
          <input
            type="text"
            placeholder="Search by craft title, SKU (e.g. MEP-...), or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
          />
        </div>

        {/* Stock Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "all", label: "All Items" },
            { id: "inStock", label: "In Stock" },
            { id: "lowStock", label: "Low Stock" },
            { id: "outOfStock", label: "Out of Stock" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                statusFilter === pill.id
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Categories & Sorting */}
        <div className="flex items-center gap-2">
          {categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-2 px-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 text-xs font-semibold focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((c, i) => (
                <option key={i} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="py-2 px-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 text-xs font-semibold focus:outline-none"
          >
            <option value="newest">Newest Listed</option>
            <option value="priceLow">Price: Low to High</option>
            <option value="priceHigh">Price: High to Low</option>
            <option value="mostSold">Best Selling</option>
            <option value="stockLow">Lowest Stock First</option>
          </select>

          {/* Toggle Layout */}
          <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg transition ${
                viewMode === "table" ? "bg-white text-stone-900 shadow-sm" : "text-stone-400"
              }`}
              title="Table View"
            >
              <FiList size={15} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition ${
                viewMode === "grid" ? "bg-white text-stone-900 shadow-sm" : "text-stone-400"
              }`}
              title="Visual Grid View"
            >
              <FiGrid size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Catalog Display */}
      {isLoading ? (
        <div className="p-16 text-center text-stone-500 bg-white rounded-3xl border border-stone-200 shadow-sm">
          <div className="inline-block w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm font-semibold text-stone-800">Loading your catalog...</p>
        </div>
      ) : !filteredProducts || filteredProducts.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-stone-200 shadow-sm space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-500 flex items-center justify-center mx-auto text-2xl">
            <FiPackage />
          </div>
          <h3 className="text-lg font-bold font-serif text-stone-900">
            No Crafts Found
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            {products?.length === 0
              ? "Start by listing your first authentic handmade creation to reach collectors worldwide."
              : "No crafts match your active search or filters."}
          </p>
          <div className="pt-2">
            <Link
              to="/create-product"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow-sm hover:bg-emerald-800 transition"
            >
              <FiPlus size={15} /> Add Product
            </Link>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID CARD VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((item) => {
            const image =
              item.featuredImage?.url ||
              item.images?.find((img) => img.isFeatured)?.url ||
              item.images?.[0]?.url ||
              "/photo.jpg";

            const price = Number(item.discountPrice || item.originalPrice || 0);

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-[4/3] w-full bg-stone-100 overflow-hidden cursor-pointer"
                    onClick={() => {
                      setSelectedProduct(item);
                      setPopup(true);
                    }}
                  >
                    <img
                      src={image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow ${
                          item.stock > 5
                            ? "bg-emerald-700 text-white"
                            : item.stock > 0
                            ? "bg-amber-600 text-white"
                            : "bg-rose-600 text-white"
                        }`}
                      >
                        {item.stock > 5 ? `${item.stock} in stock` : item.stock > 0 ? `Low: ${item.stock} left` : "Out of stock"}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 right-2.5 bg-stone-900/80 backdrop-blur-sm text-stone-200 text-[10px] font-mono px-2 py-0.5 rounded-md">
                      {item.sku || item._id.slice(-6).toUpperCase()}
                    </div>
                  </div>

                  <div className="p-4 space-y-2.5">
                    <div className="text-[11px] font-semibold text-stone-500 truncate">
                      {item.category || "Traditional Apparel"}
                    </div>

                    <h3
                      onClick={() => {
                        setSelectedProduct(item);
                        setPopup(true);
                      }}
                      className="font-bold text-stone-900 text-sm line-clamp-1 hover:text-emerald-700 cursor-pointer transition-colors"
                    >
                      {item.name}
                    </h3>

                    <div className="flex items-baseline justify-between">
                      <span className="text-base font-bold font-serif text-stone-900">
                        {price.toLocaleString()} ETB
                      </span>
                      <span className="text-xs text-stone-500 font-medium">
                        {item.sold_out || 0} sold
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProduct(item);
                        setPopup(true);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-emerald-700 hover:border-emerald-300 text-xs font-semibold transition"
                    >
                      <AiOutlineEye size={14} />
                      <span>Inspect</span>
                    </button>
                    <Link
                      to={`/dashboard/edit-product/${item._id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 text-xs font-bold transition"
                      title="Edit Craft Specifications"
                    >
                      <FiEdit size={13} />
                      <span>Edit</span>
                    </Link>
                  </div>

                  <div className="flex items-center gap-1">
                    <Link
                      to={`/product/${item._id}`}
                      target="_blank"
                      className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 transition"
                      title="Marketplace View"
                    >
                      <FiExternalLink size={15} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(item._id)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 transition"
                      title="Delete Craft"
                    >
                      <AiOutlineDelete size={17} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-3.5 pl-5 pr-2 w-10">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length === filteredProducts.length &&
                        filteredProducts.length > 0
                      }
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded accent-emerald-700 cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-4">Craft</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">Price (ETB)</th>
                  <th className="py-3.5 px-5">Stock Status</th>
                  <th className="py-3.5 px-5">Units Sold</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredProducts.map((item) => (
                  <tr key={item._id} className={`hover:bg-stone-50 transition-colors ${selectedIds.includes(item._id) ? "bg-amber-50/30" : ""}`}>
                    <td className="py-3.5 pl-5 pr-2 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item._id)}
                        onChange={() => handleToggleSelect(item._id)}
                        className="w-4 h-4 rounded accent-emerald-700 cursor-pointer"
                      />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="relative shrink-0 cursor-pointer"
                          onClick={() => {
                            setSelectedProduct(item);
                            setPopup(true);
                          }}
                        >
                          <img
                            src={
                              item.featuredImage?.url ||
                              item.images?.find((img) => img.isFeatured)?.url ||
                              item.images?.[0]?.url ||
                              "/photo.jpg"
                            }
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover border border-stone-200 hover:opacity-90"
                          />
                          {item.images?.length > 1 && (
                            <span className="absolute -bottom-1 -right-1 bg-stone-900 text-white text-[9px] font-bold px-1 rounded-sm shadow">
                              {item.images.length}
                            </span>
                          )}
                        </div>
                        <div>
                          <div
                            onClick={() => {
                              setSelectedProduct(item);
                              setPopup(true);
                            }}
                            className="font-semibold text-stone-900 line-clamp-1 hover:text-emerald-700 cursor-pointer transition-colors"
                          >
                            {item.name}
                          </div>
                          <div className="text-[11px] font-mono text-stone-400">
                            SKU: {item.sku || item._id.slice(-6).toUpperCase()}
                          </div>
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
                      {item.discountPrice &&
                        item.originalPrice &&
                        item.discountPrice < item.originalPrice && (
                          <div className="text-[11px] text-stone-400 line-through">
                            {Number(item.originalPrice).toLocaleString()} ETB
                          </div>
                        )}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            (item.stock || 0) > 5
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : (item.stock || 0) > 0
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-rose-50 text-rose-800 border border-rose-200"
                          }`}
                        >
                          {item.stock || 0} in stock
                        </span>
                        <div className="flex items-center bg-stone-100 rounded-lg p-0.5 border border-stone-200">
                          <button
                            type="button"
                            onClick={() => {
                              if ((item.stock || 0) > 0) {
                                item.stock = (item.stock || 0) - 1;
                                toast.info(`Stock updated: ${item.stock} left for ${item.name}`, { autoClose: 1200 });
                              }
                            }}
                            className="w-5 h-5 flex items-center justify-center text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-white rounded transition"
                            title="Quick Decrease Stock (-1)"
                          >
                            -
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              item.stock = (item.stock || 0) + 1;
                              toast.success(`Restocked: ${item.stock} units for ${item.name}`, { autoClose: 1200 });
                            }}
                            className="w-5 h-5 flex items-center justify-center text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-white rounded transition"
                            title="Quick Restock (+1)"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-stone-600 font-medium">
                      {item.sold_out || 0} sold
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-1">
                      <button
                        title="Inspect Craft Details"
                        onClick={() => {
                          setSelectedProduct(item);
                          setPopup(true);
                        }}
                        className="p-2 rounded-lg text-stone-600 hover:text-emerald-700 hover:bg-stone-100 transition-colors"
                      >
                        <AiOutlineEye size={18} />
                      </button>
                      <Link
                        to={`/dashboard/edit-product/${item._id}`}
                        title="Edit Craft Specifications"
                        className="p-2 inline-block rounded-lg text-amber-700 hover:bg-amber-50 transition-colors"
                      >
                        <FiEdit size={16} />
                      </Link>
                      <Link
                        to={`/product/${item._id}`}
                        target="_blank"
                        title="View Public Marketplace Page"
                        className="p-2 inline-block rounded-lg text-stone-600 hover:text-emerald-700 hover:bg-stone-100 transition-colors"
                      >
                        <FiExternalLink size={15} />
                      </Link>
                      <button
                        title="Delete Craft"
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
        </div>
      )}

      {/* Creative Merchant Product Detail Modal */}
      {popup && selectedProduct && (
        <MerchantProductDetailModal
          item={selectedProduct}
          onClose={() => {
            setPopup(false);
            setSelectedProduct(null);
          }}
          onDelete={handleDelete}
          onProductUpdated={handleProductUpdated}
          onEdit={(prod) => {
            setPopup(false);
            setProductToEdit(prod);
            setEditModalOpen(true);
          }}
        />
      )}

      {/* Creative Merchant Product Edit Modal */}
      {editModalOpen && productToEdit && (
        <MerchantProductEditModal
          product={productToEdit}
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setProductToEdit(null);
          }}
          onSuccess={(updated) => {
            if (seller?._id) dispatch(getAllProductsShop(seller._id) as any);
            if (selectedProduct && selectedProduct._id === updated._id) {
              setSelectedProduct(updated);
            }
          }}
        />
      )}

      {/* Floating Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-gray-900/95 text-white backdrop-blur-md px-6 py-3.5 rounded-2xl shadow-2xl border border-gray-700 flex items-center gap-4">
          <div className="flex items-center gap-2 pr-3 border-r border-gray-700">
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-gray-950 font-bold text-xs flex items-center justify-center">
              {selectedIds.length}
            </span>
            <span className="text-sm font-medium text-gray-200">Selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkRestock(5)}
              disabled={bulkLoading}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>+5 Stock</span>
            </button>
            <button
              onClick={() => handleBulkDiscount(10)}
              disabled={bulkLoading}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>10% Promo</span>
            </button>
            <button
              onClick={() => handleBulkDiscount(15)}
              disabled={bulkLoading}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>15% Promo</span>
            </button>
            <button
              onClick={() => clearSelection()}
              className="text-xs text-gray-400 hover:text-white px-2 py-1 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Shopallproduct;