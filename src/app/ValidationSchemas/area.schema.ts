import { PaginationQuerySchema } from '@/app/ValidationSchemas/pagination.schema';
import z from 'zod';

export const AreaSchema = z.object({
  id: z.number(),
  name: z.string(),
  isActive: z.boolean().default(false),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const areaBodySchema = z.object({
  name: z.string(),
  isActive: z.boolean(),
});
export const updateAreaBodySchema = areaBodySchema;
export const getListAreaResSchema = z.object({
  data: z.array(AreaSchema),
  totalItems: z.number(),
  totalPages: z.number(),
  page: z.number(),
  limit: z.number(),
});
export const areaParamsSchema = z.object({
  id: z.coerce.number(),
});
export const getQueryAreaSchema = PaginationQuerySchema;
export const areaResSchema = AreaSchema;

export type AreaBodyType = z.infer<typeof areaBodySchema>;
export type UpdateAreaBodyType = z.infer<typeof updateAreaBodySchema>;
export type AreaParamsType = z.infer<typeof areaParamsSchema>;
export type AreaResType = z.infer<typeof areaResSchema>;
export type GetListAreaResType = z.infer<typeof getListAreaResSchema>;
export type AreaQueryType = z.infer<typeof getQueryAreaSchema>;

export type AreaType = z.infer<typeof AreaSchema>;
