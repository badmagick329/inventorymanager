import { ICON_LG } from '@/consts';
import { Button, Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { Plus } from 'lucide-react';

export default function NewFormCover({
  title,
  setShowForm,
}: {
  title: string;
  setShowForm: (show: boolean) => void;
}) {
  return (
    <Card className='flex min-h-[172px] min-w-[288px] max-w-[320px] flex-col rounded-md md:min-w-[480px] md:max-w-[640px]'>
      <CardHeader className='flex items-center justify-center gap-2'>
        <p className='font-semibold'>{title}</p>
      </CardHeader>
      <Divider />
      <Button
        data-testid='card-create-button'
        className='h-full w-full rounded-none'
        variant='light'
        radius='sm'
        onPress={() => setShowForm(true)}
      >
        <CardBody className='flex w-full items-center justify-center gap-2 text-default-400'>
          <Plus className='text-success-400' size={ICON_LG} />
        </CardBody>
      </Button>
    </Card>
  );
}
