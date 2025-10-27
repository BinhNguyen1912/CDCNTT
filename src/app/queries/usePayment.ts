import { useMutation } from '@tanstack/react-query';
import { paymentRequestApi } from '@/apiRequest/payment';
import {
  CreatePaymentUrlType,
  QueryTransactionType,
} from '@/app/ValidationSchemas/payment.schema';

export const useCreatePaymentUrlMutation = () => {
  return useMutation({
    mutationFn: (data: CreatePaymentUrlType) => paymentRequestApi.create(data),
  });
};

export const useQueryTransactionMutation = () => {
  return useMutation({
    mutationFn: (data: QueryTransactionType) =>
      paymentRequestApi.queryTransaction(data),
  });
};
