import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "../../../lib/jwt";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.users.findUnique({
      where: { email },
      include: { roles: true }
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordhash);

    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const userRole = user.roles ? user.roles.rolename : "User";

    const token = signToken({
      userid: user.userid,
      email: user.email,
      role: userRole
    });

    return NextResponse.json({
      message: "Login successful",
      token,
      user: {
        userid: user.userid,
        email: user.email,
        role: userRole
      }
    });

  } catch (error: any) {
    console.error("LOGIN ERROR:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

