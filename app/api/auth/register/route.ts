import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { username, email, password } = await req.json();

        if (!username || !email || !password) {
            return NextResponse.json(
                { message: "Username, email, and password are required" },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.users.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return NextResponse.json(
                    { message: "Email already in use" },
                    { status: 400 }
                );
            }
            if (existingUser.username === username) {
                return NextResponse.json(
                    { message: "Username already taken" },
                    { status: 400 }
                );
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordhash = await bcrypt.hash(password, salt);

        const newUser = await prisma.users.create({
            data: {
                username,
                email,
                passwordhash,
                roleid: 2,
            },
        });


        return NextResponse.json(
            {
                message: "User registered successfully",
                user: {
                    userid: newUser.userid,
                    username: newUser.username,
                    email: newUser.email,
                    roleid: newUser.roleid,
                    createdat: newUser.createdat,
                },
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("REGISTER ERROR DETAILS:", {
          message: error.message,
          stack: error.stack,
          code: error.code, // Prisma error code
          meta: error.meta  // Prisma error meta
        });
        return NextResponse.json(
            { message: "Server error", error: error.message, details: error.code },
            { status: 500 }
        );
    }
}
