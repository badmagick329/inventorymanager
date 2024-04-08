'use client';

import { ConnectionError, Spinner } from '@/components';
import { useUsers } from '@/hooks';
import { User } from '@/types';
import React from 'react';

import NewForm from './_components/new-form';
import UserCard from './_components/user-card';

export default function ManageUsers() {
  const { isError, isLoading, data: users } = useUsers();
  if (isError) {
    return <ConnectionError />;
  }
  if (isLoading) {
    return <Spinner />;
  }

  if (users) {
    return (
      <div className='flex h-full w-full flex-grow flex-col items-center gap-4 p-4'>
        <div
          data-testid='manage-users-title'
          className='flex text-2xl font-semibold'
        >
          Manage Users
        </div>
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8 2xl:grid-cols-3'>
          {users.map((user: User) => {
            return <UserCard key={user.username} user={user} />;
          })}
          <NewForm />
        </div>
      </div>
    );
  }
}
