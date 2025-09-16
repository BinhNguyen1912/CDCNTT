'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  GuestLoginBody,
  GuestLoginBodyType,
} from '@/app/schemaValidations/guest.schema';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useGuestLoginMutation } from '@/app/queries/useGuest';
import { useAppStore } from '@/components/app-provider';
import { handleErrorApi } from '@/lib/utils';
import { useEffect } from 'react';
import envConfig from '@/config';
import { io } from 'socket.io-client';
import { Loader } from 'lucide-react';

export default function GuestLoginForm() {
  const setRole = useAppStore((state) => state.setRole);
  // const setSocket = useAppStore((state) => state.setSocket);

  //Lấy ra Path name là dyamic route [number]
  const path = useParams();
  const searchParams = useSearchParams();
  const tableNumber = Number(path.number);
  const token = searchParams.get('token');
  const loginMutation = useGuestLoginMutation();
  const route = useRouter();

  useEffect(() => {
    if (!token) {
      route.push('/');
    }
  }, [token, route]);
  const form = useForm<GuestLoginBodyType>({
    resolver: zodResolver(GuestLoginBody),
    defaultValues: {
      name: '',
      token: token ?? '',
      tableNumber,
    },
  });

  async function onSubmit(data: GuestLoginBodyType) {
    if (loginMutation.isPending) return;

    try {
      const resuft = await loginMutation.mutateAsync(data);
      setRole(resuft.payload.data.guest.role);
      // setSocket(
      //   io(envConfig.NEXT_PUBLIC_API_ENDPOINT, {
      //     auth: {
      //       Authorization: `Bearer ${resuft.payload.data.accessToken}`,
      //     },
      //   })
      // );
      route.push('/guest/menu');
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError,
      });
    }
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Đăng nhập gọi món</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="space-y-2 max-w-[600px] flex-shrink-0 w-full"
            noValidate
            onSubmit={form.handleSubmit(onSubmit, console.log)}
          >
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid gap-2">
                      <Label htmlFor="name">Tên khách hàng</Label>
                      <Input id="name" type="text" required {...field} />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                {loginMutation.isPending && (
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                )}
                Đăng nhập
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
