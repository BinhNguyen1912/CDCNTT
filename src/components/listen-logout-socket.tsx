import { useLogoutMutation } from '@/app/queries/useAuth';
import { useAppStore } from '@/components/app-provider';
import { handleErrorApi } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
const UN_AUTHENTICATED_PATHS = [
  '/auth/login',
  '/auth/register',
  '/refresh-token',
];
export default function ListenLogoutSocket() {
  const pathName = usePathname();
  const router = useRouter();
  const { isPending, mutateAsync } = useLogoutMutation();

  const setRole = useAppStore((state) => state.setRole);
  const socket = useAppStore((state) => state.socket);
  const disconnectSocket = useAppStore((state) => state.disconnectSocket);

  useEffect(() => {
    if (UN_AUTHENTICATED_PATHS.includes(pathName)) {
      return;
    }
    async function onLogout() {
      if (isPending) return;
      try {
        await mutateAsync();
        setRole(undefined);
        disconnectSocket();
        toast.warning('Bạn buộc đăng xuất ra khỏi hệ thống!');
        router.push('/');
      } catch (error) {
        handleErrorApi({
          error,
        });
      }
    }
    if (socket) {
      socket.on('logout', onLogout);
    }

    return () => {
      socket?.off('logout', onLogout);
    };
  }, [
    socket,
    pathName,
    isPending,
    mutateAsync,
    setRole,
    disconnectSocket,
    router,
  ]);
  return null;
}
