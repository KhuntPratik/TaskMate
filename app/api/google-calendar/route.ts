import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { authOptions } from "../auth/[...nextauth]/authOptions";
import { google } from "googleapis";

export async function POST(req: NextRequest) {
  const session: any = await getServerSession(authOptions);
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const accessToken =
    (token as any)?.accessToken || (session as any)?.accessToken;
  const refreshToken =
    (token as any)?.refreshToken || (session as any)?.refreshToken;

  if (!accessToken) {
    return NextResponse.json({ error: "No token" }, { status: 401 });
  }

  const { tasks } = await req.json();

  if (!tasks || !tasks.length) {
    return NextResponse.json({ message: "No tasks" });
  }

  try {
    if (!refreshToken) {
      return NextResponse.json(
        { error: "Re-auth required", details: "Missing refresh token" },
        { status: 401 }
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    for (const task of tasks) {
      const checkData = await calendar.events.list({
        calendarId: "primary",
        q: task.title,
        maxResults: 1,
      });

      if (checkData.data.items && checkData.data.items.length > 0) {
        console.log("Event already exists:", task.title);
        continue; // skip duplicate
      }

      await calendar.events.insert({
        calendarId: "primary",
        requestBody: {
          summary: task.title,
          start: {
            dateTime: new Date(task.date + "T10:00:00").toISOString(),
            timeZone: "Asia/Kolkata",
          },
          end: {
            dateTime: new Date(task.date + "T11:00:00").toISOString(),
            timeZone: "Asia/Kolkata",
          },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Google Calendar sync error:", err?.response?.data || err);
    const status = err?.response?.status || 500;
    return NextResponse.json(
      {
        error: "Google check failed",
        details: err?.response?.data || err?.message || "Unknown error",
      },
      { status }
    );
  }
}
