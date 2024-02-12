import { Select, SelectItem } from '@nextui-org/react';
import React from 'react';
import { FormValues } from './location-form';
import { FormState, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { User as UserIcon } from 'lucide-react';

type UsernamesSelectProps = {
  usernames: string[];
  selectedNames?: string[];
  register: UseFormRegister<FormValues>;
};

export default function UsernamesSelect({
  usernames,
  selectedNames,
  register,
}: UsernamesSelectProps) {
  selectedNames = selectedNames || [];

  return (
    <Select
      label='Location Access'
      placeholder='Select User(s)'
      selectionMode='multiple'
      startContent={<UserIcon />}
      defaultSelectedKeys={selectedNames}
      {...register('usernames')}
    >
      {usernames.map((username) => (
        <SelectItem key={username} value={username}>
          {username}
        </SelectItem>
      ))}
    </Select>
  );
}
