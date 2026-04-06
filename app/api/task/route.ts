export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { verifyToken } from "../../../lib/auth";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions";
import { google } from "googleapis";

type AuthUser = {
  userid: number;
  roleid: number | null;
  email?: string | null;
};

const getAuthUser = async (req: Request): Promise<AuthUser | null> => {
  const decoded = verifyToken(req) as any;
  if (decoded) {
    return {
      userid: decoded.userid,
      roleid: decoded.roleid ?? null,
      email: decoded.email,
    };
  }

  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  if (!email) return null;

  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) return null;

  return {
    userid: user.userid,
    roleid: user.roleid ?? null,
    email: user.email,
  };
};

export async function GET(req: Request) {
  try {
    const decoded = await getAuthUser(req);
    if (!decoded) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let tasks;
    if (decoded.roleid === 1) {
      tasks = await prisma.tasks.findMany({
        include: {
          tasklists: {
            include: {
              projects: true
            }
          }
        },
        orderBy: { createdat: 'desc' }
      });
    } else {
      tasks = await prisma.tasks.findMany({
        where: {
          assignedto: decoded.userid
        },
        include: {
          tasklists: {
            include: {
              projects: true
            }
          }
        },
        orderBy: { createdat: 'desc' }
      });
    }

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

type GoogleTaskPayload = {
  title: string;
  description?: string;
  duedate: string;
};

const addDays = (dateStr: string, days: number) => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
};

const syncTaskToGoogleCalendar = async (
  accessToken: string,
  task: GoogleTaskPayload
) => {
  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const startDate = new Date(task.duedate).toISOString().split("T")[0];
    const endDate = addDays(startDate, 1); // all-day events are end-exclusive

    await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: task.title,
        description: task.description,
        start: { date: startDate },
        end: { date: endDate },
      },
    });
  } catch (error) {
    console.error("GOOGLE CALENDAR SYNC ERROR:", error);
  }
};

export async function POST(req: Request) {
  try {
    const decoded = await getAuthUser(req);
    if (!decoded) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body: TaskBody = await req.json();

    const task = await prisma.tasks.create({
      data: {
        listid: body.listid,
        assignedto: body.assignedto || decoded.userid,
        title: body.title,
        description: body.description,
        priority: body.priority,
        status: body.status,
        duedate: new Date(body.duedate)
      }
    });

    const session = await getServerSession(authOptions);
    const accessToken = (session as any)?.accessToken as string | undefined;
    if (accessToken) {
      await syncTaskToGoogleCalendar(accessToken, {
        title: task.title,
        description: task.description || undefined,
        duedate: task.duedate?.toISOString() ?? body.duedate,
      });
    }

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
