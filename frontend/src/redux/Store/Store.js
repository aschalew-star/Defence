import {thunk} from "redux-thunk";
import { configureStore } from "@reduxjs/toolkit";
import { ProductReducer } from "../Reducer/Products";
import {userReducer} from "../Reducer/user"
import { Cart } from "../Reducer/Cart";
import { Wish } from "../Reducer/Wishlistreducer";
import {sellerReducer} from "../Reducer/seller"
import {orderReducer} from "../Reducer/order"
import {
eventReducer
} from "../Reducer/event"

const Store = configureStore({
  reducer: {
    products: ProductReducer,
    Cart:Cart,
    Wish:Wish,
    user:userReducer,
    seller:sellerReducer,
    order:orderReducer,
    events: eventReducer,

  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
});

export default Store;
