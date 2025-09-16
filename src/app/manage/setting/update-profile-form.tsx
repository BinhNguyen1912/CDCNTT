'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useMeProfile, useUpdateMeMutation } from '@/app/queries/useAccount';
import { mediaApiRequest } from '@/apiRequest/media';
import { toast } from 'react-toastify';
import { handleErrorApi } from '@/lib/utils';
import {
  UpdateMeBodySchema,
  UpdateMeBodyType,
} from '@/app/SchemaModel/profile.schema';
import { Badge } from '@/components/ui/badge';
import { getVietNameseRole, roleNameType } from '@/app/constants/role.constant';
import { RoleType } from '@/app/SchemaModel/role.schema';

export default function UpdateProfileForm() {
  const [file, setFile] = useState<File | undefined>(undefined);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const { data, refetch } = useMeProfile();
  const role = data?.payload.role.name ?? '...';
  const form = useForm<UpdateMeBodyType>({
    resolver: zodResolver(UpdateMeBodySchema),
    defaultValues: {
      name: '',
      avatar: undefined,
      phoneNumber: '',
    },
  });

  useEffect(() => {
    if (data) {
      const { name, avatar, phoneNumber } = data.payload;
      form.reset({
        name,
        avatar: avatar ?? undefined,
        phoneNumber,
      });
    }
  }, [data, form]);
  const avatar = form.watch('avatar');
  const name = form.watch('name');

  const previewAvatar = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file);
    }
    return avatar;
  }, [avatar, file]);

  const reset = () => {
    form.reset();
    setFile(undefined);
  };
  const updateMutation = useUpdateMeMutation();

  const onSubmit = async (values: UpdateMeBodyType) => {
    if (updateMutation.isPending) return;
    let body = values;
    try {
      if (file) {
        const formData = new FormData();
        formData.append('files', file);

        const upload = await mediaApiRequest.upload(formData);
        console.log('upload', upload);

        body = {
          ...values,
          avatar: upload.payload.data[0].url,
        };
      }
      const resuft = await updateMutation.mutateAsync(body);
      toast.success('Cập nhật trang cá nhân thành công');
      refetch();
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError,
      });
    }
  };

  return (
    <Form {...form}>
      <form
        noValidate
        className="grid auto-rows-max items-start gap-4 md:gap-8"
        onReset={reset}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Card x-chunk="dashboard-07-chunk-0">
          <div className="flex items-center justify-between pr-3">
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
            </CardHeader>
            <Badge variant={'outline'} className="text-md">
              {getVietNameseRole(role as roleNameType)}
            </Badge>
          </div>

          <CardContent>
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="avatar"
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                render={({ field }) => (
                  <FormItem>
                    <div className="flex gap-2 items-start justify-start">
                      <Avatar className="aspect-square w-[100px] h-[100px] rounded-md object-cover">
                        <AvatarImage src={previewAvatar ?? undefined} />
                        <AvatarFallback className="rounded-none">
                          {name}
                        </AvatarFallback>
                      </Avatar>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={avatarInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          setFile(file);
                          field.onChange('http://localhost:3000/' + field.name);
                        }}
                      />
                      <button
                        className="flex aspect-square w-[100px] items-center justify-center rounded-md border border-dashed"
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        {/* ICON */}
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        <span className="sr-only">Upload</span>
                      </button>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid gap-3">
                      <Label htmlFor="name">Tên</Label>
                      <Input
                        id="name"
                        type="text"
                        className="w-full"
                        {...field}
                      />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid gap-3">
                      <Label htmlFor="phoneNumber">Số điện thoại</Label>
                      <Input
                        id="phoneNumber"
                        type="text"
                        className="w-full"
                        {...field}
                        value={field.value ?? ''}
                      />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <div className=" items-center gap-2 md:ml-auto flex">
                <Button variant="outline" size="sm" type="reset">
                  Hủy
                </Button>
                <Button size="sm" type="submit">
                  Lưu thông tin
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
