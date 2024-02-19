import { OrderResponse } from '@/types';

export function formatNumber(num: number) {
  const abs = Math.abs(num);
  if (abs < 1000) {
    return num.toFixed(0);
  }
  if (abs < 1000000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  if (abs < 1000000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
}

export function sleep(delay: number) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

export function createOrdersTableData(orders: OrderResponse[]) {
  return orders.map((order) => {
    const totalPrice = order.pricePerItem * order.quantity;
    const amountPaid = order.amountPaid;
    const amountPaidDue = [amountPaid, order.debt];
    const profit = order.profit;
    const profitPerItem = order.profitPerItem;
    const remainingStock = order.quantity - order.soldQuantity;
    const stockInOut = [remainingStock, order.soldQuantity];
    const vendors = Array.from(new Set(order.vendors));
    const vendorsString =
      vendors.length > 2
        ? vendors.slice(0, 2).join(', ') + '...'
        : vendors.join(', ');
    const lastModifiedBy = order.lastModifiedBy;
    const lastModifiedUTC = new Date(order.lastModified).getTime();
    const offset = new Date().getTimezoneOffset();
    const lastModified = new Date(
      lastModifiedUTC - offset * 60000
    ).toLocaleString();

    const profitValues = [profit, profitPerItem];
    return {
      id: order.id,
      name: order.name,
      purchaseDate: order.date,
      quantity: order.quantity,
      cost: totalPrice,
      salePrice: order.currentSalePrice * order.quantity,
      amountPaidDue,
      profit: profitValues,
      stockInOut,
      vendors: vendorsString,
      lastModifiedBy,
      lastModified,
    };
  });
}
