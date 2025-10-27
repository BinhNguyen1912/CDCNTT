'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Plus, Minus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';

interface SkuSelection {
  skuId: number;
  quantity: number;
  productId: number;
}

interface Product {
  id: number;
  name: string;
  images?: string[];
  skus: Array<{
    id: number;
    value: string;
    price: number;
  }>;
}

interface MobileCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSkus: SkuSelection[];
  dishes: Product[];
  onQuantityChange: (
    productId: number,
    skuId: number,
    quantity: number,
  ) => void;
  totalPrice: number;
  onOrder: () => void;
}

export default function MobileCartModal({
  isOpen,
  onClose,
  selectedSkus,
  dishes,
  onQuantityChange,
  totalPrice,
  onOrder,
}: MobileCartModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Thêm món mới</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {selectedSkus.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-gray-500">Chưa có món được chọn</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {selectedSkus.map((item) => {
                const product = dishes.find((d) => d.id === item.productId);
                const sku = product?.skus.find((s) => s.id === item.skuId);
                if (!product || !sku) return null;

                return (
                  <div
                    key={`${item.productId}-${item.skuId}`}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    {/* Product Image */}
                    <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={product.images?.[0] || '/placeholder-food.jpg'}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">{sku.value}</p>

                      {/* Stats */}
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                        <span>406 đã đặt</span>
                        <span className="flex items-center gap-1">
                          <span>❤️</span>
                          <span>124 thích</span>
                        </span>
                      </div>

                      {/* Price */}
                      <div className="text-sm font-bold text-red-600 mb-3">
                        {formatCurrency(sku.price)}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-300"
                            onClick={() =>
                              onQuantityChange(
                                item.productId,
                                item.skuId,
                                item.quantity - 1,
                              )
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              onQuantityChange(
                                item.productId,
                                item.skuId,
                                item.quantity + 1,
                              )
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-sm font-bold text-red-600">
                          {formatCurrency(sku.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-gray-900">Tổng số tiền</span>
            <span className="text-lg font-bold text-red-600">
              {formatCurrency(totalPrice)}
            </span>
          </div>
          <Button
            className="w-full h-12 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl"
            onClick={onOrder}
            disabled={selectedSkus.length === 0}
          >
            Thêm vào đơn
          </Button>
        </div>
      </div>
    </div>
  );
}
