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
} from '@/app/SchemaModel/product.schema';
import DialogCategory from '@/app/manage/products/dialog-category';
import { useGetCategories } from '@/app/queries/useCategory';
import { Switch } from '@/components/ui/switch';
import { UpsertSKUBody } from '@/app/SchemaModel/sku.schema';

// Định nghĩa types cho biến thể
type VariantOption = {
  value: string;
  price: number;
  image: string;
};

type VariantType = {
  value: string;
  valueOption: VariantOption[];
};

export default function EditProduct({
  id,
  setId,
  onSubmitSuccess,
}: {
  id?: number | undefined;
  setId: (value: number | undefined) => void;
  onSubmitSuccess?: () => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<VariantType[]>([]);
  const [variantFiles, setVariantFiles] = useState<Map<string, File>>(
    new Map(),
  );

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const updateMutation = useUpdateProductMutation();
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const { data } = useGetProduct({
    id: id as number,
    enabled: Boolean(id),
  });

  const { data: categories } = useGetCategories();
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  const form = useForm<UpdateProductBodyType>({
    resolver: zodResolver(
      UpdateProductBodySchema,
    ) as Resolver<UpdateProductBodyType>,
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

  useEffect(() => {
    if (data?.payload) {
      const categoryIds = data.payload.categories.map((c) => c.id);
      setSelectedCategories(categoryIds);
      setImages(data.payload.images || []);
      setVariants(data.payload.variants || []);

      form.reset({
        name: data.payload.name,
        basePrice: data.payload.basePrice,
        virtualPrice: data.payload.virtualPrice,
        categories: categoryIds,
        variants: data.payload.variants || [],
        skus: [],
        images: data.payload.images,
        publishedAt: data.payload.publishedAt,
      });
    }
  }, [data, form]);
  useEffect(() => {
    // Đồng bộ variants từ state vào form khi state thay đổi
    form.setValue('variants', variants, { shouldValidate: true });
  }, [variants, form]);
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
    // Form sẽ tự động cập nhật nhờ useEffect ở trên
  };

  const handleRemoveVariant = (index: number) => {
    const updated = [...variants];
    updated.splice(index, 1);
    setVariants(updated);
  };

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const newFiles = Array.from(selectedFiles);
      setFiles(newFiles);

      // Tạo preview images
      const previewUrls = newFiles.map((f) => URL.createObjectURL(f));
      setImages((prev) => [...prev, ...previewUrls]);
    }
  };

  const resetForm = () => {
    form.reset();
    setFiles([]);
    setImages([]);
    setVariants([]);
    setVariantFiles(new Map());
    setSelectedCategories([]);
  };

  async function submit(values: UpdateProductBodyType) {
    if (updateMutation.isPending) return;

    try {
      // Upload ảnh mới nếu có
      let finalImageUrls = [...images.filter((img) => !img.includes('blob:'))];

      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append('files', file);
        });

        const uploadResult = await mediaApiRequest.upload(formData);
        const uploadedUrls = uploadResult.payload.data.map(
          (item: any) => item.url,
        );
        finalImageUrls = [...finalImageUrls, ...uploadedUrls];
      }

      // Upload ảnh cho biến thể nếu có
      const updatedVariants = await Promise.all(
        variants.map(async (variant, vi) => {
          const updatedOptions = await Promise.all(
            variant.valueOption.map(async (option, oi) => {
              const fileKey = `variant-${vi}-option-${oi}`;
              const file = variantFiles.get(fileKey);

              if (file) {
                const formData = new FormData();
                formData.append('files', file);
                const uploadResult = await mediaApiRequest.upload(formData);
                return {
                  ...option,
                  image: uploadResult.payload.data[0].url,
                };
              }
              return option;
            }),
          );

          return {
            ...variant,
            valueOption: updatedOptions,
          };
        }),
      );

      // Chỉ tạo SKUs nếu có variants và variants có dữ liệu
      let generatedSkus: UpsertSKUBody[] = [];
      if (
        updatedVariants.length > 0 &&
        updatedVariants.some((v) => v.valueOption.length > 0)
      ) {
        generatedSkus = GenerateSKU(updatedVariants, {
          basePrice: values.basePrice,
          image: finalImageUrls[0],
        });
      }

      const body = {
        id: id as number,
        ...values,
        images: finalImageUrls,
        categories: selectedCategories,
        variants: values.variants,
        skus: generatedSkus, // Sẽ là mảng rỗng nếu không có variants hoặc variants rỗng
      };

      console.log('Final body:', body);

      await updateMutation.mutateAsync(body);
      toast.success('Cập nhật thành công');
      await revalidateApiRequest('products');

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
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                          {images.map((img, idx) => (
                            <div key={idx} className="relative group">
                              <div className="aspect-square rounded-lg overflow-hidden border">
                                <img
                                  src={img}
                                  alt={`Preview ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // Xử lý lỗi tải ảnh (đặc biệt là blob URL đã bị revoke)
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/placeholder-image.jpg';
                                  }}
                                />
                              </div>
                              <button
                                type="button"
                                className="absolute top-1 right-1 bg-gray-400 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => {
                                  setImages((prev) =>
                                    prev.filter((_, i) => i !== idx),
                                  );
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ))}

                          {images.length < 6 && (
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
                          onChange={handleFilesChange}
                          className="hidden"
                          multiple
                        />

                        <p className="text-xs text-muted-foreground">
                          Tối đa 6 ảnh, kích thước tối đa 2MB mỗi ảnh
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
                          Tên sản phẩm *
                        </Label>
                        <Input
                          id="name"
                          {...field}
                          placeholder="Nhập tên sản phẩm"
                          className="mt-1"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="basePrice"
                      render={({ field }) => (
                        <FormItem>
                          <Label
                            htmlFor="basePrice"
                            className="text-sm font-medium"
                          >
                            Giá gốc
                          </Label>
                          <Input
                            id="basePrice"
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
                      name="virtualPrice"
                      render={({ field }) => (
                        <FormItem>
                          <Label
                            htmlFor="virtualPrice"
                            className="text-sm font-medium"
                          >
                            Giá hiển thị
                          </Label>
                          <Input
                            id="virtualPrice"
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
                  </div>

                  {/* Publish At Field */}
                  <FormField
                    control={form.control}
                    name="publishedAt"
                    render={({ field }) => {
                      const isPublished = field.value !== null;

                      // Chỉ hiển thị giá trị ngày nếu đã có
                      const dateValue = field.value
                        ? new Date(field.value).toISOString().split('T')[0]
                        : '';

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
                                    field.onChange(checked ? new Date() : null);
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

                {/* Danh mục */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Danh mục</h3>
                  <FormField
                    control={form.control}
                    name="categories"
                    render={({ field }) => (
                      <FormItem>
                        <Label className="text-sm font-medium">
                          Danh mục sản phẩm
                        </Label>
                        <FormControl>
                          <div className="space-y-3">
                            <div className="flex gap-2">
                              <DialogCategory
                                selectedCategories={selectedCategories}
                                setSelectedCategories={setSelectedCategories}
                                showCategoryDropdown={showCategoryDropdown}
                                setShowCategoryDropdown={
                                  setShowCategoryDropdown
                                }
                              />
                            </div>

                            {selectedCategories.length > 0 && (
                              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                                {selectedCategories.map((id) => {
                                  const cat = categories?.payload.data.find(
                                    (c) => c.id === id,
                                  );
                                  if (!cat) return null;
                                  return (
                                    <div
                                      key={id}
                                      className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                                    >
                                      <span>{cat.name}</span>
                                      <button
                                        type="button"
                                        className="text-blue-600 hover:text-blue-800 font-bold text-sm"
                                        onClick={() =>
                                          setSelectedCategories((prev) =>
                                            prev.filter((cid) => cid !== id),
                                          )
                                        }
                                      >
                                        ×
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Biến thể */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Biến thể</h3>
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Các biến thể sản phẩm</h4>
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
                            onChange={(e) =>
                              handleVariantChange(vi, e.target.value)
                            }
                            className="mb-3"
                          />
                          {variant.valueOption.map((opt, oi) => (
                            <div
                              key={oi}
                              className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end p-3 bg-gray-50 rounded-md mb-2"
                            >
                              <div>
                                <Label>Giá trị</Label>
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
                              </div>
                              <div>
                                <Label>Giá</Label>
                                <Input
                                  placeholder="Giá"
                                  type="number"
                                  value={opt.price}
                                  onChange={(e) =>
                                    handleVariantOptionChange(
                                      vi,
                                      oi,
                                      'price',
                                      Number(e.target.value),
                                    )
                                  }
                                />
                              </div>
                              <div className="flex items-end gap-2">
                                <div className="flex-1">
                                  <Label>Ảnh</Label>
                                  <div className="relative w-full mt-1">
                                    {opt.image ? (
                                      <img
                                        src={opt.image}
                                        alt="preview"
                                        className="w-full h-20 object-cover rounded-md"
                                        onError={(e) => {
                                          const target =
                                            e.target as HTMLImageElement;
                                          target.src = '/placeholder-image.jpg';
                                        }}
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
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          // Sử dụng index làm key thay vì giá trị
                                          const fileKey = `variant-${vi}-option-${oi}`;
                                          setVariantFiles((prev) =>
                                            new Map(prev).set(fileKey, file),
                                          );
                                          handleVariantOptionChange(
                                            vi,
                                            oi,
                                            'image',
                                            URL.createObjectURL(file),
                                          );
                                        }
                                      }}
                                    />
                                  </div>
                                </div>
                                {variant.valueOption.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleRemoveVariantOption(vi, oi)
                                    }
                                    className="h-10"
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
                </div>
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
