import { Card, CardHeader, CardBody, Divider, Button } from '@nextui-org/react';
import { Plus } from 'lucide-react';
import { ICON_LG } from '@/consts';

export default function FormCover({
  setShowForm,
}: {
  setShowForm: (show: boolean) => void;
}) {
  return (
    <Card className='flex min-h-[172px] min-w-[288px] max-w-[320px] flex-col rounded-md md:min-w-[480px] md:max-w-[640px]'>
      <CardHeader className='flex items-center justify-center gap-2'>
        <p className='font-semibold'>Create New Location</p>
      </CardHeader>
      <Divider />
      <Button
        className='h-full w-full rounded-none'
        variant='light'
        onClick={() => setShowForm(true)}
      >
        <CardBody className='flex w-full items-center justify-center gap-2 text-default-400'>
          <Plus className='text-success-400' size={ICON_LG} />
        </CardBody>
      </Button>
    </Card>
  );
}
