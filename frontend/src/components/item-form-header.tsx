import { Button } from '@nextui-org/react';

export default function ItemFormHeader({
  title,
  value,
  updateValue,
}: {
  title: string;
  value: boolean;
  updateValue: () => void;
}) {
  return (
    <>
      <div className='flex w-full justify-center pt-4'>
        <span className='text-2xl font-semibold'>{title}</span>
        <Button
          className='absolute right-2'
          variant='light'
          size='sm'
          onPress={updateValue}
        >
          {value ? 'Hide' : 'Show'} Help
        </Button>
      </div>
    </>
  );
}
