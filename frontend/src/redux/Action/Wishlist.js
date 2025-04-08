
// add to cart
export const addToWishlist  = (data) => async (dispatch, getState) => {
    dispatch({ type: "addToWish", payload: data });
  
    const newCart = getState().Wish?.wish || []; // Ensure it's always an array
    localStorage.setItem("wishItems", JSON.stringify(newCart));
    return data;
  };
  
    
    
    // remove from cart
    export const removeFromwish = (data) => async (dispatch, getState) => {
      dispatch({
        type: "removeFromWish",
        payload: data._id,
      });
    
      // Ensure cart state is always an array before storing it
      const updatedCart = getState().Wish?.wish || [];
      localStorage.setItem("wishItems", JSON.stringify(updatedCart));
    
      return data;
    };
    
    