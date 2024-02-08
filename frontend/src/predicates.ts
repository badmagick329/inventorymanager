import { OrderResponse, OrderPost } from './types';

export function isOrderResponse(body: any): body is OrderResponse {
  return (
    body &&
    typeof body === 'object' &&
    typeof body.id === 'number' &&
    typeof body.name === 'string' &&
    typeof body.date === 'string' &&
    typeof body.location === 'string' &&
    typeof body.pricePerItem === 'number' &&
    typeof body.quantity === 'number' &&
    typeof body.currentSalePrice === 'number' &&
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
    typeof body.date === 'string' &&
    typeof body.pricePerItem === 'number' &&
    typeof body.quantity === 'number' &&
    typeof body.currentSalePrice === 'number'
  );
}
