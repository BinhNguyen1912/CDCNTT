'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

type PaymentSuccessData = {
  guestId?: number | string;
  guestName?: string;
  tableName?: string;
  orderCount?: number;
  amount?: string | number;
  amountText?: string;
  status?: string;
  bankCode?: string;
  message?: string;
};

export default function PaymentSuccessDialog({
  open,
  onOpenChange,
  data,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  data: PaymentSuccessData | null;
}) {
  const title = 'Thanh toán thành công!';
  const resolvedAmountText =
    data?.amountText ??
    (data?.amount !== undefined ? String(data.amount) : undefined);
  const fallbackMsg =
    data?.message ||
    `Khách ${data?.guestName || ''} tại ${data?.tableName || ''} đã thanh toán${
      data?.orderCount ? ` ${data.orderCount} đơn hàng` : ''
    }${resolvedAmountText ? ` (${resolvedAmountText})` : ''}.`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-semibold text-green-600">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 items-start">
          <div className="flex flex-col items-center gap-4 md:gap-6">
            <div className="relative">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-green-100 flex items-center justify-center animate-pulse">
                <CheckCircle className="w-14 h-14 md:w-16 md:h-16 text-green-600" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-green-300 animate-ping" />
            </div>
            {resolvedAmountText && (
              <div className="text-sm text-muted-foreground">
                <span className="font-bold text-green-600 text-2xl">
                  {formatCurrency(Number(resolvedAmountText))}
                </span>
              </div>
            )}
          </div>

          <div className="w-full">
            <div className="rounded-lg border bg-card text-card-foreground">
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  {data?.guestName && (
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Khách hàng
                      </div>
                      <div className="font-medium truncate">
                        {data.guestName}
                      </div>
                    </div>
                  )}
                  {data?.tableName && (
                    <div>
                      <div className="text-xs text-muted-foreground">Bàn</div>
                      <div className="font-medium truncate">
                        {data.tableName}
                      </div>
                    </div>
                  )}
                  {data?.guestId !== undefined && (
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Mã khách
                      </div>
                      <div className="font-medium">{String(data.guestId)}</div>
                    </div>
                  )}
                  {typeof data?.orderCount === 'number' && (
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Số đơn
                      </div>
                      <div className="font-medium">{data.orderCount}</div>
                    </div>
                  )}
                  {data?.status && (
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Trạng thái
                      </div>
                      <div className="inline-flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs font-medium">
                          {data.status}
                        </span>
                      </div>
                    </div>
                  )}
                  {data?.bankCode && (
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Ngân hàng
                      </div>
                      <div className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-xs font-medium">
                        {data.bankCode}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom close button removed as requested */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
