import { Dispatch } from "redux";

// add to wishlist
export const addToWishlist = (data: any) => async (dispatch: Dispatch, getState: () => any) => {
  dispatch({ type: "addToWish", payload: data });

  const newWish = getState().Wish?.wish || []; // Ensure it's always an array
  localStorage.setItem("wishItems", JSON.stringify(newWish));
  return data;
};

// remove from wishlist
export const removeFromwish = (data: { _id: string }) => async (dispatch: Dispatch, getState: () => any) => {
  dispatch({
    type: "removeFromWish",
    payload: data._id,
  });

  const updatedWish = getState().Wish?.wish || [];
  localStorage.setItem("wishItems", JSON.stringify(updatedWish));

  return data;
};
