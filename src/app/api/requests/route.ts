
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get('token')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, bloodType, dateTime, units } = body;

    // Validate required fields
    if (!type || !bloodType || !dateTime) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    
    if (!['donation', 'receiving'].includes(type)) {
      return NextResponse.json(
        { message: 'Invalid request type' },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      let request;
      
      if (type === 'donation') {
        request = await tx.donationRequest.create({
          data: {
            userId,
            bloodType,
            status: 'PENDING'
          }
        });
        
        const appointment = await tx.appointment.create({
          data: {
            userId,
            donationRequestId: request.id,
            dateTime: new Date(dateTime),
            status: 'SCHEDULED'
          }
        });

        return { request, appointment };
      } else {
        
        if (!units || units < 1) {
          throw new Error('Valid units required for receiving request');
        }

        request = await tx.receivingRequest.create({
          data: {
            userId,
            bloodType,
            units,
            status: 'PENDING'
          }
        });
        
        const appointment = await tx.appointment.create({
          data: {
            userId,
            receivingRequestId: request.id,
            dateTime: new Date(dateTime),
            status: 'SCHEDULED'
          }
        });

        return { request, appointment };
      }
    });

    return NextResponse.json(result);
  } catch (error:any) {
    console.error('Failed to create request:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get('token')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const [donationRequests, receivingRequests] = await Promise.all([
      prisma.donationRequest.findMany({
        where: { userId },
        include: { appointment: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.receivingRequest.findMany({
        where: { userId },
        include: { appointment: true },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return NextResponse.json({ donationRequests, receivingRequests });
  } catch (error) {
    console.error('Failed to fetch requests:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}