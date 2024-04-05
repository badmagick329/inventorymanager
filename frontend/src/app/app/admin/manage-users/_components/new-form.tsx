import NewFormCover from '@/components/new-form-cover';
import { useState } from 'react';

import UserFormCard from './user-form-card';

export default function NewForm() {
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return <UserFormCard setShowForm={setShowForm} />;
  }
  return <NewFormCover title={'Create New User'} setShowForm={setShowForm} />;
}
