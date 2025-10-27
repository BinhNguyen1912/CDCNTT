import { z } from 'zod';

export const CategoryTranslationSchema = z.object({
  id: z.number(),
  name: z
    .string()
    .min(2, { message: 'Error.TooShort' })
    .max(100, { message: 'Error.TooLong' }),
  languageId: z.string(),
  categoryId: z.number({ message: 'Error.CategoryIdMustBeNumber' }),
  description: z.string(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type CategoryType = z.infer<typeof CategorySchema>;
export type CategoryIncludeTranslationType = z.infer<
  typeof CategoryIncludeTranslationSchema
>;

export const CategorySchema = z.object({
  id: z.number(),
  parentCategoryId: z.number().nullable(),
  logo: z
    .string({ message: 'Error.LogoMustBeString' })
    .min(2, { message: 'Error.TooShort' })
    .max(500, { message: 'Error.TooLong' })
    .optional(),
  name: z
    .string({ message: 'Error.NameMustBeString' })
    .min(2, { message: 'Error.TooShort' })
    .max(100, { message: 'Error.TooLong' }),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export const CategoryIncludeTranslationSchema = CategorySchema.extend({
  categoryTranslations: z.array(CategoryTranslationSchema),
});

export const getAllCategorySchema = z.object({
  data: z.array(CategoryIncludeTranslationSchema),
  totalItems: z.number(),
});
export const getCatoryriesQuerySchema = z.object({
  parentCategoryId: z.coerce.number().int().positive().optional(),
});

export const getCategoryParamSchema = z
  .object({
    parentCategoryId: z.coerce.number().int().positive(),
  })
  .strict();
export const getCategoryDetailSchema = CategoryIncludeTranslationSchema;
export const CategoryBodySchema = CategorySchema.pick({
  logo: true,
  name: true,
  parentCategoryId: true,
});
export const UpdateCategoryBodySchema = CategoryBodySchema.partial();
export type CategoryBodyType = z.infer<typeof CategoryBodySchema>;
export type CategoryResType = z.infer<typeof CategorySchema>;
export type UpdateCategoryBodyType = z.infer<typeof UpdateCategoryBodySchema>;
export type CategoryParamType = z.infer<typeof getCategoryParamSchema>;
export type CategoriesQueryType = z.infer<typeof getCatoryriesQuerySchema>;
export type GetCategoryDetailType = z.infer<typeof getCategoryDetailSchema>;
export type GetAllCategoryType = z.infer<typeof getAllCategorySchema>;
