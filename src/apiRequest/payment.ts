import http from '@/lib/http';
import {
  CreatePaymentUrlType,
  QueryTransactionType,
} from '@/app/ValidationSchemas/payment.schema';
const prefix = '/payment/vnpay';

export const paymentRequestApi = {
  create: (data: CreatePaymentUrlType) =>
    http.post<{ paymentUrl: string }>(`${prefix}/create-url`, data),

  queryTransaction: (data: QueryTransactionType) =>
    http.post<{ orderId: string; transDate: string }>(
      `${prefix}/transaction`,
      data,
    ),
};
