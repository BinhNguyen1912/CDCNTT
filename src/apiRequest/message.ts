import http from '@/lib/http';
import {
  SendGuestMessageType,
  MarkAsReadType,
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
};

export default messageApiRequest;
