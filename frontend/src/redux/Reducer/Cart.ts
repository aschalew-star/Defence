import { createReducer } from "@reduxjs/toolkit";
import { ICartItem } from "../../types";

const getInitialCart = (): ICartItem[] => {
  try {
    const stored = localStorage.getItem("cartItems");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export interface CartState {
  cart: ICartItem[];
}

const initialState: CartState = {
  cart: getInitialCart(),
};

export const Cart = createReducer(initialState, (Builder) => {
  Builder.addCase("addToCart", (state, action: any) => {
    const item = action.payload;
    if (!state.cart) state.cart = [];
    const isItemExist = state.cart.find((i) => i._id === item._id);

    if (isItemExist) {
      state.cart = state.cart.map((i) =>
        i._id === isItemExist._id ? item : i
      );
    } else {
      state.cart.push(item);
    }
  });

  Builder.addCase("removeFromCart", (state, action: any) => {
    if (!state.cart) state.cart = [];
    state.cart = state.cart.filter((i) => i._id !== action.payload);
  });
});
