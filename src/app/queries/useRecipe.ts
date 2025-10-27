'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { recipeRequestApi } from '@/apiRequest/recipe';
import {
  SkuRecipeIngredientBodyType,
  SkuRecipeIngredientDetailResType,
  skuRecipeIngredientListResType,
} from '@/app/ValidationSchemas/recipe.schema';
import { PagitionQueryType } from '@/app/ValidationSchemas/pagination.schema';

const QUERY_KEYS = {
  all: (params?: PagitionQueryType) => ['recipes', params] as const,
  detail: (id: number) => ['recipes', 'detail', id] as const,
};

export const useGetRecipes = (params?: PagitionQueryType) => {
  return useQuery({
    queryKey: QUERY_KEYS.all(params),
    queryFn: () => recipeRequestApi.list(params),
  });
};

export const useGetRecipeDetail = (id: number, enabled = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: () => recipeRequestApi.getDetail(id),
    enabled,
  });
};

export const useCreateRecipeMutation = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: SkuRecipeIngredientBodyType) =>
      recipeRequestApi.create(data),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
};

export const useUpdateRecipeMutation = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: SkuRecipeIngredientBodyType) =>
      recipeRequestApi.put(data),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
};

export const useDeleteRecipeMutation = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => recipeRequestApi.delete(id),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
};
