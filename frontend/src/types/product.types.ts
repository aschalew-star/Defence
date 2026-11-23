import { IImage } from "./common.types";
import { ISeller } from "./seller.types";

export interface IArtisanCraftSpecs {
  cottonType?: string;
  shemmaWeight?: string;
  tibebPattern?: string;
  craftingTechnique?: string;
  careInstructions?: string;
}

export type ProductStatus = "active" | "draft" | "archived";

export interface IBulkPricing {
  minQty: number;
  discountPercentage: number;
}

export interface IFlashSale {
  isActive?: boolean;
  discountPrice?: number;
  startTime?: string | Date;
  endTime?: string | Date;
  allocatedStock?: number;
  soldCount?: number;
}

export interface IBuyerProtection {
  returnWindowDays?: number;
  moneyBackGuaranteed?: boolean;
  onTimeDeliveryDays?: number;
}

export interface IShippingTier {
  provider: string;
  estimatedDays: string;
  rateETB: number;
  freeThresholdETB?: number;
}

export interface IProduct {
  _id: string;
  name: string;
  description: string;
  category: string;
  tags?: string;
  sku?: string;
  originalPrice?: number;
  discountPrice?: number;
  usdPrice?: number;
  stock: number;
  images?: IImage[];
  featuredImage?: IImage;
  shopId: string;
  shop?: ISeller;
  sold_out?: number;
  ratings?: number;
  totalReviewsCount?: number;
  sizes?: string[];
  colors?: string[];
  materials?: string[];
  artisanCraftSpecs?: IArtisanCraftSpecs;
  bulkPricing?: IBulkPricing[];
  flashSale?: IFlashSale;
  buyerProtection?: IBuyerProtection;
  shippingTiers?: IShippingTier[];
  isCustomizable?: boolean;
  productionTime?: string;
  questionsCount?: number;
  bundleProducts?: any[];
  priceHistory?: Array<{ price: number; recordedAt: string }>;
  status?: ProductStatus;
  createdAt?: string;
}

export interface IProductFilters {
  page?: number | string;
  limit?: number | string;
  category?: string;
  keyword?: string;
  sort?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  ratings?: number | string;
}

export interface ProductsState {
  isLoading: boolean;
  allProducts: IProduct[];
  products: IProduct[];
  totalProducts: number;
  page: number;
  pages: number;
  limit: number;
  error: any;
  product?: IProduct;
  success?: boolean;
  message?: string;
}
