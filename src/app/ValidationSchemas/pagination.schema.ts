import { z } from 'zod';

export const EmptyBodySchema = z.object({});
export const PaginationQuerySchema = z.object({
  page: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .default(1),
  limit: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .default(10),
  orderBy: z.enum(['createdAt', 'id']).optional(),
  orderDirection: z.enum(['asc', 'desc']).optional(),
});

export type EmptyBodyType = z.infer<typeof EmptyBodySchema>;
export type PagitionQueryType = z.infer<typeof PaginationQuerySchema>;
