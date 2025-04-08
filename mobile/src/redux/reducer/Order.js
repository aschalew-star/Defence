import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  isLoading: true,
};

export const orderReducer = createReducer(initialState,(builder)=>{
  // get all orders of user
builder.addCase("getAllOrdersUserRequest", (state) => {
    state.isLoading = true;
  })

  builder.addCase("getAllOrdersUserSuccess",(state, action) => {
    state.isLoading = false;
    state.orders = action.payload;
  })

  builder.addCase("getAllOrdersUserFailed",(state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  })
 
  
  // get all orders of shop

  builder.addCase("getAllOrdersShopRequest",(state) => {
    state.isLoading = true;
  })
  builder.addCase("getAllOrdersShopSuccess",(state, action) => {
    state.isLoading = false;
    state.orders = action.payload;
  })
 
  builder.addCase("getAllOrdersShopFailed",(state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  })
 
  // get all orders for admin
  builder.addCase("adminAllOrdersRequest",(state) => {
    state.adminOrderLoading = true;
  })

  builder.addCase("adminAllOrdersSuccess",(state, action) => {
    state.adminOrderLoading = false;
    state.adminOrders = action.payload;
  })
  builder.addCase("adminAllOrdersFailed", (state, action) => {
    state.adminOrderLoading = false;
    state.error = action.payload;
  })

  builder.addCase("clearErrors", (state) => {
    state.error = null;
  })

 
});
