import AsyncStorage from '@react-native-async-storage/async-storage';


export const loadCartFromStorage = () => async (dispatch) => {
    try {
      const storedWish = await AsyncStorage.getItem("cartItems");
      if (storedWish) {
        dispatch({ type: "setCartFromStorage", payload: JSON.parse(storedWish) });
      }
    } catch (error) {
      console.error("Failed to load Wish from AsyncStorage", error);
    }
  };
  
  
// add to cart
export const addTocart  = (data) => async (dispatch, getState) => {
    dispatch({ type: "addToCart", payload: data });
    console.log("from addcart action",data);
  
    return data;
  };
  
    
    
    // remove from cart
    export const removeFromCart = (data) => async (dispatch, getState) => {
      dispatch({
        type: "removeFromCart",
        payload: data._id,
      });
  console.log("from removecart action",data);
    
    
      return data;
    };
    
    