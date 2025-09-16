/* eslint-disable react-hooks/rules-of-hooks */
'use client';
import {
  checkAndRefreshToken,
  getRefreshTokenFormLocalStorage,
} from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

function RefreshToken() {
  const route = useRouter();
  const searchParams = useSearchParams();
  const RefreshTokenFromUrl = searchParams.get('refreshToken');
  const redirectFromUrl = searchParams.get('redirect');

  useEffect(() => {
    if (
      RefreshTokenFromUrl &&
      RefreshTokenFromUrl === getRefreshTokenFormLocalStorage()
    ) {
      checkAndRefreshToken({
        onSuccess: () => {
          route.push(redirectFromUrl || '/');
        },
      });
    } else {
      route.push('/');
    }
  }, [RefreshTokenFromUrl, redirectFromUrl, route]);

  return <div>Refresh Token ......</div>;
}
export default function RefreshTokenPage() {
  return (
    <Suspense fallback={<div>Loading.....</div>}>
      <RefreshToken />
    </Suspense>
  );
}
