import { OrderResponse, OrderPost, SaleResponse, SalePost } from './types';

export function isOrderResponse(body: any): body is OrderResponse {
  return (
    body &&
    typeof body === 'object' &&
    typeof body.id === 'number' &&
    typeof body.name === 'string' &&
    (body.date === null || typeof body.date === 'string') &&
    typeof body.location === 'string' &&
    typeof body.pricePerItem === 'number' &&
    typeof body.quantity === 'number' &&
    typeof body.soldQuantity === 'number' &&
    typeof body.currentSalePrice === 'number' &&
    typeof body.profit === 'number' &&
    typeof body.profitPerItem === 'number' &&
    typeof body.debt === 'number' &&
    typeof body.amountPaid === 'number' &&
    typeof body.potentialProfit === 'number' &&
    Array.isArray(body.vendors) &&
    typeof body.created === 'string' &&
    typeof body.lastModifiedBy === 'string' &&
    typeof body.lastModified === 'string'
  );
}

export function isOrderResponseArray(body: any): body is OrderResponse[] {
  return Array.isArray(body) && body.every(isOrderResponse);
}

export function isOrderPost(body: any): body is OrderPost {
  return (
    body &&
    typeof body === 'object' &&
    typeof body.name === 'string' &&
    (typeof body.date === 'string' || body.date === null) &&
    typeof body.pricePerItem === 'number' &&
    typeof body.quantity === 'number' &&
    typeof body.currentSalePrice === 'number'
  );
}

export function isSaleResponse(body: any): body is SaleResponse {
  return (
    body &&
    typeof body === 'object' &&
    typeof body.id === 'number' &&
    typeof body.order === 'string' &&
    typeof body.vendor === 'string' &&
    (body.date === null || typeof body.date === 'string') &&
    typeof body.quantity === 'number' &&
    typeof body.pricePerItem === 'number' &&
    typeof body.debt === 'number' &&
    typeof body.cost === 'number' &&
    typeof body.created === 'string' &&
    typeof body.lastModifiedBy === 'string' &&
    typeof body.lastModified === 'string'
  );
}

export function isSaleResponseArray(body: any): body is SaleResponse[] {
  return Array.isArray(body) && body.every(isSaleResponse);
}

export function isSalePost(body: any): body is SalePost {
  return (
    body &&
    typeof body === 'object' &&
    typeof body.vendor === 'string' &&
    typeof body.date === 'string' &&
    typeof body.quantity === 'number' &&
    typeof body.pricePerItem === 'number' &&
    typeof body.amountPaid === 'number'
  );
}
