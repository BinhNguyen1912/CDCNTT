import OrderList from '@/app/guest/orders/order-list';
import React from 'react';

export default function OrdersPage() {
  return (
    <div className="max-w-[400px] mx-auto space-y-4 mt-8">
      <OrderList />
    </div>
  );
}
