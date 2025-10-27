import { roleName } from '@/app/constants/role.constant';
import {
  OrderStatus,
  PaymentStatus,
  TypeToOrderStatus,
} from '@/app/constants/type';
import { tableNodeSchema } from '@/app/ValidationSchemas/table-node.schema';
import { create } from 'domain';
import { access } from 'fs';
import z from 'zod';

export const guestSchema = z.object({
  id: z.number(),
  name: z.string().min(2).max(50),
  tableNodeId: z.number(),
  refreshToken: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
  deletedById: z.number().nullable(),
  updatedById: z.number().nullable(),
  createdById: z.number().nullable(),
});
export const guestLoginSchema = guestSchema
  .pick({
    name: true,
    tableNodeId: true,
  })
  .extend({
    token: z.string(),
  });
export const guestParamsSchema = z.object({
  id: z.coerce.number(),
});
export const guestParamsRefeshTokenSchema = z.object({
  refreshToken: z.string(),
});
export const guestLoginResSchema = z.object({
  guest: guestSchema
    .extend({
      role: z.enum([roleName.GUEST]).default('GUEST'),
      tableName: z.string(),
    })
    .omit({
      refreshToken: true,
      refreshTokenExpiresAt: true,
    }),
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const guestOrderItemSchema = z.object({
  id: z.number(),
  productName: z.string(),
  skuValue: z.string(),
  skuId: z.number(),
  orderId: z.number(),
  createdAt: z.string(),
  image: z.string(),
  productId: z.number(),
  productTranslations: z.array(z.any()),
  quantity: z.number(),
  skuPrice: z.number(),
});

export const guestOrderSchema = z.object({
  id: z.number(),
  guestId: z.number().nullable(),
  reservationId: z.number().nullable(),
  paymentId: z.number(),
  tableNodeId: z.number().nullable(),
  status: z.enum([
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.PREPARING,
    OrderStatus.READY,
    OrderStatus.COMPLETED,
    OrderStatus.CANCELLED,
  ]),
  voucherSnapshotId: z.number().nullable(),
  type: z.enum([
    TypeToOrderStatus.AT_TABLE,
    TypeToOrderStatus.ONLINE,
    TypeToOrderStatus.RESERVATION,
  ]),
  deletedAt: z.string().nullable(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  payment: z.object({
    method: z.string().nullable(),
    amount: z.string(),
    status: z.enum([
      PaymentStatus.SUCCESS,
      PaymentStatus.FAILED,
      PaymentStatus.PENDING,
    ]),
  }),
  items: z.array(guestOrderItemSchema),
});

export const guestOrdersListSchema = z.object({
  data: z.array(guestOrderSchema),
  limit: z.number(),
  page: z.number(),
  totalItems: z.number(),
  totalPages: z.number(),
});

export const guestOrdersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  status: z
    .enum([
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.PREPARING,
      OrderStatus.READY,
      OrderStatus.COMPLETED,
      OrderStatus.CANCELLED,
    ])
    .optional(),
});
export const CreateGuestSchema = guestSchema.pick({
  name: true,
  tableNodeId: true,
});
export const guestListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});
export const callStaffSchema = z.object({
  tableNode: z.object({
    id: z.number(),
    name: z.string(),
  }),
});
export const guestListSchema = z.object({
  data: z.array(
    guestSchema
      .extend({
        tableNode: tableNodeSchema.nullable(),
      })
      .omit({
        refreshToken: true,
        refreshTokenExpiresAt: true,
      }),
  ),
  limit: z.number(),
  page: z.number(),
  totalItems: z.number(),
  totalPages: z.number(),
});

export type guestResLoginType = z.infer<typeof guestLoginResSchema>;
export type GuestOrderItemType = z.infer<typeof guestOrderItemSchema>;
export type GuestOrderType = z.infer<typeof guestOrderSchema>;
export type GuestOrdersListType = z.infer<typeof guestOrdersListSchema>;
export type GuestOrdersQueryType = z.infer<typeof guestOrdersQuerySchema>;
export type CreateGuestType = z.infer<typeof CreateGuestSchema>;
export type GuestType = z.infer<typeof guestSchema>;
export type GuestLoginType = z.infer<typeof guestLoginSchema>;
export type GuestResLoginType = z.infer<typeof guestLoginResSchema>;
export type GuestListQueryType = z.infer<typeof guestListQuerySchema>;
export type GuestListType = z.infer<typeof guestListSchema>;
export type CallStaffType = z.infer<typeof callStaffSchema>;
