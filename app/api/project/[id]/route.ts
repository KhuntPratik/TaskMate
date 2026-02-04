import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const projectid = Number(id);

        const existingProject = await prisma.projects.findUnique({
            where: { projectid }
        });

        if (!existingProject) {
            return NextResponse.json(
                { message: "Project not found" },
                { status: 404 }
            );
        }

        await prisma.projects.delete({
            where: { projectid }
        });

        return NextResponse.json(
            { message: "Project deleted successfully" },
            { status: 200 }
        );

    } catch (error) {
        console.error("DELETE PROJECT ERROR:", error);
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
        const projectid = Number(id);

        if (!projectid || isNaN(projectid)) {
            return NextResponse.json(
                { message: "Invalid project ID" },
                { status: 400 }
            );
        }

        const project = await prisma.projects.findUnique({
            where: { projectid },
            include: {
                tasklists: {
                    include: {
                        tasks: true
                    }
                }
            }
        });

        if (!project) {
            return NextResponse.json(
                { message: "Project not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(project, { status: 200 });

    } catch (error) {
        console.error("GET PROJECT BY ID ERROR:", error);
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
        const projectid = Number(id);

        const existingProject = await prisma.projects.findUnique({
            where: { projectid }
        });

        if (!existingProject) {
            return NextResponse.json(
                { message: "Project not found" },
                { status: 404 }
            );
        }

        await prisma.projects.update({
            where: { projectid },
            data: await req.json()
        });

        return NextResponse.json(
            { message: "Project updated successfully" },
            { status: 200 }
        );

    } catch (error) {
        console.error("UPDATE PROJECT ERROR:", error);
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}