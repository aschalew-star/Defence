import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { server } from "../server";
import { useAppDispatch, useAppSelector } from "./redux";
import { getAllProductsShop, deleteProduct } from "../redux/Action/productAction";
import { IProduct } from "../types";

export interface UseMerchantProductsReturn {
  products: IProduct[];
  isLoading: boolean;
  seller: any;
  search: string;
  setSearch: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  categoryFilter: string;
  setCategoryFilter: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  viewMode: "table" | "grid";
  setViewMode: (val: "table" | "grid") => void;
  selectedIds: string[];
  toggleSelectAll: () => void;
  toggleSelectOne: (id: string) => void;
  clearSelection: () => void;
  bulkLoading: boolean;
  handleBulkDelete: () => Promise<void>;
  handleBulkRestock: (amount?: number) => Promise<void>;
  handleBulkDiscount: (discountPercent?: number) => Promise<void>;
  handleExportCSV: () => void;
  handleDelete: (id: string) => void;
  filteredProducts: IProduct[];
  lowStockCount: number;
  outOfStockCount: number;
  totalCatalogValue: number;
  metrics: {
    total: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    inventoryValue: number;
  };
  // Modals state
  popup: boolean;
  setPopup: (val: boolean) => void;
  selectedProduct: IProduct | null;
  setSelectedProduct: (val: IProduct | null) => void;
  editModalOpen: boolean;
  setEditModalOpen: (val: boolean) => void;
  productToEdit: IProduct | null;
  setProductToEdit: (val: IProduct | null) => void;
}

