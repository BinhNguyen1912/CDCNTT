import {
  CreateIngredientBodyType,
  GetAllIngredientResType,
  GetIngredientDetailResType,
  UpdateIngredientBodyType,
} from '@/app/ValidationSchemas/ingredient.model';
import http from '@/lib/http';
const prefix = '/ingredients';
export const ingredienrApiRequest = {
  list: () =>
    http.get<GetAllIngredientResType>(`${prefix}`, {
      next: { tags: ['ingredientsingredients'] },
    }),
  delete: (id: number) =>
    http.delete<GetIngredientDetailResType>(`${prefix}/${id}`),

  create: (data: CreateIngredientBodyType) =>
    http.post<GetIngredientDetailResType>(`${prefix}`, data),
  getIngredient: (id: number) =>
    http.get<GetIngredientDetailResType>(`${prefix}/getIngredientDetail/${id}`),

  update: (id: number, data: UpdateIngredientBodyType) =>
    http.put<GetIngredientDetailResType>(`${prefix}/update/${id}`, data),
};
