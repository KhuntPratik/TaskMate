import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { verifyToken } from "../../../lib/auth";

export async function GET(req: Request) {
  try {
    const decoded = verifyToken(req) as any;
    if (!decoded) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const tasklists = await prisma.tasklists.findMany({
      include: {
        projects: true
      }
    });

    return NextResponse.json(tasklists);

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
    const { ProjectID, ListName } = body;

    if (!ListName) {
      return NextResponse.json({ message: "List name is required" }, { status: 400 });
    }

    const projectId = ProjectID ? Number(ProjectID) : null;
    if (ProjectID && isNaN(projectId as number)) {
      return NextResponse.json({ message: "Invalid Project ID" }, { status: 400 });
    }

    const tasklist = await prisma.tasklists.create({
      data: {
        projectid: projectId,
        listname: ListName
      }
    });

    return NextResponse.json(tasklist, { status: 201 });
  } catch (error) {
    console.error("POST TASKLIST ERROR:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}