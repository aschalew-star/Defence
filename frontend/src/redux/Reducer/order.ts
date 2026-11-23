import { createReducer } from "@reduxjs/toolkit";
import { IOrder } from "../../types";

export interface OrderState {
  isLoading: boolean;
  orders: IOrder[];
  adminOrders?: IOrder[];
  adminOrderLoading?: boolean;
  error?: any;
}

const initialState: OrderState = {
  isLoading: true,
  orders: [],
};

export const orderReducer = createReducer(initialState, (builder) => {
  // get all orders of user
  builder.addCase("getAllOrdersUserRequest", (state) => {
    state.isLoading = true;
  });

  builder.addCase("getAllOrdersUserSuccess", (state, action: any) => {
    state.isLoading = false;
    state.orders = action.payload;
  });

  builder.addCase("getAllOrdersUserFailed", (state, action: any) => {
    state.isLoading = false;
    state.error = action.payload;
  });

  // get all orders of shop
  builder.addCase("getAllOrdersShopRequest", (state) => {
    state.isLoading = true;
  });

  builder.addCase("getAllOrdersShopSuccess", (state, action: any) => {
    state.isLoading = false;
    state.orders = action.payload;
  });

  builder.addCase("getAllOrdersShopFailed", (state, action: any) => {
    state.isLoading = false;
    state.error = action.payload;
  });

  // get all orders for admin
  builder.addCase("adminAllOrdersRequest", (state) => {
    state.adminOrderLoading = true;
  });

  builder.addCase("adminAllOrdersSuccess", (state, action: any) => {
    state.adminOrderLoading = false;
    state.adminOrders = action.payload;
  });

  builder.addCase("adminAllOrdersFailed", (state, action: any) => {
    state.adminOrderLoading = false;
    state.error = action.payload;
  });

  builder.addCase("clearErrors", (state) => {
    state.error = null;
  });
});
