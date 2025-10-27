/* eslint-disable jsx-a11y/alt-text */
'use client';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  loginBodySchema,
  LoginBodyType,
} from '@/app/ValidationSchemas/auth.schema';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLoginMutation } from '@/app/queries/useAuth';
import {
  generateSocketIo,
  handleErrorApi,
  setAccessTokenFormLocalStorage,
  setRefreshTokenFormLocalStorage,
} from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { Suspense, useEffect } from 'react';
import { useAppStore } from '@/components/app-provider';
import envConfig from '@/config';
import Link from 'next/link';
// import { Loader } from 'lucide-react';
import { TextShimmer } from '../../../../components/motion-primitives/text-shimmer';
import { RoleType } from '@/types/jwt.types';
const getOauthGoogleUrl = () => {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    redirect_uri: envConfig.NEXT_PUBLIC_GOOGLE_AUTHORIZED_REDIRECT_URI,
    client_id: envConfig.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  };
  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
};
const googleOauthUrl = getOauthGoogleUrl();
function Login() {
  const loginMutation = useLoginMutation();
  const searchParams = useSearchParams();
  const clearTokens = searchParams.get('clearTokens');
  const setRole = useAppStore((state) => state.setRole);
  const setSocket = useAppStore((state) => state.setSocket);
  const route = useRouter();
  const loginform = useForm<LoginBodyType>({
    resolver: zodResolver(loginBodySchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (clearTokens) {
      setRole(undefined);
    }
  }, [clearTokens, setRole]);
  async function onSubmit(values: LoginBodyType) {
    if (loginMutation.isPending) return;
    try {
      const resuft = await loginMutation.mutateAsync(values);
      console.log('resuft', resuft);

      toast.success('Đăng nhập thành công');

      // Lưu tokens vào localStorage
      setAccessTokenFormLocalStorage(resuft?.payload?.accessToken!);
      setRefreshTokenFormLocalStorage(resuft?.payload?.refreshToken!);

      setRole(resuft?.payload?.user.roleName as RoleType);
      setSocket(generateSocketIo(resuft?.payload?.accessToken!));
      route.push('/');
    } catch (error) {
      handleErrorApi({
        error,
        setError: loginform.setError,
      });
    }
  }

  return (
    // // Mặc định mobile: chỉ 1 cột (form)
    // iPad: chia 2 cột 50/50
    <div className="w-screen h-screen grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[60%_40%]">
      {/* Cột trái - Banner */}
      <div className="hidden md:block relative bg-cream overflow-hidden">
        <Image
          alt="banner"
          fill
          src="https://cdn.dribbble.com/userupload/32239478/file/original-5a6091f0ef159d928b5c596d3713cf65.gif" // bạn thay bằng ảnh bạn up: /public/banner-left.png
          unoptimized
        />
      </div>

      <div className="flex justify-center px-8 py-5 bg-cream">
        <div className="w-full max-w-md rounded-2xl shadow-md p-8 text-center">
          {/* Logo */}
          <Image
            src="https://i.pinimg.com/1200x/3f/aa/0b/3faa0b3d7207fcb4f8bfc91dfa55d0be.jpg"
            alt="Logo IELTS"
            width={100}
            height={100}
            className="mx-auto"
          />
          <h2 className="text-lg font-semibold mt-4">
            Quản trị hệ thống quản lý nhà hàng
          </h2>
          <h1 className="text-2xl font-bold text-green-700 mt-1">
            Mr. Binh Nguyen
          </h1>
          <p className="text-[12px] text-gray-500 mt-2 mb-6">
            Vui lòng đăng nhập tài khoản của Bạn và trải nghiệm
          </p>
          <Form {...loginform}>
            <form
              onSubmit={loginform.handleSubmit(onSubmit, (error) => {
                console.warn(error);
                toast.error('Đăng nhập thất bại');
              })}
              className=""
              noValidate
            >
              <div className="text-left">
                <FormField
                  control={loginform.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên đăng nhập</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginform.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu</FormLabel>
                      <FormControl>
                        <Input {...field} className="w-full" type="password" />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {loginMutation.isPending && (
                // <Loader className="w-5 h-5 mr-2 animate-spin" />
                <TextShimmer className="font-mono text-md pt-2" duration={1}>
                  Đang đăng nhập...
                </TextShimmer>
              )}
              {!loginMutation.isPending && (
                <Button
                  type="submit"
                  variant={'outline'}
                  className="w-full mt-6 bg-green-700"
                >
                  Đăng nhập
                </Button>
              )}
              <div className="text-[12px] text-gray-400">
                (Nếu tài khoản Email đã được tạo, vui lọc dùng tài khoản GG)
              </div>
              <div className="flex justify-between">
                <Link
                  href={googleOauthUrl}
                  className="pt-3 flex flex-col gap-1"
                >
                  <Button type="button" variant={'link'} className="w-full">
                    Đăng nhập với Google
                  </Button>
                </Link>
                <Link
                  href={'/auth/register'}
                  className="pt-3 flex flex-col gap-1"
                >
                  <Button type="button" variant={'link'} className="w-full">
                    Đăng ký
                  </Button>
                </Link>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
export default function LoginForm() {
  return (
    <Suspense fallback={<div>Loading.....</div>}>
      <Login />
    </Suspense>
  );
}
