import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Security: Check for credentials in URL and block/redirect
  const url = request.url
  const urlParams = new URL(url).searchParams
  
  // Check for password or other sensitive data in URL parameters
  const sensitiveParams = ['password', 'token', 'secret', 'key', 'credentials']
  const hasSensitiveData = sensitiveParams.some(param => urlParams.has(param))
  
  if (hasSensitiveData) {
    console.warn('🚨 SECURITY ALERT: Sensitive data detected in URL:', url)
    
    // Redirect to clean signin page without parameters
    if (request.nextUrl.pathname.includes('/auth/signin')) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
    
    // For other pages, return 400 Bad Request
    return new NextResponse('Bad Request: Sensitive data in URL not allowed', { 
      status: 400 
    })
  }
  
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
    // Security checks for all routes
    '/((?!_next/static|_next/image|favicon.ico).*)',
    // IP tracking for API routes
    '/api/auth/:path*',
    '/api/files/:path*',
    '/api/profile/:path*',
    '/api/users/:path*'
  ]
}
