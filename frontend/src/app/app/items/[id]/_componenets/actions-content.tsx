'use client';
import { DeleteOrder } from '@/types';
import EditOrderModal from './edit-order-modal';
import { ICON_SM } from '@/consts';
import { List, Trash } from 'lucide-react';
import { Button, Link, useDisclosure } from '@nextui-org/react';
import { APP_ITEMS } from '@/consts/urls';
import { Tooltip } from '@nextui-org/react';
import { DELAY_500 } from '@/consts';
import DeleteModal from '@/components/delete-modal';

type ActionsContentProps = {
  rowId: number;
  locationId: string;
  deleteOrder: DeleteOrder;
};

export default function ActionsContent({
  rowId,
  locationId,
  deleteOrder,
}: ActionsContentProps) {
  const disclosure = useDisclosure();

  return (
    <>
      <div className='flex gap-2'>
        <EditOrderModal
          locationId={locationId}
          orderId={rowId.toString()}
          isDisabled={deleteOrder.isPending}
        />
        <Tooltip content='Delete' color='default' delay={DELAY_500}>
          <Button
            size='sm'
            variant='flat'
            isIconOnly
            onPress={disclosure.onOpen}
            isDisabled={deleteOrder.isPending}
          >
            <Trash size={ICON_SM} />
          </Button>
        </Tooltip>
        <Tooltip content='View Sales' color='default' delay={DELAY_500}>
          <Button
            as={Link}
            href={`${APP_ITEMS}/${locationId}/${rowId}`}
            size='sm'
            variant='flat'
            isIconOnly
            isDisabled={deleteOrder.isPending}
          >
            <List size={ICON_SM} />
          </Button>
        </Tooltip>
      </div>
      <DeleteModal
        params={{ orderId: rowId }}
        disclosure={disclosure}
        mutation={deleteOrder}
      />
    </>
  );
}
