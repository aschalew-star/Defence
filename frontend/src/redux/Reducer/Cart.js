import { createReducer } from "@reduxjs/toolkit";

const getInitialCart = () => {
  try {
    const stored = localStorage.getItem("cartItems");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const initialState = {
  cart: getInitialCart(),
};

export const Cart = createReducer(initialState, (Builder) => {
  Builder.addCase("addToCart", (state, action) => {
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

  Builder.addCase("removeFromCart", (state, action) => {
    if (!state.cart) state.cart = [];
    state.cart = state.cart.filter((i) => i._id !== action.payload);
  });
});
