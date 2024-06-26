import { Delta, OrderResponse, SaleResponse } from '@/types';

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
  if (abs < 1000000000000) {
    return `${(num / 1000000000).toFixed(1)}B`;
  }
  if (abs < 1000000000000000) {
    return `${(num / 1000000000000).toFixed(1)}T`;
  }
  return num.toFixed(0);
}

export function formatCurrency(num: number) {
  return (
    num
      .toFixed(0)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' rs'
  );
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
    const lastModified = UTCStringtoLocalDate(
      order.lastModified
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

export function UTCStringtoLocalDate(utcString: string) {
  const time = new Date(utcString).getTime();
  const offset = new Date().getTimezoneOffset();
  return new Date(time - offset * 60000);
}

export function createSalesTableData(sales: SaleResponse[]) {
  return sales.map((sale) => {
    const totalSalePrice = sale.pricePerItem * sale.quantity;
    const amountPaid = totalSalePrice - sale.debt;
    const amountPaidDue = [amountPaid, sale.debt];
    const salePriceValues = [totalSalePrice, sale.pricePerItem];
    const profit = totalSalePrice - sale.cost;
    const lastModifiedBy = sale.lastModifiedBy;
    const lastModified = UTCStringtoLocalDate(
      sale.lastModified
    ).toLocaleString();

    return {
      id: sale.id,
      name: sale.order,
      vendor: sale.vendor,
      saleDate: sale.date,
      quantity: sale.quantity,
      cost: sale.cost,
      salePrice: salePriceValues,
      profit,
      amountPaidDue,
      lastModifiedBy,
      lastModified,
    };
  });
}

export function getISODateString(date: Date) {
  return date.toISOString().split('T')[0];
}

export function injectDeltasWithUser(deltas: Delta[], firstUser: string) {
  let lastUser = firstUser;
  return deltas.map((delta) => {
    const changes = delta.changes.map((change) => {
      if (
        change.field === 'lastModifiedBy' &&
        typeof change.newValue === 'string'
      ) {
        lastUser = change.newValue;
      }
      return change;
    });
    return { ...delta, changes, lastModifiedBy: lastUser };
  });
}
