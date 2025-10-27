'use client';

import { useSetTokenToCookie } from '@/app/queries/useAuth';
import { useAppStore } from '@/components/app-provider';
import { decode } from '@/lib/jwt';
import {
  generateSocketIo,
  setAccessTokenFormLocalStorage,
  setRefreshTokenFormLocalStorage,
} from '@/lib/utils';
import { RoleType } from '@/types/jwt.types';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

export default function OauthLoginPage() {
  const searchParams = useSearchParams();
  const route = useRouter();
  const accessToken = searchParams.get('accessToken');
  const refreshToken = searchParams.get('refreshToken');
  const message = searchParams.get('message');
  const count = useRef(0);
  const setRole = useAppStore((state) => state.setRole);
  const setSocket = useAppStore((state) => state.setSocket);
  const { mutateAsync } = useSetTokenToCookie();
  useEffect(() => {
    if (accessToken && refreshToken) {
      const { roleName } = decode(accessToken);
      if (count.current === 0) {
        mutateAsync({
          accessToken,
          refreshToken,
        })
          .then(() => {
            // Lưu tokens vào localStorage
            setAccessTokenFormLocalStorage(accessToken);
            setRefreshTokenFormLocalStorage(refreshToken);

            setRole(roleName as RoleType);
            setSocket(generateSocketIo(accessToken));
            route.push('/manage/dashboard');
          })
          .catch((e) => {
            toast.error(e.message || 'Lỗi khi đăng nhập với google');
          });
        count.current++;
      }
    } else {
      if (count.current == 0) {
        setTimeout(() => {
          toast.error(message || 'Lỗi khi đăng nhập với google');
        });
        route.push('/auth/login');
        count.current++;
      }
    }
  }, [
    accessToken,
    refreshToken,
    message,
    route,
    mutateAsync,
    setRole,
    setSocket,
  ]);
  return null;
}
