import { IAvatar } from "./common.types";

export type VerificationStatus = "Pending" | "Verified" | "Rejected";
export type PayoutType = "telebirr" | "bank_transfer";
export type SellerTier = "Standard Artisan" | "Verified Guild" | "Gold Merchant" | "Top Rated Master Artisan";

export interface IPayoutMethod {
  _id?: string;
  type: PayoutType;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  isDefault?: boolean;
}

export interface ISeller {
  _id: string;
  name: string;
  email: string;
  phoneNumber: number | string;
  avatar?: IAvatar;
  role: "seller";
  sellerTier?: SellerTier;
  fulfillmentRate?: number;
  averageDispatchHours?: number;
  status?: string;
  stateOrRegion?: string;
  description?: string;
  address?: string;
  city?: string;
  subCity?: string;
  woreda?: string;
  landmark?: string;
  zipCode?: number | string;
  tinNumber?: string;
  businessRegistrationNumber?: string;
  businessType?: string;
  legalOwnerName?: string;
  legalBusinessName?: string;
  idType?: string;
  idNumber?: string;
  tradeLicenseUrl?: string;
  idCardUrl?: string;
  isVerified?: boolean;
  verificationStatus?: VerificationStatus;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  trustBadge?: string;
  trustScore?: number;
  commissionRate?: number;
  availableBalance?: number;
  pendingBalance?: number;
  totalWithdrawn?: number;
  artisanLineage?: string;
  craftSpecialization?: string[];
  vatRegistered?: boolean;
  totRegistered?: boolean;
  payoutMethods?: IPayoutMethod[];
  withdrawMethod?: {
    bankName?: string;
    bankAccountNumber?: string;
    bankHolderName?: string;
  };
  shippingSettings?: {
    handlingDays?: number;
    localExpressAvailable?: boolean;
    freeShippingMinOrder?: number;
    enableCustomShipping?: boolean;
    preferredCourier?: string;
    estimatedDeliveryDaysMin?: number;
    estimatedDeliveryDaysMax?: number;
    addisAbabaRate?: number;
    regionalRate?: number;
    internationalRate?: number;
  };
  socialLinks?: {
    telegram?: string;
    instagram?: string;
    tiktok?: string;
    facebook?: string;
    phoneWhatsApp?: string;
  };
  coverBanner?: {
    public_id?: string;
    url?: string;
  };
  returnPolicy?: string;
  businessLicense?: {
    public_id?: string;
    url?: string;
  };
  idCard?: {
    public_id?: string;
    url?: string;
  };
  badge?: string;
  followersCount?: number;
  vacationMode?: {
    isActive: boolean;
    message?: string;
    returnDate?: string | null;
  };
  bundleDeals?: any[];
  createdAt?: string;
}

export interface SellerState {
  isLoading: boolean;
  isSeller?: boolean;
  seller?: ISeller | null;
  sellers?: ISeller[];
  error?: any;
}
