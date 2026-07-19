export const queryKeys = {
  locations: ['locations'] as const,
  users: ['users'] as const,
  ordersRoot: ['orders'] as const,
  orders: (locationId: string | number) =>
    ['orders', String(locationId)] as const,
  orderDetail: (locationId: string | number, orderId?: string | number) =>
    [
      'orders',
      String(locationId),
      orderId ? String(orderId) : undefined,
    ] as const,
  salesRoot: ['sales'] as const,
  sales: (orderId: string | number) => ['sales', String(orderId)] as const,
  vendorsRoot: ['vendors'] as const,
  vendors: (locationId: string | number) =>
    ['vendors', String(locationId)] as const,
  orderVendorsRoot: ['order-vendors'] as const,
  orderVendors: (orderId: string | number) =>
    ['order-vendors', String(orderId)] as const,
  historyRoot: ['history'] as const,
  history: (locationId: string | number) =>
    ['history', String(locationId)] as const,
  feedback: ['feedback'] as const,
  logout: ['logout'] as const,
};
