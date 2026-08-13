import { describe, expect, it } from 'vitest';

import { OrderResponse } from '@/types';

import { isCompletedOrder } from './useOrdersTableModel';

const order: OrderResponse = {
  id: 1,
  name: 'Exercise book',
  date: '2026-08-01',
  location: 'FGS',
  locationId: 8,
  pricePerItem: 50,
  quantity: 100,
  soldQuantity: 100,
  currentSalePrice: 70,
  profit: 2000,
  profitPerItem: 20,
  debt: 0,
  amountPaid: 7000,
  potentialProfit: 0,
  vendors: ['Vendor'],
  created: '2026-08-01 00:00:00',
  lastModifiedBy: 'admin',
  lastModified: '2026-08-01 00:00:00',
};

describe('isCompletedOrder', () => {
  it('marks an order complete only when all stock is sold and debt is paid', () => {
    expect(isCompletedOrder(order)).toBe(true);
  });

  it('keeps fully paid orders visible while stock remains', () => {
    expect(isCompletedOrder({ ...order, soldQuantity: 99 })).toBe(false);
  });

  it('keeps fully sold orders visible while customer debt remains', () => {
    expect(isCompletedOrder({ ...order, debt: 1 })).toBe(false);
  });
});
