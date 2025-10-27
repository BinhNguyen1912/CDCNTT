import z from 'zod';

export const UnitSchema = z.object({
  name: z.string().toLowerCase(),
  description: z.string(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type UnitType = z.infer<typeof UnitSchema>;

export const unitBodyShema = UnitSchema.pick({
  name: true,
  description: true,
});

export const unitResSchema = UnitSchema;

export const unitUpdateBodySchema = UnitSchema.pick({
  name: true,
});

export const getAllUnitResSchema = z.object({
  data: z.array(UnitSchema),
  totalItems: z.number(),
});
export const unitParamsSchema = z.object({
  name: z.coerce.string(),
});

export type unitBodyType = z.infer<typeof unitBodyShema>;
export type unitResType = z.infer<typeof unitResSchema>;
export type unitUpdateBodyType = z.infer<typeof unitUpdateBodySchema>;
export type getAllUnitResType = z.infer<typeof getAllUnitResSchema>;
export type unitParamsType = z.infer<typeof unitParamsSchema>;
