'use client';

import { useState, useMemo, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { PlusCircle, Upload, Plus, X, CalendarIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import DialogCategory from './dialog-category';
import { Switch } from '@/components/ui/switch';
import {
  CreateProductBodyType,
  VariantOption,
  VariantsType,
  VariantType,
} from '@/app/ValidationSchemas/product.schema';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { mediaApiRequest } from '@/apiRequest/media';
import { useAddProductMutation } from '@/app/queries/useProducts';
import { useAddIngredientMutation } from '@/app/queries/useIngredient';
import { CreateIngredientBodyType } from '@/app/ValidationSchemas/ingredient.model';
import { useGetUnits } from '@/app/queries/useUnit';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DialogAddUnit from '@/app/manage/ingredients/add-unit';
import { handleErrorApi } from '@/lib/utils';

interface AddIngredientProps {
  onIngredientCreated?: () => void;
}

export default function AddIngredient({
  onIngredientCreated,
}: AddIngredientProps) {
  const [files, setFiles] = useState<File[]>([]);

  const [open, setOpen] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const addIngredientMutation = useAddIngredientMutation();
  const form = useForm<CreateIngredientBodyType>({
    defaultValues: {
      name: '',
      image: '',
      minStock: 0,
      stock: 0,
      unitId: '',
      isActive: true,
      enableLowStockWarning: false,
    },
  });

  const image = form.watch('image');
  const enableLowStockWarning = form.watch('enableLowStockWarning');

  const previewImages = useMemo(() => {
    if (files && files.length) {
      return files.map((f) => URL.createObjectURL(f)); // files là files[]
    }
    return image; // fallback: mảng string từ form
  }, [files, image]);
  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const newFiles = Array.from(selectedFiles);
      setFiles(newFiles);

      // Tạo preview images
      const previewUrls = newFiles.map((f) => URL.createObjectURL(f));

      // Upload files và lấy URL thực
      try {
        const formData = new FormData();
        newFiles.forEach((file) => {
          formData.append('files', file);
        });

        // Gọi API upload - giả sử bạn có hàm mediaApiRequest.upload
        const uploadResult = await mediaApiRequest.upload(formData);
        const imageUrls =
          uploadResult?.payload?.data.map((item: any) => item.url) || [];

        // Set URL thực vào form
        form.setValue('image', imageUrls[0]);
      } catch (error) {
        console.error('Upload failed:', error);
        toast.error('Upload ảnh thất bại');
        // Fallback: vẫn set preview nhưng cảnh báo
        form.setValue('image', previewUrls[0]);
      }
    }
  };

  const reset = () => {
    setFiles([]);
    setOpen(false);
    form.reset();
  };

  const handleSubmit = async (values: CreateIngredientBodyType) => {
    if (addIngredientMutation.isPending) return;
    try {
      // Nếu có files chưa upload, upload chúng trước
      let finalImageUrls = values.image;
      let body = values;

      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const uploadResult = await mediaApiRequest.upload(formData);
      finalImageUrls = uploadResult?.payload?.data[0].url || '';

      body = {
        stock: Number(body.stock),
        unitId: body.unitId,
        image: finalImageUrls,
        name: body.name,
        isActive: body.isActive,
        enableLowStockWarning: body.enableLowStockWarning,
        // Chỉ gửi minStock khi enableLowStockWarning = true
        ...(body.enableLowStockWarning
          ? { minStock: Number(body.minStock) }
          : {}),
      };
      const resuft = await addIngredientMutation.mutateAsync(body);
      console.log('resuft:', resuft);
      toast.success('Nguyên liệu đã được thêm thành công!');
      onIngredientCreated?.();
      reset();
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError,
      });
    }
  };

  const unitsQuery = useGetUnits();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Thêm nguyên liệu
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[900px] max-h-screen overflow-auto">
        <DialogHeader>
          <DialogTitle>Thêm nguyên liệu</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            id="add-ingredient-form"
            className="grid gap-6"
            onSubmit={form.handleSubmit(handleSubmit)}
            noValidate
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {/* Hình & Upload */}
              <div className="md:col-span-1 flex flex-col items-center gap-4">
                <div className="grid grid-cols-1 gap-2">
                  {files.length > 0 ? (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                      <img
                        src={URL.createObjectURL(files[0])}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="absolute top-1 right-1 p-0"
                        onClick={() => {
                          setFiles([]);
                          form.setValue('image', ''); // xoá ảnh trong form
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="relative w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <Upload className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={imageInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFiles([file]); // lưu file để upload
                      const previewUrl = URL.createObjectURL(file);
                      form.setValue('image', previewUrl); // string hợp lệ với schema
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-1" /> Tải ảnh lên
                </Button>
              </div>

              {/* Thông tin cơ bản */}
              <div className="md:col-span-2 space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="name">Tên nguyên liệu</Label>
                      <FormControl>
                        <Input id="name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="stock">Số lượng nhập</Label>
                      <FormControl>
                        <Input id="stock" {...field} />
                      </FormControl>
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
                              {field.value ? 'Bật cảnh báo' : 'Tắt cảnh báo'}
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
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
                        <Label htmlFor="minStock">Mức tồn kho cảnh báo</Label>
                        <FormControl>
                          <Input
                            id="minStock"
                            type="number"
                            min="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => {
                    const isActive = !!field.value; // ép sang boolean

                    return (
                      <FormItem>
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5 text-sm">
                              <FormLabel>Trạng thái công khai</FormLabel>
                              <p className="text-[12px] text-muted-foreground">
                                {isActive ? 'Đang hoạt động' : 'Chưa hoạt động'}
                              </p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={isActive}
                                onCheckedChange={(checked) =>
                                  field.onChange(checked)
                                }
                              />
                            </FormControl>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

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
                            <SelectTrigger className="min-w-[220px]">
                              <SelectValue placeholder="Chọn đơn vị" />
                            </SelectTrigger>
                            <SelectContent>
                              {unitsQuery.data?.payload?.data?.map((unit) => (
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
                              unitsQuery.refetch?.();
                            }
                          }}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="basePrice"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="price">Giá cơ bản</Label>
                        <FormControl>
                          <Input
                            id="price"
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="virtualPrice"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="price">Giá Ảo</Label>
                        <FormControl>
                          <Input
                            id="price"
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div> */}

                <div className="grid grid-cols-2 gap-4">
                  {/* Categories */}
                  {/* <FormField
                    control={form.control}
                    name="categories"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Danh mục</Label>
                        <FormControl>
                          <DialogCategory
                            selectedCategories={field.value || []}
                            setSelectedCategories={field.onChange}
                            showCategoryDropdown={showCategoryDropdown}
                            setShowCategoryDropdown={setShowCategoryDropdown}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}

                  {/* <Controller
                    name="publishedAt"
                    control={form.control}
                    render={({ field }) => {
                      const isPublished = field.value !== null;
                      const dateValue = field.value
                        ? field.value instanceof Date
                          ? field.value.toISOString().split('T')[0]
                          : new Date(field.value).toISOString().split('T')[0]
                        : new Date().toISOString().split('T')[0];

                      return (
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5 text-sm">
                              <Label>Trạng thái công khai</Label>
                              <p className="text-[12px] text-muted-foreground">
                                {isPublished ? 'Đã công khai' : 'Riêng tư'}
                              </p>
                            </div>
                            <Switch
                              checked={isPublished}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange(new Date());
                                } else {
                                  field.onChange(null);
                                }
                              }}
                            />
                          </div>

                          {isPublished && (
                            <div className="grid gap-2">
                              <Input
                                id="publish-date"
                                type="date"
                                value={dateValue}
                                onChange={(e) => {
                                  field.onChange(
                                    e.target.value
                                      ? new Date(e.target.value)
                                      : null,
                                  );
                                }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    }}
                  /> */}
                  {/* <FormField
                    control={form.control}
                    name="publishedAt"
                    render={({ field }) => {
                      const isPublished = field.value !== null;
                      const dateValue = field.value
                        ? field.value instanceof Date
                          ? field.value.toISOString().split('T')[0]
                          : new Date(field.value).toISOString().split('T')[0]
                        : new Date().toISOString().split('T')[0];

                      return (
                        <FormItem>
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5 text-sm">
                                <FormLabel>Trạng thái công khai</FormLabel>
                                <p className="text-[12px] text-muted-foreground">
                                  {isPublished ? 'Đã công khai' : 'Riêng tư'}
                                </p>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={isPublished}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange(new Date());
                                    } else {
                                      field.onChange(null);
                                    }
                                  }}
                                />
                              </FormControl>
                            </div>

                            {isPublished && (
                              <div className="grid gap-2">
                                <FormControl>
                                  <Input
                                    id="publish-date"
                                    type="date"
                                    value={dateValue}
                                    onChange={(e) => {
                                      field.onChange(
                                        e.target.value
                                          ? new Date(e.target.value)
                                          : null,
                                      );
                                    }}
                                  />
                                </FormControl>
                              </div>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  /> */}
                </div>

                {/* Categories */}
                {/* <FormField
                  control={form.control}
                  name="categories"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Danh mục</Label>
                      <FormControl>
                        <DialogCategory
                          selectedCategories={field.value || []}
                          setSelectedCategories={field.onChange}
                          showCategoryDropdown={showCategoryDropdown}
                          setShowCategoryDropdown={setShowCategoryDropdown}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}

                {/* Publish */}
                {/* <Controller
                  name="publishedAt"
                  control={form.control}
                  render={({ field }) => (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Label>Bật public</Label>
                        <Switch
                          checked={field.value !== null}
                          onCheckedChange={(val) => {
                            field.onChange(val);
                            if (!val) form.setValue('publishedAt', null);
                            else if (!form.getValues('publishedAt'))
                              form.setValue('publishedAt', today);
                          }}
                        />
                      </div>
                      {form.watch('publishedAt') && (
                        <Controller
                          name="publishedAt"
                          control={form.control}
                          render={({ field }) => (
                            <Input
                              type="date"
                              {...field}
                              value={field.value || today}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          )}
                        />
                      )}
                    </div>
                  )}
                /> */}
              </div>
            </div>
          </form>
        </Form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Hủy
          </Button>
          <Button type="submit" form="add-ingredient-form">
            Thêm nguyên liệu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
