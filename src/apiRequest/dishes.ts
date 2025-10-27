import {
  CreateDishBodyType,
  DishListResType,
  DishResType,
  UpdateDishBodyType,
} from '@/app/SchemaModel/dish.schema';
import http from '@/lib/http';

const prefix = '/dishes';
export const dishesApiRequest = {
  create: (data: CreateDishBodyType) =>
    http.post<DishResType>(`${prefix}`, data),
  update: (id: number, data: UpdateDishBodyType) =>
    http.put<DishResType>(`${prefix}/${id}`, data),
  getDish: (id: number) => http.get<DishResType>(`${prefix}/${id}`),
  //Mặc định Next15 thì fetch là {cache: 'no-cache' -> dynamic rendering}, hiện tại Next14 mặc định là {cache: 'force-cache'} nghĩa là cache static rendering

  //Bây giờ mình sẽ dùng tag để dùng Fn : RevalidateTag để nó Build cho những file Static Rendering
  getDishes: () =>
    http.get<DishListResType>(`${prefix}`, { next: { tags: ['dishes'] } }),

  delete: (id: number) => http.delete<DishResType>(`${prefix}/${id}`),
};

export default dishesApiRequest;
