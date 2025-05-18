import {thunk} from "redux-thunk";
import { configureStore } from "@reduxjs/toolkit";
import { ProductReducer } from "./reducer/Products";
import {userReducer} from "./reducer/User"
import { Cart } from "./reducer/Cart";
import { Wish } from "./reducer/Wishlist";
import {sellerReducer} from "./reducer/seller"



const Store = configureStore({
  reducer: {
    products: ProductReducer,
    Cart:Cart,
    Wish:Wish,
    user:userReducer,
    seller:sellerReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
});

export default Store;
