import axios from "axios";
import { Dispatch } from "redux";
import { server } from "../../server";

// get all orders of user
export const getAllOrdersOfUser = (userId: string) => async (dispatch: Dispatch) => {
  if (!userId) return;
  try {
    dispatch({
      type: "getAllOrdersUserRequest",
    });

    const { data } = await axios.get(
      `${server}/order/get-all-orders/${userId}`,
      { withCredentials: true }
    );

    dispatch({
      type: "getAllOrdersUserSuccess",
      payload: data.orders,
    });
  } catch (error: any) {
    dispatch({
      type: "getAllOrdersUserFailed",
      payload: error.response?.data?.message || error.message,
    });
  }
};

// get all orders of seller
export const getAllOrdersOfShop = (shopId: string) => async (dispatch: Dispatch) => {
  if (!shopId) return;
  try {
    dispatch({
      type: "getAllOrdersShopRequest",
    });

    const { data } = await axios.get(
      `${server}/order/get-seller-all-orders/${shopId}`,
      { withCredentials: true }
    );

    dispatch({
      type: "getAllOrdersShopSuccess",
      payload: data.orders,
    });
  } catch (error: any) {
    dispatch({
      type: "getAllOrdersShopFailed",
      payload: error.response?.data?.message || error.message,
    });
  }
};

// get all orders of Admin
export const getAllOrdersOfAdmin = () => async (dispatch: Dispatch) => {
  try {
    dispatch({
      type: "adminAllOrdersRequest",
    });

    const { data } = await axios.get(`${server}/order/admin-all-orders`, {
      withCredentials: true,
    });

    dispatch({
      type: "adminAllOrdersSuccess",
      payload: data.orders,
    });
  } catch (error: any) {
    dispatch({
      type: "adminAllOrdersFailed",
      payload: error.response?.data?.message || error.message,
    });
  }
};
