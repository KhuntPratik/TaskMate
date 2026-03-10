import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { verifyToken } from "../../../lib/auth";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
    try {
        const decoded = verifyToken(req) as any;
        if (!decoded || decoded.roleid !== 1) {
            return NextResponse.json({ message: "Unauthorized. Admin access required." }, { status: 403 });
        }

        const users = await prisma.users.findMany({
            include: {
                roles: true
            }
        });

        const safeUsers = users.map(user => {
            const { passwordhash, ...rest } = user;
            return rest;
        });

        return NextResponse.json(safeUsers);

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const decoded = verifyToken(req) as any;
        if (!decoded || decoded.roleid !== 1) {
            return NextResponse.json({ message: "Unauthorized. Admin access required." }, { status: 403 });
        }

        const body = await req.json();
        const { username, email, password, roleid } = body;

        if (!username || !email || !password) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.users.create({
            data: {
                username,
                email,
                passwordhash: hashedPassword,
                roleid: roleid ? Number(roleid) : undefined
            }
        });

        const { passwordhash, ...safeUser } = user;
        return NextResponse.json(safeUser, { status: 201 });

    } catch (error: any) {
        console.error("CREATE USER ERROR:", error);
        return NextResponse.json(
            { message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}
