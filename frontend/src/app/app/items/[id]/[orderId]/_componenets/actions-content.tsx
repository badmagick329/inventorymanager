import { ICON_SM } from '@/consts';
import { Button } from '@nextui-org/react';
import { DeleteSale } from '@/types';
import { Trash } from 'lucide-react';
import EditSaleModal from './edit-sale-modal';
import { Tooltip } from '@nextui-org/react';
import { TOOLTIP_DELAY } from '@/consts';

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
      <EditSaleModal
        locationId={locationId}
        orderId={orderId}
        saleId={rowId.toString()}
        isDisabled={deleteSale.isPending}
      />
      <Tooltip content='Delete' color='default' delay={TOOLTIP_DELAY}>
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
      </Tooltip>
    </div>
  );
}
