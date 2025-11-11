import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import messageApiRequest from '@/apiRequest/message';
import {
  SendGuestMessageType,
  MarkAsReadType,
  SendUserMessageType,
  SendAdminReplyToGuestType,
  SendAdminToGuestMessageType,
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SendGuestMessageType) =>
      messageApiRequest.sendGuestMessage(data),
    onSuccess: () => {
      // Invalidate guest conversation after sending message
      queryClient.invalidateQueries({ queryKey: ['guest-conversation'] });
    },
  });
};

/**
 * Hook để Guest lấy cuộc trò chuyện với admin
 */
export const useGetGuestConversationQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['guest-conversation'],
    queryFn: () => messageApiRequest.getGuestConversation(),
    enabled, // Chỉ chạy khi enabled
    refetchInterval: enabled ? 5000 : false, // Chỉ refetch khi enabled và tăng lên 5s
    staleTime: 3000, // Cache 3s
    gcTime: 30000, // Giữ cache 30s
  });
};

/**
 * Hook để đánh dấu tin nhắn đã đọc (Admin)
 */
export const useMarkAsReadMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MarkAsReadType) => messageApiRequest.markAsRead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['received-messages'] });
    },
  });
};

/**
 * Hook để lấy cuộc trò chuyện với một guest cụ thể
 */
export const useGetConversationWithGuestQuery = (guestId: number | null) => {
  return useQuery({
    queryKey: ['conversation', guestId],
    queryFn: () => messageApiRequest.getConversationWithGuest(guestId!),
    enabled: guestId !== null,
    refetchInterval: 5000, // Tăng lên 5s
    staleTime: 3000, // Cache 3s
    gcTime: 30000, // Giữ cache 30s
  });
};

/**
 * Hook để Admin gửi tin nhắn đến guest
 */
export const useSendMessageToGuestMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SendUserMessageType) =>
      messageApiRequest.sendMessageToGuest(data),
    onSuccess: (_, variables) => {
      // Invalidate conversation queries after sending message
      queryClient.invalidateQueries({ queryKey: ['conversation'] });
      queryClient.invalidateQueries({ queryKey: ['unread-messages'] });
      queryClient.invalidateQueries({ queryKey: ['received-messages'] });
    },
  });
};

/**
 * Hook để Admin trả lời tin nhắn của guest
 */
export const useReplyToGuestMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SendAdminReplyToGuestType) =>
      messageApiRequest.replyToGuest(data),
    onSuccess: () => {
      // Invalidate conversation queries after sending message
      queryClient.invalidateQueries({ queryKey: ['conversation'] });
      queryClient.invalidateQueries({ queryKey: ['unread-messages'] });
      queryClient.invalidateQueries({ queryKey: ['received-messages'] });
    },
  });
};

/**
 * Hook để lấy danh sách tin nhắn đã nhận (để hiển thị danh sách guests)
 */
export const useGetReceivedMessagesQuery = () => {
  return useQuery({
    queryKey: ['received-messages'],
    queryFn: () => messageApiRequest.getReceivedMessages(),
    refetchInterval: 5000, // Auto refetch mỗi 5 giây
    staleTime: 3000, // Cache 3s
    gcTime: 30000, // Giữ cache 30s
  });
};

/**
 * Hook để Admin gửi tin nhắn đến guest
 */
export const useSendAdminToGuestMessageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      guestId,
      data,
    }: {
      guestId: number;
      data: SendAdminToGuestMessageType;
    }) => messageApiRequest.sendAdminToGuestMessage(guestId, data),
    onSuccess: () => {
      // Invalidate conversation queries after sending message
      queryClient.invalidateQueries({ queryKey: ['conversation'] });
      queryClient.invalidateQueries({ queryKey: ['received-messages'] });
      queryClient.invalidateQueries({ queryKey: ['unread-messages'] });
    },
  });
};
