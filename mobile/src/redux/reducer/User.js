import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
};

export const userReducer = createReducer(initialState, (builder)=>{
 builder.addCase("LoadUserRequest", (state) => {
    state.loading = true;
  },)

  builder.addCase("LoadUserSuccess",(state, action) => {
    state.isAuthenticated = true;
    state.loading = false;
    state.user = action.payload;
  },)
  
  builder.addCase("LoadUserFail",(state, action) => {
    state.loading = false;
    state.error = action.payload;
    state.isAuthenticated = false;
  },)

  builder.addCase("updateUserInfoRequest", (state) => {
    state.loading = true;
  },)

 
  builder.addCase("updateUserInfoSuccess", (state, action) => {
    state.loading = false;
    state.user = action.payload;
  },)

  builder.addCase("updateUserInfoFailed", (state, action) => {
    state.loading = false;
    state.error = action.payload;
  },)
 
  
  // update user address

  builder.addCase("updateUserAddressRequest",(state) => {
    state.addressloading = true;
  },)


  builder.addCase("updateUserAddressSuccess",(state, action) => {
    state.addressloading = false;
    state.successMessage = action.payload.successMessage;
    state.user = action.payload.user;
  },)

  builder.addCase("updateUserAddressFailed", (state, action) => {
    state.addressloading = false;
    state.error = action.payload;
  },)
 
  // delete user address

  builder.addCase("deleteUserAddressRequest", (state) => {
    state.addressloading = true;
  },)

  builder.addCase("deleteUserAddressSuccess", (state, action) => {
    state.addressloading = false;
    state.successMessage = action.payload.successMessage;
    state.user = action.payload.user;
  },)


  builder.addCase("deleteUserAddressFailed",(state, action) => {
    state.addressloading = false;
    state.error = action.payload;
  },)

 

  // get all users --- admin
  
  builder.addCase("getAllUsersRequest", (state) => {
    state.usersLoading = true;
  },)

  builder.addCase("getAllUsersSuccess",(state,action) => {
    state.usersLoading = false;
    state.users = action.payload;
  },)
  
  builder.addCase("getAllUsersFailed",(state,action) => {
    state.usersLoading = false;
    state.error = action.payload;
  },)
 
  builder.addCase("clearErrors",(state) => {
    state.error = null;
  },)
 
  builder.addCase("clearMessages",(state) => {
    state.successMessage = null;
  },)
 
});
