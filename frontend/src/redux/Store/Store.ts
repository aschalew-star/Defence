import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { ProductReducer } from "../Reducer/Products";
import { userReducer } from "../Reducer/user";
import { Cart } from "../Reducer/Cart";
import { Wish } from "../Reducer/Wishlistreducer";
import { sellerReducer } from "../Reducer/seller";
import { orderReducer } from "../Reducer/order";
import { eventReducer } from "../Reducer/event";

const Store = configureStore({
  reducer: {
    products: ProductReducer,
    Cart: Cart,
    Wish: Wish,
    user: userReducer,
    seller: sellerReducer,
    order: orderReducer,
    events: eventReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof Store.getState>;
export type AppDispatch = typeof Store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default Store;
