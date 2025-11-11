import http from '@/lib/http';
import {
  SendGuestMessageType,
  MarkAsReadType,
  SendUserMessageType,
  SendAdminReplyToGuestType,
  SendAdminToGuestMessageType,
  MessageResType,
  ConversationResponseType,
} from '@/app/ValidationSchemas/message.schema';

export type MessageType = {
  id: number;
  content: string;
  fromGuestId?: number;
  fromUserId?: number;
  toUserId?: number;
  readAt?: string;
  createdAt: string;
  guest?: {
    id: number;
    name: string;
    tableNode?: {
      name: string;
    };
  };
  fromUser?: {
    id: number;
    name: string;
  };
};

export type UnreadMessagesResponse = {
  messages: MessageType[];
  unreadCount: number;
};

const messageApiRequest = {
  // Guest gửi tin nhắn
  sendGuestMessage: (data: SendGuestMessageType) =>
    http.post<MessageType>('/messages/guest', data),

  // Lấy tin nhắn chưa đọc (Admin)
  getUnreadMessages: () =>
    http.get<UnreadMessagesResponse>('/messages/admin/unread'),

  // Đánh dấu đã đọc
  markAsRead: (data: MarkAsReadType) =>
    http.post<{ success: boolean }>('/messages/mark-read', data),

  // Lấy cuộc trò chuyện với một guest cụ thể
  getConversationWithGuest: (guestId: number) =>
    http.get<ConversationResponseType>(`/messages/conversation/${guestId}`),

  // Admin gửi tin nhắn đến guest
  sendMessageToGuest: (data: SendUserMessageType) =>
    http.post<MessageType>('/messages/user', data),

  // Admin trả lời tin nhắn của guest
  replyToGuest: (data: SendAdminReplyToGuestType) =>
    http.post<MessageType>('/messages/admin/reply-to-guest', data),

  // Lấy danh sách tin nhắn đã nhận (để hiển thị danh sách guests)
  getReceivedMessages: () =>
    http.get<ConversationResponseType>('/messages/received'),

  // Guest lấy cuộc trò chuyện với admin
  getGuestConversation: () =>
    http.get<ConversationResponseType>('/messages/guest-conversation'),

  // Admin gửi tin nhắn đến guest
  sendAdminToGuestMessage: (
    guestId: number,
    data: SendAdminToGuestMessageType,
  ) => http.post<MessageResType>(`/messages/admin-to-guest/${guestId}`, data),
};

export default messageApiRequest;
