'use client';
import { useLogout } from '@/hooks';
import { APP_LOGIN } from '@/consts/urls';
import { useRouter } from 'next/navigation';
import { useAdminStatus } from '@/app/context/admin-provider';

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
