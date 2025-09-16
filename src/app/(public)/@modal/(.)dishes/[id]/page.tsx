import dishesApiRequest from '@/apiRequest/dishes';
import Modal from '@/app/(public)/@modal/(.)dishes/[id]/modal';
import DetailDishesPage from '@/app/(public)/dishes/[id]/detailDishes';
import { WrapServerApi } from '@/lib/utils';
import React from 'react';

export default async function DishPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const data = await WrapServerApi(() => dishesApiRequest.getDish(+id));
  if (!data) return <div>Không tìm thấy món ăn</div>;
  return (
    <Modal>
      <DetailDishesPage dish={data.payload.data} />
    </Modal>
  );
}
