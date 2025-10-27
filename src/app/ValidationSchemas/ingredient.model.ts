import { UnitSchema } from '@/app/ValidationSchemas/unit.model';
import { UserSchema } from '@/app/ValidationSchemas/user.schema';
import z from 'zod';

export const IngredientSchema = z.object({
  id: z.number(),
  name: z.string(),
  stock: z.number(),
  unitId: z.string(),
  image: z.string().nullable(),
  minStock: z.number(),
  isActive: z.boolean(),
  deletedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type IngredientType = z.infer<typeof IngredientSchema>;

export const ingredientBodySchema = IngredientSchema.pick({
  name: true,
  unitId: true,
  stock: true,
  image: true,
  isActive: true,
})
  .extend({
    enableLowStockWarning: z.boolean().default(false),
    minStock: z.number().positive().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.enableLowStockWarning && !data.minStock) {
      ctx.addIssue({
        code: 'custom',
        path: ['minStock'],
        message: 'minStock is required when enableLowStockWarning is true',
      });
    }
    // Nếu enableLowStockWarning = false thì không cần minStock
    if (!data.enableLowStockWarning && data.minStock) {
      ctx.addIssue({
        code: 'custom',
        path: ['minStock'],
        message:
          'minStock should not be provided when enableLowStockWarning is false',
      });
    }
  });
export const ingredientResSchema = IngredientSchema;

export const getIngredientDetailResSchema = IngredientSchema.extend({
  unit: UnitSchema,
  createdBy: UserSchema.pick({
    name: true,
    id: true,
  }).nullable(),
});
export const getAllIngredientResSchema = z.object({
  data: z.array(getIngredientDetailResSchema),
  totalItems: z.number(),
  totalPages: z.number(),
  page: z.number(),
  limit: z.number(),
});
export const ingredientParamsSchema = z.object({
  id: z.coerce.number(),
});

export const ingredientQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});

export const updateIngredientBodySchema = IngredientSchema.pick({
  name: true,
  unitId: true,
  stock: true,
  image: true,
  isActive: true,
})
  .extend({
    enableLowStockWarning: z.boolean().optional(),
    minStock: z.number().positive().optional(),
  })
  .superRefine((data, ctx) => {
    // Nếu enableLowStockWarning = true thì minStock là bắt buộc
    if (data.enableLowStockWarning === true && !data.minStock) {
      ctx.addIssue({
        code: 'custom',
        path: ['minStock'],
        message: 'minStock is required when enableLowStockWarning is true',
      });
    }
    // Nếu enableLowStockWarning = false thì không cần minStock
    if (data.enableLowStockWarning === false && data.minStock) {
      ctx.addIssue({
        code: 'custom',
        path: ['minStock'],
        message:
          'minStock should not be provided when enableLowStockWarning is false',
      });
    }
  });

export type CreateIngredientBodyType = z.infer<typeof ingredientBodySchema>;
export type UpdateIngredientBodyType = z.infer<
  typeof updateIngredientBodySchema
>;
export type GetAllIngredientResType = z.infer<typeof getAllIngredientResSchema>;
export type GetIngredientDetailResType = z.infer<typeof ingredientResSchema>;
export type GetIngredientParamsType = z.infer<typeof ingredientParamsSchema>;
export type IngredientQueryType = z.infer<typeof ingredientQuerySchema>;
