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
} from '@/app/SchemaModel/product.schema';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { mediaApiRequest } from '@/apiRequest/media';
import { useAddProductMutation } from '@/app/queries/useProducts';

// ========== TYPE DEFINITIONS ==========

// interface VariantOption {
//   value: string;
//   price: number;
//   image: string;
// }

// interface Variant {
//   value: string;
//   valueOption: VariantOption[];
// }

// interface CreateDishBodyType {
//   name: string;
//   description: string;
//   price: number;
//   images: string[];
//   status: DishStatus;
//   categories: number[];
//   variants: Variant[];
//   skus: VariantOption[];
//   publishedAt?: string | null; // ISO string
//   isPublished: boolean;
// }

// const getVietnameseDishStatus = (status: DishStatus): string => {
//   const statusMap: Record<DishStatus, string> = {
//     AVAILABLE: 'Có sẵn',
//     UNAVAILABLE: 'Hết hàng',
//   };
//   return statusMap[status] || status;
// };

// ========== MAIN COMPONENT ==========
export default function AddDish() {
  const [files, setFiles] = useState<File[]>([]);

  const [open, setOpen] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [variants, setVariants] = useState<VariantType[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const addProductMutation = useAddProductMutation();
  const form = useForm<CreateProductBodyType>({
    defaultValues: {
      name: '',
      basePrice: 0,
      virtualPrice: 0,
      images: [],
      categories: [],
      variants: [],
      skus: [],
      publishedAt: null,
    },
  });

  const images = form.watch('images');

  const previewImages = useMemo(() => {
    if (files && files.length) {
      return files.map((f) => URL.createObjectURL(f)); // files là files[]
    }
    return images; // fallback: mảng string từ form
  }, [files, images]);
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
        const imageUrls = uploadResult.payload.data.map(
          (item: any) => item.url,
        );

        // Set URL thực vào form
        form.setValue('images', imageUrls);
      } catch (error) {
        console.error('Upload failed:', error);
        toast.error('Upload ảnh thất bại');
        // Fallback: vẫn set preview nhưng cảnh báo
        form.setValue('images', previewUrls);
      }
    }
  };
  // --- VARIANTS HANDLERS ---
  const handleAddVariant = () => {
    setVariants([
      ...variants,
      { value: '', valueOption: [{ value: '', price: 0, image: '' }] },
    ]);
  };

  const handleVariantChange = (index: number, value: string) => {
    const updated = [...variants];
    updated[index].value = value;
    setVariants(updated);
  };

  const handleVariantOptionChange = (
    variantIndex: number,
    optionIndex: number,
    field: keyof VariantOption,
    value: string | number,
  ) => {
    const updated = [...variants];
    updated[variantIndex].valueOption[optionIndex][field] = value as never;
    setVariants(updated);
  };

  const handleAddVariantOption = (variantIndex: number) => {
    const updated = [...variants];
    updated[variantIndex].valueOption.push({ value: '', price: 0, image: '' });
    setVariants(updated);
  };

  const handleRemoveVariantOption = (
    variantIndex: number,
    optionIndex: number,
  ) => {
    const updated = [...variants];
    updated[variantIndex].valueOption.splice(optionIndex, 1);
    setVariants(updated);
  };

  const handleRemoveVariant = (index: number) => {
    const updated = [...variants];
    updated.splice(index, 1);
    setVariants(updated);
  };

  const reset = () => {
    setFiles([]);
    setOpen(false);
    setVariants([]);
    form.reset();
  };

  const handleSubmit = async (values: CreateProductBodyType) => {
    if (addProductMutation.isPending) return;
    try {
      // Nếu có files chưa upload, upload chúng trước
      let finalImageUrls = values.images;

      if (
        files.length > 0 &&
        values.images.some((img) => img.includes('blob:'))
      ) {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append('files', file);
        });

        const uploadResult = await mediaApiRequest.upload(formData);
        finalImageUrls = uploadResult.payload.data.map((item: any) => item.url);
      }

      const formData: CreateProductBodyType = {
        ...values,
        images: finalImageUrls,
        variants,
        skus: variants.flatMap((v) => v.valueOption.map((o) => ({ ...o }))),
      };
      const resuft = await addProductMutation.mutateAsync(formData);
      console.log('resuft:', resuft);
      toast.success('Món ăn đã được thêm thành công!');
      reset();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Có lỗi xảy ra khi thêm món ăn');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Thêm món ăn
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[900px] max-h-screen overflow-auto">
        <DialogHeader>
          <DialogTitle>Thêm món ăn</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            id="add-dish-form"
            className="grid gap-6"
            onSubmit={form.handleSubmit(handleSubmit)}
            noValidate
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {/* Hình & Upload */}
              <div className="md:col-span-1 flex flex-col items-center gap-4">
                <div className="grid grid-cols-2 gap-2">
                  {previewImages.length > 0 ? (
                    previewImages.map((src, idx) => (
                      <div
                        key={idx}
                        className="relative w-32 h-32 rounded-lg overflow-hidden border"
                      >
                        <img
                          src={src}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="absolute top-1 right-1 p-0"
                          onClick={() => {
                            const newFiles = files.filter((_, i) => i !== idx);
                            setFiles(newFiles);

                            // Cập nhật cả images trong form
                            const currentImages = form.getValues('images');
                            const newImages = currentImages.filter(
                              (_, i) => i !== idx,
                            );
                            form.setValue('images', newImages);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="relative w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <Upload className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  ref={imageInputRef}
                  onChange={handleFilesChange}
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
                      <Label htmlFor="name">Tên món ăn</Label>
                      <FormControl>
                        <Input id="name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Categories */}
                  <FormField
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
                  />

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
                  <FormField
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
                  />
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

            {/* Biến thể */}
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-lg">Biến thể</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddVariant}
                >
                  <Plus className="h-4 w-4 mr-1" /> Thêm biến thể
                </Button>
              </div>

              {variants.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  Chưa có biến thể nào
                </div>
              ) : (
                variants.map((variant, vi) => (
                  <div key={vi} className="border rounded-md p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="font-medium">Biến thể {vi + 1}</div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveVariant(vi)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Tên biến thể"
                      value={variant.value}
                      onChange={(e) => handleVariantChange(vi, e.target.value)}
                      className="mb-3"
                    />
                    {variant.valueOption.map((opt, oi) => (
                      <div
                        key={oi}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end p-3 bg-gray-50 rounded-md mb-2"
                      >
                        <Input
                          placeholder="Giá trị"
                          value={opt.value}
                          onChange={(e) =>
                            handleVariantOptionChange(
                              vi,
                              oi,
                              'value',
                              e.target.value,
                            )
                          }
                        />
                        <Input
                          placeholder="Giá"
                          type="number"
                          value={opt.price}
                          onChange={(e) =>
                            handleVariantOptionChange(
                              vi,
                              oi,
                              'price',
                              parseInt(e.target.value),
                            )
                          }
                        />
                        <div className="flex items-end gap-2">
                          <div className="relative w-full">
                            {opt.image ? (
                              <img
                                src={opt.image}
                                alt="preview"
                                className="w-full h-20 object-cover rounded-md"
                              />
                            ) : (
                              <div className="w-full h-20 flex items-center justify-center border border-dashed rounded-md text-gray-400">
                                Chưa có ảnh
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f)
                                  handleVariantOptionChange(
                                    vi,
                                    oi,
                                    'image',
                                    URL.createObjectURL(f),
                                  );
                              }}
                            />
                          </div>
                          {variant.valueOption.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveVariantOption(vi, oi)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddVariantOption(vi)}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Thêm tùy chọn
                    </Button>
                  </div>
                ))
              )}
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
          <Button type="submit" form="add-dish-form">
            Thêm món ăn
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
