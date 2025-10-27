'use client';
import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/components/app-provider';

interface LowStockItem {
  ingredientName: string;
  currentStock: number;
  minStock: number;
  unit: string;
}

interface LowStockWarningData {
  message: string;
  lowStockItems: LowStockItem[];
  timestamp: string;
}

export default function LowStockWarningDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [warningData, setWarningData] = useState<LowStockWarningData | null>(
    null,
  );
  const { socket } = useAppStore();

  useEffect(() => {
    if (!socket) return;

    const handleLowStockWarning = (data: LowStockWarningData) => {
      console.log(' Low stock warning received:', data);
      setWarningData(data);
      setIsOpen(true);
    };

    socket.on('low-stock-warning', handleLowStockWarning);

    return () => {
      socket.off('low-stock-warning', handleLowStockWarning);
    };
  }, [socket]);

  const handleConfirm = () => {
    setIsOpen(false);
    setWarningData(null);
  };

  if (!warningData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            Cảnh báo nguyên liệu hết hàng
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-800 font-medium">{warningData.message}</p>
            <p className="text-sm text-amber-600 mt-1">
              Thời gian:{' '}
              {new Date(warningData.timestamp).toLocaleString('vi-VN')}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">
              Danh sách nguyên liệu cần bổ sung:
            </h4>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {warningData.lowStockItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {item.ingredientName}
                      </span>
                      <Badge variant={'destructive'} className="text-xs">
                        Cảnh báo
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <span className="text-red-600 font-medium">
                        Tồn kho hiện tại: {item.currentStock} {item.unit}
                      </span>
                      <span className="mx-2">•</span>
                      <span className="text-amber-600">
                        Ngưỡng tối thiểu: {item.minStock} {item.unit}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    {/* <div className="text-xs text-gray-500">
                      Còn lại: {item.currentStock - item.minStock} {item.unit}
                    </div> */}
                    {item.currentStock <= item.minStock && (
                      <div className="text-xs text-red-600 font-medium">
                        Đã hết!
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={handleConfirm}
            className="flex items-center gap-2"
          >
            Xác nhận
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
