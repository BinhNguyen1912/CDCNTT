import { useMutation, useQuery } from '@tanstack/react-query';
import orderApiRequest from '@/apiRequest/order';
import {
  OrderQueryType,
  GuestCreateNewOrderType,
  OrdersListResType,
  UpdateOrderType,
} from '@/app/ValidationSchemas/order.schema';

export const useGetOrderListQuery = (params?: OrderQueryType) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => orderApiRequest.getOrdersList(params),
    enabled: true,
  });
};

export const useGetOrderDetailQuery = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['order-detail', id],
    queryFn: () => orderApiRequest.getOrderDetail(id),
    enabled: enabled && !!id,
  });
};

export const useUpdateOrderMutation = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateOrderType }) =>
      orderApiRequest.updateOrder(id, data),
  });
};

export const useCreateGuestOrderMutation = () => {
  return useMutation({
    mutationFn: (data: GuestCreateNewOrderType) =>
      orderApiRequest.createGuestOrder(data),
  });
};

export const useCreateOrderForGuestMutation = () => {
  return useMutation({
    mutationFn: ({
      guestId,
      orders,
    }: {
      guestId: number;
      orders: GuestCreateNewOrderType;
    }) => orderApiRequest.createOrderForGuest(guestId, orders),
  });
};

export const usePayOrdersByGuestMutation = () => {
  return useMutation({
    mutationFn: (guestId: number) => orderApiRequest.payOrdersByGuest(guestId),
  });
};
