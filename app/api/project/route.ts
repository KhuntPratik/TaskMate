import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { verifyToken } from "../../../lib/auth";

export async function GET(req: Request) {
    try {
        const decoded = verifyToken(req) as any;
        if (!decoded) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        let projects;
        if (decoded.roleid === 1) {
            projects = await prisma.projects.findMany({
                orderBy: { createdat: 'desc' }
            });
        } else {
            projects = await prisma.projects.findMany({
                where: {
                    createdby: decoded.userid
                },
                orderBy: { createdat: 'desc' }
            });
        }

        return NextResponse.json(projects);

    } catch (error) {
        console.error("GET PROJECT ERROR:", error);
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const decoded = verifyToken(req) as any;
        if (!decoded) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { ProjectName, Description } = body;

        const project = await prisma.projects.create({
            data: {
                projectname: ProjectName,
                description: Description,
                createdby: decoded.userid
            }
        });

        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        console.error("POST PROJECT ERROR:", error);
        return NextResponse.json(
            { message: "Server error", error: String(error) },
            { status: 500 }
        );
    }
}