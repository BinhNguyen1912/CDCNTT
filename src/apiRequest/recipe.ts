import {
  SkuRecipeIngredientBodyType,
  SkuRecipeIngredientDetailResType,
  skuRecipeIngredientListResType,
} from '@/app/ValidationSchemas/recipe.schema';
import http from '@/lib/http';
import { PagitionQueryType } from '@/app/ValidationSchemas/pagination.schema';
const prefix = '/recipes';
export const recipeRequestApi = {
  list: (params?: PagitionQueryType) => {
    const qs = params ? new URLSearchParams(params as any).toString() : '';
    const url = qs ? `${prefix}?${qs}` : `${prefix}`;
    return http.get<skuRecipeIngredientListResType>(url);
  },
  getDetail: (id: number) =>
    http.get<SkuRecipeIngredientDetailResType>(`${prefix}/${id}`),
  create: (data: SkuRecipeIngredientBodyType) =>
    http.post<SkuRecipeIngredientDetailResType>(`${prefix}`, data),
  put: (data: SkuRecipeIngredientBodyType) =>
    http.put<SkuRecipeIngredientDetailResType>(`${prefix}`, data),
  delete: (id: number) => http.delete<{ message: string }>(`${prefix}/${id}`),
};
