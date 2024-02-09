export type Location = {
  id: number;
  name: string;
  users?: string[];
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
  date: string;
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
