
import {createReducer} from "@reduxjs/toolkit"

const initialState = {
    wish: localStorage.getItem("WishItems")
      ? JSON.parse(localStorage.getItem("WishItems"))
      : [],
  };

export const Wish = createReducer(initialState,(Builder)=>{
    Builder.addCase("addToWish", (state, action) => {
      const item = action.payload;
      const isItemExist = state.wish.find((i) => i._id === item._id);
    
      if (isItemExist) {
        state.wish = state.wish.map((i) => (i._id === isItemExist._id ? item : i));
      } else {
        state.wish.push(item);
      }
    });
    
    Builder.addCase("removeFromWish",(state,action)=>{
        state.wish = state.wish.filter((i) => i._id !== action.payload);
      
      

    })
})