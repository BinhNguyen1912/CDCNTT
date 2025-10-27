// import {
//   CreateOrdersBodyType,
//   CreateOrdersResType,
//   GetOrderDetailResType,
//   GetOrdersQueryParamsType,
//   GetOrdersResType,
//   PayGuestOrdersBodyType,
//   PayGuestOrdersResType,
//   UpdateOrderBodyType,
//   UpdateOrderResType,
// } from '@/app/SchemaModel/order.schema';
import {
  GuestCreateNewOrderType,
  OrderType,
  OrderQueryType,
  OrderDetailType,
  OrdersListResType,
  OrderResType,
  UpdateOrderType,
  UpdateOrderResType,
} from '@/app/ValidationSchemas/order.schema';
import http from '@/lib/http';
const prefix = '/orders';
const orderApiRequest = {
  createGuestOrder: (body: GuestCreateNewOrderType) =>
    http.post<OrderResType>('guest/new-order', body),
  createOrderForGuest: (guestId: number, body: GuestCreateNewOrderType) =>
    http.post<OrderResType>(`orders/create-order-for-guest/${guestId}`, body),
  updateOrder: (id: number, body: UpdateOrderType) =>
    http.put<UpdateOrderResType>(`orders/${id}`, body),
  getOrdersList: (params?: OrderQueryType) => {
    if (!params) return http.get<OrdersListResType>('orders');

    console.log('Order API params:', params);
    console.log('fromDate:', params.fromDate);
    console.log('toDate:', params.toDate);

    // Gửi theo schema backend - 4 trường bắt buộc: page, limit, fromDate, toDate
    const body: any = {
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search,
      status: params.status,
      type: params.type,
      tableNodeId: params.tableNodeId,
    };

    // Xử lý fromDate và toDate
    if (params.fromDate) {
      body.fromDate =
        params.fromDate instanceof Date
          ? params.fromDate.toISOString()
          : params.fromDate;
    }
    if (params.toDate) {
      body.toDate =
        params.toDate instanceof Date
          ? params.toDate.toISOString()
          : params.toDate;
    }
    if (params.createdAt) {
      body.createdAt =
        params.createdAt instanceof Date
          ? params.createdAt.toISOString()
          : params.createdAt;
    }
    if (params.updatedAt) {
      body.updatedAt =
        params.updatedAt instanceof Date
          ? params.updatedAt.toISOString()
          : params.updatedAt;
    }

    console.log('Order API body:', body);
    console.log('fromDate string:', body.fromDate);
    console.log('toDate string:', body.toDate);

    return http.post<OrdersListResType>('/orders/lists', body);
  },
  getOrderDetail: (id: number) =>
    http.get<OrdersListResType['data']>(`${prefix}/${id}`),

  payOrdersByGuest: (guestId: number) =>
    http.get<{ payload: OrderDetailType[] }>(
      `${prefix}/pay-orders-by-guest/${guestId}`,
    ),
};

export default orderApiRequest;
