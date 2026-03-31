export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";
import { prisma } from "../../../../lib/prisma";
import { signToken } from "../../../../lib/jwt";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email?.toLowerCase();
    const name = session?.user?.name || undefined;

    if (!email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    let user = await prisma.users.findUnique({
      where: { email },
      include: { roles: true },
    });

    if (!user) {
      const baseUsername = (name || email.split("@")[0] || "user")
        .trim()
        .replace(/\s+/g, "");

      let usernameCandidate = baseUsername || "user";
      for (let i = 0; i < 5; i++) {
        const existingByUsername = await prisma.users.findUnique({
          where: { username: usernameCandidate },
        });
        if (!existingByUsername) break;
        usernameCandidate = `${baseUsername}${Math.floor(Math.random() * 10000)}`;
      }

      const randomPassword = crypto.randomBytes(16).toString("hex");
      const passwordhash = await bcrypt.hash(randomPassword, 10);

      user = await prisma.users.create({
        data: {
          username: usernameCandidate,
          email,
          passwordhash,
          roleid: 2,
        },
        include: { roles: true },
      });
    }

    const userRole = user.roles?.rolename || "User";

    const token = signToken({
      userid: user.userid,
      email: user.email,
      role: userRole,
      roleid: user.roleid,
    });

    return NextResponse.json({
      message: "Google login successful",
      token,
      user: {
        userid: user.userid,
        email: user.email,
        role: userRole,
        roleid: user.roleid,
      },
    });
  } catch (error: any) {
    console.error("GOOGLE LOGIN ERROR:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
