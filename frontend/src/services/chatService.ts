import apiClient from "./apiClient";
import { IConversation, IMessage } from "../types";

export const chatService = {
  getUserConversations: async (userId: string): Promise<{ conversations: IConversation[] }> => {
    const response = await apiClient.get<{ conversations: IConversation[] }>(
      `/conversation/get-all-conversation-user/${userId}`
    );
    return response.data;
  },

  getSellerConversations: async (sellerId: string): Promise<{ conversations: IConversation[] }> => {
    const response = await apiClient.get<{ conversations: IConversation[] }>(
      `/conversation/get-all-conversation-seller/${sellerId}`
    );
    return response.data;
  },

  getMessages: async (conversationId: string): Promise<{ messages: IMessage[] }> => {
    const response = await apiClient.get<{ messages: IMessage[] }>(
      `/message/get-all-messages/${conversationId}`
    );
    return response.data;
  },

  sendMessage: async (messageData: {
    conversationId: string;
    sender: string;
    text?: string;
    images?: any;
  }): Promise<{ message: IMessage }> => {
    const response = await apiClient.post<{ message: IMessage }>(
      "/message/create-new-message",
      messageData
    );
    return response.data;
  },

  updateLastMessage: async (
    conversationId: string,
    lastMessage: string,
    lastMessageId: string
  ): Promise<void> => {
    await apiClient.put(`/conversation/update-last-message/${conversationId}`, {
      lastMessage,
      lastMessageId,
    });
  },
};

export default chatService;
