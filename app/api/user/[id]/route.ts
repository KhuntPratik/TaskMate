
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { verifyToken } from "../../../../lib/auth";
import bcrypt from "bcryptjs";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Verify the user is authenticated (any valid token accepted)
        const decoded = verifyToken(req) as any;
        if (!decoded) {
            return NextResponse.json({ message: "Unauthorized. Please log in." }, { status: 401 });
        }

        const { id } = await params;
        const userId = parseInt(id);

        if (isNaN(userId)) {
            return NextResponse.json({ message: "Invalid User ID" }, { status: 400 });
        }

        // Prevent user from deleting themselves
        if (userId === decoded.userid) {
            return NextResponse.json({ message: "You cannot delete your own account." }, { status: 400 });
        }

        // Check the user exists
        const userToDelete = await prisma.users.findUnique({
            where: { userid: userId }
        });

        if (!userToDelete) {
            return NextResponse.json({ message: "User not found." }, { status: 404 });
        }

        await prisma.users.delete({
            where: { userid: userId }
        });

        return NextResponse.json({ message: "User deleted successfully" });

    } catch (error: any) {
        console.error("DELETE USER ERROR:", { message: error.message, code: error.code, meta: error.meta });

        // Foreign key constraint — user has linked records in other tables
        if (error.code === 'P2003' || error.code === 'P2014') {
            return NextResponse.json(
                { message: "Cannot delete user: they have tasks or project records linked to them." },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const decoded = verifyToken(req) as any;
        if (!decoded) {
            return NextResponse.json({ message: "Unauthorized. Please log in." }, { status: 401 });
        }

        const { id } = await params;
        const userId = parseInt(id);

        if (isNaN(userId)) {
            return NextResponse.json({ message: "Invalid User ID" }, { status: 400 });
        }

        const body = await req.json();
        const { username, email, password, roleid } = body;

        const updateData: any = {};
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (roleid !== undefined) updateData.roleid = Number(roleid);

        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.passwordhash = await bcrypt.hash(password, salt);
        }

        const updatedUser = await prisma.users.update({
            where: { userid: userId },
            data: updateData,
            include: { roles: true }
        });

        const { passwordhash, ...safeUser } = updatedUser;
        return NextResponse.json(safeUser);

    } catch (error: any) {
        console.error("UPDATE USER ERROR:", error);
        return NextResponse.json(
            { message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}
