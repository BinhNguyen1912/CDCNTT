import { DishResType } from '@/app/schemaValidations/dish.schema';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import React from 'react';

export default function DetailDishesPage({
  dish,
}: {
  dish: DishResType['data'];
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2s">
        <div>
          <Image src={dish.image} width={200} height={200} alt={dish.name} />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">{dish.name}</h1>
          <p className="text-lg">Giá: {formatCurrency(dish.price)}</p>
        </div>
      </div>
      <div className="bg-gray-100 rounded-md p-4">
        <h2 className="text-xl font-bold">Mô tả sản phẩm</h2>
        <p className="text-black pt-2">{dish.description}</p>
      </div>
    </div>
  );
}
