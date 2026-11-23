/**
 * AliExpress-Grade Marketplace Enterprise Feature Types
 */

export interface IWalletTransaction {
  _id?: string;
  transactionType:
    | "topup"
    | "purchase_debit"
    | "refund_credit"
    | "cashback"
    | "referral_reward"
    | "coins_redemption"
    | "dispute_settlement";
  amount: number;
  coinsChange?: number;
  referenceId?: string;
  orderId?: string;
  description: string;
  status: "completed" | "pending" | "failed";
  createdAt: string;
}

export interface IWallet {
  balance: number;
  currency: string;
  loyaltyCoins: number;
  recentTransactions?: IWalletTransaction[];
}

export interface INotification {
  _id: string;
  recipient: string;
  recipientType: "user" | "seller" | "admin";
  title: string;
  message: string;
  type:
    | "order_update"
    | "price_drop"
    | "flash_deal"
    | "qa_reply"
    | "wallet_credit"
    | "review_reply"
    | "system_notice"
    | "dispute_update";
  referenceId?: string;
  referenceUrl?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface IProductAnswer {
  _id?: string;
  responder: string;
  responderType: "merchant" | "admin" | "buyer";
  responderName: string;
  answer: string;
  isVerifiedSeller: boolean;
  createdAt: string;
}

export interface IProductQA {
  _id: string;
  product: string;
  shop: string;
  user: string;
  userName: string;
  userAvatar?: string;
  question: string;
  answers: IProductAnswer[];
  helpfulVotes: number;
  status: "published" | "pending" | "hidden";
  createdAt: string;
}

export interface IBundleDeal {
  _id?: string;
  title: string;
  description?: string;
  products: any[];
  discountPercentage: number;
  isActive: boolean;
  createdAt?: string;
}

export interface IReferralStats {
  referralCode: string;
  referralLink: string;
  totalReferred: number;
  referredUsers: Array<{ _id: string; name: string; createdAt: string }>;
  loyaltyCoins: number;
  rewardPerReferralCoins: number;
}

export interface IDisputeEvidence {
  public_id?: string;
  url: string;
  description?: string;
  uploadedBy?: "customer" | "merchant" | "admin";
  uploadedAt?: string;
}

export interface IDisputeMessage {
  _id?: string;
  senderType: "customer" | "merchant" | "admin";
  senderName: string;
  message: string;
  attachments?: string[];
  createdAt: string;
}

export interface IDispute {
  _id: string;
  disputeNumber: string;
  parentOrder: string | any;
  subOrder?: string | any;
  customer: string | any;
  shop: string | any;
  reason: string;
  details?: string;
  requestedResolution: "Full Refund" | "Partial Refund" | "Replacement" | "Return & Refund";
  status:
    | "Open"
    | "Merchant Responded"
    | "Under Admin Review"
    | "Resolved - Full Refund"
    | "Resolved - Partial Refund"
    | "Resolved - Rejected"
    | "Closed";
  evidence?: IDisputeEvidence[];
  messages?: IDisputeMessage[];
  arbitrationDetails?: {
    resolvedBy?: string;
    resolvedAt?: string;
    resolutionNote?: string;
    refundedAmount?: number;
  };
  createdAt: string;
}

export interface IReturnClaim {
  _id: string;
  returnNumber: string;
  order: string | any;
  subOrder?: string | any;
  shop: string | any;
  user: string | any;
  items: any[];
  reason: string;
  status:
    | "Requested"
    | "Approved"
    | "Item Shipped"
    | "Item Received"
    | "Inspected"
    | "Refunded"
    | "Rejected";
  refundAmount?: number;
  trackingNumber?: string;
  createdAt: string;
}

export interface ISellerScoreMetrics {
  onTimeDispatchRate: number;
  disputeRate: number;
  returnRate: number;
  reviewScore: number;
  responseTimeHours: number;
}

export interface ISellerScore {
  _id?: string;
  shop: string | any;
  metrics: ISellerScoreMetrics;
  overallScore: number;
  tier: string;
  badges: string[];
  lastCalculatedAt?: string;
}

export interface IPromotion {
  _id: string;
  title: string;
  description?: string;
  bannerImage?: { public_id?: string; url: string };
  discountType: "percentage" | "fixed_amount";
  discountValue: number;
  startDate: string;
  endDate: string;
  applicableProducts?: string[];
  applicableCategories?: string[];
  isActive: boolean;
}

export interface ILedgerEntry {
  _id: string;
  shop: string | any;
  shopId: string;
  entryType:
    | "ESCROW_HOLD"
    | "ESCROW_RELEASE"
    | "COMMISSION_DEDUCTION"
    | "PAYOUT_REQUEST"
    | "PAYOUT_COMPLETED"
    | "PAYOUT_REJECTED"
    | "REFUND_DEBIT"
    | "DISPUTE_HOLD";
  amount: number;
  balanceType: "pendingBalance" | "availableBalance" | "escrowVault";
  balanceBefore: number;
  balanceAfter: number;
  parentOrder?: string;
  subOrder?: string;
  referenceCode?: string;
  description: string;
  createdAt: string;
}
