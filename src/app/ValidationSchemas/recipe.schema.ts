import { IngredientSchema } from '@/app/ValidationSchemas/ingredient.model';
import { ProductSchema } from '@/app/ValidationSchemas/product.schema';
import { SKUSchema } from '@/app/ValidationSchemas/sku.schema';
import { UnitSchema } from '@/app/ValidationSchemas/unit.model';
import z from 'zod';

export const SKURecipeIngredientSchema = z.object({
  id: z.number(),
  skuId: z.number(),
  ingredientId: z.number(),
  quantity: z.number(),
  unitId: z.string(),

  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export const skuRecipeIngredientDetailResSchema = z.object({
  sku: z.object({
    id: z.number(),
    value: z.string(),
    image: z.string().nullable(),
    product: z.object({
      id: z.number(),
      name: z.string(),
    }),
  }),
  skuRecipeIngredients: z.array(
    z.object({
      skuRecipeIngredientsId: z.number(),
      name: z.string(),
      quantity: z.number(),
      unit: z.string(),
      ingredientId: z.number(),
    }),
  ),
});
export type SKURecipeIngredientType = z.infer<typeof SKURecipeIngredientSchema>;

export const skuRecipeIngredientBodySchema = z.object({
  skuId: z.number(),
  ingredients: z.array(
    z.object({
      ingredientId: z.number(),
      quantity: z.number(),
      unitId: z.string(),
    }),
  ),
});

export const skuRecipeIngredientUpdateBodySchema = z.object({
  ingredients: z.array(
    z.object({
      ingredientId: z.number(),
      quantity: z.number(),
      unitId: z.string(),
    }),
  ),
});

export const skuRecipeIngredientParamsSchema = z.object({
  skuId: z.coerce.number(),
});

export const skuRecipeIngredientListResSchema = z.object({
  data: z.array(
    SKURecipeIngredientSchema.extend({
      ingredient: IngredientSchema.pick({
        name: true,
        id: true,
      }),
      unit: UnitSchema.pick({ name: true }),
      sku: SKUSchema.extend({
        product: ProductSchema.pick({
          name: true,
          id: true,
        }),
      }),
    }),
  ),
  totalItems: z.number(),
  totalPages: z.number(),
  page: z.number(),
  limit: z.number(),
});

export type SkuRecipeIngredientDetailResType = z.infer<
  typeof skuRecipeIngredientDetailResSchema
>;
export type SkuRecipeIngredientBodyType = z.infer<
  typeof skuRecipeIngredientBodySchema
>;
export type SkuRecipeIngredientUpdateBodyType = z.infer<
  typeof skuRecipeIngredientUpdateBodySchema
>;
export type skuRecipeIngredientListResType = z.infer<
  typeof skuRecipeIngredientListResSchema
>;
