import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function POST(req: NextRequest) {
  const session: any = await getServerSession();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "No token" }, { status: 401 });
  }

  const { tasks } = await req.json();

  if (!tasks || !tasks.length) {
    return NextResponse.json({ message: "No tasks" });
  }

  try {
    for (const task of tasks) {
      const res = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            summary: task.title,
            start: {
              dateTime: new Date(task.date + "T10:00:00").toISOString(),
              timeZone: "Asia/Kolkata",
            },
            end: {
              dateTime: new Date(task.date + "T11:00:00").toISOString(),
              timeZone: "Asia/Kolkata",
            },
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("Google Error:", data);
        return NextResponse.json(data, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}