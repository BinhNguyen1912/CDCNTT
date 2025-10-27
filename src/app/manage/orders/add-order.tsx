/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PlusCircle } from 'lucide-react';
import { use, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { TablesDialog } from '@/app/manage/orders/tables-dialog';
import { Switch } from '@/components/ui/switch';
import GuestsDialog from '@/app/manage/orders/guests-dialog';
import Image from 'next/image';
import { cn, formatCurrency, handleErrorApi } from '@/lib/utils';

import { DishStatus } from '@/app/constants/type';
import Quantity from '@/app/guest/menu/quatity';

import { toast } from 'react-toastify';
import {
  CreateGuestSchema,
  CreateGuestType,
  GuestListType,
} from '@/app/ValidationSchemas/guest.schema';
import { GuestCreateNewOrderType } from '@/app/ValidationSchemas/order.schema';
import { useGetProducts } from '@/app/queries/useProducts';
import { useCreateOrderForGuestMutation } from '@/app/queries/useOrder';
import { useCreateGuest } from '@/app/queries/useAccount';

interface SkuSelection {
  skuId: number;
  quantity: number;
  productId: number;
}

export default function AddOrder() {
  const [open, setOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<
    GuestListType['data'][0] | null
  >(null);
  const [isNewGuest, setIsNewGuest] = useState(true);
  const [selectedSkus, setSelectedSkus] = useState<SkuSelection[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data } = useGetProducts();
  const dishes = useMemo(() => data?.payload?.data || [], [data]);

  const createOrder = useCreateOrderForGuestMutation();
  const createGuest = useCreateGuest();

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

  const form = useForm<CreateGuestType>({
    resolver: zodResolver(CreateGuestSchema),
    defaultValues: {
      name: '',
      tableNodeId: 0,
    },
  });
  const name = form.watch('name');
  const tableNodeId = form.watch('tableNodeId');

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
    try {
      let guestId: number | undefined;

      // Bước 1: Tạo guest mới nếu cần
      if (isNewGuest) {
        // Validate form trước khi tạo guest
        if (!name.trim()) {
          toast.error('Vui lòng nhập tên khách hàng');
          return;
        }
        if (!tableNodeId) {
          toast.error('Vui lòng chọn bàn');
          return;
        }

        console.log('🔄 Đang tạo khách hàng mới...', { name, tableNodeId });
        const newGuest = await createGuest.mutateAsync({
          name: name.trim(),
          tableNodeId,
        });

        guestId = newGuest?.payload?.id;
        console.log('✅ Đã tạo khách hàng mới với ID:', guestId);
      } else {
        // Sử dụng guest đã chọn
        guestId = selectedGuest?.id;
        console.log('👤 Sử dụng khách hàng có sẵn với ID:', guestId);
      }

      // Bước 2: Kiểm tra guestId
      if (!guestId) {
        toast.error('Không thể xác định khách hàng');
        return;
      }

      // Bước 3: Kiểm tra có món nào được chọn không
      if (orders.length === 0) {
        toast.error('Vui lòng chọn ít nhất một món');
        return;
      }

      // Bước 4: Tạo đơn hàng với guestId trong params
      console.log(
        '🛒 Đang tạo đơn hàng cho guest ID:',
        guestId,
        'với orders:',
        orders,
      );
      await createOrder.mutateAsync({
        guestId: guestId,
        orders: orders,
      });

      toast.success('Tạo đơn hàng thành công!');
      reset();
    } catch (error) {
      console.error('❌ Lỗi khi tạo đơn hàng:', error);
      handleErrorApi({
        error,
        setError: form.setError,
      });
    }
  };
  const reset = () => {
    form.reset();
    setSelectedGuest(null);
    setIsNewGuest(true);
    setSelectedSkus([]);
    setOpen(false);
  };
  return (
    <Dialog
      onOpenChange={(value) => {
        if (!value) {
          reset();
        }
        setOpen(value);
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="h-7 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Tạo đơn hàng
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Tạo đơn hàng</DialogTitle>
        </DialogHeader>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <Label
                htmlFor="isNewGuest"
                className="text-sm font-medium text-blue-900"
              >
                Khách hàng mới
              </Label>
              <p className="text-xs text-blue-700 mt-1">
                {isNewGuest
                  ? 'Tạo khách hàng mới'
                  : 'Chọn từ khách hàng có sẵn'}
              </p>
            </div>
            <Switch
              id="isNewGuest"
              checked={isNewGuest}
              onCheckedChange={setIsNewGuest}
            />
          </div>
        </div>
        {isNewGuest && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Thông tin khách hàng
            </h3>
            <Form {...form}>
              <form noValidate className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <Label
                        htmlFor="name"
                        className="text-sm font-medium text-gray-700"
                      >
                        Tên khách hàng
                      </Label>
                      <Input
                        id="name"
                        className="mt-1"
                        placeholder="Nhập tên khách hàng"
                        {...field}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tableNodeId"
                  render={({ field }) => (
                    <FormItem>
                      <Label
                        htmlFor="tableNumber"
                        className="text-sm font-medium text-gray-700"
                      >
                        Chọn bàn
                      </Label>
                      <div className="mt-1 flex items-center gap-3">
                        <div className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-600">
                          {field.value
                            ? `Bàn #${field.value}`
                            : 'Chưa chọn bàn'}
                        </div>
                        <TablesDialog
                          onChoose={(table) => {
                            field.onChange(table.id);
                          }}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
        )}
        {!isNewGuest && (
          <GuestsDialog
            onChoose={(guest) => {
              setSelectedGuest(guest);
            }}
          />
        )}
        {!isNewGuest && selectedGuest && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-green-900 mb-2">
              Khách hàng đã chọn
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-green-900">
                  {selectedGuest.name}
                </p>
                <p className="text-sm text-green-700">
                  ID: #{selectedGuest.id}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-green-900">Bàn</p>
                <p className="text-sm text-green-700">
                  {selectedGuest.tableNode?.name || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {dishes
            .filter((dish) => dish.status !== 'HIDDEN')
            .map((dish) => {
              const isUnavailable = dish.status === 'INACTIVE';

              return (
                <div
                  key={dish.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow h-fit"
                >
                  {/* Product Header */}
                  <div className="text-center mb-4">
                    <div className="relative mx-auto w-20 h-20 mb-3">
                      {isUnavailable && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg z-10">
                          <span className="text-white text-xs font-medium bg-red-500 px-2 py-1 rounded">
                            Hết hàng
                          </span>
                        </div>
                      )}
                      <Image
                        src={dish.images?.[0] || '/placeholder-food.jpg'}
                        alt={dish.name}
                        fill
                        quality={100}
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                      {dish.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Giá gốc: {formatCurrency(dish.basePrice)}
                    </p>
                  </div>

                  {/* SKU Options */}
                  {dish.variants && dish.variants.length > 0 && (
                    <div className="space-y-3">
                      {dish.variants.map((variant, index) => (
                        <div key={index}>
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            {variant.value}
                          </label>
                          <div className="space-y-2">
                            {variant.valueOption.map((option, optIndex) => {
                              const skuId = dish.skus[optIndex]?.id;
                              if (!skuId) return null;

                              const currentQuantity = getCurrentQuantity(
                                dish.id,
                                skuId,
                              );

                              return (
                                <div
                                  key={optIndex}
                                  className={`border rounded-lg p-2 transition-all ${
                                    currentQuantity > 0
                                      ? 'border-red-500 bg-red-50'
                                      : 'border-gray-200 hover:border-gray-300'
                                  } ${isUnavailable ? 'opacity-50' : ''}`}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-gray-900 truncate">
                                      {option.value}
                                    </span>
                                    <span className="text-xs font-semibold text-red-600">
                                      {formatCurrency(option.price)}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-center">
                                    <Quantity
                                      onChange={(value) =>
                                        handleQuantityChange(
                                          dish.id,
                                          skuId,
                                          value,
                                        )
                                      }
                                      value={currentQuantity}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
        <DialogFooter className="bg-gray-50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
          <div className="w-full space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Tổng số món:</span>
              <span className="font-semibold text-gray-900">
                {orders.length} món
              </span>
            </div>
            <div className="flex items-center justify-between text-lg">
              <span className="font-semibold text-gray-900">Tổng tiền:</span>
              <span className="font-bold text-red-600">
                {formatCurrency(totalPrice)}
              </span>
            </div>
            <Button
              className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg"
              onClick={handleOrder}
              disabled={orders.length === 0}
            >
              Tạo đơn hàng
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
