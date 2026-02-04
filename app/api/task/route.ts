import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const tasks = await prisma.tasks.findMany({
      include: {
        tasklists: {
          include: {
            projects: true
          }
        }
      }
    });

    return NextResponse.json(tasks);

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}


type TaskBody = {
  listid: number;
  assignedto: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  duedate: string;
};

export async function POST(req: Request) {
  try {
    const body: TaskBody = await req.json();

    const task = await prisma.tasks.create({
      data: {
        listid: body.listid,
        assignedto: body.assignedto,
        title: body.title,
        description: body.description,
        priority: body.priority,
        status: body.status,
        duedate: new Date(body.duedate)
      }
    });

    const safeTask = {
      ...task,
      duedate: task.duedate?.toISOString() ?? null,
      createdat: task.createdat?.toISOString() ?? new Date().toISOString()
    };

    return NextResponse.json(safeTask, { status: 201 });
  } catch (error: any) {
    console.error("POST TASK ERROR:", error);
    return NextResponse.json({ message: error.message || "Server error" }, { status: 500 });
  }
}

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     console.log("POST /api/task body:", body);

//     const { listid, assignedto, title, description, priority, status, duedate, createdat } = body;

//     if (!title) {
//       return NextResponse.json(
//         { message: "Title is required" },
//         { status: 400 }
//       );
//     }

//     const task = await prisma.tasks.create({
//       data: {
//         listid: listid ? Number(listid) : null,
//         assignedto: assignedto ? Number(assignedto) : null,
//         title: title,
//         description: description,
//         priority: priority,
//         status: status,
//         duedate: duedate ? new Date(duedate) : null,
//         createdat: createdat ? new Date(createdat) : new Date()
//       }
//     })

//     return NextResponse.json(task);

//   } catch (error) {
//     console.error("POST TASK ERROR:", error);
//     return NextResponse.json(
//       { message: "Server error", error: String(error) },
//       { status: 500 }
//     );
//   }
// }
