import { NextResponse } from 'next/server';
import axios from 'axios';
const BASE_URL = process.env.BASE_URL;
import { createErrorResponse } from '@/utils/responses';
import { createAuthHeader } from '@/utils/responses';

const MockData = {
  '4': {
    id: 1,
    order: 'test order4',
    vendor: 'Vendor 1',
    date: '2024-02-08',
    quantity: 10,
    pricePerItem: 1.0,
    debt: 10.0,
  },
};

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  for (const [key, value] of Object.entries(MockData)) {
    if (key === params.id) {
      return new NextResponse(JSON.stringify(value), {
        status: 200,
      });
    }
  }
}
