'use client';

import DeleteModal from '@/components/delete-modal';
import { DELAY_500, ICON_SM } from '@/consts';
import { APP_ITEMS } from '@/consts/urls';
import { DeleteOrder } from '@/types';
import { Button, Link, Tooltip, useDisclosure } from "@heroui/react";
import { List, Trash } from 'lucide-react';

import EditOrderModal from './edit-order-modal';

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
            data-testid='items-delete-button'
            size='sm'
            variant='ghost'
            color='danger'
            isIconOnly
            onPress={disclosure.onOpen}
            isDisabled={deleteOrder.isPending}
          >
            <Trash size={ICON_SM} />
          </Button>
        </Tooltip>
        <Tooltip content='View Sales' color='default' delay={DELAY_500}>
          <Button
            data-testid='items-view-sales-button'
            as={Link}
            href={`${APP_ITEMS}/${locationId}/${rowId}`}
            size='sm'
            variant='ghost'
            color='primary'
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
