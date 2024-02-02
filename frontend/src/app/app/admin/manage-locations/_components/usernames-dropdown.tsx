import { Button } from '@nextui-org/react';
import React from 'react';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@nextui-org/react';
import { FormValues } from './location-form';
import { UseFormSetValue } from 'react-hook-form';

type UsernamesDropdownProps = {
  usernames: string[];
  setValue: UseFormSetValue<FormValues>;
};

export default function UsernamesDropdown({
  usernames,
  setValue,
}: UsernamesDropdownProps) {
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));

  const selectedValue = React.useMemo(() => {
    setValue('usernames', Array.from(selectedKeys));
    if (selectedKeys.size == 0) {
      return 'Select user(s)';
    }
    if (selectedKeys.size > 2) {
      return `${selectedKeys.size} users selected`;
    }
    return Array.from(selectedKeys).join(', ').replaceAll('_', ' ');
  }, [selectedKeys, setValue]);

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant='bordered' className='bordered-md'>
          {selectedValue}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label='Multiple selection example'
        variant='flat'
        closeOnSelect={false}
        disallowEmptySelection={false}
        selectionMode='multiple'
        selectedKeys={selectedKeys}
        // @ts-ignore
        onSelectionChange={setSelectedKeys}
        emptyContent='No users found'
      >
        {usernames.map((username) => (
          <DropdownItem key={username}>{username}</DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
