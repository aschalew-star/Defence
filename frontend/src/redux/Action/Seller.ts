import axios from "axios";
import { Dispatch } from "redux";
import { server } from "../../server";

// get all sellers --- admin
export const getAllSellers = () => async (dispatch: Dispatch) => {
  try {
    dispatch({
      type: "getAllSellersRequest",
    });

    const { data } = await axios.get(`${server}/shop/admin-all-sellers`, {
      withCredentials: true,
    });

    dispatch({
      type: "getAllSellersSuccess",
      payload: data.sellers,
    });
  } catch (error: any) {
    dispatch({
      type: "getAllSellerFailed",
      payload: error.response?.data?.message || error.message,
    });
  }
};
