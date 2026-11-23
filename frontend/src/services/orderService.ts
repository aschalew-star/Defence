import apiClient from "./apiClient";
import { IOrder } from "../types";

export const orderService = {
  getUserOrders: async (userId: string): Promise<{ orders: IOrder[] }> => {
    const response = await apiClient.get<{ orders: IOrder[] }>(
      `/order/get-all-orders/${userId}`
    );
    return response.data;
  },

  getShopOrders: async (shopId: string): Promise<{ orders: IOrder[] }> => {
    const response = await apiClient.get<{ orders: IOrder[] }>(
      `/order/get-seller-all-orders/${shopId}`
    );
    return response.data;
  },

  updateOrderStatus: async (
    orderId: string,
    status: string,
    deliveryOtp?: string
  ): Promise<{ order: IOrder }> => {
    const response = await apiClient.put<{ order: IOrder }>(
      `/order/update-order-status/${orderId}`,
      { status, deliveryOtp }
    );
    return response.data;
  },
};

export default orderService;
