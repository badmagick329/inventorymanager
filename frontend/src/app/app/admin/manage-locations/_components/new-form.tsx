import { useState } from 'react';
import LocationFormCard from './location-form-card';
import NewFormCover from '@/components/new-form-cover';
import { useUsers } from '@/hooks';
import { User } from '@/types';
import { Spinner } from '@/components/loaders';
import { ConnectionError } from '@/components/errors';

export default function NewForm() {
  const [showForm, setShowForm] = useState(false);
  const { isError, isLoading, data } = useUsers();
  if (isLoading) {
    return <Spinner />;
  }
  if (isError) {
    return <ConnectionError />;
  }

  const users = data?.data;
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
