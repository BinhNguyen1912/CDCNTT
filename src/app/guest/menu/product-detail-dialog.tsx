'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useGetProduct } from '@/app/queries/useProducts';
import { formatCurrency, handleErrorApi } from '@/lib/utils';
import { Minus, Plus, X } from 'lucide-react';
import { GetProductDetailType } from '@/app/ValidationSchemas/product.schema';
import { useCreateGuestOrderMutation } from '@/app/queries/useOrder';
import { GuestCreateNewOrderType } from '@/app/ValidationSchemas/order.schema';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

interface ProductDetailDialogProps {
  productId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (skuId: number, quantity: number) => void;
  onPlaceOrder?: () => void;
}

interface SKUSelection {
  skuId: number;
  quantity: number;
}

export default function ProductDetailDialog({
  productId,
  isOpen,
  onClose,
  onAddToCart,
  onPlaceOrder,
}: ProductDetailDialogProps) {
  const [selectedSKUs, setSelectedSKUs] = useState<SKUSelection[]>([]);
  const [note, setNote] = useState('');
  const [entered, setEntered] = useState(false);
  const { mutateAsync } = useCreateGuestOrderMutation();
  const router = useRouter();

  const { data: productData, isLoading } = useGetProduct({
    id: productId || 0,
    enabled: isOpen && !!productId,
  });

  const product: GetProductDetailType | null = productData?.payload || null;

  // Reset selections when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedSKUs([]);
      setNote('');
      setEntered(false);
    } else {
      // trigger enter animation on open
      const id = setTimeout(() => setEntered(true), 10);
      return () => clearTimeout(id);
    }
  }, [isOpen]);

  const handleSKUQuantityChange = (skuId: number, quantity: number) => {
    setSelectedSKUs((prev) => {
      const existingIndex = prev.findIndex((item) => item.skuId === skuId);

      if (existingIndex >= 0) {
        if (quantity === 0) {
          return prev.filter((item) => item.skuId !== skuId);
        }
        const newSelection = [...prev];
        newSelection[existingIndex] = { skuId, quantity };
        return newSelection;
      } else if (quantity > 0) {
        return [...prev, { skuId, quantity }];
      }

      return prev;
    });
  };

  const getSKUQuantity = (skuId: number): number => {
    return selectedSKUs.find((item) => item.skuId === skuId)?.quantity || 0;
  };

  const getTotalPrice = (): number => {
    if (!product) return 0;

    return selectedSKUs.reduce((total, selection) => {
      const sku = product.skus.find((s) => s.id === selection.skuId);
      return total + (sku?.price || 0) * selection.quantity;
    }, 0);
  };

  const handleAddToOrder = () => {
    selectedSKUs.forEach((selection) => {
      if (selection.quantity > 0) {
        onAddToCart(selection.skuId, selection.quantity);
      }
    });
    onClose();
  };

  const handlePlaceOrder = async () => {
    if (
      selectedSKUs.length === 0 ||
      selectedSKUs.every((s) => s.quantity === 0)
    ) {
      return;
    }

    try {
      const orderData: GuestCreateNewOrderType = selectedSKUs
        .filter((selection) => selection.quantity > 0)
        .map((selection) => ({
          skuId: selection.skuId,
          quantity: selection.quantity,
        }));

      const result = await mutateAsync(orderData);
      console.log('Order result:', result);
      toast.success('Đặt món thành công!');
      onClose();
      router.push('/guest/orders');
    } catch (error) {
      handleErrorApi({ error });
    }
  };

  if (!product) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p>Đang tải thông tin món ăn...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0 bg-transparent border-none shadow-none [&>button]:hidden flex flex-col">
        {/* Card container with animated entrance */}
        <div
          className={
            `m-2 md:m-4 rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden transform-gpu transition-all duration-400 flex flex-col max-h-[calc(90vh-1rem)] ` +
            (entered
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-4 scale-[0.98]')
          }
        >
          <DialogHeader>
            <div
              className={
                `flex items-center justify-between px-4 pt-4 transition-all duration-500 ` +
                (entered
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-2')
              }
              style={{ transitionDelay: entered ? '80ms' : '0ms' }}
            >
              <DialogTitle className="text-lg md:text-xl font-semibold">
                Thêm món mới
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-full hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-6 px-4 pb-4 flex-1 overflow-y-auto">
            {/* Product Image */}
            <div
              className={
                `relative aspect-square rounded-xl overflow-hidden bg-gray-50 transition-all duration-500 z-0 mb-4 md:mb-0 ` +
                (entered
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-2')
              }
              style={{ transitionDelay: entered ? '140ms' : '0ms' }}
            >
              <div className="absolute top-3 left-3 z-10">
                <span className="bg-orange-500/90 text-white text-[10px] md:text-xs font-medium px-2 py-1 rounded-full shadow">
                  Độc quyền
                </span>
              </div>
              <Image
                src={product.images?.[0] || '/placeholder-food.jpg'}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 ease-out hover:scale-105"
              />
            </div>

            <div
              className={
                `space-y-4 transition-all duration-500 bg-white overflow-y-auto md:overflow-visible ` +
                (entered
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-2')
              }
              style={{ transitionDelay: entered ? '180ms' : '0ms' }}
            >
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {product.name}
                </h2>

                {product.productTranslations?.[0]?.description && (
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {product.productTranslations[0].description}
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{Math.floor(Math.random() * 500) + 100} đã đặt</span>
                <span className="flex items-center gap-1">
                  <span>❤️</span>
                  {Math.floor(Math.random() * 200) + 50} thích
                </span>
              </div>

              {/* Price */}
              <div className="text-lg font-bold text-red-600">
                {formatCurrency(product.basePrice)}
              </div>

              {/* SKU Selection */}
              <div className="space-y-3 md:space-y-4">
                <h3 className="font-medium text-gray-900">Chọn loại:</h3>

                {product.skus.map((sku) => {
                  const qty = getSKUQuantity(sku.id);
                  const active = qty > 0;
                  return (
                    <div
                      key={sku.id}
                      className={
                        `rounded-xl p-3 border transition-all duration-200 ` +
                        (active
                          ? 'border-orange-400 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50')
                      }
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-medium text-gray-900 truncate">
                            {sku.value}
                          </span>
                        </div>
                        <span className="text-red-600 font-semibold">
                          {formatCurrency(sku.price)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() =>
                              handleSKUQuantityChange(
                                sku.id,
                                Math.max(0, qty - 1),
                              )
                            }
                            disabled={qty === 0}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>

                          <span className="w-8 text-center font-medium">
                            {qty}
                          </span>

                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() =>
                              handleSKUQuantityChange(sku.id, qty + 1)
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Note */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Thêm ghi chú</span>
                </div>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú cho món ăn..."
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Footer sticky inside card */}
          <div
            className={
              `border-t bg-white/80 backdrop-blur px-4 py-3 flex items-center justify-between transition-all duration-500 flex-shrink-0 ` +
              (entered
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-2')
            }
            style={{ transitionDelay: entered ? '220ms' : '0ms' }}
          >
            <div className="text-sm">
              <span className="font-semibold mr-2">Tổng:</span>
              <span className="text-base font-bold text-red-600">
                {formatCurrency(getTotalPrice())}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="h-11 px-4 text-sm"
                onClick={handlePlaceOrder}
                disabled={
                  selectedSKUs.length === 0 ||
                  selectedSKUs.every((s) => s.quantity === 0)
                }
              >
                Đặt đơn hàng
              </Button>
              <Button
                className="h-11 px-4 md:px-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow-sm transition text-sm"
                onClick={handleAddToOrder}
                disabled={
                  selectedSKUs.length === 0 ||
                  selectedSKUs.every((s) => s.quantity === 0)
                }
              >
                Thêm vào giỏ hàng
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
