
// add to cart
export const addTocart  = (data) => async (dispatch, getState) => {
  dispatch({ type: "addToCart", payload: data });

  const newCart = getState().Cart?.cart || []; // Ensure it's always an array
  localStorage.setItem("cartItems", JSON.stringify(newCart));
  return data;
};

  
  
  // remove from cart
  export const removeFromCart = (data) => async (dispatch, getState) => {
    dispatch({
      type: "removeFromCart",
      payload: data._id,
    });
  
    // Ensure cart state is always an array before storing it
    const updatedCart = getState().Cart?.cart || [];
    localStorage.setItem("cartItems", JSON.stringify(updatedCart));
  
    return data;
  };
  
  