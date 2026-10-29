import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { afterEach, describe, expect, it } from 'vitest';

import { OrderFormValues, OrderResponse } from '@/types';

import { getOrderNameHistory } from './order-name-history';
import OrderNameInput from './order-name-input';

const baseOrder: OrderResponse = {
  id: 1,
  name: 'Exercise book',
  date: '2026-08-01',
  location: 'FGS',
  locationId: 8,
  pricePerItem: 50,
  quantity: 100,
  soldQuantity: 0,
  currentSalePrice: 70,
  profit: 0,
  profitPerItem: 20,
  debt: 0,
  amountPaid: 0,
  potentialProfit: 2000,
  vendors: [],
  created: '2026-08-01 00:00:00',
  lastModifiedBy: 'admin',
  lastModified: '2026-08-01 00:00:00',
};

function order(overrides: Partial<OrderResponse>): OrderResponse {
  return { ...baseOrder, ...overrides };
}

describe('getOrderNameHistory', () => {
  it('matches names ignoring case and surrounding whitespace', () => {
    const orders = [
      order({ id: 1, name: 'Exercise Book' }),
      order({ id: 2, name: '  exercise book ' }),
      order({ id: 3, name: 'Exercise book large' }),
    ];

    expect(getOrderNameHistory(orders, ' EXERCISE BOOK').count).toBe(2);
  });

  it('leaves out the item being edited', () => {
    const orders = [
      order({ id: 1, date: '2026-09-01' }),
      order({ id: 2, date: '2026-07-01' }),
    ];

    expect(getOrderNameHistory(orders, 'Exercise book', '1')).toEqual({
      count: 1,
      lastDate: '2026-07-01',
    });
  });

  it('reports the latest recorded purchase date', () => {
    const orders = [
      order({ id: 1, date: '2026-03-15' }),
      order({ id: 2, date: null }),
      order({ id: 3, date: '2026-10-02' }),
      order({ id: 4, date: '2025-12-30' }),
    ];

    expect(getOrderNameHistory(orders, 'Exercise book')).toEqual({
      count: 4,
      lastDate: '2026-10-02',
    });
  });

  it('has no last date when no match recorded one', () => {
    const orders = [order({ id: 1, date: null }), order({ id: 2, date: null })];

    expect(getOrderNameHistory(orders, 'Exercise book')).toEqual({
      count: 2,
      lastDate: null,
    });
  });

  it('is empty when nothing matches', () => {
    expect(getOrderNameHistory([order({})], 'Pencil')).toEqual({
      count: 0,
      lastDate: null,
    });
  });
});

function NameField({
  orders,
  excludedOrderId,
}: {
  orders: OrderResponse[];
  excludedOrderId?: string;
}) {
  const { control, formState } = useForm<OrderFormValues>({
    defaultValues: { name: '', date: '', quantity: '', cost: '', salePrice: '' },
  });
  return (
    <OrderNameInput
      control={control}
      formState={formState}
      orders={orders}
      excludedOrderId={excludedOrderId}
    />
  );
}

describe('OrderNameInput history', () => {
  // Vitest globals are off, so Testing Library cannot register its own cleanup.
  afterEach(cleanup);

  const orders = [
    order({ id: 1, date: '2026-08-01' }),
    order({ id: 2, date: '2026-07-14' }),
    order({ id: 3, name: 'Pencil', date: null }),
  ];

  function enterName(name: string) {
    const input = screen.getByTestId('items-order-name-input');
    fireEvent.change(input, { target: { value: name } });
    fireEvent.blur(input);
  }

  it('shows the history only after the name loses focus', () => {
    render(<NameField orders={orders} />);
    const input = screen.getByTestId('items-order-name-input');

    fireEvent.change(input, { target: { value: 'exercise book' } });
    expect(screen.queryByTestId('items-order-name-history')).toBeNull();

    fireEvent.blur(input);
    expect(screen.getByTestId('items-order-name-history').textContent).toBe(
      'Bought 2 times before at this location · last purchased 1 Aug 2026'
    );
  });

  it('says when the purchase date was not recorded', () => {
    render(<NameField orders={orders} />);
    enterName('Pencil');

    expect(screen.getByTestId('items-order-name-history').textContent).toBe(
      'Bought once before at this location · purchase date not recorded'
    );
  });

  it('says when the name is new at this location', () => {
    render(<NameField orders={orders} />);
    enterName('Ruler');

    expect(screen.getByTestId('items-order-name-history').textContent).toBe(
      'Not bought at this location before'
    );
  });

  it('hides the history when the name is emptied', () => {
    render(<NameField orders={orders} />);
    enterName('Pencil');
    fireEvent.change(screen.getByTestId('items-order-name-input'), {
      target: { value: '' },
    });

    expect(screen.queryByTestId('items-order-name-history')).toBeNull();
  });
});
