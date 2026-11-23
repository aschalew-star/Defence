import React, { useState, useEffect, useRef, FormEvent, ChangeEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./redux";
import { fechAllProducts } from "../redux/Action/productAction";
import { IProduct } from "../types";

export interface UseProductCatalogReturn {
  products: IProduct[];
  totalProducts: number;
  pages: number;
  page: number;
  limit: number;
  isLoading: boolean;
  error: any;
  categoryParam: string;
  sortParam: string;
  keywordParam: string;
  minPriceParam: string;
  maxPriceParam: string;
  searchInput: string;
  setSearchInput: (val: string) => void;
  minPriceInput: string;
  setMinPriceInput: (val: string) => void;
  maxPriceInput: string;
  setMaxPriceInput: (val: string) => void;
  showPriceFilter: boolean;
  setShowPriceFilter: (val: boolean | ((prev: boolean) => boolean)) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  handleCategoryChange: (catValue: string) => void;
  handleSortChange: (newSort: string) => void;
  handleSearchSubmit: (e: FormEvent) => void;
  handleClearSearch: () => void;
  handlePriceFilterSubmit: (e: FormEvent) => void;
  handleClearPriceFilter: () => void;
  handlePageChange: (newPage: number) => void;
  handleResetFilters: () => void;
}

export const useProductCatalog = (): UseProductCatalogReturn => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL parameters
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const categoryParam = searchParams.get("category") || "all";
  const sortParam = searchParams.get("sort") || "default";
  const keywordParam = searchParams.get("keyword") || "";
  const minPriceParam = searchParams.get("minPrice") || "";
  const maxPriceParam = searchParams.get("maxPrice") || "";

  // Local state for search & price filter inputs
  const [searchInput, setSearchInput] = useState<string>(keywordParam);
  const [minPriceInput, setMinPriceInput] = useState<string>(minPriceParam);
  const [maxPriceInput, setMaxPriceInput] = useState<string>(maxPriceParam);
  const [showPriceFilter, setShowPriceFilter] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Redux state
  const { products, totalProducts, pages, page, limit, isLoading, error } =
    useAppSelector((state) => state.products);

  // Synchronize inputs if URL changes externally
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
      }) as any
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

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === "all" || value === "default" || value === "") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    next.set("page", "1"); // reset to page 1 on filter changes
    setSearchParams(next);
  };

  const handleCategoryChange = (catValue: string) => {
    updateParam("category", catValue);
  };

  const handleSortChange = (newSort: string) => {
    updateParam("sort", newSort);
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateParam("keyword", searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    updateParam("keyword", null);
  };

  const handlePriceFilterSubmit = (e: FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (minPriceInput) next.set("minPrice", minPriceInput);
    else next.delete("minPrice");

    if (maxPriceInput) next.set("maxPrice", maxPriceInput);
    else next.delete("maxPrice");

    next.set("page", "1");
    setSearchParams(next);
    setShowPriceFilter(false);
  };

  const handleClearPriceFilter = () => {
    setMinPriceInput("");
    setMaxPriceInput("");
    const next = new URLSearchParams(searchParams);
    next.delete("minPrice");
    next.delete("maxPrice");
    next.set("page", "1");
    setSearchParams(next);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pages) return;
    const next = new URLSearchParams(searchParams);
    next.set("page", String(newPage));
    setSearchParams(next);
    containerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearchInput("");
    setMinPriceInput("");
    setMaxPriceInput("");
  };

  return {
    products,
    totalProducts,
    pages,
    page,
    limit,
    isLoading,
    error,
    categoryParam,
    sortParam,
    keywordParam,
    minPriceParam,
    maxPriceParam,
    searchInput,
    setSearchInput,
    minPriceInput,
    setMinPriceInput,
    maxPriceInput,
    setMaxPriceInput,
    showPriceFilter,
    setShowPriceFilter,
    containerRef,
    handleCategoryChange,
    handleSortChange,
    handleSearchSubmit,
    handleClearSearch,
    handlePriceFilterSubmit,
    handleClearPriceFilter,
    handlePageChange,
    handleResetFilters,
  };
};

export default useProductCatalog;
