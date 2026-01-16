import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/session';

export async function middleware(request: NextRequest) {
    // 1. Check if the route is protected
    const isProtected = request.nextUrl.pathname.startsWith('/admin');

    if (!isProtected) {
        return NextResponse.next();
    }

    // 2. Check for valid session
    const cookie = request.cookies.get('session')?.value;
    const session = await decrypt(cookie);

    // 3. Redirect if no session or invalid
    if (!session?.userId) {
        return NextResponse.redirect(new URL('/login', request.nextUrl));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
