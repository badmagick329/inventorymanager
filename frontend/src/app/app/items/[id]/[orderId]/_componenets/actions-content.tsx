import { ICON_SM } from '@/consts';
import { Button } from '@nextui-org/react';
import { DeleteSale } from '@/types';
import { Pencil, Trash } from 'lucide-react';

type ActionsContentProps = {
  rowId: number;
  locationId: string;
  orderId: string;
  deleteSale: DeleteSale;
};

export default function ActionsContent({
  rowId,
  locationId,
  orderId,
  deleteSale,
}: ActionsContentProps) {
  return (
    <div className='flex gap-2'>
      <Button
        size='sm'
        variant='flat'
        isIconOnly
        isDisabled={deleteSale.isPending}
      >
        <Pencil size={ICON_SM} />
      </Button>
      <Button
        size='sm'
        variant='flat'
        isIconOnly
        isDisabled={deleteSale.isPending}
        onPress={() =>
          deleteSale.mutate({
            saleId: rowId,
            locationId,
            orderId,
          })
        }
      >
        <Trash size={ICON_SM} />
      </Button>
    </div>
  );
}
