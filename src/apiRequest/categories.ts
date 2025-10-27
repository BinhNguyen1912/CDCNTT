import {
  CategoryBodyType,
  CategoryType,
  GetAllCategoryType,
  GetCategoryDetailType,
  UpdateCategoryBodyType,
} from '@/app/ValidationSchemas/category.schema';
import http from '@/lib/http';

const prefix = '/category';
export const categoriesApiRequest = {
  create: (data: CategoryBodyType) =>
    http.post<CategoryType>(`${prefix}`, data),
  update: (id: number, data: UpdateCategoryBodyType) =>
    http.put<GetCategoryDetailType>(`${prefix}/${id}`, data),
  getCategory: (id: number) =>
    http.get<GetCategoryDetailType>(`${prefix}/${id}`),
  //Mặc định Next15 thì fetch là {cache: 'no-cache' -> dynamic rendering}, hiện tại Next14 mặc định là {cache: 'force-cache'} nghĩa là cache static rendering

  //Bây giờ mình sẽ dùng tag để dùng Fn : RevalidateTag để nó Build cho những file Static Rendering
  getListCategory: () =>
    http.get<GetAllCategoryType>(`${prefix}`, {
      next: { tags: ['categories'] },
    }),

  delete: (id: number) => http.delete<{ message: string }>(`${prefix}/${id}`),
};

export default categoriesApiRequest;
