import orderApiRequest from '@/apiRequest/order';
import {
  GetOrdersQueryParamsType,
  PayGuestOrdersBodyType,
  UpdateOrderBodyType,
} from '@/app/schemaValidations/order.schema';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useUpdateOrderMutation = () => {
  return useMutation({
    mutationFn: ({
      orderId,
      ...body
    }: UpdateOrderBodyType & { orderId: number }) =>
      orderApiRequest.updateOrder(orderId, body),
  });
};

export const useGetOrderDetail = ({
  enabled,
  orderId,
}: {
  orderId: number;
  enabled: boolean;
}) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderApiRequest.getOrderDetail(orderId),
    enabled,
  });
};

export const useGetOrderListQuery = (params: GetOrdersQueryParamsType) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => orderApiRequest.getOrderList(params),
  });
};

export const usePayGuestOrders = () => {
  return useMutation({
    mutationFn: (body: PayGuestOrdersBodyType) => orderApiRequest.pay(body),
  });
};

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: orderApiRequest.createOrders,
  });
};
