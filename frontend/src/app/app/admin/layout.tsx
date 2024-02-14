'use client';
import { useIsAdmin, useLogout } from '@/hooks';
import { APP_LOGIN } from '@/consts/urls';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { isAdmin, isLoading } = useIsAdmin();
  const logout = useLogout();

  if (isLoading) {
    return null;
  }
  if (!isAdmin) {
    logout.mutate();
    router.push(APP_LOGIN);
    return null;
  }
  return <>{children}</>;
}
