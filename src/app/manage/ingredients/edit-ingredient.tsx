'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Upload, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Resolver, useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { handleErrorApi } from '@/lib/utils';
import { mediaApiRequest } from '@/apiRequest/media';
import { toast } from 'react-toastify';
import { revalidateApiRequest } from '@/apiRequest/revalidateApiRequest';
import {
  useGetProduct,
  useUpdateProductMutation,
} from '@/app/queries/useProducts';
import {
  GenerateSKU,
  UpdateProductBodySchema,
  UpdateProductBodyType,
} from '@/app/ValidationSchemas/product.schema';
import DialogCategory from '@/app/manage/products/dialog-category';
import { useGetCategories } from '@/app/queries/useCategory';
import { Switch } from '@/components/ui/switch';
import { UpsertSKUBody } from '@/app/ValidationSchemas/sku.schema';
import {
  useGetIngredient,
  useUpdateIngredientMutation,
} from '@/app/queries/useIngredient';
import {
  updateIngredientBodySchema,
  UpdateIngredientBodyType,
} from '@/app/ValidationSchemas/ingredient.model';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetUnits } from '@/app/queries/useUnit';
import DialogAddUnit from '@/app/manage/ingredients/add-unit';

export default function EditIngredient({
  id,
  setId,
  onSubmitSuccess,
}: {
  id?: number | undefined;
  setId: (value: number | undefined) => void;
  onSubmitSuccess?: () => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [image, setImage] = useState<string>('');

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const updateMutation = useUpdateIngredientMutation();
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const { data } = useGetIngredient({
    id: id as number,
    enabled: Boolean(id),
  });
  const { data: unitsQuery } = useGetUnits();

  const form = useForm<UpdateIngredientBodyType>({
    resolver: zodResolver(
      updateIngredientBodySchema,
    ) as Resolver<UpdateIngredientBodyType>,
    defaultValues: {
      name: '',
      image: '',
      isActive: true,
      minStock: 0,
      stock: 0,
      unitId: '',
      enableLowStockWarning: false,
    },
  });

  useEffect(() => {
    if (data?.payload) {
      // const categoryIds = data.payload.categories.map((c) => c.id);

      form.reset({
        name: data.payload.name,
        image: data.payload.image,
        isActive: !!data.payload.isActive,
        minStock: data.payload.minStock,
        stock: data.payload.stock,
        unitId: data.payload.unitId,
        enableLowStockWarning: data.payload.minStock > 0,
      });
    }
  }, [data, form]);

  const resetForm = () => {
    form.reset();
    setFiles([]);
  };

  const enableLowStockWarning = form.watch('enableLowStockWarning');

  async function submit(values: UpdateIngredientBodyType) {
    if (updateMutation.isPending) return;

    try {
      // Upload ảnh mới nếu có
      let finalImageUrls = values.image;

      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append('files', file);
        });

        const uploadResult = await mediaApiRequest.upload(formData);
        const uploadedUrls = uploadResult?.payload?.data[0].url || '';
        finalImageUrls = uploadedUrls;
      }

      const body = {
        ...values,
        image: finalImageUrls,
        isActive: Boolean(values.isActive),
        // Chỉ gửi minStock khi enableLowStockWarning = true
        ...(values.enableLowStockWarning ? { minStock: values.minStock } : {}),
      };

      console.log('Final body:', body);

      await updateMutation.mutateAsync({ id: id as number, ...body });
      toast.success('Cập nhật thành công', {
        hideProgressBar: true,
        autoClose: 1000,
      });
      await revalidateApiRequest('ingredients');

      setId(undefined);
      resetForm();
      onSubmitSuccess?.();
    } catch (error) {
      handleErrorApi({ error, setError: form.setError });
    }
  }

  return (
    <Dialog
      open={Boolean(id)}
      onOpenChange={(value) => {
        if (!value) {
          setId(undefined);
          resetForm();
        }
      }}
    >
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-2xl font-bold">
            Cập nhật sản phẩm
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Các trường bắt buộc: Tên, ảnh
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            noValidate
            className="grid gap-6 py-4"
            id="edit-product-form"
            onSubmit={form.handleSubmit(submit, (err) =>
              console.log('err form', err),
            )}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Phần hình ảnh */}
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium mb-3">Hình ảnh sản phẩm</h3>
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                          {field.value && (
                            <div className="relative group">
                              <div className="aspect-square rounded-lg overflow-hidden border">
                                <img
                                  src={
                                    typeof field.value === 'string'
                                      ? field.value
                                      : URL.createObjectURL(field.value) // nếu là File
                                  }
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/placeholder-image.jpg';
                                  }}
                                />
                              </div>
                              <button
                                type="button"
                                className="absolute top-1 right-1 bg-gray-400 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => field.onChange(null)} // xoá ảnh
                              >
                                ×
                              </button>
                            </div>
                          )}

                          {!field.value && (
                            <div
                              className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                              onClick={() => imageInputRef.current?.click()}
                            >
                              <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                              <span className="text-xs text-muted-foreground">
                                Thêm ảnh
                              </span>
                            </div>
                          )}
                        </div>

                        <input
                          type="file"
                          accept="image/*"
                          ref={imageInputRef}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              field.onChange(file); // set file trực tiếp vào form
                            }
                          }}
                          className="hidden"
                        />

                        <p className="text-xs text-muted-foreground">
                          Chỉ chọn 1 ảnh, kích thước tối đa 2MB
                        </p>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Phần thông tin cơ bản */}
              <div className="md:col-span-2 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Thông tin cơ bản</h3>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="name" className="text-sm font-medium">
                          Tên nguyên liệu *
                        </Label>
                        <Input
                          id="name"
                          {...field}
                          placeholder="Nhập tên nguyên liệu"
                          className="mt-1"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <Label
                            htmlFor="stock"
                            className="text-sm font-medium"
                          >
                            Số lượng còn
                          </Label>
                          <Input
                            id="stock"
                            type="number"
                            {...field}
                            placeholder="0"
                            className="mt-1"
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="enableLowStockWarning"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5 text-sm">
                                <FormLabel>Cảnh báo tồn kho thấp</FormLabel>
                                <p className="text-[12px] text-muted-foreground">
                                  {field.value
                                    ? 'Bật cảnh báo'
                                    : 'Tắt cảnh báo'}
                                </p>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value ?? false}
                                  onCheckedChange={(checked) => {
                                    field.onChange(checked);
                                    if (!checked) {
                                      form.setValue('minStock', 0);
                                    }
                                  }}
                                />
                              </FormControl>
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {enableLowStockWarning && (
                      <FormField
                        control={form.control}
                        name="minStock"
                        render={({ field }) => (
                          <FormItem>
                            <Label
                              htmlFor="minStock"
                              className="text-sm font-medium"
                            >
                              Mức tồn cảnh báo
                            </Label>
                            <Input
                              id="minStock"
                              type="number"
                              min="0"
                              {...field}
                              placeholder="0"
                              className="mt-1"
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5 text-sm">
                              <FormLabel>Trạng thái công khai</FormLabel>
                              <p className="text-[12px] text-muted-foreground">
                                {field.value
                                  ? 'Đang hoạt động'
                                  : 'Chưa hoạt động'}
                              </p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value ?? false} // nếu null/undefined thì coi là false
                                onCheckedChange={(checked) =>
                                  field.onChange(checked)
                                }
                              />
                            </FormControl>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="unitId"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="unitId">Đơn vị</Label>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn đơn vị" />
                            </SelectTrigger>
                            <SelectContent>
                              {unitsQuery?.payload?.data.map((unit) => (
                                <SelectItem
                                  key={unit.name}
                                  value={unit.name.toString()}
                                >
                                  {unit.name} - {unit.description}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <DialogAddUnit
                          onOpenChange={(open) => {
                            if (!open) {
                              /* refetch if hook supports */
                            }
                          }}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </form>
        </Form>

        <DialogFooter className="border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setId(undefined);
              resetForm();
            }}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            form="edit-product-form"
            className="min-w-24"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
