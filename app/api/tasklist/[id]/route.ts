import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { verifyToken } from "../../../../lib/auth";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const decoded = verifyToken(req) as any;
        if (!decoded || decoded.roleid !== 1) {
            return NextResponse.json({ message: "Unauthorized. Admin access required." }, { status: 403 });
        }

        const { id } = await params;
        const listId = Number(id);

        if (isNaN(listId)) {
            return NextResponse.json({ message: "Invalid List ID" }, { status: 400 });
        }

        // Deleting the task list (Cascades to tasks if configured in Prisma, but let's be safe)
        await prisma.tasklists.delete({
            where: { listid: listId }
        });

        return NextResponse.json({ message: "Task list deleted successfully" });
    } catch (error: any) {
        console.error("DELETE TASKLIST ERROR:", error);
        return NextResponse.json(
            { message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}
