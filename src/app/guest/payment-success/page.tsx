'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Parse query parameters
    const guestId = searchParams.get('guestId');
    const amount = searchParams.get('amount');
    const status = searchParams.get('status');
    const message = searchParams.get('message');
    const bankCode = searchParams.get('bankCode');

    if (status === 'success') {
      setData({
        guestId,
        amount,
        status,
        message,
        bankCode,
      });
      setIsOpen(true);

      // Clear URL parameters
      router.replace('/guest/payment-success');
    }
  }, [searchParams, router, mounted]);

  if (!mounted) {
    return null;
  }

  const handleClose = () => {
    setIsOpen(false);
    router.push('/guest/orders');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-green-600">
            Thanh toán thành công!
          </DialogTitle>
          <DialogDescription className="text-base mt-4">
            Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-600">Số tiền:</span>
            <span className="font-bold text-lg text-green-600">
              {data?.amount ? formatCurrency(Number(data.amount)) : ''}
            </span>
          </div>

          {data?.bankCode && (
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-600">Ngân hàng:</span>
              <span className="font-semibold text-blue-600">
                {data.bankCode}
              </span>
            </div>
          )}

          <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-600">Mã khách:</span>
            <span className="font-semibold">#{data?.guestId}</span>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            onClick={handleClose}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            Xem đơn hàng
          </Button>
          <Link href="/guest/menu">
            <Button variant="outline" className="w-full">
              Đặt món thêm
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
