import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { server } from "../server";
import Productcard from "./Products/Productcard";
import { FiChevronLeft, FiChevronRight, FiSliders, FiArrowLeft, FiShoppingBag } from "react-icons/fi";

function Productdynamic() {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1", 10);
  const sort = searchParams.get("sort") || "default";

  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [pages, setPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCategoryProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams({
          page,
          limit: 12,
        });

        // If numeric price filter was passed in param
        if (!isNaN(category) && !isNaN(parseFloat(category))) {
          queryParams.append("maxPrice", category);
        } else if (category && category !== "all") {
          queryParams.append("category", category);
        }

        if (sort && sort !== "default") {
          queryParams.append("sort", sort);
        }

        const { data } = await axios.get(
          `${server}/product/get-all-products?${queryParams.toString()}`
        );

        if (isMounted) {
          setProducts(data.products || []);
          setTotalProducts(data.totalProducts || 0);
          setPages(data.pages || 1);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || err.message || "Failed to load category products");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCategoryProducts();

    return () => {
      isMounted = false;
    };
  }, [category, page, sort]);

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    const current = Object.fromEntries(searchParams.entries());
    if (newSort === "default") {
      delete current.sort;
    } else {
      current.sort = newSort;
    }
    current.page = "1";
    setSearchParams(current);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pages) return;
    const current = Object.fromEntries(searchParams.entries());
    current.page = newPage.toString();
    setSearchParams(current);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatTitle = (raw) => {
    if (!raw) return "Category";
    if (!isNaN(raw) && !isNaN(parseFloat(raw))) {
      return `Garments Under ${raw} ETB`;
    }
    return raw;
  };

  const startItem = totalProducts > 0 ? (page - 1) * 12 + 1 : 0;
  const endItem = Math.min(page * 12, totalProducts);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Category Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
        <div className="mb-4">
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-900 transition"
          >
            <FiArrowLeft /> Back to All Traditional Garments
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-md mb-2">
              <FiShoppingBag className="text-sm" /> Collection
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-gray-900 font-serif capitalize">
              {formatTitle(category)}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Browse custom handwoven {formatTitle(category)} directly from master Ethiopian artisans
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-amber-900 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200/60 shadow-sm">
              {totalProducts} Items Available
            </span>
          </div>
        </div>

        {/* Sort Bar */}
        <div className="pt-4 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Showing <span className="font-bold text-gray-800">{totalProducts > 0 ? `${startItem}-${endItem}` : 0}</span> of{" "}
            <span className="font-bold text-gray-800">{totalProducts}</span>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
            <FiSliders className="text-gray-400 text-xs" />
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
              Sort:
            </span>
            <select
              value={sort}
              onChange={handleSortChange}
              className="bg-transparent text-gray-800 text-xs font-bold outline-none cursor-pointer"
            >
              <option value="default">Featured / Newest</option>
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="top-rated">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid or Status Views */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-gray-500 font-medium">
            Fetching collection for {formatTitle(category)}...
          </p>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
          <p className="text-rose-600 font-semibold mb-2">{error}</p>
          <button
            onClick={() => handlePageChange(1)}
            className="px-4 py-2 bg-amber-800 text-white text-xs font-bold rounded-xl shadow"
          >
            Retry Loading
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
          <div className="w-16 h-16 bg-amber-50 text-amber-800 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            🇪🇹
          </div>
          <h3 className="text-xl font-bold text-gray-900 font-serif">
            No products found in "{formatTitle(category)}"
          </h3>
          <p className="text-xs text-gray-500 mt-2 max-w-md mx-auto">
            Artisans are currently crafting new designs for this category. Check back soon or explore other traditional collections.
          </p>
          <Link
            to="/products"
            className="inline-block mt-5 px-5 py-2.5 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold rounded-xl shadow-md transition"
          >
            Explore Entire Marketplace Catalog
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {products.map((item) => (
              <Productcard key={item._id} item={item} />
            ))}
          </div>

          {/* Pagination Controls */}
          {pages > 1 && (
            <div className="mt-12 bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <FiChevronLeft /> Prev
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition ${
                      page === p
                        ? "bg-amber-800 text-white shadow-md shadow-amber-800/20"
                        : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= pages}
                className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next <FiChevronRight />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Productdynamic;