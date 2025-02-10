import { Button } from "@heroui/react";

export default function LocationCardError({
  message,
  refetcher,
}: {
  message: string;
  refetcher: () => void;
}) {
  return (
    <div className='flex flex-col gap-4'>
      <span>{message}</span>
      <Button color='danger' variant='solid' onPress={refetcher} radius='sm'>
        Retry?
      </Button>
    </div>
  );
}
