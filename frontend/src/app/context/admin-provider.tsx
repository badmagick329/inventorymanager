'use client';

import { useContext, createContext, useState, useEffect } from 'react';
import { NEXT_ADMIN, NEXT_USERS_ME } from '@/consts/urls';
import axios from 'axios';

type AdminContextType = {
  isAdmin: boolean | null;
  username: string | null;
};

const AdminContext = createContext<AdminContextType>({
  isAdmin: null,
  username: null,
});

async function fetchData(
  setIsAdmin: (value: boolean) => void,
  setUsername: (value: string) => void
) {
  const adminRequest = axios.get(NEXT_ADMIN);
  const usersMeRequest = axios.get(NEXT_USERS_ME);
  const result = await Promise.allSettled([adminRequest, usersMeRequest]);
  const adminResult = result[0].status === 'fulfilled' ? true : false;
  const usernameResult =
    result[1].status === 'fulfilled' ? result[1].value.data.username : '';
  setIsAdmin(adminResult);
  setUsername(usernameResult);
}

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    fetchData(setIsAdmin, setUsername);
  }, []);

  return (
    <AdminContext.Provider value={{ isAdmin, username }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminStatus = (): boolean | null => {
  const { isAdmin } = useContext(AdminContext);
  return isAdmin;
};

export const useUsername = (): string | null => {
  const { username } = useContext(AdminContext);
  return username;
};
