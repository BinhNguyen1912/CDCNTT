import {
  OrderStatus,
  OrderType,
  PaymentStatus,
  TypeToOrderStatus,
} from '@/app/constants/type';
import { guestSchema } from '@/app/ValidationSchemas/guest.schema';
import { PaymentShema } from '@/app/ValidationSchemas/payment.schema';
import { ProductSchema } from '@/app/ValidationSchemas/product.schema';
import { tableNodeSchema } from '@/app/ValidationSchemas/table-node.schema';
import z from 'zod';

export const OrderSchema = z.object({
  id: z.number(),
  tableNodeId: z.number().nullable(),
  paymentId: z.number(),
  userId: z.number().nullable(),
  guestId: z.number().nullable(),
  reservationId: z.number().nullable(),
  status: z.enum([
    OrderStatus.PENDING,
    OrderStatus.COMPLETED,
    OrderStatus.CANCELLED,
    OrderStatus.CONFIRMED,
    OrderStatus.PREPARING,
    OrderStatus.READY,
  ]),
  voucherSnapshotId: z.number().nullable(),
  type: z.enum([OrderType.AT_TABLE, OrderType.ONLINE, OrderType.RESERVATION]),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const OrderItemCreateSchema = z
  .object({
    skuId: z.coerce.number(),
    quantity: z.coerce.number().optional(),
  })
  .transform((val) => ({
    skuId: val.skuId,
    quantity: val.quantity ?? val.quantity ?? 0,
  }));
export const GuestCreateNewOrderSchema = z.array(OrderItemCreateSchema);

export const OrderQuerySchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
  search: z.string().optional(),
  status: z
    .enum([
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.PREPARING,
      OrderStatus.COMPLETED,
      OrderStatus.CANCELLED,
      OrderStatus.READY,
    ])
    .optional(),
  type: z
    .enum([
      TypeToOrderStatus.ONLINE,
      TypeToOrderStatus.AT_TABLE,
      TypeToOrderStatus.RESERVATION,
    ])
    .optional(),
  tableNodeId: z.coerce.number().optional(),
  createdAt: z
    .union([z.date(), z.string()])
    .transform((val) => (val instanceof Date ? val : new Date(val)))
    .optional(),
  updatedAt: z
    .union([z.date(), z.string()])
    .transform((val) => (val instanceof Date ? val : new Date(val)))
    .optional(),
  fromDate: z
    .union([z.date(), z.string()])
    .transform((val) => (val instanceof Date ? val : new Date(val)))
    .optional(),
  toDate: z
    .union([z.date(), z.string()])
    .transform((val) => (val instanceof Date ? val : new Date(val)))
    .optional(),
});
export const OrderItemSchema = z.object({
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

export const OrderGuestSchema = guestSchema.extend({
  tableNode: tableNodeSchema.nullable(),
});

export const OrderPaymentSchema = PaymentShema.pick({
  method: true,
  amount: true,
  status: true,
});

export const OrderTableNodeSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const ProductSKUSnapshotSchema = z.object({
  id: z.number(),
  productName: z.string(),
  skuValue: z.string(),
  skuId: z.number(),
  orderId: z.number().nullable(),
  createdAt: z.date(),
  image: z.string(),
  productId: z.number().nullable(),
  quantity: z.number(),
  skuPrice: z.number(),
});
export const OrderResSchema = OrderSchema.extend({
  items: z.array(
    z.object({
      id: z.number(),
      skuValue: z.string(),
      image: z.string(),
      productName: z.string(),
      quantity: z.number(),
      skuPrice: z.number(),
      productTranslations: z.any().optional(),
      product: ProductSchema.extend({
        productSKUSnapshots: z.array(ProductSKUSnapshotSchema),
      }).nullable(),
    }),
  ),
  guest: guestSchema
    .omit({
      refreshToken: true,
      refreshTokenExpiresAt: true,
    })
    .nullable(),
  tableNode: z
    .object({
      name: z.string(),
    })
    .nullable(),
});
export const OrderDetailSchema = z.object({
  id: z.number(),
  userId: z.number().nullable(),
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
    OrderStatus.PAID,
  ]),
  voucherSnapshotId: z.number().nullable(),
  type: z.enum([
    TypeToOrderStatus.ONLINE,
    TypeToOrderStatus.AT_TABLE,
    TypeToOrderStatus.RESERVATION,
  ]),
  receiver: z.any().nullable(),
  deletedAt: z.date().nullable(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z
    .object({
      name: z.string(),
      id: z.number(),
    })
    .nullable(),
  guest: OrderGuestSchema.nullable(),
  payment: OrderPaymentSchema,
  tableNode: OrderTableNodeSchema.nullable(),
  items: z.array(
    OrderItemSchema.extend({
      product: ProductSchema,
    }),
  ),
});

export const OrdersListResSchema = z.object({
  data: z.array(OrderDetailSchema),
  limit: z.number(),
  page: z.number(),
  totalItems: z.number(),
  totalPages: z.number(),
});

export const UpdateOrderSchema = z.object({
  status: z.enum([
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.PREPARING,
    OrderStatus.READY,
    OrderStatus.COMPLETED,
    OrderStatus.CANCELLED,
    OrderStatus.PAID,
  ]),
  quantity: z.number(),
  skuId: z.number(),
});
export const UpdateOrderResSchema = z.object({
  order: OrderResSchema,
  socketId: z.string(),
});
export type OrderQueryType = z.infer<typeof OrderQuerySchema>;
export type OrderItemType = z.infer<typeof OrderItemSchema>;
export type OrderGuestType = z.infer<typeof OrderGuestSchema>;
export type OrderPaymentType = z.infer<typeof OrderPaymentSchema>;
export type OrderTableNodeType = z.infer<typeof OrderTableNodeSchema>;
export type OrderDetailType = z.infer<typeof OrderDetailSchema>;
export type OrdersListResType = z.infer<typeof OrdersListResSchema>;
export type OrderResType = z.infer<typeof OrderResSchema>;
export type OrderType = z.infer<typeof OrderSchema>;
export type GuestCreateNewOrder = z.infer<typeof GuestCreateNewOrderSchema>;
export type GuestCreateNewOrderType = GuestCreateNewOrder;
export type UpdateOrderType = z.infer<typeof UpdateOrderSchema>;
export type UpdateOrderResType = z.infer<typeof UpdateOrderResSchema>;
