import AsyncStorage from '@react-native-async-storage/async-storage';

// Thunk: Load wish list from AsyncStorage
export const loadWishFromStorage = () => async (dispatch) => {
  try {
    const storedWish = await AsyncStorage.getItem("WishItems");
    if (storedWish) {
      const parsed = JSON.parse(storedWish);
      dispatch({
        type: "setWishFromStorage",
        payload: Array.isArray(parsed) ? parsed : [],
      });
    }
  } catch (error) {
    console.error("Failed to load Wish from AsyncStorage", error);
  }
};


 

  
  
// add to cart
export const addToWishlist  = (data) => async (dispatch, getState) => {
    dispatch({ type: "addToWish", payload: data });
  console.log("from addwishliast action",data);
    return data;
  };
  
    
    
    // remove from cart
    export const removeFromwish = (data) => async (dispatch, getState) => {
      dispatch({
        type: "removeFromWish",
        payload: data._id,
      });

  console.log("from removewishliast action",data);

    
    
      return data;
    };
    
    