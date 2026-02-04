import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
    try {
        const Projects = await prisma.projects.findMany();

        return NextResponse.json(Projects);

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
        const body = await req.json();

        const { ProjectName, Description, CreatedBy } = body;



        const project = await prisma.projects.create({
            data: {
                projectname: ProjectName,
                description: Description,
                createdby: CreatedBy
            }
        })

        return NextResponse.json(project);
    }

    catch (error) {
        console.error("POST PROJECT ERROR:", error);
        return NextResponse.json(
            { message: "Server error", error: String(error) },
            { status: 500 }
        );
    }
}