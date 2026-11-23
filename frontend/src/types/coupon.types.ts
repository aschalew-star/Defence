export type CouponDiscountType = "percentage" | "fixed";

export interface ICoupon {
  _id: string;
  code: string;
  title?: string;
  description?: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageCount?: number;
  endDate: string;
  isActive?: boolean;
  shop?: string;
  createdAt?: string;
}
