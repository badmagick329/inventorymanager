'use client';

import { NEXT_ADMIN, NEXT_USERS_ME } from '@/consts/urls';
import axios from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';

type GlobalContextType = {
  isAdmin: boolean | null;
  username: string | null;
};

const GlobalContext = createContext<GlobalContextType>({
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

export const GlobalContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    fetchData(setIsAdmin, setUsername);
  }, []);

  return (
    <GlobalContext.Provider value={{ isAdmin, username }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useAdminStatus = (): boolean | null => {
  const { isAdmin } = useContext(GlobalContext);
  return isAdmin;
};

export const useUsername = (): string | null => {
  const { username } = useContext(GlobalContext);
  return username;
};
