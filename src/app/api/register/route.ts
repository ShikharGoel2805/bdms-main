import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";


const prisma = new PrismaClient();



export async function POST(req: NextRequest) {
  try {
    const { email, password, firstName, lastName,isAdmin } = await req.json()

    const existingUser = await prisma.user.findFirst({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }
    const user = await prisma.user.create({
      data: {
        email,
        password:await hash(password,10),
        firstName,
        lastName,
        isAdmin
      }
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}