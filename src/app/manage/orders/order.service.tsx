import { OrderStatus } from '@/app/constants/type';
import {
  OrderObjectByGuestID,
  ServingGuestByTableNumber,
  Statics,
} from '@/app/manage/orders/order-table';
import {
  OrderDetailType,
  OrdersListResType,
} from '@/app/ValidationSchemas/order.schema';
import { useMemo } from 'react';

export const useOrderService = (orderList: OrdersListResType['data']) => {
  const result = useMemo(() => {
    const statics: Statics = {
      status: {
        CANCELLED: 0,
        PAID: 0,
        COMPLETED: 0,
        CONFIRMED: 0,
        PENDING: 0,
        PREPARING: 0,
        READY: 0,
      },
      table: {},
    };
    const orderObjectByGuestId: OrderObjectByGuestID = {};
    const guestByTableNumber: ServingGuestByTableNumber = {};
    orderList.forEach((order: OrderDetailType) => {
      statics.status[order.status] = statics.status[order.status] + 1;
      if (order.tableNode?.id !== null && order.guestId !== null) {
        if (!statics.table[order.tableNodeId!]) {
          statics.table[order.tableNodeId!] = {};
        }
        statics.table[order.tableNodeId!][order.guestId] = {
          ...statics.table[order.tableNodeId!]?.[order.guestId],
          [order.status]:
            (statics.table[order.tableNodeId!]?.[order.guestId]?.[
              order.status
            ] ?? 0) + 1,
        };
      }

      // Tính toán cho orderObjectByGuestId
      if (order.guestId) {
        if (!orderObjectByGuestId[order.guestId]) {
          orderObjectByGuestId[order.guestId] = [];
        }
        orderObjectByGuestId[order.guestId].push(order);
      }

      // Tính toán cho guestByTableNumber
      if (order.tableNode?.id && order.guestId) {
        if (!guestByTableNumber[order.tableNode.id]) {
          guestByTableNumber[order.tableNode.id] = {};
        }
        guestByTableNumber[order.tableNode.id][order.guestId] =
          orderObjectByGuestId[order.guestId];
      }
    });

    // Cần phải lọc lại 1 lần nữa mới chuẩn
    // Những guest nào mà không còn phục vụ nữa sẽ bị loại bỏ
    const servingGuestByTableNumber: ServingGuestByTableNumber = {};
    for (const tableId in guestByTableNumber) {
      const guestObject = guestByTableNumber[tableId];
      const servingGuestObject: OrderObjectByGuestID = {};
      for (const guestId in guestObject) {
        const guestOrders = guestObject[guestId];
        const isServingGuest = guestOrders.some((order) =>
          [
            OrderStatus.PENDING,
            OrderStatus.PREPARING,
            OrderStatus.COMPLETED,
          ].includes(order.status as any),
        );
        if (isServingGuest) {
          servingGuestObject[Number(guestId)] = guestOrders;
        }
      }
      if (Object.keys(servingGuestObject).length) {
        servingGuestByTableNumber[Number(tableId)] = servingGuestObject;
      }
    }
    return {
      statics,
      orderObjectByGuestId,
      servingGuestByTableNumber,
    };
  }, [orderList]);
  return result;
};
