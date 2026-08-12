'use client';

import { ConnectionError, Spinner } from '@/components';
import { useUsers } from '@/hooks';
import { User } from '@/types';
import { Chip } from '@heroui/react';
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
      <section className='mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-12'>
        <header className='mb-8 flex items-end justify-between gap-4'>
          <div>
            <h1
              data-testid='manage-users-title'
              className='text-3xl font-semibold tracking-tight'
            >
              Manage Users
            </h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              Manage accounts and the locations available to each person.
            </p>
          </div>
          <Chip variant='flat' radius='sm'>
            {users.length} {users.length === 1 ? 'user' : 'users'}
          </Chip>
        </header>
        <div className='grid w-full grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3'>
          {users.map((user: User) => {
            return <UserCard key={user.username} user={user} />;
          })}
          <NewForm />
        </div>
      </section>
    );
  }
}
