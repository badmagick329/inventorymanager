import { useState } from 'react';
import LocationFormCard from './location-form-card';
import NewFormCover from './new-form-cover';
import { useUsers } from '@/hooks';
import { User } from '@/types';
import Spinner from '@/components/Spinner';
import { Button } from '@nextui-org/react';

export default function NewForm() {
  const [showForm, setShowForm] = useState(false);
  const { error, isError, isLoading, data, refetch } = useUsers();
  if (isLoading) {
    return <Spinner />;
  }
  if (isError) {
    return (
      <div>
        <span>An error occurred. Try again?</span>
        <Button color='danger' variant='solid' onClick={() => refetch()}>
          Retry?
        </Button>
      </div>
    );
  }

  const users = data?.data;
  if (!users) {
    <div>
      <span>No users found</span>
      <Button color='danger' variant='solid' onClick={() => refetch()}>
        Retry?
      </Button>
    </div>;
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
  return <NewFormCover setShowForm={setShowForm} />;
}
