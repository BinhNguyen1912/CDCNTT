import { PaymentStatus } from '@/app/constants/type';
import { guestSchema } from '@/app/ValidationSchemas/guest.schema';
import {
  OrderSchema,
  ProductSKUSnapshotSchema,
} from '@/app/ValidationSchemas/order.schema';
import z from 'zod';

export const PaymentShema = z.object({
  id: z.number(),
  amount: z.string(),
  method: z.string().nullable(),
  status: z.enum([
    PaymentStatus.SUCCESS,
    PaymentStatus.FAILED,
    PaymentStatus.PENDING,
  ]),
  transactionId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export const CreatePaymentUrlSchema = z.object({
  guestId: z.number().int().positive(),
});

export const QueryTransactionSchema = z.object({
  orderId: z.string(),
  transDate: z.string(),
});
export const OrderResForPaymentSchema = OrderSchema.extend({
  payment: PaymentShema,
  items: ProductSKUSnapshotSchema.array(),
  guest: guestSchema.nullable(),
});
export type CreatePaymentUrlType = z.infer<typeof CreatePaymentUrlSchema>;
export type QueryTransactionType = z.infer<typeof QueryTransactionSchema>;
export type OrderResForPaymentType = z.infer<typeof OrderResForPaymentSchema>;

export type PaymentType = z.infer<typeof PaymentShema>;
