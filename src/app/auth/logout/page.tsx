/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useLogoutMutation } from '@/app/queries/useAuth';
import { useAppStore } from '@/components/app-provider';
import {
  getAccessTokenFormLocalStorage,
  getRefreshTokenFormLocalStorage,
} from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useRef } from 'react';
import { set } from 'zod';

/**
 * đoạn code dùng ref như một cờ (flag / mutex / guard) để chặn việc gọi mutateAsync()
 * nhiều lần liên tiếp (ví dụ do render nhiều lần hoặc effect chạy nhiều lần).
 * useRef giữ giá trị qua các render mà không làm component re-render
 *  khi thay đổi — nên rất phù hợp để lưu flag, id của setTimeout, hoặc promise đang chạy.
 */

function Logout() {
  const { mutateAsync } = useLogoutMutation(); //nêu mình lấy nguyên Object này đi muta thì sẽ bị vòng lặp vô cực thì nó bị thay đổi thay chiếu
  const route = useRouter();
  const searchParams = useSearchParams();
  const accessTokenFromUrl = searchParams.get('accessToken');
  const refreshTokenFromUrl = searchParams.get('refreshToken');
  const ref = useRef<any>(null);
  const setRole = useAppStore((state) => state.setRole);
  // const disconnectSocket = useAppStore((state) => state.disconnectSocket);
  useEffect(() => {
    if (
      !ref.current &&
      ((refreshTokenFromUrl &&
        refreshTokenFromUrl !== getRefreshTokenFormLocalStorage()) ||
        (accessTokenFromUrl &&
          accessTokenFromUrl !== getAccessTokenFormLocalStorage()))
    ) {
      ref.current = mutateAsync;

      mutateAsync().then((res) => {
        setTimeout(() => {
          ref.current = null;
        }, 1000);
        setRole(undefined);
        // disconnectSocket();
        route.push('/auth/login');
      });
    } else {
      route.push('/');
    }
  }, [
    accessTokenFromUrl,
    refreshTokenFromUrl,
    route,
    mutateAsync,
    setRole,
    // disconnectSocket,
  ]);

  return <div>Logout ....</div>;
}
export default function LogoutPage() {
  return (
    <Suspense fallback={<div>Loading.....</div>}>
      <Logout />
    </Suspense>
  );
}
