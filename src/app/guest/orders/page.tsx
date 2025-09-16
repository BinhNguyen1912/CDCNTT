import OrderList from '@/app/guest/orders/order-list';
import React from 'react';

export default function OrdersPage() {
  return (
    <div className="max-w-[400px] mx-auto space-y-4">
      <h1 className="text-center text-xl font-bold">Đơn hàng</h1>
      <OrderList />
    </div>
  );
}
