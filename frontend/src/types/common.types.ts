/**
 * Common shared utility and infrastructure types
 */

export interface IAvatar {
  public_id?: string;
  url: string;
}

export interface IImage {
  public_id?: string;
  url: string;
  isFeatured?: boolean;
}

export interface IPagination {
  page: number;
  pages: number;
  limit: number;
  total: number;
}

export type CurrencyCode = "ETB" | "USD";

export type LanguageCode = "en" | "am" | "om" | "ti";

export interface ILanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  dir?: "ltr" | "rtl";
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  products?: T[];
  orders?: T[];
  events?: T[];
  sellers?: T[];
  users?: T[];
  totalProducts?: number;
  totalOrders?: number;
  page: number;
  pages: number;
  limit: number;
}

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string>;
}
