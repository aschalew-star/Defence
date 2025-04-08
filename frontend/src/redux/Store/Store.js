import {thunk} from "redux-thunk";
import { configureStore } from "@reduxjs/toolkit";
import { ProductReducer } from "../Reducer/Products";
import {userReducer} from "../Reducer/user"
import { Cart } from "../Reducer/Cart";
import { Wish } from "../Reducer/Wishlistreducer";
import {sellerReducer} from "../Reducer/seller"



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
