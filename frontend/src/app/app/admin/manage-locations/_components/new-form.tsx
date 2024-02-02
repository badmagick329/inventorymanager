import { useState } from 'react';
import LocationFormCard from './location-form-card';
import NewFormCover from './new-form-cover';

export default function NewForm() {
  const [showForm, setShowForm] = useState(false);

  // TODO: fetch usernames from the server
  const usernames = ['testuser1'];
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
