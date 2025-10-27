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
import { XCircle, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function PaymentFailedPage() {
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
    const errorCode = searchParams.get('errorCode');

    if (status === 'failed') {
      setData({
        guestId,
        amount,
        status,
        message,
        errorCode,
      });
      setIsOpen(true);

      // Clear URL parameters
      router.replace('/guest/payment-failed');
    }
  }, [searchParams, router, mounted]);

  if (!mounted) {
    return null;
  }

  const handleClose = () => {
    setIsOpen(false);
    router.push('/guest/orders');
  };

  const handleTryAgain = () => {
    setIsOpen(false);
    router.push('/guest/orders');
  };

  const getErrorMessage = (errorCode?: string) => {
    switch (errorCode) {
      case '07':
        return 'Trừ thẻ bị nghi ngờ gian lận';
      case '09':
        return 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking';
      case '10':
        return 'Xác thực thông tin thẻ/Tài khoản không đúng quá 3 lần';
      case '11':
        return 'Đã hết hạn chờ thanh toán';
      case '12':
        return 'Thẻ/Tài khoản bị khóa';
      case '51':
        return 'Không đủ số dư để thực hiện giao dịch';
      case '65':
        return 'Thẻ/Tài khoản đã vượt quá hạn mức giao dịch trong ngày';
      default:
        return 'Thanh toán không thành công. Vui lòng thử lại hoặc chọn phương thức khác.';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-red-600">
            Thanh toán thất bại
          </DialogTitle>
          <DialogDescription className="text-base mt-4">
            {data?.message || 'Đã xảy ra lỗi trong quá trình thanh toán'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">
                {data?.errorCode
                  ? getErrorMessage(data.errorCode)
                  : getErrorMessage()}
              </p>
            </div>
          </div>

          <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-600">
              Số tiền cần thanh toán:
            </span>
            <span className="font-bold text-lg text-orange-600">
              {data?.amount ? formatCurrency(Number(data.amount)) : ''}
            </span>
          </div>

          {data?.errorCode && (
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-600">Mã lỗi:</span>
              <span className="font-semibold text-red-600">
                {data.errorCode}
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
            onClick={handleTryAgain}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          >
            Thử lại
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/guest/orders')}
            className="w-full"
          >
            Về đơn hàng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
