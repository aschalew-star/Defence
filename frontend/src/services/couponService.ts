import apiClient from "./apiClient";
import { ICoupon } from "../types";

export const couponService = {
  getShopCoupons: async (shopId: string): Promise<{ couponCodes: ICoupon[] }> => {
    const response = await apiClient.get<{ couponCodes: ICoupon[] }>(
      `/coupon/get-coupon/${shopId}`
    );
    return response.data;
  },

  createCoupon: async (payload: Partial<ICoupon>): Promise<{ coupon: ICoupon }> => {
    const response = await apiClient.post<{ coupon: ICoupon }>(
      "/coupon/create-coupon-code",
      payload
    );
    return response.data;
  },

  deleteCoupon: async (couponId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(
      `/coupon/delete-coupon/${couponId}`
    );
    return response.data;
  },
};

export default couponService;
