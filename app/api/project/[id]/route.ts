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
        const projectid = Number(id);

        const existingProject = await prisma.projects.findUnique({
            where: { projectid }
        });

        if (!existingProject) {
            return NextResponse.json({ message: "Project not found" }, { status: 404 });
        }

        // Only Admin or Creator can delete
        if (decoded.roleid !== 1 && existingProject.createdby !== decoded.userid) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        await prisma.projects.delete({
            where: { projectid }
        });

        return NextResponse.json({ message: "Project deleted successfully" }, { status: 200 });

    } catch (error) {
        console.error("DELETE PROJECT ERROR:", error);
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
        const projectid = Number(id);

        if (!projectid || isNaN(projectid)) {
            return NextResponse.json({ message: "Invalid project ID" }, { status: 400 });
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
            return NextResponse.json({ message: "Project not found" }, { status: 404 });
        }

        // Only Admin or Creator can view? (Or members if implemented)
        // For now, let's keep it simple: Admin or Creator
        if (decoded.roleid !== 1 && project.createdby !== decoded.userid) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json(project, { status: 200 });

    } catch (error) {
        console.error("GET PROJECT BY ID ERROR:", error);
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
        const projectid = Number(id);

        const existingProject = await prisma.projects.findUnique({
            where: { projectid }
        });

        if (!existingProject) {
            return NextResponse.json({ message: "Project not found" }, { status: 404 });
        }

        // Only Admin or Creator can edit
        if (decoded.roleid !== 1 && existingProject.createdby !== decoded.userid) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();

        await prisma.projects.update({
            where: { projectid },
            data: body
        });

        return NextResponse.json({ message: "Project updated successfully" }, { status: 200 });

    } catch (error) {
        console.error("UPDATE PROJECT ERROR:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
