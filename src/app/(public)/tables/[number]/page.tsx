import GuestLoginForm from '@/app/(public)/tables/[number]/guest-login-form';
import { Suspense } from 'react';

export default function TableNumberPage() {
  return (
    <Suspense fallback={<div>Loading.....</div>}>
      <GuestLoginForm />;
    </Suspense>
  );
}
