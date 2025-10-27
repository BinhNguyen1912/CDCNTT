/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import {
  UpdateEmployeeAccountBody,
  UpdateEmployeeAccountBodyType,
} from '@/app/SchemaModel/account.schema';
import { Role, RoleValues } from '@/app/constants/type';
import {
  useGetEmployeeAccount,
  useUpdateEmployeeAccount,
  useUpdateMeMutation,
} from '@/app/queries/useAccount';
import { mediaApiRequest } from '@/apiRequest/media';
import { toast } from 'react-toastify';
import { handleErrorApi } from '@/lib/utils';
import { set } from 'zod';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  UpdateUserBodySchema,
  UpdateUserBodyType,
  UserTypeWithRolePermissions,
} from '@/app/ValidationSchemas/user.schema';
import { useGetRoleListQuery } from '@/app/queries/useRole';
import { z } from 'zod';

export default function EditEmployee({
  id,
  setId,
  onSubmitSuccess,
}: {
  id?: number | undefined;
  setId: (value: number | undefined) => void;
  onSubmitSuccess?: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const { data } = useGetEmployeeAccount({
    id: id as number,
    enabled: Boolean(id),
  });
  const roles = useGetRoleListQuery().data?.payload?.data || [];
  console.log('roles', roles);

  const dataUser = data?.payload;
  const updateAccountMutation = useUpdateEmployeeAccount();

  const form = useForm<UpdateUserBodyType>({
    resolver: zodResolver(UpdateUserBodySchema),
    defaultValues: {
      changePassword: false,
      email: '',
      name: '',
      roleId: 0,
      avatar: '',
      confirmNewPassword: undefined,
      newPassword: undefined,
      phoneNumber: '',
      status: 'ACTIVE',
    },
  });

  const avatar = form.watch('avatar');
  const name = form.watch('name');
  const changePassword = form.watch('changePassword');

  const previewAvatarFromFile = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file);
    }
    return avatar;
  }, [file, avatar]);

  useEffect(() => {
    if (data) {
      const { email, name, roleId, status, phoneNumber, avatar } =
        (dataUser as UserTypeWithRolePermissions) || {};
      form.reset({
        avatar: avatar ?? '',
        email: email ?? '',
        name: name ?? '',
        changePassword: false,
        confirmNewPassword: '',
        newPassword: '',
        roleId: roleId ?? 0,
        status: (status as 'ACTIVE' | 'INACTIVE' | 'BLOCKED') || 'ACTIVE',
        phoneNumber: phoneNumber ?? '',
      });
    }
  }, [data, form]);

  async function submit(value: UpdateUserBodyType) {
    let body = { id: id as number, ...value };
    try {
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const upload = await mediaApiRequest.upload(formData);
        const imageURL = upload?.payload?.data;
        if (Array.isArray(imageURL) && imageURL.length > 0) {
          body = {
            ...body,
            avatar: imageURL[0].url || '',
          };
        } else {
          toast.error('Failed to upload avatar. Please try again.');
          return;
        }
      }
      if (!value.changePassword) {
        delete body.newPassword;
        delete body.confirmNewPassword;
      }
      if (!body.status) body.status = 'ACTIVE';
      if (!body.roleId) body.roleId = 0;
      if (!body.phoneNumber) body.phoneNumber = '';
      if (!body.avatar) body.avatar = '';
      const result = await updateAccountMutation.mutateAsync(body);
      toast.success('Cập nhật thành công');
      reset();
      onSubmitSuccess?.();
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError,
      });
    }
  }
  const reset = () => {
    setFile(null);
    setId(undefined);
  };
  return (
    <Dialog
      open={Boolean(id)}
      onOpenChange={(value) => {
        if (!value) {
          reset();
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-screen overflow-auto">
        <DialogHeader>
          <DialogTitle>Cập nhật tài khoản</DialogTitle>
          <DialogDescription>
            Các trường tên, email, mật khẩu là bắt buộc
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className="grid auto-rows-max items-start gap-4 md:gap-8"
            id="edit-employee-form"
            onSubmit={form.handleSubmit(submit, (err) => {
              console.log('err', err);
            })}
          >
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex gap-2 items-start justify-start">
                      <Avatar className="aspect-square w-[100px] h-[100px] rounded-md object-cover">
                        <AvatarImage src={previewAvatarFromFile ?? ''} />
                        <AvatarFallback className="rounded-none">
                          {name || 'Avatar'}
                        </AvatarFallback>
                      </Avatar>
                      <input
                        type="file"
                        accept="image/*"
                        ref={avatarInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFile(file);
                            field.onChange(
                              'http://localhost:3000/' + file.name,
                            );
                          }
                        }}
                        className="hidden"
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
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="name">Tên</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input
                          id="name"
                          className="w-full"
                          {...field}
                          value={field.value ?? ''}
                        />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="email">Email</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input
                          id="email"
                          className="w-full"
                          {...field}
                          value={field.value ?? ''}
                        />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="phoneNumber">Số điện thoại</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input
                          id="phoneNumber"
                          className="w-full"
                          {...field}
                          value={field.value ?? ''}
                        />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="status">Trạng thái</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <select
                          id="status"
                          {...field}
                          value={
                            field.value as 'ACTIVE' | 'INACTIVE' | 'BLOCKED'
                          }
                          className="w-full border rounded px-2 py-1"
                        >
                          <option value="ACTIVE">Hoạt động</option>
                          <option value="INACTIVE">Không hoạt động</option>
                          <option value="BLOCKED">Bị khóa</option>
                        </select>
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="roleId"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="roleId">Vai trò</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <select
                          id="roleId"
                          {...field}
                          value={field.value ?? 0}
                          className="w-full border rounded px-2 py-1"
                        >
                          <option value={0}>Chọn vai trò</option>
                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="changePassword"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="changePassword">Đổi mật khẩu</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              {changePassword && (
                <>
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                          <Label htmlFor="newPassword">Mật khẩu mới</Label>
                          <div className="col-span-3 w-full space-y-2">
                            <Input
                              id="newPassword"
                              className="w-full"
                              type="password"
                              {...field}
                              value={field.value ?? ''}
                            />
                            <FormMessage />
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmNewPassword"
                    render={({ field }) => (
                      <FormItem>
                        <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                          <Label htmlFor="confirmNewPassword">
                            Xác nhận mật khẩu mới
                          </Label>
                          <div className="col-span-3 w-full space-y-2">
                            <Input
                              id="confirmNewPassword"
                              className="w-full"
                              type="password"
                              {...field}
                              value={field.value ?? ''}
                            />
                            <FormMessage />
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button type="submit" form="edit-employee-form">
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
