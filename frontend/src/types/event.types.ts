import { IImage } from "./common.types";
import { ISeller } from "./seller.types";

export interface IEvent {
  _id: string;
  name: string;
  description: string;
  category: string;
  start_Date: string;
  Finish_Date: string;
  status?: string;
  tags?: string;
  originalPrice?: number;
  discountPrice?: number;
  stock: number;
  images?: IImage[];
  featuredImage?: IImage;
  shopId: string;
  shop?: ISeller;
  sold_out?: number;
  createdAt?: string;
}

export interface EventState {
  isLoading: boolean;
  allEvents?: IEvent[];
  events?: IEvent[];
  event?: IEvent;
  error?: any;
  success?: boolean;
  message?: string;
}
