import { IAvatar, IImage } from "./common.types";

export interface IReview {
  _id: string;
  user?: {
    _id: string;
    name: string;
    avatar?: IAvatar;
  };
  userData?: {
    _id?: string;
    name?: string;
    avatar?: IAvatar;
    email?: string;
  };
  isVerifiedPurchase?: boolean;
  productRef?: {
    _id: string;
    name: string;
    images?: IImage[];
    discountPrice?: number;
  };
  rating: number;
  comment: string;
  images?: IImage[];
  merchantReply?: {
    comment: string;
    repliedAt: string;
  };
  createdAt?: string;
}
