/* eslint-disable @typescript-eslint/no-unused-expressions */
'use client';
import { OrderStatus } from '@/app/constants/type';
// import { usePayGuestOrders } from '@/app/queries/useOrder';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  OrderStatusIcon,
  formatCurrency,
  formatDateTimeToLocaleString,
  formatDateTimeToTimeString,
  getVietnameseOrderStatus,
  handleErrorApi,
} from '@/lib/utils';
import {
  ALargeSmall,
  Check,
  ConciergeBell,
  CookingPot,
  HandCoins,
  Loader,
} from 'lucide-react';
import Image from 'next/image';
import { Fragment } from 'react';
import { OrdersListResType } from '@/app/ValidationSchemas/order.schema';
import { usePayOrdersByGuestMutation } from '@/app/queries/useOrder';
import { toast } from 'react-toastify';

type Guest = OrdersListResType['data'][0]['guest'];
type Orders = OrdersListResType['data'];
export default function OrderGuestDetail({
  guest,
  orders,
  refetch,
}: {
  guest?: Guest;
  orders?: Orders;
  refetch?: () => void;
}) {
  const safeGuest = guest!;
  const safeOrders = orders!;

  const ordersFilterToPurchase = safeGuest
    ? safeOrders.filter(
        (order) =>
          order.status !== OrderStatus.COMPLETED &&
          order.status !== OrderStatus.CANCELLED,
      )
    : [];
  const purchasedOrderFilter = safeGuest
    ? safeOrders.filter((order) => order.status === OrderStatus.COMPLETED)
    : [];

  const usePayForGuest = usePayOrdersByGuestMutation();

  const pay = async () => {
    if (usePayForGuest.isPending || !safeGuest) return;
    try {
      const result = await usePayForGuest.mutateAsync(safeGuest.id);

      // Show success toast
      toast.success(
        `Đã thanh toán thành công ${ordersFilterToPurchase.length} đơn hàng cho khách ${safeGuest.name}!`,
        {
          hideProgressBar: true,
          autoClose: 3000,
        },
      );

      // Refresh orders list
      if (refetch) {
        await refetch();
        toast.info('Đang làm mới dữ liệu...', {
          autoClose: 1000,
        });
      }
    } catch (error) {
      handleErrorApi({ error });
    }
  };
  return (
    <div className="space-y-2 text-sm">
      {safeGuest && (
        <Fragment>
          <div className="space-x-1">
            <span className="font-semibold">Tên:</span>
            <span>{safeGuest.name}</span>
            <span className="font-semibold">(#{safeGuest.id})</span>
            <span>|</span>
            <span className="font-semibold">Tên bàn:</span>
            <span>{safeGuest.tableNode?.name}</span>
          </div>
        </Fragment>
      )}

      <div className="space-y-1">
        <div className="font-semibold">Đơn hàng:</div>
        {safeOrders.map((order, index) => {
          // Kiểm tra nếu order không có items hoặc items rỗng
          if (!order.items || order.items.length === 0) {
            return (
              <div key={order.id} className="flex gap-2 items-center text-xs">
                <span className="w-[10px]">{index + 1}</span>
                <span>Không có sản phẩm</span>
              </div>
            );
          }

          const firstItem = order.items[0];
          const productImages = firstItem.product?.images || [];
          const defaultImage = firstItem.image || '/placeholder.png';

          return (
            <div key={order.id} className="flex gap-2 items-center text-xs">
              <span className="w-[10px]">{index + 1}</span>
              <span title={getVietnameseOrderStatus(order.status)}>
                {order.status === OrderStatus.PENDING && (
                  <Loader className="w-4 h-4" />
                )}
                {order.status === OrderStatus.CONFIRMED && (
                  <ConciergeBell className="w-4 h-4" />
                )}
                {order.status === OrderStatus.CANCELLED && (
                  <ALargeSmall className="w-4 h-4 text-red-400" />
                )}
                {order.status === OrderStatus.PREPARING && (
                  <CookingPot className="w-4 h-4 text-red-400" />
                )}
                {order.status === OrderStatus.COMPLETED && (
                  <Check className="w-4 h-4 text-red-400" />
                )}
                {order.status === OrderStatus.PAID && (
                  <OrderStatusIcon.PAID className="w-4 h-4 text-yellow-400" />
                )}
              </span>
              <Image
                src={productImages[0] || defaultImage}
                alt={firstItem.productName}
                title={firstItem.productName}
                width={30}
                height={30}
                className="h-[30px] w-[30px] rounded object-cover"
              />
              <span
                className="truncate w-[70px] sm:w-[100px]"
                title={firstItem.productName}
              >
                {firstItem.productName}-{firstItem.skuValue}
              </span>
              <span
                className="font-semibold"
                title={`Tổng: ${firstItem.quantity}`}
              >
                x{firstItem.quantity}
              </span>
              <span className="italic">
                {formatCurrency(firstItem.quantity * firstItem.skuPrice)}
              </span>
              <span
                className="hidden sm:inline"
                title={`Tạo: ${formatDateTimeToLocaleString(
                  order.createdAt,
                )} | Cập nhật: ${formatDateTimeToLocaleString(order.updatedAt)}
          `}
              >
                {formatDateTimeToLocaleString(order.createdAt)}
              </span>
              <span
                className="sm:hidden"
                title={`Tạo: ${formatDateTimeToLocaleString(
                  order.createdAt,
                )} | Cập nhật: ${formatDateTimeToLocaleString(order.updatedAt)}
          `}
              >
                {formatDateTimeToTimeString(order.createdAt)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="space-x-1">
        <span className="font-semibold">Chưa thanh toán:</span>
        <Badge>
          <span>
            {formatCurrency(
              ordersFilterToPurchase.reduce((acc, order) => {
                if (!order.items || order.items.length === 0) return acc;
                return acc + order.items[0].quantity * order.items[0].skuPrice;
              }, 0),
            )}
          </span>
        </Badge>
      </div>
      <div className="space-x-1">
        <span className="font-semibold">Đã thanh toán:</span>
        <Badge variant={'outline'}>
          <span>
            {formatCurrency(
              purchasedOrderFilter.reduce((acc, order) => {
                if (!order.items || order.items.length === 0) return acc;
                return acc + order.items[0].quantity * order.items[0].skuPrice;
              }, 0),
            )}
          </span>
        </Badge>
      </div>

      <div>
        <Button
          className="w-full"
          size={'sm'}
          variant={'secondary'}
          disabled={ordersFilterToPurchase.length === 0}
          onClick={pay}
        >
          Thanh toán tất cả ({ordersFilterToPurchase.length} đơn)
        </Button>
      </div>
    </div>
  );
}
