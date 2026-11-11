import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  isLoading: false,
  allProducts: [],
  products: [],
  totalProducts: 0,
  page: 1,
  pages: 1,
  limit: 12,
  error: null,
};

export const ProductReducer = createReducer(initialState, (builder) => {
  // Get all products (with pagination metadata)
  builder.addCase("getAllProductRequest", (state) => {
    state.isLoading = true;
  });

  builder.addCase("getAllProductSuccess", (state, action) => {
    state.isLoading = false;
    state.products = action.payload || [];
    state.allProducts = action.payload || [];
    state.totalProducts = action.totalProducts ?? (action.payload ? action.payload.length : 0);
    state.page = action.page || 1;
    state.pages = action.pages || 1;
    state.limit = action.limit || 12;
    state.error = null;
  });

  builder.addCase("getAllProductFail", (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  });

  // Create product
  builder.addCase("productCreateRequest", (state) => {
    state.isLoading = true;
  });

  builder.addCase("productCreateSuccess", (state, action) => {
    state.isLoading = false;
    state.product = action.payload;
    state.success = true;
  });

  builder.addCase("productCreateFail", (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
    state.success = false;
  });

  // Get all products of a shop
  builder.addCase("getAllProductsShopRequest", (state) => {
    state.isLoading = true;
  });

  builder.addCase("getAllProductsShopSuccess", (state, action) => {
    state.isLoading = false;
    state.products = action.payload || [];
  });

  builder.addCase("getAllProductsShopFailed", (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  });

  // Delete product of a shop
  builder.addCase("deleteProductRequest", (state) => {
    state.isLoading = true;
  });

  builder.addCase("deleteProductSuccess", (state, action) => {
    state.isLoading = false;
    state.message = action.payload;
  });

  builder.addCase("deleteProductFailed", (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  });

  builder.addCase("clearErrors", (state) => {
    state.error = null;
  });
});
