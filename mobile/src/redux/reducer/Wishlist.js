import { createReducer } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Default initial state
const initialState = {
  wish: [],
};

// Async helper to update AsyncStorage
const updateWishStorage = async (wish) => {
  try {
    // await AsyncStorage.setItem("WishItems", JSON.stringify(wish));
    const flattenedWish = wish.flat(); // ✅ remove one level of nesting
    await AsyncStorage.setItem("WishItems", JSON.stringify(flattenedWish));
  } catch (error) {
    console.error("Failed to update Wish AsyncStorage", error);
  }
};

export const Wish = createReducer(initialState, (builder) => {
  builder.addCase("addToWish", (state, action) => {
    const item = Array.isArray(action.payload) ? action.payload[0] : action.payload;

    const isItemExist = state.wish.find((i) => i._id === item._id);

    if (isItemExist) {
      state.wish = state.wish.map((i) =>
        i._id === isItemExist._id ? item : i
      );
    } else {
      state.wish = [...state.wish, item]; // ✅ Always keeps it flat
    }
    const newWish = [...state.wish]; // Force flatten and detachment
    updateWishStorage(newWish);
  });

  builder.addCase("removeFromWish", (state, action) => {
    state.wish = state.wish.filter((i) => i._id !== action.payload);
    updateWishStorage([...state.wish]);
  });

  builder.addCase("setWishFromStorage", (state, action) => {
    state.wish = Array.isArray(action.payload) ? action.payload : [];
  });
});


