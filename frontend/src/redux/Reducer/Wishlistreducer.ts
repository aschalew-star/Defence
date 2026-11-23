import { createReducer } from "@reduxjs/toolkit";

const getInitialWishlist = (): any[] => {
  try {
    const stored = localStorage.getItem("wishItems");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export interface WishState {
  wish: any[];
}

const initialState: WishState = {
  wish: getInitialWishlist(),
};

export const Wish = createReducer(initialState, (Builder) => {
  Builder.addCase("addToWish", (state, action: any) => {
    const item = action.payload;
    if (!state.wish) state.wish = [];
    const isItemExist = state.wish.find((i: any) => i._id === item._id);

    if (isItemExist) {
      state.wish = state.wish.map((i: any) =>
        i._id === isItemExist._id ? item : i
      );
    } else {
      state.wish.push(item);
    }
  });

  Builder.addCase("removeFromWish", (state, action: any) => {
    if (!state.wish) state.wish = [];
    state.wish = state.wish.filter((i: any) => i._id !== action.payload);
  });
});
