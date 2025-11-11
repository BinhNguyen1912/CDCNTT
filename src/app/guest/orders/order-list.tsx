/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { OrderStatus } from '@/app/constants/type';
import { useGetGuestOrderList } from '@/app/queries/useGuest';
import {
  GuestOrderType,
  GuestType,
} from '@/app/ValidationSchemas/guest.schema';
// import {
//   PayGuestOrdersResType,
//   UpdateOrderResType,
// } from '@/app/SchemaModel/order.schema';
import { useAppStore } from '@/components/app-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  formatCurrency,
  getVietnameseOrderStatus,
  handleErrorApi,
} from '@/lib/utils';
import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Bell, CreditCard, Wallet } from 'lucide-react';
import { useCallStaffMutation } from '@/app/queries/useAccount';
import { useCreatePaymentUrlMutation } from '@/app/queries/usePayment';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function OrderList() {
  const { data, refetch } = useGetGuestOrderList();
  const socket = useAppStore((state) => state.socket);
  const orders = data?.payload?.data || [];
  const callStaffMutation = useCallStaffMutation();
  const createPaymentUrl = useCreatePaymentUrlMutation();

  // Read guestInfo from localStorage
  const [guestInfo, setGuestInfo] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    'cash' | 'vnpay' | null
  >(null);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem('guestInfo');
      if (raw) {
        setGuestInfo(JSON.parse(raw));
      }
    } catch {}
  }, []);

  const { paid, waitingForPay } = useMemo(() => {
    return orders.reduce(
      (result, order) => {
        // Tính tổng giá trị và số lượng của tất cả items trong order
        const orderTotal = order.items.reduce(
          (itemTotal, item) => {
            return {
              price: itemTotal.price + item.quantity * item.skuPrice,
              quantity: itemTotal.quantity + item.quantity,
            };
          },
          { price: 0, quantity: 0 },
        );

        if (
          order.status === OrderStatus.PENDING ||
          order.status === OrderStatus.CONFIRMED ||
          order.status === OrderStatus.PREPARING ||
          order.status === OrderStatus.READY
        ) {
          return {
            ...result,
            waitingForPay: {
              price: result.waitingForPay.price + orderTotal.price,
              quantity: result.waitingForPay.quantity + orderTotal.quantity,
            },
          };
        }
        if (order.status === OrderStatus.COMPLETED) {
          return {
            ...result,
            paid: {
              price: result.paid.price + orderTotal.price,
              quantity: result.paid.quantity + orderTotal.quantity,
            },
          };
        }
        return result;
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
      },
    );
  }, [orders]);

  // Debug logs
  console.log('Orders:', orders);
  console.log('waitingForPay:', waitingForPay);
  console.log('paid:', paid);

  useEffect(() => {
    if (!socket) {
      console.log('🔌 Guest socket not available');
      return;
    }

    function onConnect() {
      console.log(
        '🎧 Guest socket connected, setting up order-status-updated listener...',
      );

      function onOrderStatusUpdated(data: any) {
        console.log(' Guest received order status update:', data);

        // Check if this is a payment success event
        if (data?.message?.toLowerCase().includes('thanh toán')) {
          toast.success(
            data.message || 'Đơn hàng của bạn đã được thanh toán thành công!',
            {
              hideProgressBar: true,
              autoClose: 3000,
            },
          );
        } else {
          toast.success(
            `Đơn hàng của bạn đã được cập nhật sang "trạng thái ${getVietnameseOrderStatus(data?.order?.status) || 'Chờ xử lý'}"`,
            {
              hideProgressBar: true,
              autoClose: 3000,
            },
          );
        }

        refetch();
      }

      socket?.on('order-status-updated', onOrderStatusUpdated);
      socket?.on('update-order', onOrderStatusUpdated);

      // Cleanup function
      return () => {
        socket?.off('order-status-updated', onOrderStatusUpdated);
        socket?.off('update-order', onOrderStatusUpdated);
      };
    }

    function onDisconnect() {
      console.log('🔌 Guest socket disconnected');
    }

    // Nếu socket đã kết nối, setup listener ngay
    if (socket.connected) {
      const cleanup = onConnect();
      return cleanup;
    }

    // Nếu chưa kết nối, đợi sự kiện connect
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [socket, refetch]);

  const handleCallStaff = async () => {
    if (!mounted || !guestInfo?.tableNodeId || !guestInfo?.tableName) {
      toast.error('Không thể xác định thông tin bàn');
      return;
    }

    const callStaffData = {
      tableNode: {
        id: guestInfo.tableNodeId,
        name: guestInfo.tableName,
      },
    };

    try {
      await callStaffMutation.mutateAsync(callStaffData);
      toast.success('Quý khách đợi xíu, nhân viên sẽ đến ngay!', {
        autoClose: 2000,
        hideProgressBar: true,
      });
    } catch (error) {
      handleErrorApi({ error });
    }
  };

  const handlePayment = async (method: 'cash' | 'vnpay') => {
    console.log('guestInfo', guestInfo);

    if (!guestInfo?.id) {
      toast.error('Không thể xác định thông tin khách hàng');
      return;
    }

    try {
      if (method === 'vnpay') {
        const response = await createPaymentUrl.mutateAsync({
          guestId: guestInfo.id,
        });
        if (response.payload?.paymentUrl) {
          window.location.href = response.payload.paymentUrl;
        }
      } else if (method === 'cash') {
        // Cash payment disabled for guest
        toast.info('Hãy nhấn chuông để gọi nhân viên thanh toán', {
          autoClose: 3000,
        });
      }
    } catch (error) {
      handleErrorApi({ error });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h1 className="text-lg md:text-xl lg:text-2xl font-bold">Đơn hàng</h1>

        <div className="hidden md:block">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCallStaff}
                  disabled={callStaffMutation.isPending}
                  className="h-8 w-8 lg:h-10 lg:w-10 p-0"
                >
                  <Bell className="h-4 w-4 lg:h-5 lg:w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Gọi nhân viên</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="md:hidden mt-8">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCallStaff}
                  disabled={callStaffMutation.isPending}
                  className="h-9 w-9 p-0"
                >
                  <Bell className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Gọi nhân viên</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Mobile Call Staff Button - Fixed Bottom */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="lg"
                onClick={handleCallStaff}
                disabled={callStaffMutation.isPending}
                className="h-12 w-12 rounded-full bg-orange-500 hover:bg-orange-600 shadow-lg"
              >
                <Bell className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Gọi nhân viên</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {orders &&
        orders.map((order, index) => (
          <div key={order.id} className="mb-4 p-4 border rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Đơn hàng #{order.id}</h3>
              <Badge variant={'secondary'}>
                {getVietnameseOrderStatus(order.status)}
              </Badge>
            </div>

            {order.items.map((item, itemIndex) => (
              <div key={item.id} className="flex gap-4 mb-2">
                <div className="flex items-center justify-center">
                  {itemIndex + 1}
                </div>
                <div className="flex-shrink-0 relative">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.productName}
                      height={100}
                      width={100}
                      quality={100}
                      className="object-cover w-[80px] h-[80px] rounded-md"
                    />
                  ) : (
                    <div className="w-[80px] h-[80px] rounded-md bg-gray-200 flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="text-sm font-medium">{item.productName}</h3>
                  <p className="text-xs text-gray-600">{item.skuValue}</p>
                  <div className="text-xs font-semibold">
                    {formatCurrency(item.skuPrice)}
                  </div>
                  <div className="flex justify-between items-center">
                    <Badge>SL: {item.quantity}</Badge>
                    <span className="text-sm font-semibold">
                      {formatCurrency(item.quantity * item.skuPrice)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-2 pt-2 border-t">
              <div className="flex justify-between">
                <span className="font-semibold">Tổng cộng:</span>
                <span className="font-bold">
                  {formatCurrency(
                    order.items.reduce(
                      (total, item) => total + item.quantity * item.skuPrice,
                      0,
                    ),
                  )}
                </span>
              </div>
            </div>
          </div>
        ))}

      {paid.quantity !== 0 && waitingForPay.quantity !== 0 && (
        <div className="sticky bottom-0 bg-white pt-2 border-t">
          <div>
            Đã thanh toán - <b>{`${paid.quantity}`}</b> món -{' '}
            <b>{`${formatCurrency(paid.price ?? 0)}`}</b>
          </div>
        </div>
      )}
      {waitingForPay.quantity !== 0 && (
        <div className="sticky bottom-0 bg-white pt-2 border-t">
          <div>
            Chưa thanh toán - <b>{`${waitingForPay.quantity}`}</b> món -{' '}
            <b>{`${formatCurrency(waitingForPay.price ?? 0)}`}</b>
          </div>
        </div>
      )}
      {paid.quantity !== 0 && waitingForPay.quantity === 0 && (
        <div className="sticky bottom-0 bg-white pt-2 border-t">
          <div>
            Đã thanh toán hoàn tất -{' '}
            <b>{`${paid.quantity + waitingForPay.quantity}`}</b> món -{' '}
            <b>{`${formatCurrency(paid.price + waitingForPay.price)}`}</b>
          </div>
        </div>
      )}

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-bold text-center">
              Chọn phương thức thanh toán
            </DialogTitle>
            <DialogDescription className="text-center text-base md:text-lg mt-2">
              Tổng cần thanh toán:{' '}
              <span className="font-bold text-orange-600 text-lg md:text-xl">
                {formatCurrency(waitingForPay.price)}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 md:gap-4 py-4">
            <button
              disabled
              className="flex items-center gap-3 md:gap-4 p-4 md:p-6 rounded-xl border-2 border-gray-200 bg-gray-100 cursor-not-allowed opacity-60"
            >
              <div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-gray-200 flex-shrink-0">
                <Wallet className="w-6 h-6 md:w-7 md:h-7 text-gray-400" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <h3 className="font-semibold text-base md:text-lg text-gray-500">
                  Thanh toán tiền mặt
                </h3>
                <p className="text-xs md:text-sm text-orange-600 mt-1 font-medium">
                  Hãy nhấn chuông để gọi nhân viên thanh toán
                </p>
              </div>
              <div className="text-gray-400 font-bold text-lg md:text-xl flex-shrink-0">
                ⚠️
              </div>
            </button>

            <button
              onClick={() => handlePayment('vnpay')}
              disabled={createPaymentUrl.isPending}
              className="flex items-center gap-3 md:gap-4 p-4 md:p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 transition-all bg-white hover:bg-blue-50 group active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors flex-shrink-0">
                <CreditCard className="w-6 h-6 md:w-7 md:h-7 text-blue-600" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <h3 className="font-semibold text-base md:text-lg text-gray-900">
                  Thanh toán VNPay
                </h3>
                <p className="text-xs md:text-sm text-gray-600 mt-1">
                  Thanh toán qua ngân hàng
                </p>
              </div>
              {createPaymentUrl.isPending ? (
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="text-blue-600 font-bold text-lg md:text-xl flex-shrink-0">
                  →
                </div>
              )}
            </button>
          </div>

          <DialogFooter className="sm:justify-center">
            <Button
              variant="outline"
              onClick={() => setShowPaymentDialog(false)}
              className="w-full sm:w-auto"
            >
              Hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {waitingForPay.quantity > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 md:px-0">
          <div className="bg-white rounded-2xl shadow-2xl border border-orange-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 md:py-4">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 md:w-6 md:h-6" />
                  <span className="text-sm md:text-base font-medium">
                    Chưa thanh toán
                  </span>
                </div>
                <span className="text-lg md:text-xl font-bold">
                  {formatCurrency(waitingForPay.price)}
                </span>
              </div>
            </div>
            <div className="px-4 py-3">
              <Button
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-11 md:h-12 text-sm md:text-base shadow-md transition-all"
                onClick={() => setShowPaymentDialog(true)}
              >
                <Wallet className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Thanh toán ngay
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
