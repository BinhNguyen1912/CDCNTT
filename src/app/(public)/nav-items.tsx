/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { cn, handleErrorApi } from '@/lib/utils';
import { RoleType } from '@/types/jwt.types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Role } from '@/app/constants/type';
import { useLogoutMutation } from '@/app/queries/useAuth';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/components/app-provider';
import Link from 'next/link';
import { toast } from 'react-toastify';

const menuItems: {
  title: string;
  href: string;
  role?: RoleType[];
  hideWhenLogin?: boolean;
}[] = [
  {
    title: 'home',
    href: '/',
  },

  {
    title: 'menu',
    href: '/guest/menu',
    role: [Role.GUEST],
  },
  {
    title: 'Đơn',
    href: '/guest/orders',
    role: [Role.GUEST],
  },
  {
    title: 'login',
    href: '/auth/login',
    hideWhenLogin: true,
  },
  {
    title: 'manage',
    href: '/manage/dashboard',
    role: [Role.ADMIN, Role.STAFF],
  },
  {
    title: 'privacy-policy',
    href: '/privacy-policy',
  },
  {
    title: 'term-of-service',
    href: '/term-of-service',
  },
  {
    title: 'about',
    href: '/about',
  },
];

// Server: Món ăn, Đăng nhập. Do server không biết trạng thái đăng nhập của user
// CLient: Đầu tiên client sẽ hiển thị là Món ăn, Đăng nhập.
// Nhưng ngay sau đó thì client render ra là Món ăn, Đơn hàng, Quản lý do đã check được trạng thái đăng nhập

export default function NavItems({ className }: { className?: string }) {
  const setRole = useAppStore((state) => state.setRole);
  const role = useAppStore((state) => state.role);
  // const disconnectSocket = useAppStore((state) => state.disconnectSocket);
  const logoutMutation = useLogoutMutation();
  const router = useRouter();
  const logout = async () => {
    if (logoutMutation.isPending) return;
    try {
      await logoutMutation.mutateAsync();
      setRole(undefined);
      // disconnectSocket();
      toast.success('Đằng xuất thành công');
      router.push('/');
    } catch (error: any) {
      handleErrorApi({
        error,
      });
    }
  };
  return (
    <>
      {menuItems.map((item) => {
        // Trường hợp đăng nhập thì chỉ hiển thị menu đăng nhập
        const isAuth = item.role && role && item.role.includes(role);

        // Trường hợp menu item có thể hiển thị dù cho đã đăng nhập hay chưa
        const canShow =
          (item.role === undefined && !item.hideWhenLogin) ||
          (!role && item.hideWhenLogin);
        if (isAuth || canShow) {
          return (
            <Link href={item.href} key={item.href} className={className}>
              {item.title}
            </Link>
          );
        }
        return null;
      })}
      {role && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <div className={cn(className, 'cursor-pointer')}>{'logout'}</div>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {'Bạn có muốn đăng xuất không'}
              </AlertDialogTitle>
              <AlertDialogDescription>{''}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{'hủy'}</AlertDialogCancel>
              <AlertDialogAction onClick={logout}>OK</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
