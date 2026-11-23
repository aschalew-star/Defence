import { createReducer } from "@reduxjs/toolkit";
import { IUser } from "../../types";

export interface UserState {
  isAuthenticated: boolean;
  loading: boolean;
  user?: IUser | null;
  error?: any;
  addressloading?: boolean;
  successMessage?: string | null;
  usersLoading?: boolean;
  users?: IUser[];
}

const initialState: UserState = {
  isAuthenticated: false,
  loading: true,
};

export const userReducer = createReducer(initialState, (builder) => {
  builder.addCase("LoadUserRequest", (state) => {
    state.loading = true;
  });

  builder.addCase("LoadUserSuccess", (state, action: any) => {
    state.isAuthenticated = true;
    state.loading = false;
    state.user = action.payload;
  });

  builder.addCase("LoadUserFail", (state, action: any) => {
    state.loading = false;
    state.error = action.payload;
    state.isAuthenticated = false;
  });

  builder.addCase("updateUserInfoRequest", (state) => {
    state.loading = true;
  });

  builder.addCase("updateUserInfoSuccess", (state, action: any) => {
    state.loading = false;
    state.user = action.payload;
  });

  builder.addCase("updateUserInfoFailed", (state, action: any) => {
    state.loading = false;
    state.error = action.payload;
  });

  // update user address
  builder.addCase("updateUserAddressRequest", (state) => {
    state.addressloading = true;
  });

  builder.addCase("updateUserAddressSuccess", (state, action: any) => {
    state.addressloading = false;
    state.successMessage = action.payload.successMessage;
    state.user = action.payload.user;
  });

  builder.addCase("updateUserAddressFailed", (state, action: any) => {
    state.addressloading = false;
    state.error = action.payload;
  });

  // delete user address
  builder.addCase("deleteUserAddressRequest", (state) => {
    state.addressloading = true;
  });

  builder.addCase("deleteUserAddressSuccess", (state, action: any) => {
    state.addressloading = false;
    state.successMessage = action.payload.successMessage;
    state.user = action.payload.user;
  });

  builder.addCase("deleteUserAddressFailed", (state, action: any) => {
    state.addressloading = false;
    state.error = action.payload;
  });

  // get all users --- admin
  builder.addCase("getAllUsersRequest", (state) => {
    state.usersLoading = true;
  });

  builder.addCase("getAllUsersSuccess", (state, action: any) => {
    state.usersLoading = false;
    state.users = action.payload;
  });

  builder.addCase("getAllUsersFailed", (state, action: any) => {
    state.usersLoading = false;
    state.error = action.payload;
  });

  builder.addCase("clearErrors", (state) => {
    state.error = null;
  });

  builder.addCase("clearMessages", (state) => {
    state.successMessage = null;
  });
});
