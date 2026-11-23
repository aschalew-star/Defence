import { createReducer } from "@reduxjs/toolkit";
import { ISeller } from "../../types";

export interface SellerState {
  isLoading: boolean;
  isSeller?: boolean;
  seller?: ISeller | null;
  sellers?: ISeller[];
  error?: any;
}

const initialState: SellerState = {
  isLoading: true,
  isSeller: false,
  seller: null,
  sellers: [],
};

export const sellerReducer = createReducer(initialState, (builder) => {
  builder.addCase("LoadSellerRequest", (state) => {
    state.isLoading = true;
  });

  builder.addCase("LoadSellerSuccess", (state, action: any) => {
    state.isSeller = true;
    state.isLoading = false;
    state.seller = action.payload;
  });

  builder.addCase("LoadSellerFail", (state, action: any) => {
    state.isLoading = false;
    state.error = action.payload;
    state.isSeller = false;
  });

  builder.addCase("getAllSellersRequest", (state) => {
    state.isLoading = true;
  });

  builder.addCase("getAllSellersSuccess", (state, action: any) => {
    state.isLoading = false;
    state.sellers = action.payload;
  });

  builder.addCase("getAllSellerFailed", (state, action: any) => {
    state.isLoading = false;
    state.error = action.payload;
  });

  builder.addCase("clearErrors", (state) => {
    state.error = null;
  });
});
