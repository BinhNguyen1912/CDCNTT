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
import { Upload } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Resolver, useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { handleErrorApi } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

import { mediaApiRequest } from '@/apiRequest/media';
import { toast } from 'react-toastify';
import { revalidateApiRequest } from '@/apiRequest/revalidateApiRequest';
import {
  useGetProduct,
  useUpdateProductMutation,
} from '@/app/queries/useProducts';
import {
  UpdateProductBodySchema,
  UpdateProductBodyType,
} from '@/app/SchemaModel/product.schema';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DialogCategory from '@/app/manage/products/dialog-category';
import { useGetCategories } from '@/app/queries/useCategory';
import DialogAddCategory from '@/app/manage/products/add-category';

export default function EditProduct({
  id,
  setId,
  onSubmitSuccess,
}: {
  id?: number | undefined;
  setId: (value: number | undefined) => void;
  onSubmitSuccess?: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const updateMutation = useUpdateProductMutation();
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const { data } = useGetProduct({
    id: id as number,
    enabled: Boolean(id),
  });

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

  const image = form.watch('images')?.[0];
  const name = form.watch('name');

  const { data: categories } = useGetCategories();

  const previewImage = useMemo(() => {
    if (file) return URL.createObjectURL(file);
    return image;
  }, [file, image]);

  useEffect(() => {
    if (data) {
      form.reset({
        name: data.payload.name,
        basePrice: data.payload.basePrice,
        virtualPrice: data.payload.virtualPrice,
        categories: data.payload.categories.map((c) => c.id) || [], // ✅ giữ cả id + name
        variants: data.payload.variants || [],
        skus: data.payload.skus || [],
        images: data.payload.images,
        publishedAt: data.payload.publishedAt,
      });
    }
  }, [data, form]);

  async function submit(value: UpdateProductBodyType) {
    let body: UpdateProductBodyType & { id: number } = {
      id: id as number,
      ...value,
    };

    if (updateMutation.isPending) return;
    try {
      if (file) {
        const formData = new FormData();
        formData.append('file', file);

        const upload = await mediaApiRequest.upload(formData);

        // upload.payload.data là array => lấy [0]
        const uploadedFile = upload.payload.data[0];

        body = {
          ...body,
          images: [uploadedFile.url], // ✅ chỉ lấy url
        };
      }

      const result = await updateMutation.mutateAsync(body);
      toast.success('Cập nhật thành công');
      await revalidateApiRequest('products');
      reset();
      onSubmitSuccess?.();
    } catch (error) {
      handleErrorApi({ error, setError: form.setError });
    }
  }

  const reset = () => {
    setId(undefined);
    setFile(null);
  };

  return (
    <Dialog
      open={Boolean(id)}
      onOpenChange={(value) => {
        if (!value) {
          setId(undefined);
          setFile(null);
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-screen overflow-auto">
        <DialogHeader>
          <DialogTitle>Cập nhật sản phẩm</DialogTitle>
          <DialogDescription>Các trường bắt buộc: Tên, ảnh</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className="grid auto-rows-max items-start gap-4 md:gap-8"
            id="edit-product-form"
            onSubmit={form.handleSubmit(submit)}
          >
            <div className="grid gap-4 py-4">
              {/* Image */}
              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex gap-2 items-start justify-start">
                      <Avatar className="aspect-square w-[100px] h-[100px] rounded-md object-cover">
                        <AvatarImage src={previewImage} />
                        <AvatarFallback>{name || 'Ảnh'}</AvatarFallback>
                      </Avatar>
                      <input
                        type="file"
                        accept="image/*"
                        ref={imageInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFile(file);
                            field.onChange([
                              'http://localhost:3000/' + file.name,
                            ]);
                          }
                        }}
                        className="hidden"
                      />
                      <button
                        className="flex aspect-square w-[100px] items-center justify-center rounded-md border border-dashed"
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        <span className="sr-only">Upload</span>
                      </button>
                    </div>
                  </FormItem>
                )}
              />

              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="name">Tên sản phẩm</Label>
                    <Input id="name" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Base Price */}
              <FormField
                control={form.control}
                name="basePrice"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="basePrice">Giá gốc</Label>
                    <Input id="basePrice" type="number" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Virtual Price */}
              <FormField
                control={form.control}
                name="virtualPrice"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="virtualPrice">Giá hiển thị</Label>
                    <Input id="virtualPrice" type="number" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categories"
                render={({ field }) => (
                  <FormItem>
                    <Label>Danh mục</Label>
                    <FormControl>
                      <div className="flex flex-wrap gap-2">
                        {/* render danh mục hiện có */}
                        {field.value?.map((id) => {
                          const cat = categories?.payload.data.find(
                            (c) => c.id === id,
                          );
                          return (
                            <span
                              key={id}
                              className="px-2 py-1 bg-gray-100 rounded text-sm"
                            >
                              {cat ? cat.name : `ID ${id}`}
                            </span>
                          );
                        })}

                        {/* nút chọn danh mục */}
                        <DialogCategory
                          selectedCategories={field.value}
                          setSelectedCategories={field.onChange}
                          setShowCategoryDropdown={setShowCategoryDropdown}
                          showCategoryDropdown={showCategoryDropdown}
                        />

                        {/* nút thêm mới */}
                        <DialogAddCategory
                          categories={categories?.payload.data || []}
                          setCategories={() => {
                            // Sau khi thêm mới thì gọi lại API hoặc cập nhật state
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="skus"
                render={({ field }) => (
                  <FormItem>
                    <Label>Biến thể (SKU)</Label>
                    <div className="space-y-2">
                      {field.value?.map((sku, idx) => (
                        <div
                          key={sku.value}
                          className="flex gap-2 items-center"
                        >
                          <Input
                            value={sku.value}
                            onChange={(e) => {
                              const newSkus = [...field.value];
                              newSkus[idx].value = e.target.value;
                              field.onChange(newSkus);
                            }}
                            placeholder="Tên biến thể"
                          />
                          <Input
                            type="number"
                            value={sku.price}
                            onChange={(e) => {
                              const newSkus = [...field.value];
                              newSkus[idx].price = Number(e.target.value);
                              field.onChange(newSkus);
                            }}
                            placeholder="Giá"
                          />
                        </div>
                      ))}
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button type="submit" form="edit-product-form">
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
