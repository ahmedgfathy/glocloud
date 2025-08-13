import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    // Get company settings
    const settings = await prisma.companySettings.findFirst();
    
    if (settings?.companyLogo) {
      // Serve the company logo as favicon
      try {
        const logoPath = join(process.cwd(), 'public', settings.companyLogo);
        const imageBuffer = await readFile(logoPath);
        
        // Determine content type based on file extension
        const extension = settings.companyLogo.split('.').pop()?.toLowerCase();
        let contentType = 'image/png';
        
        switch (extension) {
          case 'ico':
            contentType = 'image/x-icon';
            break;
          case 'png':
            contentType = 'image/png';
            break;
          case 'jpg':
          case 'jpeg':
            contentType = 'image/jpeg';
            break;
          case 'svg':
            contentType = 'image/svg+xml';
            break;
          case 'gif':
            contentType = 'image/gif';
            break;
        }
        
        return new Response(new Uint8Array(imageBuffer), {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=3600',
          },
        });
      } catch (error) {
        console.error('Error reading company logo:', error);
      }
    }
    
    // Fallback to default favicon
    try {
      const defaultFaviconPath = join(process.cwd(), 'public', 'favicon.ico');
      const imageBuffer = await readFile(defaultFaviconPath);
      
      return new Response(new Uint8Array(imageBuffer), {
        headers: {
          'Content-Type': 'image/x-icon',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } catch (error) {
      // If no default favicon, return empty response
      return new NextResponse(null, { status: 404 });
    }
  } catch (error) {
    console.error('Error in favicon API:', error);
    return new NextResponse(null, { status: 500 });
  }
}
