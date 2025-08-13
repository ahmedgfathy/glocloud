import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Clone the request headers and add custom headers for IP tracking
  const requestHeaders = new Headers(request.headers)
  
  // Get the client IP address from various possible headers
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  const xClientIp = request.headers.get('x-client-ip')
  
  let clientIp = 'unknown'
  
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    const ips = forwardedFor.split(',').map(ip => ip.trim())
    clientIp = ips[0] || 'unknown'
  } else if (realIp) {
    clientIp = realIp
  } else if (cfConnectingIp) {
    clientIp = cfConnectingIp
  } else if (xClientIp) {
    clientIp = xClientIp
  }
  
  // Add the resolved IP to headers for API routes to use
  requestHeaders.set('x-client-ip-resolved', clientIp)
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    '/api/auth/:path*',
    '/api/files/:path*',
    '/api/profile/:path*',
    '/api/users/:path*'
  ]
}
