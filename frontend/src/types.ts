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

export type Disclosure = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onOpenChange: (open: boolean) => void;
  isControlled: boolean;
  getButtonProps: (props?: any) => any;
  getDisclosureProps: (props?: any) => any;
};
