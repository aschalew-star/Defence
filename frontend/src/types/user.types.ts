import { IAvatar, LanguageCode } from "./common.types";

export type UserRole = "user" | "admin" | "superadmin";

export interface IAddress {
  _id?: string;
  country: string;
  city: string;
  subCity?: string;
  woreda?: string;
  address1: string;
  address2?: string;
  zipCode?: number | string;
  addressType?: string;
}

export interface IUserCustomMeasurements {
  bust?: string;
  waist?: string;
  hips?: string;
  length?: string;
  height?: string;
  shoulders?: string;
  notes?: string;
  [key: string]: any;
}

export interface IShoppingPreferences {
  favoriteCategories?: string[];
  preferredSizing?: string;
  isDiaspora?: boolean;
  preferredCurrency?: string;
  preferredDeliveryCity?: string;
  preferredLanguage?: LanguageCode;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: number | string;
  role: UserRole;
  avatar?: IAvatar;
  addresses?: IAddress[];
  customMeasurements?: IUserCustomMeasurements;
  shoppingPreferences?: IShoppingPreferences;
  loyaltyCoins?: number;
  referralCode?: string;
  googleId?: string;
  authProvider?: "local" | "google";
  followedShops?: string[];
  wallet?: any;
  createdAt?: string;
}

export interface UserState {
  isAuthenticated: boolean;
  loading: boolean;
  user?: IUser | null;
  error?: any;
  addressloading?: boolean;
  successMessage?: string | null;
  usersLoading?: boolean;
  users?: IUser[];
}
