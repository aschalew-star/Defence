import { IAvatar, IImage } from "./common.types";

export interface IChatParticipant {
  _id: string;
  name: string;
  avatar?: IAvatar;
  email?: string;
  role?: string;
}

export interface IMessage {
  _id?: string;
  conversationId: string;
  sender: string;
  text?: string;
  images?: IImage | string;
  createdAt: string;
  seen?: boolean;
}

export interface IConversation {
  _id: string;
  members: string[];
  lastMessage?: string;
  lastMessageId?: string;
  createdAt: string;
  updatedAt: string;
  userData?: IChatParticipant;
}

export interface ISocketMessage {
  senderId: string;
  receiverId: string;
  text?: string;
  images?: any;
  conversationId?: string;
  createdAt: string;
}

export interface IOnlineUser {
  userId: string;
  socketId: string;
}
