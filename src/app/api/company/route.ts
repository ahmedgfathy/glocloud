import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Public endpoint for company information (logo and name only)
export async function GET() {
  try {
    let settings = await prisma.companySettings.findFirst();
    
    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.companySettings.create({
        data: {
          companyName: 'PMS Cloud',
          primaryColor: '#2563eb',
          secondaryColor: '#1e40af',
          isConfigured: false,
        },
      });
    }

    // Return only public information
    return NextResponse.json({ 
      settings: {
        companyName: settings.companyName,
        companyLogo: settings.companyLogo
      }
    });
  } catch (error) {
    console.error('Error fetching company settings:', error);
    return NextResponse.json(
      { 
        settings: {
          companyName: 'PMS Cloud',
          companyLogo: null
        }
      }, 
      { status: 200 }
    );
  }
}
