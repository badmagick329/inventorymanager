import { OrderResponse } from '@/types';
import { formatCalendarDate } from '@/utils';

export type OrderNameHistory = {
  count: number;
  lastDate: string | null;
};

/**
 * Summarises earlier items with the same name at one location. Names match
 * exactly after trimming and ignoring case, so near-misses are not counted as
 * repeat purchases. `excludedOrderId` drops the item being edited so it does
 * not count as its own history.
 */
export function getOrderNameHistory(
  orders: OrderResponse[],
  name: string,
  excludedOrderId?: string
): OrderNameHistory {
  const key = normalizeName(name);
  const matches = orders.filter(
    (order) =>
      String(order.id) !== excludedOrderId && normalizeName(order.name) === key
  );
  // Purchase dates are `YYYY-MM-DD`, so string order is date order.
  const lastDate = matches.reduce<string | null>(
    (latest, order) =>
      order.date && (!latest || order.date > latest) ? order.date : latest,
    null
  );
  return { count: matches.length, lastDate };
}

function normalizeName(name: string) {
  return name.trim().toLowerCase();
}

export default function OrderNameHistoryNote({
  history,
}: {
  history: OrderNameHistory;
}) {
  return (
    <p
      data-testid='items-order-name-history'
      className='px-1 text-xs text-muted-foreground'
    >
      {describeHistory(history)}
    </p>
  );
}

function describeHistory({ count, lastDate }: OrderNameHistory) {
  if (count === 0) {
    return 'Not bought at this location before';
  }
  const times = count === 1 ? 'once' : `${count} times`;
  const last = lastDate
    ? `last purchased ${formatCalendarDate(lastDate)}`
    : 'purchase date not recorded';
  return `Bought ${times} before at this location · ${last}`;
}
