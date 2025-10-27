/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { Resolver, useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  getTableLink,
  getVietnameseTableStatus,
  handleErrorApi,
} from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import Link from 'next/link';

import {
  useGetTableNodeDetail,
  useUpdateTableNodeMutation,
} from '@/app/queries/useTableNode';
import { TableNodeType } from '@/app/ValidationSchemas/table-node.schema';
import { use, useEffect } from 'react';
import QrCodeTable from '@/components/qrcode-table';
import { toast } from 'react-toastify';
import {
  UpdateTableBodySchema,
  UpdateTableBodyType,
} from '@/app/ValidationSchemas/table.schema';
import {
  TableStatus,
  TableStatusValues,
  Furniture,
} from '@/app/constants/table.constant';

type EditTableFormType = {
  name: string;
  seats: number;
  type: (typeof Furniture)[keyof typeof Furniture];
  status: (typeof TableStatusValues)[number];
  areaId: number;
  changeToken: boolean;
};

export default function EditTable({
  id,
  setId,
  onSubmitSuccess,
}: {
  id?: number | undefined;
  setId: (value: number | undefined) => void;
  onSubmitSuccess?: () => void;
}) {
  const resuft = useGetTableNodeDetail(id as number, Boolean(id));
  const data = resuft?.data?.payload as TableNodeType | undefined;

  const form = useForm<EditTableFormType>({
    defaultValues: {
      name: data?.name ?? '',
      seats: data?.seats ?? 0,
      type:
        (data?.type as (typeof Furniture)[keyof typeof Furniture]) ?? 'TABLE',
      status:
        (data?.status as (typeof TableStatusValues)[number]) ?? 'AVAILABLE',
      areaId: data?.areaId ?? 0,
      changeToken: false,
    },
  });
  const updateTableMutation = useUpdateTableNodeMutation();

  useEffect(() => {
    if (data) {
      form.reset({
        name: data.name,
        seats: data.seats,
        type: data.type,
        status: data.status,
        areaId: data.areaId,
        changeToken: false, // luôn có trường này!
      });
    }
  }, [data, form]);

  async function submit(formValue: EditTableFormType) {
    if (!data) return;
    const payload = {
      ...data, // lấy lại toàn bộ trường gốc
      ...formValue, // ghi đè các trường được chỉnh sửa
      id: data.id,
      changeToken: formValue.changeToken,
      status: formValue.status as (typeof TableStatusValues)[number],
      type: formValue.type as (typeof Furniture)[keyof typeof Furniture],
    };
    console.log('payload', payload);

    await updateTableMutation.mutateAsync(payload);
    toast.success('Cập nhật thành công');
    reset();
  }
  const reset = () => {
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
      <DialogContent
        className="sm:max-w-[600px] max-h-screen overflow-auto"
        onCloseAutoFocus={() => {
          form.reset();
          setId(undefined);
        }}
      >
        <DialogHeader>
          <DialogTitle>Cập nhật bàn ăn</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className="grid auto-rows-max items-start gap-4 md:gap-8"
            id="edit-table-form"
            onSubmit={form.handleSubmit(submit, (err) => console.log(err))}
          >
            <div className="grid gap-4 py-4">
              <FormItem>
                <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                  <Label htmlFor="id">ID bàn</Label>
                  <div className="col-span-3 w-full space-y-2">
                    <Input
                      id="id"
                      type="number"
                      className="w-full"
                      value={data?.id ?? 0}
                      readOnly
                    />
                    <FormMessage />
                  </div>
                </div>
              </FormItem>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="name">Tên bàn</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input id="name" className="w-full" {...field} />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="seats"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="seats">Số ghế</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input
                          id="seats"
                          type="number"
                          className="w-full"
                          {...field}
                        />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="type">Loại bàn</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn loại bàn" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(Furniture).map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TableStatusValues.map((status) => (
                              <SelectItem key={status} value={status}>
                                {getVietnameseTableStatus(status)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="areaId"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="areaId">Khu vực</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input
                          id="areaId"
                          type="number"
                          className="w-full"
                          {...field}
                        />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="changeToken"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="changeToken">Đổi QR Code</Label>
                      <div className="col-span-3 w-full space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="changeToken"
                            checked={!!field.value}
                            onCheckedChange={field.onChange}
                          />
                        </div>
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormItem>
                <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                  <Label>QR Code</Label>
                  <div className="col-span-3 w-full space-y-2">
                    {data ? (
                      <QrCodeTable
                        tableNumber={data?.id}
                        token={data?.token}
                        tableName={data?.name}
                      />
                    ) : null}
                  </div>
                </div>
              </FormItem>
              <FormItem>
                <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                  <Label>URL gọi món</Label>
                  <div className="col-span-3 w-full space-y-2">
                    {data && (
                      <Link
                        href={getTableLink({
                          token: data?.token,
                          tableNumber: data?.id,
                        })}
                        target="_blank"
                        className="break-all"
                      >
                        {getTableLink({
                          token: data?.token,
                          tableNumber: data?.id,
                        })}
                      </Link>
                    )}
                  </div>
                </div>
              </FormItem>
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button type="submit" form="edit-table-form">
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
