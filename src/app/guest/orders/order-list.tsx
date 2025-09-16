/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { OrderStatus } from '@/app/constants/type';
import { useGetGuestOrderListMutation } from '@/app/queries/useGuest';
import { GuestCreateOrdersResType } from '@/app/schemaValidations/guest.schema';
import {
  PayGuestOrdersResType,
  UpdateOrderResType,
} from '@/app/schemaValidations/order.schema';
import { useAppStore } from '@/components/app-provider';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, getVietnameseOrderStatus } from '@/lib/utils';
import Image from 'next/image';
import React, { useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';

export default function OrderList() {
  const { data, refetch } = useGetGuestOrderListMutation();
  // const socket = useAppStore((state) => state.socket);
  const orders = data?.payload.data || [];
  const { paid, waitingForPay } = useMemo(() => {
    return orders.reduce(
      (resuft, order) => {
        if (
          order.status === OrderStatus.Delivered ||
          order.status === OrderStatus.Pending ||
          order.status === OrderStatus.Processing
        ) {
          return {
            ...resuft,
            waitingForPay: {
              price:
                resuft.waitingForPay.price +
                Number(order.quantity * order.dishSnapshot.price),
              quantity: resuft.waitingForPay.quantity + order.quantity,
            },
          };
        }
        if (order.status === OrderStatus.Paid) {
          return {
            ...resuft,
            paid: {
              price:
                resuft.paid.price +
                Number(order.quantity * order.dishSnapshot.price),
              quantity: resuft.paid.quantity + order.quantity,
            },
          };
        }
        return resuft;
      },
      {
        waitingForPay: {
          price: 0,
          quantity: 0,
        },
        paid: {
          price: 0,
          quantity: 0,
        },
      }
    );
  }, [orders]);

  // useEffect(() => {
  //   // if (socket?.connected) {
  //   //   onConnect();
  //   // }
  //   function onConnect() {
  //     console.log('connected', socket?.id);
  //   }
  //   function onDisconnect() {}
  //   function onUpdateOrder(data: UpdateOrderResType['data']) {
  //     console.log('data', data);
  //     toast.success(
  //       `Món ăn ${data.dishSnapshot.name} - SL: ${
  //         data.quantity
  //       } đã được chuyển sang trạng thái ${getVietnameseOrderStatus(
  //         data.status
  //       )}`,
  //       {
  //         hideProgressBar: true,
  //         autoClose: 2000,
  //         icon: false,
  //       }
  //     );
  //     refetch();
  //   }
  //   function onNewOrder(data: GuestCreateOrdersResType['data']) {
  //     console.log('data', data);
  //     const guest = data[0].guest;
  //     toast.success(
  //       `Khách hàng ${guest?.name} vừa đặt ${data.length} món mới tại bàn ${guest?.tableNumber} `,
  //       {
  //         hideProgressBar: true,
  //         autoClose: 2000,
  //         icon: false,
  //       }
  //     );
  //     refetch();
  //   }
  //   function onPayment(data: PayGuestOrdersResType['data']) {
  //     const guest = data[0].guest;
  //     toast.success(
  //       `Khách hàng ${guest?.name} vừa thanh toán ${data.length} món tại bàn ${guest?.tableNumber} `
  //     );
  //     refetch();
  //   }
  //   //lang nghe
  //   socket?.on('connect', onConnect);
  //   //huy lang nghe
  //   socket?.on('disconnect', onDisconnect);
  //   socket?.on('new-order', onNewOrder);

  //   socket?.on('update-order', onUpdateOrder);
  //   socket?.on('payment', onPayment);
  //   return () => {
  //     socket?.off('connect', onConnect);
  //     socket?.off('disconnect', onDisconnect);
  //     socket?.off('payment', onPayment);
  //     socket?.off('new-order', onNewOrder);
  //     socket?.off('update-order', onUpdateOrder);
  //   };
  // }, [refetch, socket]);
  return (
    <>
      {orders &&
        orders.map((order, index) => (
          <div key={order.id} className="flex gap-4 ">
            <div className="flex items-center justify-center">{index + 1}</div>
            <div className="flex-shrink-0 relative">
              <Image
                src={order.dishSnapshot.image}
                alt={order.dishSnapshot.name}
                height={100}
                width={100}
                quality={100}
                className="object-cover w-[80px] h-[80px] rounded-md"
              />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm">{order.dishSnapshot.name}</h3>
              <div className="text-xs font-semibold">
                {formatCurrency(order.dishSnapshot.price)}
              </div>
              <div className={`flex-shrink-0 ml-auto`}>
                <Badge>SL: {order.quantity}</Badge>
              </div>
            </div>
            <div
              className={`flex-shrink-0 ml-auto flex items-center justify-center`}
            >
              <Badge variant={'secondary'}>
                {getVietnameseOrderStatus(order.status)}
              </Badge>
            </div>
          </div>
        ))}
      {paid.quantity !== 0 && waitingForPay.quantity !== 0 && (
        <div className="sticky bottom-0  bg-white pt-2 ">
          <div>
            Đã thanh toán - <b>{`${paid.quantity}`}</b> món -{' '}
            <b>{`${formatCurrency(paid.price ?? 0)}`}</b>
          </div>
        </div>
      )}
      {waitingForPay.quantity !== 0 && (
        <div className="sticky bottom-0 bg-white pt-2">
          <div>
            Chưa thanh toán - <b>{`${waitingForPay.quantity}`}</b> món -{' '}
            <b>{`${formatCurrency(waitingForPay.price ?? 0)}`}</b>
          </div>
        </div>
      )}
      {paid.quantity !== 0 && waitingForPay.quantity === 0 && (
        <div className="sticky bottom-0 bg-white pt-2">
          <div>
            Đã thanh toán hoàn tất -{' '}
            <b>{`${paid.quantity + waitingForPay.quantity}`}</b> món -{' '}
            <b>{`${formatCurrency(paid.price + waitingForPay.price)}`}</b>
          </div>
        </div>
      )}
    </>
  );
}
