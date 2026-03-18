export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { verifyToken } from "../../../../lib/auth";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const decoded = verifyToken(req) as any;
        if (!decoded) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const taskid = Number(id);

        const existingTask = await prisma.tasks.findUnique({
            where: { taskid }
        });

        if (!existingTask) {
            return NextResponse.json({ message: "Task not found" }, { status: 404 });
        }

        // Only Admin or Assigned User can delete
        if (decoded.roleid !== 1 && existingTask.assignedto !== decoded.userid) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        await prisma.tasks.delete({
            where: { taskid }
        });

        return NextResponse.json({ message: "Task deleted successfully" }, { status: 200 });

    } catch (error) {
        console.error("DELETE TASK ERROR:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const decoded = verifyToken(req) as any;
        if (!decoded) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const taskid = Number(id);

        if (!taskid || isNaN(taskid)) {
            return NextResponse.json({ message: "Invalid task ID" }, { status: 400 });
        }

        const task = await prisma.tasks.findUnique({
            where: { taskid },
            include: {
                tasklists: {
                    include: {
                        projects: true
                    }
                }
            }
        });

        if (!task) {
            return NextResponse.json({ message: "Task not found" }, { status: 404 });
        }

        // Only Admin or Assigned User can view
        if (decoded.roleid !== 1 && task.assignedto !== decoded.userid) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json(task, { status: 200 });

    } catch (error) {
        console.error("GET TASK BY ID ERROR:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const decoded = verifyToken(req) as any;
        if (!decoded) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const taskid = Number(id);

        if (isNaN(taskid)) {
            return NextResponse.json({ message: "Invalid task id" }, { status: 400 });
        }

        const body = await req.json();

        const existingTask = await prisma.tasks.findUnique({
            where: { taskid }
        });

        if (!existingTask) {
            return NextResponse.json({ message: "Task not found" }, { status: 404 });
        }

        // Only Admin or Assigned User can edit
        if (decoded.roleid !== 1 && existingTask.assignedto !== decoded.userid) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const updatedTask = await prisma.tasks.update({
            where: { taskid },
            data: body
        });

        return NextResponse.json({ message: "Task updated successfully", data: updatedTask }, { status: 200 });

    } catch (error: any) {
        console.error("UPDATE TASK ERROR:", error);
        return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
    }
}
