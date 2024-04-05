import { ICON_SM } from '@/consts';
import { Button, useDisclosure } from '@nextui-org/react';
import { DeleteSale } from '@/types';
import { Trash } from 'lucide-react';
import EditSaleModal from './edit-sale-modal';
import { Tooltip } from '@nextui-org/react';
import { DELAY_500 } from '@/consts';
import DeleteModal from '@/components/delete-modal';

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
  const disclosure = useDisclosure();

  return (
    <div className='flex gap-2'>
      <EditSaleModal
        locationId={locationId}
        orderId={orderId}
        saleId={rowId.toString()}
        isDisabled={deleteSale.isPending}
      />
      <Tooltip content='Delete' color='default' delay={DELAY_500}>
        <Button
          radius='sm'
          isIconOnly
          variant='ghost'
          color='danger'
          isDisabled={deleteSale.isPending}
          onPress={disclosure.onOpen}
        >
          <Trash size={ICON_SM} />
        </Button>
      </Tooltip>
      <DeleteModal
        params={{ saleId: rowId, locationId, orderId }}
        disclosure={disclosure}
        mutation={deleteSale}
      />
    </div>
  );
}
