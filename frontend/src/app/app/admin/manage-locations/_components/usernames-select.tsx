import { Select, SelectItem } from '@nextui-org/react';
import { useEffect } from 'react';
import { FormValues } from './useSubmitForm';
import { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { User as UserIcon } from 'lucide-react';

type UsernamesSelectProps = {
  usernames: string[];
  selectedNames?: string[];
  register: UseFormRegister<FormValues>;
  setValue: UseFormSetValue<FormValues>;
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
