import { create } from 'domain';
import { z } from 'zod';

export const SKUSchema = z.object({
  id: z.number(),
  value: z.string(),
  price: z.number(),
  image: z.string(),
  productId: z.number(),

  createdById: z.number(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type SKUSType = z.infer<typeof SKUSchema>;

export const UpsertSKUBodySchema = SKUSchema.pick({
  image: true,
  price: true,
  value: true,
});

export type UpsertSKUBody = z.infer<typeof UpsertSKUBodySchema>;

export const UpsertSKUResSchema = SKUSchema;
