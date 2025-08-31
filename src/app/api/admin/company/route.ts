import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let settings = await prisma.companySettings.findFirst();
    
    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.companySettings.create({
        data: {
          companyName: 'Glo Cloud',
          primaryColor: '#2563eb',
          secondaryColor: '#1e40af',
          isConfigured: false,
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching company settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    
    const companyName = formData.get('companyName') as string;
    const primaryColor = formData.get('primaryColor') as string;
    const secondaryColor = formData.get('secondaryColor') as string;
    const contactEmail = formData.get('contactEmail') as string;
    const contactPhone = formData.get('contactPhone') as string;
    const address = formData.get('address') as string;
    const website = formData.get('website') as string;
    const description = formData.get('description') as string;
    const logoFile = formData.get('logo') as File;

    let logoPath = null;

    // Handle logo upload
    if (logoFile && logoFile.size > 0) {
      const logoDir = join(process.cwd(), 'public', 'company');
      await mkdir(logoDir, { recursive: true });
      
      const extension = logoFile.name.split('.').pop();
      const filename = `logo-${uuidv4()}.${extension}`;
      logoPath = `/company/${filename}`;
      
      const buffer = Buffer.from(await logoFile.arrayBuffer());
      await writeFile(join(logoDir, filename), buffer);
    }

    let settings = await prisma.companySettings.findFirst();

    const updateData = {
      companyName: companyName || 'Glo Cloud',
      primaryColor: primaryColor || '#2563eb',
      secondaryColor: secondaryColor || '#1e40af',
      contactEmail: contactEmail || null,
      contactPhone: contactPhone || null,
      address: address || null,
      website: website || null,
      description: description || null,
      isConfigured: true,
      ...(logoPath && { companyLogo: logoPath }),
    };

    if (settings) {
      settings = await prisma.companySettings.update({
        where: { id: settings.id },
        data: updateData,
      });
    } else {
      settings = await prisma.companySettings.create({
        data: updateData,
      });
    }

    return NextResponse.json({ 
      message: 'Company settings updated successfully',
      settings 
    });
  } catch (error) {
    console.error('Error updating company settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
