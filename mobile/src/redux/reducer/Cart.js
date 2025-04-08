import { createReducer } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Load initial state async (but this is a fallback default — actual loading should be done outside)
const initialState = {
  cart: [],
};

// Async helper to update AsyncStorage when state changes
const updateCartStorage = async (cart) => {
  try {
    await AsyncStorage.setItem("cartItems", JSON.stringify(cart));
  } catch (error) {
    console.error("Failed to update AsyncStorage", error);
  }
};

export const Cart = createReducer(initialState, (builder) => {
  builder
    .addCase("addToCart", (state, action) => {
      const item = action.payload;
      const isItemExist = state.cart.find((i) => i._id === item._id);

      if (isItemExist) {
        state.cart = state.cart.map((i) =>
          i._id === isItemExist._id ? item : i
        );
      } else {
        state.cart.push(item);
      }

      // Save updated cart to AsyncStorage
      updateCartStorage(state.cart);
    })

    .addCase("removeFromCart", (state, action) => {
      state.cart = state.cart.filter((i) => i._id !== action.payload);

      // Save updated cart to AsyncStorage
      updateCartStorage(state.cart);
    })

    .addCase("setCartFromStorage", (state, action) => {
      state.cart = action.payload;
    });
});
