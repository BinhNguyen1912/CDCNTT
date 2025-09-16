'use client';
import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useGetDishes } from '@/app/queries/useProducts';
import { formatCurrency, handleErrorApi } from '@/lib/utils';
import { GuestCreateOrdersBodyType } from '@/app/schemaValidations/guest.schema';
import { useGuestOrderMutation } from '@/app/queries/useGuest';
import { useRouter } from 'next/navigation';
import { DishStatus } from '@/app/constants/type';
import Quantity from '@/app/guest/menu/quatity';

export default function MenuOrder() {
  const { data } = useGetDishes();
  const dishes = useMemo(() => data?.payload.data || [], [data]);
  const [orders, setOrders] = useState<GuestCreateOrdersBodyType>([]);
  const route = useRouter();

  const { mutateAsync } = useGuestOrderMutation();
  const totalPrice = useMemo(() => {
    return dishes.reduce((resuft, dish) => {
      const order = orders.find((order) => dish.id === order.dishId);
      if (!order) return resuft;
      return resuft + Number(order.quantity * dish.price);
    }, 0);
  }, [orders, dishes]);

  const handleOnChange = (dishId: number, quantity: number) => {
    setOrders((prevOrders) => {
      // Nếu quantity = 0 thì xoá món khỏi list
      if (quantity === 0) {
        return prevOrders.filter((order) => order.dishId !== dishId);
      }

      // Tìm xem món đã có trong list chưa
      const index = prevOrders.findIndex((order) => order.dishId === dishId);

      if (index === -1) {
        // Nếu chưa có → thêm mới
        return [...prevOrders, { dishId, quantity }];
      } else {
        // Nếu đã có → update quantity
        const newOrders = [...prevOrders];
        newOrders[index] = { ...newOrders[index], quantity };
        return newOrders;
      }
    });
  };

  const handleOrder = async () => {
    try {
      const resuft = await mutateAsync(orders);
      console.log('resuft', resuft);
      route.push('/guest/orders');
    } catch (error) {
      handleErrorApi({
        error,
      });
    }
  };
  return (
    <>
      {dishes
        .filter((dish) => dish.status !== DishStatus.Hidden)
        .map((dish) => (
          <div key={dish.id} className="flex gap-4 ">
            <div className="flex-shrink-0 relative">
              {dish.status == DishStatus.Unavailable && (
                <span className="absolute top-70% left-60% translate-x-[-50%] translate-y-[-50%] text-xs bg-red-400 p-1 rounded-xl">
                  Hết hàng
                </span>
              )}
              <Image
                src={dish.image}
                alt={dish.name}
                height={100}
                width={100}
                quality={100}
                className="object-cover w-[80px] h-[80px] rounded-md"
              />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm">{dish.name}</h3>
              <p className="text-xs">{dish.description}</p>
              <p className="text-xs font-semibold">
                {formatCurrency(dish.price)}
              </p>
            </div>
            <div
              className={`flex-shrink-0 ml-auto flex justify-center items-center ${
                dish.status == DishStatus.Unavailable
                  ? 'pointer-events-none'
                  : ''
              }`}
            >
              <Quantity
                onChange={(value) => handleOnChange(dish.id, value)}
                value={
                  orders.find((order) => order.dishId === dish.id)?.quantity ??
                  0
                }
              />
            </div>
          </div>
        ))}
      <div className="sticky bottom-0">
        <Button
          className="w-full justify-between"
          onClick={handleOrder}
          disabled={orders.length === 0}
        >
          <span>Giỏ hàng · {orders.length} món</span>
          <span>{formatCurrency(totalPrice)}</span>
        </Button>
      </div>
    </>
  );
}
