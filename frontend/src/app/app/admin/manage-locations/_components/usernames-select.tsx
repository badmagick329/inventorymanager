import { LocationFormValues } from '@/types';
import { Select, SelectItem } from "@heroui/react";
import { User as UserIcon } from 'lucide-react';
import { useEffect } from 'react';
import { UseFormRegister, UseFormSetValue } from 'react-hook-form';

type UsernamesSelectProps = {
  usernames: string[];
  selectedNames?: string[];
  register: UseFormRegister<LocationFormValues>;
  setValue: UseFormSetValue<LocationFormValues>;
};

export default function UsernamesSelect({
  usernames,
  selectedNames,
  register,
  setValue,
}: UsernamesSelectProps) {
  selectedNames = selectedNames || [];

  useEffect(() => {
    setValue('usernames', selectedNames || []);
  }, [usernames]);

  return (
    <Select
      data-testid='manage-locations-usernames-select'
      label='Location Access'
      placeholder='Select User(s)'
      selectionMode='multiple'
      startContent={<UserIcon />}
      defaultSelectedKeys={selectedNames}
      {...register('usernames')}
    >
      {usernames.map((username) => (
        <SelectItem
          data-testid='manage-locations-usernames-option'
          key={username}
          value={username}
        >
          {username}
        </SelectItem>
      ))}
    </Select>
  );
}
