// import React, { useMemo, useRef, useState, useEffect } from 'react';
// import {
//   Dialog,
//   DialogClose,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '@/components/ui/dialog';
// import { Label } from '@/components/ui/label';
// import { Input } from '@/components/ui/input';
// import { Plus, Upload } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { useForm } from 'react-hook-form';
// import {
//   CategoryBodySchema,
//   CategoryBodyType,
//   CategoryType,
// } from '@/app/SchemaModel/category.schema';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { useAddCategoryMutation } from '@/app/queries/useCategory';
// import { mediaApiRequest } from '@/apiRequest/media';
// import { toast } from 'react-toastify';
// import { handleErrorApi } from '@/lib/utils';
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@/components/ui/form';
// import { Avatar } from '@radix-ui/react-avatar';
// import { AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';

// export default function DialogAddCategory({
//   categories,
//   setCategories,
//   onOpenChange,
// }: {
//   categories: CategoryType[];
//   setCategories: React.Dispatch<React.SetStateAction<CategoryType[]>>;
//   onOpenChange?: (open: boolean) => void;
// }) {
//   const [file, setFile] = useState<File | undefined>(undefined);
//   const avatarInputRef = useRef<HTMLInputElement>(null);
//   const [open, setOpen] = useState(false);
//   const addCategoryMutation = useAddCategoryMutation();

//   const form = useForm<CategoryBodyType>({
//     resolver: zodResolver(CategoryBodySchema),
//     defaultValues: {
//       name: '',
//       logo: '',
//       parentCategoryId: null,
//     },
//   });

//   const logo = form.watch('logo');

//   const previewLogo = useMemo(() => {
//     if (file) {
//       return URL.createObjectURL(file);
//     }
//     return logo;
//   }, [logo, file]);

//   const reset = () => {
//     form.reset();
//     setFile(undefined);
//   };

//   const onSubmit = async (values: CategoryBodyType) => {
//     if (addCategoryMutation.isPending) return;
//     let body = values;
//     try {
//       if (file) {
//         const formData = new FormData();
//         formData.append('files', file);

//         const upload = await mediaApiRequest.upload(formData);
//         body = {
//           ...values,
//           logo: upload?.payload?.data[0].url || '',
//         };
//       }
//       const result = await addCategoryMutation.mutateAsync(body);
//       setCategories((prev) => [...prev, result.payload]);
//       toast.success('Thành công');
//       setOpen(false);
//       reset();
//     } catch (error) {
//       handleErrorApi({
//         error,
//         setError: form.setError,
//       });
//     }
//   };
//   const handleFormSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     form.handleSubmit(onSubmit)();
//   };
//   return (
//     <Dialog
//       open={open}
//       onOpenChange={(newOpen) => {
//         setOpen(newOpen);
//         if (onOpenChange) onOpenChange(newOpen);
//       }}
//     >
//       <DialogTrigger asChild>
//         <Button
//           type="button"
//           variant="outline"
//           className="w-10 h-10 p-0 flex items-center justify-center"
//         >
//           <Plus className="h-4 w-4" />
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="sm:max-w-[425px]">
//         <Form {...form}>
//           <form onSubmit={handleFormSubmit} id="add-category-form">
//             <DialogHeader>
//               <DialogTitle className="mb-2">Thêm danh mục mới</DialogTitle>
//             </DialogHeader>
//             <div className="grid gap-4">
//               <div className="grid gap-3">
//                 {/* Avatar */}
//                 <FormField
//                   control={form.control}
//                   name="logo"
//                   render={({ field }) => (
//                     <FormItem>
//                       <div className="flex gap-2 items-start justify-start">
//                         <Avatar className="aspect-square w-[100px] h-[100px] rounded-md object-cover">
//                           <AvatarImage src={previewLogo ?? undefined} />
//                           <AvatarFallback className="rounded-none">
//                             ab
//                           </AvatarFallback>
//                         </Avatar>
//                         <input
//                           type="file"
//                           accept="image/*"
//                           className="hidden"
//                           ref={avatarInputRef}
//                           onChange={(e) => {
//                             const file = e.target.files?.[0];
//                             setFile(file);
//                             field.onChange(
//                               'http://localhost:4000/' + field.name,
//                             );
//                           }}
//                         />
//                         <button
//                           className="flex aspect-square w-[100px] items-center justify-center rounded-md border border-dashed"
//                           type="button"
//                           onClick={() => avatarInputRef.current?.click()}
//                         >
//                           <Upload className="h-4 w-4 text-muted-foreground" />
//                           <span className="sr-only">Upload</span>
//                         </button>
//                       </div>
//                     </FormItem>
//                   )}
//                 />

