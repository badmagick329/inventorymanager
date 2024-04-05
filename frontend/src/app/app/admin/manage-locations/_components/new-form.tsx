import { ConnectionError, NewFormCover, Spinner } from '@/components';
import { useUsers } from '@/hooks';
import { User } from '@/types';
import { useState } from 'react';

import { LocationFormCard } from '.';

export default function NewForm() {
  const [showForm, setShowForm] = useState(false);
  const { isError, isLoading, data: users } = useUsers();
  if (isLoading) {
    return <Spinner />;
  }
  if (isError) {
    return <ConnectionError />;
  }

  if (!users) {
    <ConnectionError message='No users found' />;
  }

  const usernames = users.map((user: User) => user.username);
  if (showForm) {
    return (
      <LocationFormCard
        location={''}
        usernames={usernames}
        setShowForm={setShowForm}
      />
    );
  }
  return (
    <NewFormCover title={'Create New Location'} setShowForm={setShowForm} />
  );
}
