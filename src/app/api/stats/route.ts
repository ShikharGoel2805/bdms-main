import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const [totalUsers, upcomingAppointments, completedAppointments] = await Promise.all([
      prisma.user.count(),
      prisma.appointment.count({
        where: {
          status: 'SCHEDULED',
          dateTime: {
            gte: new Date(new Date().getDate()),
          },
        },
      }),
      prisma.appointment.count({
        where: {
          status: 'COMPLETED',
        },
      }),
    ])

    return NextResponse.json({
      totalUsers,
      upcomingAppointments,
      completedAppointments,
    })
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}