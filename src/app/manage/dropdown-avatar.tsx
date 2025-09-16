'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useLogoutMutation } from '@/app/queries/useAuth';
import { useRouter } from 'next/navigation';
import { handleErrorApi } from '@/lib/utils';
import { useMeProfile } from '@/app/queries/useAccount';
import { useAppStore } from '@/components/app-provider';

export default function DropdownAvatar() {
  const LogoutMutation = useLogoutMutation();
  const router = useRouter();
  const payload = useMeProfile();
  const account = payload.data?.payload;
  const setRole = useAppStore((state) => state.setRole);
  // const disconnectSocket = useAppStore((state) => state.disconnectSocket);
  const logout = async () => {
    try {
      await LogoutMutation.mutateAsync();
      setRole(undefined);
      // disconnectSocket();
      //Tại đây ta không cần phải xóa localstorge vì trong file http có kiểm tra nếu
      //là client mà path là api/auth/logout thì mình sẽ xóa
      router.push('/');
    } catch (error) {
      handleErrorApi({
        error,
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="overflow-hidden rounded-full"
        >
          <Avatar>
            <AvatarImage
              src={account?.avatar ?? undefined}
              alt={account?.name}
            />
            <AvatarFallback>
              {account?.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{account?.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={'/manage/setting'} className="cursor-pointer">
            Cài đặt
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>Hỗ trợ</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>Đăng xuất</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