export const useMerchantProducts = (): UseMerchantProductsReturn => {
  const dispatch = useAppDispatch();
  const { products, isLoading } = useAppSelector((state) => state.products);
  const { seller } = useAppSelector((state) => state.seller);

  const effectiveSeller = seller;
  const effectiveProducts = useMemo(() => (products || []) as any[], [products]);

  // Modals
  const [popup, setPopup] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [productToEdit, setProductToEdit] = useState<IProduct | null>(null);

  // Filters & Controls
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Bulk Actions State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState<boolean>(false);

  useEffect(() => {
    if (effectiveSeller?._id) {
      dispatch(getAllProductsShop(effectiveSeller._id) as any);
    }
  }, [dispatch, effectiveSeller]);

  const handleDelete = useCallback(
    (id: string) => {
      if (window.confirm("Are you sure you want to remove this craft from your store?")) {
        dispatch(deleteProduct(id) as any);
        toast.success("Craft removed from inventory");
      }
    },
    [dispatch]
  );

  // Filtered and sorted products list
  const filteredProducts = useMemo(() => {
    let list: any[] = Array.isArray(effectiveProducts) ? [...effectiveProducts] : [];

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      list = list.filter((p) => p.category === categoryFilter);
    }

    // Status filter
    if (statusFilter === "inStock") {
      list = list.filter((p) => (p.stock ?? 0) >= 5);
    } else if (statusFilter === "lowStock") {
      list = list.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) < 5);
    } else if (statusFilter === "outOfStock") {
      list = list.filter((p) => (p.stock ?? 0) === 0);
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === "priceAsc") return (a.discountPrice || a.originalPrice || 0) - (b.discountPrice || b.originalPrice || 0);
      if (sortBy === "priceDesc") return (b.discountPrice || b.originalPrice || 0) - (a.discountPrice || a.originalPrice || 0);
      if (sortBy === "stockAsc") return (a.stock ?? 0) - (b.stock ?? 0);
      if (sortBy === "stockDesc") return (b.stock ?? 0) - (a.stock ?? 0);
      if (sortBy === "soldDesc") return (b.sold_out ?? 0) - (a.sold_out ?? 0);
      // default newest
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    return list;
  }, [effectiveProducts, search, categoryFilter, statusFilter, sortBy]);

  const handleBulkRestock = async (amount = 5) => {
    if (selectedIds.length === 0) return;
    setBulkLoading(true);
    try {
      await Promise.all(
        selectedIds.map(async (id) => {
          const prod = (products || []).find((p: IProduct) => p._id === id);
          if (!prod) return;
          const newStock = Number(prod.stock || 0) + amount;
          return axios.put(
            `${server}/product/update-product/${id}`,
            { stock: newStock },
            { withCredentials: true }
          );
        })
      );
      toast.success(`Successfully added +${amount} stock to ${selectedIds.length} crafts!`);
      setSelectedIds([]);
      if (seller?._id) dispatch(getAllProductsShop(seller._id) as any);
    } catch {
      toast.error("Failed to bulk restock items");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDiscount = async (discountPercent = 10) => {
    if (selectedIds.length === 0) return;
    setBulkLoading(true);
    try {
      await Promise.all(
        selectedIds.map(async (id) => {
          const prod = (products || []).find((p: IProduct) => p._id === id);
          if (!prod) return;
          const orig = Number(prod.originalPrice || prod.discountPrice || 0);
          const newDiscount = Math.round(orig * ((100 - discountPercent) / 100));
          return axios.put(
            `${server}/product/update-product/${id}`,
            { originalPrice: orig, discountPrice: newDiscount },
            { withCredentials: true }
          );
        })
      );
      toast.success(`Applied ${discountPercent}% Holiday Promo to ${selectedIds.length} crafts!`);
      setSelectedIds([]);
      if (seller?._id) dispatch(getAllProductsShop(seller._id) as any);
    } catch {
      toast.error("Failed to apply bulk discount");
    } finally {
      setBulkLoading(false);
    }
  };

  const metrics = useMemo(() => {
    const list = products || [];
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let inventoryValue = 0;

    list.forEach((p: IProduct) => {
      const stock = Number(p.stock || 0);
      const price = Number(p.discountPrice || p.originalPrice || 0);
      inventoryValue += stock * price;

      if (stock === 0) outOfStock += 1;
      else if (stock < 5) lowStock += 1;
      else inStock += 1;
    });

    return {
      total: list.length,
      inStock,
      lowStock,
      outOfStock,
      inventoryValue,
    };
  }, [products]);

  const lowStockCount = metrics.lowStock;

  const outOfStockCount = useMemo(() => {
    if (!Array.isArray(products)) return 0;
    return products.filter((p) => (p.stock ?? 0) === 0).length;
  }, [products]);

  const totalCatalogValue = useMemo(() => {
    if (!Array.isArray(products)) return 0;
    return products.reduce(
      (sum, p) => sum + (p.discountPrice || p.originalPrice || 0) * (p.stock || 0),
      0
    );
  }, [products]);

  // Bulk Selection Helpers
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p._id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelectedIds([]);

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.length} selected items?`
      )
    ) {
      return;
    }

    setBulkLoading(true);
    try {
      for (const id of selectedIds) {
        await dispatch(deleteProduct(id) as any);
      }
      toast.success(`Successfully deleted ${selectedIds.length} items`);
      setSelectedIds([]);
    } catch {
      toast.error("Failed to delete some selected items");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!filteredProducts || filteredProducts.length === 0) {
      toast.info("No items to export");
      return;
    }

    const headers = [
      "Craft ID",
      "Item Name",
      "Category",
      "Original Price (ETB)",
      "Discount Price (ETB)",
      "Stock Inventory",
      "Sold Count",
      "Creation Date",
    ];

    const rows = filteredProducts.map((p) => [
      `"${p._id}"`,
      `"${(p.name || "").replace(/"/g, '""')}"`,
      `"${p.category || ""}"`,
      p.originalPrice || 0,
      p.discountPrice || 0,
      p.stock || 0,
      p.sold_out || 0,
      `"${p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `artisan_catalog_${seller?.name || "shop"}_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Artisan catalog CSV exported successfully!");
  };

  return {
    products: effectiveProducts,
    isLoading: !!isLoading,
    seller: effectiveSeller,
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
    handleBulkDelete,
    handleBulkRestock,
    handleBulkDiscount,
    handleExportCSV,
    handleDelete,
    filteredProducts,
    lowStockCount,
    outOfStockCount,
    totalCatalogValue,
    metrics,
    popup,
    setPopup,
    selectedProduct,
    setSelectedProduct,
    editModalOpen,
    setEditModalOpen,
    productToEdit,
    setProductToEdit,
  };
};

export default useMerchantProducts;
