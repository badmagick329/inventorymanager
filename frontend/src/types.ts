import { createOrdersTableData, createSalesTableData } from './utils';
import { useDeleteOrder, useDeleteSale } from './hooks';

type ValueOf<T> = T[keyof T];
export type Error = boolean;
export type Result<T> =
  | {
      error?: Error;
      value: T;
    }
  | {
      error: Error;
      value?: T;
    };

export type Location = {
  id: number;
  name: string;
  users?: string[];
  spendings?: number;
  revenue?: number;
  profit?: number;
};

export type User = {
  id: number;
  username: string;
  locations: Location[];
};

export type OrderResponse = {
  id: number;
  name: string;
  date: string | null;
  location: string;
  pricePerItem: number;
  quantity: number;
  soldQuantity: number;
  currentSalePrice: number;
  profit: number;
  profitPerItem: number;
  debt: number;
  amountPaid: number;
  potentialProfit: number;
  vendors: string[];
  created: string;
  lastModifiedBy: string;
  lastModified: string;
};

export type OrderPost = {
  name: string;
  date: string | null;
  pricePerItem: number;
  quantity: number;
  currentSalePrice: number;
};

export type SaleResponse = {
  id: number;
  order: string;
  vendor: string;
  date: string;
  quantity: number;
  pricePerItem: number;
  debt: number;
  cost: number;
  created: string;
  lastModifiedBy: string;
  lastModified: string;
};

export type SalePost = {
  vendor: string;
  date: string | null;
  quantity: number;
  pricePerItem: number;
  amountPaid: number;
};

export type VendorResponse = {
  id: number;
  name: string;
  location: string;
  debt: number;
};

export type Disclosure = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onOpenChange: (open: boolean) => void;
  isControlled: boolean;
  getButtonProps: (props?: any) => any;
  getDisclosureProps: (props?: any) => any;
};

export type LocationFormValues = {
  location: string;
  usernames: string[];
};

export type LoginFormValues = {
  username: string;
  password: string;
};

export type OrderFormValues = {
  name: string;
  date: string;
  quantity: string;
  cost: string;
  salePrice: string;
};

export type SaleFormValues = {
  vendor: string;
  date: string;
  quantity: string;
  salePrice: string;
  amountPaid: string;
};

export type OrdersTableRow = ReturnType<typeof createOrdersTableData>[0];

export type DeleteOrder = ReturnType<typeof useDeleteOrder>;

export type OrdersTableCellValue = ValueOf<OrdersTableRow>;

export type DeleteSale = ReturnType<typeof useDeleteSale>;

export type SalesTableRow = ReturnType<typeof createSalesTableData>[0];

export type SalesTableCellValue = ValueOf<SalesTableRow>;

export type OrderHistory = {
  first: HistoricalOrder;
  last: HistoricalOrder;
  deltas: Delta[];
};

export type Delta = {
  changeList: ChangeList[];
  lastModified: string;
};

export type ChangeList = {
  field: string;
  oldValue: number | string;
  newValue: number | string;
};

export type HistoricalOrder = {
  id: number;
  name: string;
  date: null;
  pricePerItem: number;
  quantity: number;
  currentSalePrice: number;
  lastModifiedBy: string;
  lastModified: string;
};
