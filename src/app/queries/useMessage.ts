import { useMutation, useQuery } from '@tanstack/react-query';
import messageApiRequest from '@/apiRequest/message';
import {
  SendGuestMessageType,
  MarkAsReadType,
} from '@/app/ValidationSchemas/message.schema';

/**
 * Hook để lấy danh sách tin nhắn chưa đọc (Admin)
 */
export const useGetUnreadMessagesQuery = () => {
  return useQuery({
    queryKey: ['unread-messages'],
    queryFn: () => messageApiRequest.getUnreadMessages(),
    refetchInterval: 3000, // Auto refetch mỗi 3 giây
  });
};

/**
 * Hook để Guest gửi tin nhắn
 */
export const useSendGuestMessageMutation = () => {
  return useMutation({
    mutationFn: (data: SendGuestMessageType) =>
      messageApiRequest.sendGuestMessage(data),
  });
};

/**
 * Hook để đánh dấu tin nhắn đã đọc (Admin)
 */
export const useMarkAsReadMutation = () => {
  return useMutation({
    mutationFn: (data: MarkAsReadType) => messageApiRequest.markAsRead(data),
  });
};
