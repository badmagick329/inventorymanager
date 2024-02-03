import { useState } from 'react';
import UserFormCard from './user-form-card';
import NewFormCover from './new-form-cover';

export default function NewForm() {
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return <UserFormCard setShowForm={setShowForm} />;
  }
  return <NewFormCover setShowForm={setShowForm} />;
}
