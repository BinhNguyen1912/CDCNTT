'use client';
import { useAppStore } from '@/components/app-provider';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { checkAndRefreshToken } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const UN_AUTHENTICATED_PATHS = [
  '/auth/login',
  '/auth/register',
  '/refresh-token',
];
export default function RefreshToken() {
  const pathName = usePathname();
  const route = useRouter();
  // const socket = useAppStore((state) => state.socket);
  useEffect(() => {
    if (UN_AUTHENTICATED_PATHS.includes(pathName)) {
      return;
    }
    let interval: any = null;
    console.log('pathName', pathName);

    //Phải gọi lần đầu tiên , sau đó Interval sẽ chạy hàm lại sau thời gian TIMEOUT
    const onRefreshToken = (forceRefresh?: boolean) =>
      checkAndRefreshToken({
        onError: () => {
          clearInterval(interval);
          route.push('/auth/login');
        },
        forceRefresh: forceRefresh,
      });
    onRefreshToken();

    //TIMEOUT Interval phải bé hơn thời gian hết hạn của AccessToken
    //Ví dụ AccessToken là 10s thì cứ 1s mình sẽ cho check 1 lần
    const TIMEOUT = 1000;

    //Tại vì sẽ có trường hợp khi gọi lại nhưng bị lỗi nên kiểm tra cho kỹ
    interval = setInterval(
      () =>
        checkAndRefreshToken({
          onError: () => {
            clearInterval(interval);
            route.push('/auth/login');
          },
        }),
      TIMEOUT,
    );
    // if (socket?.connected) {
    //   onConnect();
    // }

    // function onConnect() {
    //   console.log('connected', socket?.id);
    // }
    // function onDisconnect() {
    //   console.log('disconnected', socket?.id);
    // }
    function onRefreshTokenSocket() {
      onRefreshToken(true);
    }
    //lang nghe
    // socket?.on('connect', onConnect);
    // socket?.on('refresh-token', onRefreshTokenSocket);
    // //huy lang nghe
    // socket?.on('disconnect', onDisconnect);

    // socket?.on('update-order', onUpdateOrder);
    return () => {
      // socket?.off('connect', onConnect);
      // socket?.off('disconnect', onDisconnect);
      // socket?.off('refresh-token', onRefreshTokenSocket);
    };
  }, [pathName, route]);

  return null;
}
