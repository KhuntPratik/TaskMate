import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const tasklists = await prisma.tasklists.findMany();

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
    const body = await req.json();

    const { ListID, ProjectID, ListName } = body;

    const tasklist = await prisma.tasklists.create({
      data: {
        listid: ListID,
        projectid: ProjectID,
        listname: ListName
      }
    })

    return NextResponse.json(tasklist);
  }

  catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}