//                 {/* Name */}
//                 <FormField
//                   control={form.control}
//                   name="name"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Name</FormLabel>
//                       <FormControl>
//                         <Input placeholder="shadcn" {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 {/* Parent Category */}
//                 <FormField
//                   control={form.control}
//                   name="parentCategoryId"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Danh mục cha</FormLabel>
//                       <FormControl>
//                         <Select
//                           onValueChange={(value) =>
//                             field.onChange(value ? Number(value) : null)
//                           }
//                           value={field.value?.toString() || ''}
//                         >
//                           <SelectTrigger>
//                             <SelectValue placeholder="-- Không có --" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             {categories.map((cat) => (
//                               <SelectItem
//                                 key={cat.id}
//                                 value={cat.id.toString()}
//                               >
//                                 {cat.name}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>
//             </div>
//             <DialogFooter>
//               <DialogClose asChild>
//                 <Button type="button" variant="outline">
//                   Cancel
//                 </Button>
//               </DialogClose>
//               <Button type="submit" disabled={addCategoryMutation.isPending}>
//                 {addCategoryMutation.isPending ? 'Đang lưu...' : 'Save changes'}
//               </Button>
//             </DialogFooter>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// }

import React, { useMemo, useRef, useState } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import {
  CategoryBodySchema,
  CategoryBodyType,
  CategoryType,
} from '@/app/ValidationSchemas/category.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAddCategoryMutation } from '@/app/queries/useCategory';
import { mediaApiRequest } from '@/apiRequest/media';
import { toast } from 'react-toastify';
import { handleErrorApi } from '@/lib/utils';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Avatar } from '@radix-ui/react-avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function DialogAddCategory({
  categories,
  setCategories,
  onOpenChange,
}: {
  categories: CategoryType[];
  setCategories: React.Dispatch<React.SetStateAction<CategoryType[]>>;
  onOpenChange?: (open: boolean) => void;
}) {
  const [file, setFile] = useState<File | undefined>();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const addCategoryMutation = useAddCategoryMutation();

  const form = useForm<CategoryBodyType>({
    resolver: zodResolver(CategoryBodySchema),
    defaultValues: {
      name: '',
      logo: '',
      parentCategoryId: null,
    },
  });

  const logo = form.watch('logo');

  const previewLogo = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file);
    }
    return logo;
  }, [logo, file]);

  const reset = () => {
    form.reset();
    setFile(undefined);
  };

  const onSubmit = async (values: CategoryBodyType) => {
    if (addCategoryMutation.isPending) return;
    let body = values;
    try {
      if (file) {
        const formData = new FormData();
        formData.append('files', file);

        const upload = await mediaApiRequest.upload(formData);
        body = {
          ...values,
          logo: upload?.payload?.data[0].url || '',
        };
      }
      const result = await addCategoryMutation.mutateAsync(body);
      setCategories((prev) => [...prev, result.payload as CategoryType]);
      setOpen(false);
      reset();
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError,
      });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit(onSubmit)();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (onOpenChange) onOpenChange(newOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-10 h-10 p-0 flex items-center justify-center"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={handleFormSubmit} id="add-category-form">
            <DialogHeader>
              <DialogTitle className="mb-2">Thêm danh mục mới</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-3">
                {/* Avatar */}
                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex gap-2 items-start justify-start">
                        <Avatar className="aspect-square w-[100px] h-[100px] rounded-md object-cover">
                          <AvatarImage src={previewLogo ?? undefined} />
                          <AvatarFallback className="rounded-none">
                            ab
                          </AvatarFallback>
                        </Avatar>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={avatarInputRef}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              setFile(f);
                              // chỉ set tạm logo để có preview
                              field.onChange(URL.createObjectURL(f));
                            }
                          }}
                        />
                        <button
                          className="flex aspect-square w-[100px] items-center justify-center rounded-md border border-dashed"
                          type="button"
                          onClick={() => avatarInputRef.current?.click()}
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
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="shadcn" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Parent Category */}
                <FormField
                  control={form.control}
                  name="parentCategoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Danh mục cha</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(value ? Number(value) : null)
                          }
                          value={field.value?.toString() || ''}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="-- Không có --" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem
                                key={cat.id}
                                value={cat.id.toString()}
                              >
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={addCategoryMutation.isPending}>
                {addCategoryMutation.isPending ? 'Đang lưu...' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
