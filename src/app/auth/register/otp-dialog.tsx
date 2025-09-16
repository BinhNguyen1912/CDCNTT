'use client';
import { useSendOTPMutation } from '@/app/queries/useAuth';
import { otpBodySchema, OtpBodyType } from '@/app/SchemaModel/auth.schema';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { handleErrorApi } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { DialogClose } from '@radix-ui/react-dialog';
import { Loader } from 'lucide-react';

import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

export default function OTPDialog() {
  const sendOTPMutation = useSendOTPMutation();
  const [open, setOpen] = React.useState(false);
  const form = useForm<OtpBodyType>({
    resolver: zodResolver(otpBodySchema),
    defaultValues: {
      email: '',
      type: 'REGISTER',
    },
  });

  async function onSubmit(values: OtpBodyType) {
    if (sendOTPMutation.isPending) return;
    try {
      await sendOTPMutation.mutateAsync(values);
      toast.success('Gửi thành công! Vui lòng kiểm tra Email của bạn');
      setOpen(false);
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError,
      });
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link" onSubmit={() => setOpen(true)}>
          Lấy mã code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <Form {...form}>
          <form
            className="space-y-3 m-3"
            noValidate
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <DialogDescription>
              Nhập địa chỉ Email bên dưới đã nhận mã OTP
            </DialogDescription>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="abc@gmail.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Hủy</Button>
              </DialogClose>
              <Button type="submit" disabled={sendOTPMutation.isPending}>
                {sendOTPMutation.isPending && (
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                )}
                Xác nhận
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
