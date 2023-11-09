import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { authOptions } from './server/auth'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest, response: NextResponse) {
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token) return NextResponse.redirect(new URL('/', request.url))

    return NextResponse.next()
}

export const config = {
    matcher: '/dashboard/:path*',
}
