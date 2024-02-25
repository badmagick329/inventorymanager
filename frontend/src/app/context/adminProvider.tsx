'use client';

import { useContext, createContext, useState, useEffect } from 'react';
import { NEXT_ADMIN } from '@/consts/urls';
import axios from 'axios';

type AdminContextType = {
  isAdmin: boolean | null;
};

const AdminContext = createContext<AdminContextType>({ isAdmin: null });

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    axios
      .get(NEXT_ADMIN)
      .then(() => setIsAdmin(true))
      .catch(() => setIsAdmin(false));
  }, []);

  return (
    <AdminContext.Provider value={{ isAdmin }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminStatus = (): boolean | null => {
  const { isAdmin } = useContext(AdminContext);
  return isAdmin;
};
