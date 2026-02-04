import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const taskid = Number(id);

        const existingProject = await prisma.tasks.findUnique({
            where: { taskid }
        });

        if (!existingProject) {
            return NextResponse.json(
                { message: "Task not found" },
                { status: 404 }
            );
        }

        await prisma.tasks.delete({
            where: { taskid }
        });

        return NextResponse.json(
            { message: "Task deleted successfully" },
            { status: 200 }
        );

    } catch (error) {
        console.error("DELETE TASK ERROR:", error);
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}



export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const taskid = Number(id);

        if (!taskid || isNaN(taskid)) {
            return NextResponse.json(
                { message: "Invalid task ID" },
                { status: 400 }
            );
        }

        const task = await prisma.tasks.findUnique({
            where: { taskid },
            include: {
                tasklists: {
                    include: {
                        tasks: true
                    }
                }
            }
        });

        if (!task) {
            return NextResponse.json(
                { message: "Task not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(task, { status: 200 });

    } catch (error) {
        console.error("GET TASK BY ID ERROR:", error);
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}




export async function PUT(
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
            data: body
        });

        return NextResponse.json(
            { message: "Task updated successfully", data: updatedTask },
            { status: 200 }
        );

    } catch (error: any) {
        console.error("UPDATE TASK ERROR:", error);

        return NextResponse.json(
            {
                message: "Server error",
                error: error.message   // helpful for debugging
            },
            { status: 500 }
        );
    }
}