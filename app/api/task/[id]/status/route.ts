export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const taskid = Number(id);

        if (isNaN(taskid)) {
            return NextResponse.json(
                { message: "Invalid task id" },
                { status: 400 }
            );
        }

        const body = await req.json();
        const { status } = body;

        // Validate status
        const allowedStatuses = ['To Do', 'In Progress', 'Completed'];
        if (!status || !allowedStatuses.includes(status)) {
            // Allow mapping from UI 'Pending' if passed accidentally, though UI should handle this
            if (status === 'Pending') {
                // Acceptable, will map below (but ideally UI sends 'To Do')
            } else {
                return NextResponse.json(
                    { message: "Invalid status value" },
                    { status: 400 }
                );
            }
        }

        const dbStatus = status === 'Pending' ? 'To Do' : status;

        const existingTask = await prisma.tasks.findUnique({
            where: { taskid }
        });

        if (!existingTask) {
            return NextResponse.json(
                { message: "Task not found" },
                { status: 404 }
            );
        }

        const updatedTask = await prisma.tasks.update({
            where: { taskid },
            data: { status: dbStatus }
        });

        return NextResponse.json(
            { message: "Task status updated successfully", data: updatedTask },
            { status: 200 }
        );

    } catch (error: any) {
        console.error("UPDATE TASK STATUS ERROR:", error);
        return NextResponse.json(
            { message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}
