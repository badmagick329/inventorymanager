'use client';

import { useAdminStatus } from '@/app/context/global-context-provider';
import { APP_LOGIN } from '@/consts/urls';
import { useLogout } from '@/hooks';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const logout = useLogout();
  const isAdmin = useAdminStatus();

  if (isAdmin === null) {
    return null;
  }
  if (!isAdmin) {
    logout.mutate();
    router.push(APP_LOGIN);
    return null;
  }
  return <>{children}</>;
}
