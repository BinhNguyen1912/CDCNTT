import {
  CreateOrdersBodyType,
  CreateOrdersResType,
  GetOrderDetailResType,
  GetOrdersQueryParamsType,
  GetOrdersResType,
  PayGuestOrdersBodyType,
  PayGuestOrdersResType,
  UpdateOrderBodyType,
  UpdateOrderResType,
} from '@/app/schemaValidations/order.schema';
import http from '@/lib/http';
import queryString from 'query-string';
const orderApiRequest = {
  getOrderList: (params: GetOrdersQueryParamsType) =>
    http.get<GetOrdersResType>('/orders?' + queryString.stringify(params)),
  updateOrder: (orderId: number, body: UpdateOrderBodyType) =>
    http.put<UpdateOrderResType>(`/orders/${orderId}`, body),
  getOrderDetail: (orderId: number) =>
    http.get<GetOrderDetailResType>(`/orders/${orderId}`),
  pay: (body: PayGuestOrdersBodyType) =>
    http.post<PayGuestOrdersResType>('/orders/pay', body),
  createOrders: (body: CreateOrdersBodyType) =>
    http.post<CreateOrdersResType>('/orders', body),
};

export default orderApiRequest; // 👈 export default
