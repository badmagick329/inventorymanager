import { Button } from "@heroui/react";

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
        <span data-testid='sales-form-title' className='text-2xl font-semibold'>
          {title}
        </span>
        <Button
          data-testid='sales-form-help-button'
          className='absolute right-2'
          variant='light'
          radius='sm'
          onPress={updateValue}
        >
          {value ? 'Hide' : 'Show'} Help
        </Button>
      </div>
    </>
  );
}
