'use client';
import React, { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useGetProducts } from '@/app/queries/useProducts';
import { useGetCategories } from '@/app/queries/useCategory';
import { formatCurrency, handleErrorApi } from '@/lib/utils';
import { toast } from 'react-toastify';
import { useCreateGuestOrderMutation } from '@/app/queries/useOrder';
import { useCallStaffMutation } from '@/app/queries/useAccount';
import { GuestCreateNewOrderType } from '@/app/ValidationSchemas/order.schema';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/components/app-provider';
import { DishStatus } from '@/app/constants/type';
import Quantity from '@/app/guest/menu/quatity';
import { Plus, Bell } from 'lucide-react';
import CategoryTabs from '@/components/CategoryTabs';
import PromotionBanner from '@/components/PromotionBanner';
import { ProductStatus } from '@/app/constants/product.constant';
import ProductDetailDialog from './product-detail-dialog';
import MobileCartModal from '@/components/MobileCartModal';

interface SkuSelection {
  skuId: number;
  quantity: number;
  productId: number;
}

interface Category {
  id: number;
  name: string;
  logo: string;
}

export default function MenuOrder() {
  const { data } = useGetProducts();
  const { data: categoriesData } = useGetCategories();

  const dishes = useMemo(() => data?.payload?.data || [], [data]);
  const categories = useMemo(() => {
    if (!categoriesData?.payload?.data) return [];
    return categoriesData.payload.data.map((cat) => ({
      id: cat.id,
      name: cat.name,
      logo: cat.logo || '/placeholder-category.jpg',
    }));
  }, [categoriesData]);

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSkus, setSelectedSkus] = useState<SkuSelection[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const route = useRouter();
  const { mutateAsync } = useCreateGuestOrderMutation();
  const callStaffMutation = useCallStaffMutation();
  const socket = useAppStore((state) => state.socket);

  // Read guestInfo from localStorage to get tableName
  const [guestInfo, setGuestInfo] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem('guestInfo');
      if (raw) {
        setGuestInfo(JSON.parse(raw));
      }
    } catch {}
  }, []);

  // Listen for payment success event
  useEffect(() => {
    if (!socket) {
      console.log('🔌 Guest socket not available in menu');
      return;
    }

    function onConnect() {
      console.log(
        '🎧 Guest socket connected in menu, setting up payment listener...',
      );

      function onOrderStatusUpdated(data: any) {
        console.log('💳 Guest received order status update in menu:', data);

        // Check if this is a payment success event
        if (data?.message?.toLowerCase().includes('thanh toán')) {
          toast.success(
            data.message || 'Đơn hàng của bạn đã được thanh toán thành công!',
            {
              hideProgressBar: true,
              autoClose: 3000,
            },
          );
        }
      }

      socket?.on('order-status-updated', onOrderStatusUpdated);
      socket?.on('update-order', onOrderStatusUpdated);

      return () => {
        socket?.off('order-status-updated', onOrderStatusUpdated);
        socket?.off('update-order', onOrderStatusUpdated);
      };
    }

    if (socket.connected) {
      const cleanup = onConnect();
      return cleanup;
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', () => {
      console.log('🔌 Guest socket disconnected in menu');
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect');
    };
  }, [socket]);

  const orders: GuestCreateNewOrderType = useMemo(() => {
    return selectedSkus
      .filter((item) => item.quantity > 0)
      .map((item) => ({
        skuId: item.skuId,
        quantity: item.quantity,
      }));
  }, [selectedSkus]);

  const totalPrice = useMemo(() => {
    return selectedSkus.reduce((total, item) => {
      if (item.quantity === 0) return total;

      const product = dishes.find((d) => d.id === item.productId);
      if (!product) return total;

      const sku = product.skus.find((s) => s.id === item.skuId);
      if (!sku) return total;

      return total + sku.price * item.quantity;
    }, 0);
  }, [selectedSkus, dishes]);

  const handleQuantityChange = (
    productId: number,
    skuId: number,
    quantity: number,
  ) => {
    setSelectedSkus((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === productId && item.skuId === skuId,
      );

      if (existingIndex >= 0) {
        if (quantity === 0) {
          return prev.filter(
            (item) => !(item.productId === productId && item.skuId === skuId),
          );
        }
        const newSelection = [...prev];
        newSelection[existingIndex] = {
          ...newSelection[existingIndex],
          quantity,
        };
        return newSelection;
      } else if (quantity > 0) {
        return [...prev, { productId, skuId, quantity }];
      }

      return prev;
    });
  };

  const getCurrentQuantity = (productId: number, skuId: number): number => {
    return (
      selectedSkus.find(
        (item) => item.productId === productId && item.skuId === skuId,
      )?.quantity || 0
    );
  };

  const handleOrder = async () => {
    if (orders.length === 0) return;

    try {
      const result = await mutateAsync(orders);
      console.log('Order result:', result);
      toast.success('Đặt món thành công!', {
        hideProgressBar: true,
        autoClose: 3000,
      });
      setSelectedSkus([]);
      setIsMobileCartOpen(false); // Đóng modal sau khi đặt hàng thành công
      route.push('/guest/orders');
    } catch (error) {
      handleErrorApi({ error });
    }
  };

  const handleCallStaff = async () => {
    if (!mounted || !guestInfo?.tableNodeId || !guestInfo?.tableName) {
      toast.error('Không thể xác định thông tin bàn');
      return;
    }

    const callStaffData = {
      tableNode: {
        id: guestInfo.tableNodeId,
        name: guestInfo.tableName,
      },
    };

    console.log('🔔 Call Staff Data:', callStaffData);
    console.log('👤 Guest Info:', guestInfo);

    try {
      await callStaffMutation.mutateAsync(callStaffData);
      toast.success('Quý khách đợi xíu, nhân viên sẽ đến ngay!', {
        hideProgressBar: true,
        autoClose: 3000,
      });
    } catch (error) {
      handleErrorApi({ error });
    }
  };

  const handleProductClick = (productId: number) => {
    setSelectedProductId(productId);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedProductId(null);
  };

  const handleAddToCartFromDialog = (skuId: number, quantity: number) => {
    if (!selectedProductId) return;
    handleQuantityChange(selectedProductId, skuId, quantity);
  };

  const getDisplayPrice = (product: any) => {
    const basePrice = product.basePrice;
    const virtualPrice = product.virtualPrice;

    if (virtualPrice && virtualPrice > basePrice) {
      return {
        originalPrice: virtualPrice,
        discountedPrice: basePrice,
        hasDiscount: true,
      };
    }

    return {
      originalPrice: basePrice,
      discountedPrice: basePrice,
      hasDiscount: false,
    };
  };

  const filteredDishes = useMemo(() => {
    if (!selectedCategory) return dishes;
    return dishes.filter((dish) =>
      dish.categories?.some((cat: any) => cat.id === selectedCategory),
    );
  }, [dishes, selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50">
      <CategoryTabs
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 lg:gap-6 p-4">
            {filteredDishes
              .filter((dish) => dish.status !== ProductStatus.HIDDEN)
              .map((dish) => {
                const priceInfo = getDisplayPrice(dish);
                const isUnavailable = dish.status === ProductStatus.INACTIVE;

                return (
                  <div
                    key={dish.id}
                    className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="relative aspect-square">
                      {isUnavailable && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                          <span className="text-white text-xs font-medium bg-red-500 px-2 py-1 rounded">
                            Hết hàng
                          </span>
                        </div>
                      )}
                      <Image
                        src={dish.images?.[0] || '/placeholder-food.jpg'}
                        alt={dish.name}
                        fill
                        className="object-cover"
                      />

                      <div className="absolute top-2 left-2">
                        <span className="bg-orange-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                          Đặc biệt
                        </span>
                      </div>
                    </div>

                    <div className="p-3 md:p-4">
                      <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-2 line-clamp-2">
                        {dish.name}
                      </h3>

                      <div className="hidden md:flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <span>
                          {Math.floor(Math.random() * 500) + 100} đã đặt
                        </span>
                        <span className="flex items-center gap-1">
                          <span>❤️</span>
                          {Math.floor(Math.random() * 200) + 50} thích
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-3 md:mb-4">
                        {priceInfo.hasDiscount ? (
                          <>
                            <span className="text-base md:text-lg font-bold text-red-600">
                              {formatCurrency(priceInfo.discountedPrice)}
                            </span>
                            <span className="text-xs md:text-sm text-gray-500 line-through">
                              {formatCurrency(priceInfo.originalPrice)}
                            </span>
                            <span className="text-xs bg-green-100 text-green-700 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full">
                              Giảm{' '}
                              {formatCurrency(
                                priceInfo.originalPrice -
                                  priceInfo.discountedPrice,
                              )}
                            </span>
                          </>
                        ) : (
                          <span className="text-base md:text-lg font-bold text-gray-900">
                            {formatCurrency(priceInfo.originalPrice)}
                          </span>
                        )}
                      </div>

                      {dish.variants && dish.variants.length > 0 && (
                        <div className="hidden md:block space-y-2 mb-3 md:mb-4">
                          {dish.variants.map((variant, index) => (
                            <div key={index}>
                              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                                {variant.value}:
                              </label>
                              <div className="flex flex-wrap gap-1 md:gap-2">
                                {variant.valueOption.map((option, optIndex) => {
                                  const skuId = dish.skus[optIndex]
                                    ?.id as number;
                                  const currentQuantity = getCurrentQuantity(
                                    dish.id,
                                    skuId,
                                  );
                                  return (
                                    <button
                                      key={optIndex}
                                      className={`px-2 md:px-3 py-1 text-xs rounded-full border transition-colors ${
                                        isUnavailable
                                          ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                          : 'border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-600'
                                      }`}
                                      disabled={isUnavailable}
                                    >
                                      {option.value}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <Button
                        className="w-full h-8 md:h-10 font-semibold rounded-lg flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm"
                        onClick={() => handleProductClick(dish.id)}
                        disabled={isUnavailable}
                        variant="outline"
                      >
                        <Plus className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="hidden sm:inline">Thêm vào giỏ</span>
                        <span className="sm:hidden">+</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <aside className="hidden  lg:block w-80 xl:w-96 bg-white border-l border-gray-200 p-4 xl:p-6 sticky top-0 h-screen overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="px-2 py-5 text-base xl:text-lg font-semibold">
              {mounted && guestInfo?.tableName
                ? guestInfo.tableName
                : 'Bàn đã chọn'}
            </h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCallStaff}
                    disabled={callStaffMutation.isPending}
                    className="h-8 w-8 p-0"
                  >
                    <Bell className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Gọi nhân viên</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {orders.length === 0 ? (
            <div className="h-[60vh] grid place-items-center text-center text-gray-500">
              <div>
                <div className="text-4xl xl:text-6xl mb-4">📝</div>
                <p className="text-sm xl:text-base">Chưa có món được chọn</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 xl:space-y-3">
              {selectedSkus.map((item) => {
                const product = dishes.find((d) => d.id === item.productId);
                const sku = product?.skus.find((s) => s.id === item.skuId);
                if (!product || !sku) return null;
                return (
                  <div
                    key={`${item.productId}-${item.skuId}`}
                    className="flex items-center justify-between p-2 xl:p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-medium text-xs xl:text-sm truncate">
                        {product.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {sku.value}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 xl:gap-2">
                      <Quantity
                        value={item.quantity}
                        onChange={(value) =>
                          handleQuantityChange(
                            item.productId,
                            item.skuId,
                            value,
                          )
                        }
                      />
                      <div className="w-16 xl:w-20 text-right font-semibold text-red-600 text-xs xl:text-sm">
                        {formatCurrency(sku.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-4 xl:mt-6 pt-3 xl:pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3 xl:mb-4">
              <span className="font-semibold text-sm xl:text-base">Tổng:</span>
              <span className="text-base xl:text-lg font-bold text-red-600">
                {formatCurrency(totalPrice)}
              </span>
            </div>
            <Button
              className="w-full h-10 xl:h-11 text-white text-sm xl:text-base"
              onClick={handleOrder}
              disabled={orders.length === 0}
              variant="default"
            >
              Đặt món
            </Button>
          </div>
        </aside>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 md:p-4 shadow-lg z-50">
        <div className="flex gap-2">
          {/* Call Staff Button - Mobile */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCallStaff}
                  disabled={callStaffMutation.isPending}
                  className="h-11 md:h-12 px-3 md:px-4 flex-shrink-0"
                >
                  <Bell className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="hidden sm:inline ml-2 text-xs md:text-sm">
                    Gọi nhân viên
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Gọi nhân viên</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Cart Button */}
          <Button
            className="flex-1 h-11 md:h-12 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg"
            onClick={() => setIsMobileCartOpen(true)}
            disabled={orders.length === 0}
          >
            <div className="flex justify-between items-center w-full text-sm md:text-base">
              <span>Giỏ hàng · {orders.length} món</span>
              <span className="font-bold">{formatCurrency(totalPrice)}</span>
            </div>
          </Button>
        </div>
      </div>

      <ProductDetailDialog
        productId={selectedProductId}
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onAddToCart={handleAddToCartFromDialog}
      />

      <MobileCartModal
        isOpen={isMobileCartOpen}
        onClose={() => setIsMobileCartOpen(false)}
        selectedSkus={selectedSkus}
        dishes={dishes}
        onQuantityChange={handleQuantityChange}
        totalPrice={totalPrice}
        onOrder={handleOrder}
      />
    </div>
  );
}
