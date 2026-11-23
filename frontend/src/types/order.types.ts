import { IImage } from "./common.types";
import { ISeller } from "./seller.types";
import { IUser } from "./user.types";

export interface ICartItem {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  originalPrice?: number;
  discountPrice?: number;
  stock?: number;
  images?: IImage[];
  featuredImage?: IImage;
  shopId?: string;
  shop?: ISeller;
  shopName?: string;
  qty: number;
  size?: string;
  selectedSize?: string;
  selectedColor?: string;
  isReviewed?: boolean;
}

export type OrderStatus =
  | "Processing"
  | "Tailoring & Handweaving"
  | "Quality Checked"
  | "Transferred to delivery partner"
  | "Out for delivery"
  | "Delivered"
  | "Delivered - Pending Inspection"
  | "Cancelled"
  | "Refund Success"
  | "Processing refund"
  | "Transit"
  | "Shipping"
  | "On the way"
  | "Pending";

export interface IOrderShippingAddress {
  country: string;
  city: string;
  subCity?: string;
  woreda?: string;
  address1: string;
  address2?: string;
  zipCode?: string | number;
  phoneNumber?: string | number;
}

export interface IOrderPaymentInfo {
  id?: string;
  status?: string;
  type?: string;
  tx_ref?: string;
}

export interface ITrackingEvent {
  status: string;
  location?: string;
  timestamp: string | Date;
  note?: string;
}

export interface IOrderTrackingDetails {
  waybillNumber?: string;
  carrierName?: string;
  carrierPhone?: string;
  trackingEvents?: ITrackingEvent[];
}

export interface IOrderBuyerProtection {
  protectionStatus?: "Active" | "Claimed" | "Resolved" | "Expired";
  autoConfirmDeadline?: string | Date;
  returnWindowDays?: number;
}

export interface ISubOrderFinancials {
  subTotal: number;
  shippingFee: number;
  platformCommissionRate: number;
  platformFeeAmount: number;
  merchantNetEarnings: number;
  payoutStatus: "Pending Escrow" | "Eligible for Payout" | "Paid" | "Refunded" | "Disputed";
  payoutReference?: string;
}

export interface ISubOrderMilestones {
  confirmedAt?: string | Date;
  inProductionAt?: string | Date;
  dispatchedAt?: string | Date;
  deliveredAt?: string | Date;
}

export interface ISubOrder {
  _id: string;
  subOrderNumber: string;
  parentOrder: string | IOrder;
  parentOrderNumber?: string;
  shopId: string;
  shop?: ISeller;
  items: ICartItem[];
  itemsTotal: number;
  shippingFee: number;
  subTotal: number;
  status: OrderStatus;
  deliveryOtp?: string;
  deliveryProvider?: string;
  trackingCode?: string;
  financials?: ISubOrderFinancials;
  milestones?: ISubOrderMilestones;
  shippingAddress?: IOrderShippingAddress;
  paymentInfo?: IOrderPaymentInfo;
  paidAt?: string;
  deliveredAt?: string;
  createdAt?: string;
}

export interface IOrder {
  _id: string;
  orderNumber?: string;
  subOrderNumber?: string;
  subOrders?: ISubOrder[] | string[];
  couponCode?: string;
  discountAmount?: number;
  cart: ICartItem[];
  shippingAddress: IOrderShippingAddress;
  user: IUser;
  totalPrice: number;
  subTotal?: number;
  shipping?: number;
  shippingPrice?: number;
  shippingTotal?: number;
  discountTotal?: number;
  walletAmountApplied?: number;
  coinsRedeemed?: number;
  coinsDiscount?: number;
  financials?: {
    subTotal?: number;
    shippingFee?: number;
    platformCommissionRate?: number;
    platformFeeAmount?: number;
    merchantNetEarnings?: number;
    payoutStatus?: string;
  };
  giftOptions?: {
    isGift?: boolean;
    giftMessage?: string;
    giftWrapping?: boolean;
    hidePrice?: boolean;
  };
  status: OrderStatus;
  statusHistory?: Array<{
    status: string;
    timestamp: string | Date;
    note?: string;
    updatedBy?: string;
  }>;
  paymentInfo?: IOrderPaymentInfo;
  paidAt?: string;
  deliveredAt?: string;
  deliveryOtp?: string;
  deliveryProvider?: string;
  trackingCode?: string;
  deliveryNotes?: string;
  refundReason?: string;
  disputeReason?: string;
  disputeDetails?: string;
  trackingDetails?: IOrderTrackingDetails;
  buyerProtection?: IOrderBuyerProtection;
  deliveryVerification?: {
    deliveryOtp?: string;
    isOtpVerified?: boolean;
    verifiedAt?: string;
    verifiedBy?: string;
    preShipmentProof?: {
      photoUrl?: string;
      note?: string;
      uploadedAt?: string;
    };
  };
  deliveryDetails?: {
    provider?: string;
    trackingCode?: string;
    estimatedDelivery?: string;
    estimatedDeliveryDate?: string | Date;
    deliveryNotes?: string;
  };
  preShipmentProof?: {
    photo?: {
      url: string;
      public_id?: string;
    };
    notes?: string;
    uploadedAt?: string;
  };
  customMeasurements?: {
    bust?: string;
    waist?: string;
    hips?: string;
    length?: string;
    height?: string;
    heightOrLength?: string;
    notes?: string;
    additionalInstructions?: string;
    [key: string]: any;
  };
  createdAt?: string;
}

export interface CartState {
  cart: ICartItem[];
}

export interface WishState {
  wish: any[];
}

export interface OrderState {
  isLoading: boolean;
  orders: IOrder[];
  adminOrders?: IOrder[];
  adminOrderLoading?: boolean;
  error?: any;
}
