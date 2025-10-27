'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { useCreateAreaMutation } from '@/app/queries/useArea';
import {
  areaBodySchema,
  AreaBodyType,
} from '@/app/ValidationSchemas/area.schema';
import { toast } from 'react-toastify';

interface AddAreaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddAreaDialog({
  open,
  onOpenChange,
}: AddAreaDialogProps) {
  const form = useForm<AreaBodyType>({
    resolver: zodResolver(areaBodySchema),
    defaultValues: {
      name: '',
      isActive: false, // default trùng với schema
    },
  });

  const createMutation = useCreateAreaMutation();

  const onSubmit = (values: AreaBodyType) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        toast('Thêm khu vực thành công!');
        form.reset();
        onOpenChange(false);
      },
      onError: (err: any) => {
        toast('Lỗi khi thêm khu vực');
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full rounded-xl p-6 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold ">
            Thêm mới khu vực
          </DialogTitle>
          <DialogDescription className=" text-gray-500 mb-2">
            Thêm một khu vực mới vào nhà hàng của bạn.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            {/* Tên khu vực */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2">
                  <FormLabel className="font-medium text-base">
                    Tên khu vực
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Nhập tên khu vực..."
                      className="h-12 px-4 text-base border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* isActive */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between gap-4 py-2 px-2 bg-gray-50 rounded-lg">
                  <FormLabel className="font-medium text-base">
                    Kích hoạt
                  </FormLabel>
                  <FormControl>
                    <Controller
                      name="isActive"
                      control={form.control}
                      render={({ field: { value, onChange } }) => (
                        <Switch checked={value} onCheckedChange={onChange} />
                      )}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="flex justify-end gap-3 mt-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-lg px-6 h-11 border-gray-300 hover:bg-gray-100"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="rounded-lg px-6 h-11 bg-primary text-white font-semibold hover:bg-primary/90 shadow-md"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Đang thêm...' : 'Thêm mới'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
