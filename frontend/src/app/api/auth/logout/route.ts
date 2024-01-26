import { serialize } from 'cookie';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
const BASE_URL = process.env.BASE_URL;

export async function POST(req: Request) {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token');
    if (!token) {
        return new NextResponse(JSON.stringify({ message: 'no token' }), {
            status: 400,
        });
    }
    const authToken = JSON.parse(token.value);
    const url = new URL(`${BASE_URL}/api/auth/logout/`);
    const response = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Token ${authToken}` },
    });
    console.log(`Response from django: ${response.status}`);
    if (response.status !== 204) {
        return new NextResponse(JSON.stringify({ message: 'error' }), {
            status: response.status,
        });
    }
    return new NextResponse(JSON.stringify({}), {
        status: 200,
        headers: {
            'Set-Cookie': serialize('auth-token', '', {
                path: '/',
                httpOnly: true,
                maxAge: 0,
                sameSite: true,
            }),
        },
    });
}
