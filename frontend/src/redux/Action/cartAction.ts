import { Dispatch } from "redux";
import { ICartItem } from "../../types";

// add to cart
export const addTocart = (data: ICartItem) => async (dispatch: Dispatch, getState: () => any) => {
  dispatch({ type: "addToCart", payload: data });

  const newCart = getState().Cart?.cart || []; // Ensure it's always an array
  localStorage.setItem("cartItems", JSON.stringify(newCart));
  return data;
};

// remove from cart
export const removeFromCart = (data: { _id: string }) => async (dispatch: Dispatch, getState: () => any) => {
  dispatch({
    type: "removeFromCart",
    payload: data._id,
  });

  // Ensure cart state is always an array before storing it
  const updatedCart = getState().Cart?.cart || [];
  localStorage.setItem("cartItems", JSON.stringify(updatedCart));

  return data;
};
