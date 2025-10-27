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
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRegisterMutation } from '@/app/queries/useAuth';
import {
  handleErrorApi,
  setAccessTokenFormLocalStorage,
  setRefreshTokenFormLocalStorage,
  generateSocketIo,
} from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Suspense } from 'react';
import { useAppStore } from '@/components/app-provider';
// import { Loader } from 'lucide-react';
import { TextShimmer } from '../../../../components/motion-primitives/text-shimmer';
import OTPDialog from '@/app/auth/register/otp-dialog';
import {
  registerBodySchema,
  RegisterBodyType,
} from '@/app/ValidationSchemas/auth.schema';
import { RoleType } from '@/types/jwt.types';

function Register() {
  const registerMutation = useRegisterMutation();
  const setRole = useAppStore((state) => state.setRole);
  const setSocket = useAppStore((state) => state.setSocket);
  const route = useRouter();
  const registerForm = useForm<RegisterBodyType>({
    resolver: zodResolver(registerBodySchema),
    defaultValues: {
      email: '',
      password: '',
      code: '',
      confirmPassword: '',
      name: '',
    },
  });

  // useEffect(() => {
  //   if (clearTokens) {
  //     setRole(undefined);
  //   }
  // }, [clearTokens, setRole]);
  async function onSubmit(values: RegisterBodyType) {
    if (registerMutation.isPending) return;
    try {
      const resuft = await registerMutation.mutateAsync(values);

      if (resuft?.payload) {
        setAccessTokenFormLocalStorage(resuft.payload.accessToken);
        setRefreshTokenFormLocalStorage(resuft.payload.refreshToken);

        setRole(resuft.payload.user.roleName as RoleType);
        setSocket(generateSocketIo(resuft.payload.accessToken));
        route.push('/');
      }
    } catch (error) {
      handleErrorApi({
        error,
        setError: registerForm.setError,
      });
    }
  }

  return (
    <div className="w-screen h-screen grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[60%_40%]">
      {/* Cột trái - Banner */}
      <div className="hidden md:block relative bg-[#f9f9f9] overflow-hidden">
        <Image
          alt="banner"
          fill
          src="https://cdn.dribbble.com/userupload/32239478/file/original-5a6091f0ef159d928b5c596d3713cf65.gif" // bạn thay bằng ảnh bạn up: /public/banner-left.png
          unoptimized
        />
      </div>

      {/* Cột phải - Form login */}
      <div className="flex flex-col justify-center items-center px-8 bg-cream text-center">
        {/* Logo */}
        <Image
          src="https://i.pinimg.com/1200x/3f/aa/0b/3faa0b3d7207fcb4f8bfc91dfa55d0be.jpg" // logo nên đặt trong public/
          alt="Logo IELTS"
          width={100}
          height={100}
        />
        <h2 className="text-lg font-semibold mt-4">
          Quản trị hệ thống quản lý nhà hàng
        </h2>
        <h1 className="text-2xl font-bold text-green-700 mt-1">
          Mr. Binh Nguyen
        </h1>
        <div className="p-2 flex flex-col gap-2 w-fit">
          <Form {...registerForm}>
            <form
              onSubmit={registerForm.handleSubmit(onSubmit, (error) => {
                console.warn(error);
                toast.error('Đăng nhập thất bại');
              })}
              className="space-y-2 w-[400px] "
              noValidate
            >
              <div className="text-left">
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel> Mật khẩu</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Xác nhận mật khẩu</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Họ tên</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nhập mã code</FormLabel>
                      <FormControl>
                        <Input {...field} className="w-full" type="text" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {registerMutation.isPending && (
                // <Loader className="w-5 h-5 mr-2 animate-spin" />
                <TextShimmer className="font-mono text-md pt-2" duration={1}>
                  Đang xử lý...
                </TextShimmer>
              )}
              {!registerMutation.isPending && (
                <Button
                  type="submit"
                  variant={'outline'}
                  className="w-full mt-6 bg-green-700"
                >
                  Đăng Ký
                </Button>
              )}
            </form>
          </Form>
          <div className="w-full flex items-center justify-between">
            <div>
              <OTPDialog />
            </div>
            <Button variant="link">Đăng nhập với Google</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default function RegisterForm() {
  return (
    <Suspense fallback={<div>Loading.....</div>}>
      <Register />
    </Suspense>
  );
}
