import { createReducer } from "@reduxjs/toolkit";

const getInitialWishlist = () => {
  try {
    const stored = localStorage.getItem("wishItems");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const initialState = {
  wish: getInitialWishlist(),
};

export const Wish = createReducer(initialState, (Builder) => {
  Builder.addCase("addToWish", (state, action) => {
    const item = action.payload;
    if (!state.wish) state.wish = [];
    const isItemExist = state.wish.find((i) => i._id === item._id);

    if (isItemExist) {
      state.wish = state.wish.map((i) =>
        i._id === isItemExist._id ? item : i
      );
    } else {
      state.wish.push(item);
    }
  });

  Builder.addCase("removeFromWish", (state, action) => {
    if (!state.wish) state.wish = [];
    state.wish = state.wish.filter((i) => i._id !== action.payload);
  });
});
