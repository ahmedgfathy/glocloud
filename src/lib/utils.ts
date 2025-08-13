import { NextRequest } from 'next/server'

export function getClientIP(request: NextRequest): string {
  // Try the resolved IP from middleware first
  const resolvedIp = request.headers.get('x-client-ip-resolved')
  if (resolvedIp && resolvedIp !== 'unknown') {
    return resolvedIp
  }
  
  // Fallback to manual parsing
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  const xClientIp = request.headers.get('x-client-ip')
  
  // x-forwarded-for can contain multiple IPs, take the first one
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map(ip => ip.trim())
    return ips[0] || 'unknown'
  }
  
  // Try other headers
  return realIp || cfConnectingIp || xClientIp || 'unknown'
}

export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown'
}

export function generateActivityId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 6)
}
