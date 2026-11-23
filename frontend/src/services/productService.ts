import apiClient from "./apiClient";
import { IProduct, IProductFilters, PaginatedResponse } from "../types";

export const productService = {
  getAllProducts: async (params: IProductFilters = {}): Promise<PaginatedResponse<IProduct>> => {
    const query = new URLSearchParams();
    if (params.page) query.append("page", String(params.page));
    if (params.limit) query.append("limit", String(params.limit));
    if (params.category && params.category !== "all" && params.category !== "All") {
      query.append("category", params.category);
    }
    if (params.keyword) query.append("keyword", params.keyword);
    if (params.sort) query.append("sort", params.sort);
    if (params.minPrice) query.append("minPrice", String(params.minPrice));
    if (params.maxPrice) query.append("maxPrice", String(params.maxPrice));
    if (params.ratings) query.append("ratings", String(params.ratings));

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const response = await apiClient.get<PaginatedResponse<IProduct>>(
      `/product/get-all-products${queryString}`
    );
    return response.data;
  },

  getProductById: async (id: string): Promise<{ product: IProduct }> => {
    const response = await apiClient.get<{ product: IProduct }>(
      `/product/get-product-details/${id}`
    );
    return response.data;
  },

  getShopProducts: async (shopId: string): Promise<{ products: IProduct[] }> => {
    const response = await apiClient.get<{ products: IProduct[] }>(
      `/product/get-all-products-shop/${shopId}`
    );
    return response.data;
  },

  createProduct: async (productData: any): Promise<{ product: IProduct }> => {
    const response = await apiClient.post<{ product: IProduct }>(
      "/product/create-product",
      productData
    );
    return response.data;
  },

  deleteProduct: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(
      `/product/delete-shop-product/${id}`
    );
    return response.data;
  },
};

export default productService;
