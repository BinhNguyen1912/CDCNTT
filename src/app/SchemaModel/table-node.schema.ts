import { Furniture, TableStatus } from '@/app/constants/table.constant';
import { AreaSchema } from '@/app/SchemaModel/area.schema';
import { PaginationQuerySchema } from '@/app/SchemaModel/pagination.schema';
import { tableLayoutSchema } from '@/app/SchemaModel/table-layout.schema';
import z from 'zod';

export const tableNodeSchema = z.object({
  id: z.number(),
  name: z.string(),
  seats: z.number(),
  areaId: z.number(),
  layoutId: z.number().nullable().optional(),
  status: z.enum([
    TableStatus.AVAILABLE,
    TableStatus.OCCUPIED,
    TableStatus.OUT_OF_SERVICE,
    TableStatus.RESERVED,
    TableStatus.HIDE,
  ]),
  token: z.string(),
  type: z.enum([
    Furniture.COUNTER,
    Furniture.DECORATION,
    Furniture.DOOR,
    Furniture.TABLE,
    Furniture.WALL,
    Furniture.ROUND,
    Furniture.SQUARE,
    Furniture.VASE,
  ]),
  //Layout
  positionX: z.number(),
  positionY: z.number(),
  rotation: z.number().nullable(),
  width: z.number(),
  height: z.number(),
  imageUrl: z.string(),

  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type TableNodeType = z.infer<typeof tableNodeSchema>;

export const tableNodeBodySchema = tableNodeSchema.pick({
  name: true,
  areaId: true,
  status: true,
  imageUrl: true,
  layoutId: true,
  positionX: true,
  height: true,
  width: true,
  positionY: true,
  rotation: true,
  seats: true,
  type: true,
});
export const updateTableNodeBodySchema = tableNodeBodySchema.extend({
  changeToken: z.boolean(),
});
export const getListTableNodeResSchema = z.object({
  data: z.array(
    tableNodeSchema.extend({
      area: AreaSchema.pick({
        name: true,
      }),
      layout: tableLayoutSchema
        .pick({
          name: true,
          status: true,
        })
        .nullable(),
    }),
  ),
  totalItems: z.number(),
  totalPages: z.number(),
  page: z.number(),
  limit: z.number(),
});
export const TableNodeParamsSchema = z.object({
  id: z.coerce.number(),
});
export const getQueryTableNodeSchema = PaginationQuerySchema.extend({
  areaId: z.coerce.number(),
});
export const TableNodeResSchema = tableNodeSchema;
export const TableNodeDetailResSchema = TableNodeResSchema.extend({
  area: AreaSchema.pick({
    name: true,
  }),
  layout: tableLayoutSchema
    .pick({
      name: true,
      status: true,
    })
    .nullable(),
});

export const updateTableNodeBodyBatchResSchema = z.object({
  data: z.array(TableNodeResSchema),
});
export const updateTableNodeBodyBatchSchema = z.array(
  updateTableNodeBodySchema.extend({
    id: z.coerce.number(),
  }),
);
export type TableNodeBodyType = z.infer<typeof tableNodeBodySchema>;
export type UpdateTableNodeBodyType = z.infer<typeof updateTableNodeBodySchema>;
export type TableNodeParamsType = z.infer<typeof TableNodeParamsSchema>;
export type TableNodeResType = z.infer<typeof TableNodeResSchema>;
export type GetListTableNodeResType = z.infer<typeof getListTableNodeResSchema>;
export type TableNodeQueryType = z.infer<typeof getQueryTableNodeSchema>;
export type TableNodeDetailResType = z.infer<typeof TableNodeDetailResSchema>;
export type UpdateTableNodeBodyBatchType = z.infer<
  typeof updateTableNodeBodyBatchSchema
>;
export type UpdateTableNodeBodyBatchResType = z.infer<
  typeof updateTableNodeBodyBatchResSchema
>;
