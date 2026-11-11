import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import Productcard from "../Products/Productcard";
import { fechAllProducts } from "../../redux/Action/productAction";
import {
  FiFilter,
  FiSliders,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiCheck,
  FiLayers,
} from "react-icons/fi";

const CATEGORIES = [
  { label: "All Garments", value: "all" },
  { label: "Habesha Kemis", value: "kemis" },
  { label: "Men's Attire", value: "men" },
  { label: "Kids Collection", value: "kids" },
  { label: "Gabi & Netela", value: "gabi" },
  { label: "Ceremonial & Wedding", value: "ceremonial" },
  { label: "Tibeb & Accs", value: "accessories" },
];

function Products() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL parameters
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const categoryParam = searchParams.get("category") || "all";
  const sortParam = searchParams.get("sort") || "default";
  const keywordParam = searchParams.get("keyword") || "";
  const minPriceParam = searchParams.get("minPrice") || "";
  const maxPriceParam = searchParams.get("maxPrice") || "";

  // Local state for search & price filter inputs
  const [searchInput, setSearchInput] = useState(keywordParam);
  const [minPriceInput, setMinPriceInput] = useState(minPriceParam);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPriceParam);
  const [showPriceFilter, setShowPriceFilter] = useState(false);

  const containerRef = useRef(null);

  // Redux state
  const { products, totalProducts, pages, page, limit, isLoading, error } =
    useSelector((state) => state.products);

  // Synchronize search input if URL changes externally
  useEffect(() => {
    setSearchInput(keywordParam);
  }, [keywordParam]);

  useEffect(() => {
    setMinPriceInput(minPriceParam);
  }, [minPriceParam]);

  useEffect(() => {
    setMaxPriceInput(maxPriceParam);
  }, [maxPriceParam]);

  // Fetch paginated products from server whenever query params change
  useEffect(() => {
    dispatch(
      fechAllProducts({
        page: pageParam,
        limit: 12,
        category: categoryParam !== "all" ? categoryParam : undefined,
        sort: sortParam !== "default" ? sortParam : undefined,
        keyword: keywordParam || undefined,
        minPrice: minPriceParam || undefined,
        maxPrice: maxPriceParam || undefined,
      })
    );
  }, [
    dispatch,
    pageParam,
    categoryParam,
    sortParam,
    keywordParam,
    minPriceParam,
    maxPriceParam,
  ]);

  // Helper to update URL params safely
  const updateParams = (newParams) => {
    const current = Object.fromEntries(searchParams.entries());
    const merged = { ...current, ...newParams };

    // Remove empty keys or default values
    Object.keys(merged).forEach((key) => {
      if (
        merged[key] === "" ||
        merged[key] === null ||
        merged[key] === undefined ||
        (key === "category" && merged[key] === "all") ||
        (key === "sort" && merged[key] === "default") ||
        (key === "page" && Number(merged[key]) === 1)
      ) {
        delete merged[key];
      }
    });

    setSearchParams(merged);
  };

  const handleCategoryChange = (catVal) => {
    updateParams({ category: catVal, page: 1 });
  };

  const handleSortChange = (e) => {
    updateParams({ sort: e.target.value, page: 1 });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParams({ keyword: searchInput.trim(), page: 1 });
  };

  const handleClearSearch = () => {
    setSearchInput("");
    updateParams({ keyword: "", page: 1 });
  };

  const handleApplyPriceFilter = (e) => {
    e.preventDefault();
    updateParams({
      minPrice: minPriceInput.trim(),
      maxPrice: maxPriceInput.trim(),
      page: 1,
    });
    setShowPriceFilter(false);
  };

  const handleClearPriceFilter = () => {
    setMinPriceInput("");
    setMaxPriceInput("");
    updateParams({ minPrice: "", maxPrice: "", page: 1 });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > (pages || 1)) return;
    updateParams({ page: newPage });
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Generate numbered pagination items
  const renderPaginationButtons = () => {
    const totalPages = pages || 1;
    const currentPage = page || 1;
    const btns = [];

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
      endPage = Math.min(5, totalPages);
    }
    if (currentPage >= totalPages - 2) {
      startPage = Math.max(1, totalPages - 4);
    }

    if (startPage > 1) {
      btns.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="w-9 h-9 rounded-xl text-xs font-bold transition border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
        >
          1
        </button>
      );
      if (startPage > 2) {
        btns.push(
          <span key="dots-start" className="px-1 text-gray-400 font-bold">
            ...
          </span>
        );
      }
    }

    for (let p = startPage; p <= endPage; p++) {
      btns.push(
        <button
          key={p}
          onClick={() => handlePageChange(p)}
          className={`w-9 h-9 rounded-xl text-xs font-bold transition ${
            currentPage === p
              ? "bg-amber-800 text-white shadow-md shadow-amber-800/20"
              : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          {p}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        btns.push(
          <span key="dots-end" className="px-1 text-gray-400 font-bold">
            ...
          </span>
        );
      }
      btns.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="w-9 h-9 rounded-xl text-xs font-bold transition border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
        >
          {totalPages}
        </button>
      );
    }

    return btns;
  };

  const hasActiveFilters =
    categoryParam !== "all" ||
    keywordParam ||
    minPriceParam ||
    maxPriceParam ||
    sortParam !== "default";

  const clearAllFilters = () => {
    setSearchInput("");
    setMinPriceInput("");
    setMaxPriceInput("");
    setSearchParams({});
  };

  // Safe pagination bounds
  const currentCount = products ? products.length : 0;
  const startItem = totalProducts > 0 ? (pageParam - 1) * (limit || 12) + 1 : 0;
  const endItem = Math.min(pageParam * (limit || 12), totalProducts);

  return (
    <div ref={containerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title & Stats Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-md mb-2">
              <FiLayers className="text-sm" /> Verified Cultural Marketplace
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-serif">
              Authentic Ethiopian Traditional Catalog
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Hand-spun cotton garments directly crafted by local weavers and cultural boutiques across Ethiopia
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs font-bold text-amber-900 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200/60 shadow-sm">
              {totalProducts} Garments Listed
            </span>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="pt-6 space-y-4">
          {/* Search & Sort Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input Form */}
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex-1 max-w-md flex items-center"
            >
              <FiSearch className="absolute left-3.5 text-gray-400 text-base pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by kemis, tibeb embroidery, artisan..."
                className="w-full bg-gray-50 hover:bg-gray-100/70 focus:bg-white text-gray-900 text-xs font-medium pl-10 pr-20 py-2.5 rounded-xl border border-gray-200 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/10 outline-none transition"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-12 text-gray-400 hover:text-gray-600 p-1"
                >
                  <FiX className="text-sm" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1.5 px-2.5 py-1 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold rounded-lg shadow-sm transition"
              >
                Find
              </button>
            </form>

            {/* Right Tools: Price Filter & Sort Dropdown */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Price Filter Toggle */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPriceFilter(!showPriceFilter)}
                  className={`text-xs font-bold px-3 py-2 rounded-xl border flex items-center gap-1.5 transition ${
                    minPriceParam || maxPriceParam
                      ? "bg-amber-50 border-amber-300 text-amber-900"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FiSliders className="text-sm" />
                  <span>Price Range</span>
                  {(minPriceParam || maxPriceParam) && (
                    <span className="w-2 h-2 rounded-full bg-amber-600" />
                  )}
                </button>

                {/* Price Popover */}
                {showPriceFilter && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-30 animate-fadeIn">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-gray-900">Price in ETB</span>
                      <button
                        onClick={() => setShowPriceFilter(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <FiX className="text-sm" />
                      </button>
                    </div>
                    <form onSubmit={handleApplyPriceFilter} className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-gray-400 font-bold block mb-1">
                            Min ETB
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={minPriceInput}
                            onChange={(e) => setMinPriceInput(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 outline-none focus:border-amber-600"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400 font-bold block mb-1">
                            Max ETB
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="50,000"
                            value={maxPriceInput}
                            onChange={(e) => setMaxPriceInput(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 outline-none focus:border-amber-600"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleClearPriceFilter}
                          className="text-[11px] font-bold text-gray-500 hover:text-gray-800"
                        >
                          Clear
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold rounded-lg shadow-sm"
                        >
                          Apply Filter
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1">
                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                  Sort:
                </span>
                <select
                  value={sortParam}
                  onChange={handleSortChange}
                  className="bg-transparent text-gray-800 text-xs font-bold outline-none cursor-pointer py-1"
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

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-2">
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1 mr-1">
              <FiFilter /> Categories:
            </span>
            {CATEGORIES.map((cat) => {
              const isActive = categoryParam === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryChange(cat.value)}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition whitespace-nowrap ${
                    isActive
                      ? "bg-amber-800 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
              <span className="text-[11px] font-bold text-gray-400">Active Filters:</span>

              {categoryParam !== "all" && (
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 text-xs px-2.5 py-1 rounded-full font-semibold">
                  Category: {CATEGORIES.find((c) => c.value === categoryParam)?.label || categoryParam}
                  <button onClick={() => handleCategoryChange("all")}>
                    <FiX className="hover:text-red-600 text-xs" />
                  </button>
                </span>
              )}

              {keywordParam && (
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 text-xs px-2.5 py-1 rounded-full font-semibold">
                  Search: "{keywordParam}"
                  <button onClick={handleClearSearch}>
                    <FiX className="hover:text-red-600 text-xs" />
                  </button>
                </span>
              )}

              {(minPriceParam || maxPriceParam) && (
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 text-xs px-2.5 py-1 rounded-full font-semibold">
                  Price: {minPriceParam || 0} - {maxPriceParam || "∞"} ETB
                  <button onClick={handleClearPriceFilter}>
                    <FiX className="hover:text-red-600 text-xs" />
                  </button>
                </span>
              )}

              {sortParam !== "default" && (
                <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full font-semibold">
                  Sort: {sortParam}
                  <button onClick={() => updateParams({ sort: "default" })}>
                    <FiX className="hover:text-red-600 text-xs" />
                  </button>
                </span>
              )}

              <button
                onClick={clearAllFilters}
                className="text-xs font-bold text-rose-600 hover:underline ml-1"
              >
                Reset All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grid or Status Views */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-gray-500 font-medium">
            Fetching authentic Ethiopian creations from master artisans...
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
      ) : currentCount === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
          <div className="w-16 h-16 bg-amber-50 text-amber-800 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            🇪🇹
          </div>
          <h3 className="text-xl font-bold text-gray-900 font-serif">
            No traditional pieces matched your criteria
          </h3>
          <p className="text-xs text-gray-500 mt-2 max-w-md mx-auto">
            We couldn't find any garments matching your active filters. Try clearing your search keyword or switching category tabs.
          </p>
          <button
            onClick={clearAllFilters}
            className="mt-5 px-5 py-2.5 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold rounded-xl shadow-md transition"
          >
            Clear All Filters & Show Catalog
          </button>
        </div>
      ) : (
        <>
          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {products.map((item) => (
              <Productcard key={item._id} item={item} />
            ))}
          </div>

          {/* Server-Side Pagination Bar */}
          <div className="mt-12 bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-500 font-medium">
              Showing <span className="font-bold text-gray-900">{startItem}</span> to{" "}
              <span className="font-bold text-gray-900">{endItem}</span> of{" "}
              <span className="font-bold text-gray-900">{totalProducts}</span> garments
            </div>

            <div className="flex items-center gap-1.5">
              {/* Prev Button */}
              <button
                onClick={() => handlePageChange(pageParam - 1)}
                disabled={pageParam <= 1}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <FiChevronLeft />
                <span className="hidden sm:inline">Prev</span>
              </button>

              {/* Numbered Page Buttons */}
              <div className="flex items-center gap-1">
                {renderPaginationButtons()}
              </div>

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(pageParam + 1)}
                disabled={pageParam >= (pages || 1)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <span className="hidden sm:inline">Next</span>
                <FiChevronRight />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Products;