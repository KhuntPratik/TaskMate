import { NextResponse } from "next/server";
import { google } from "googleapis";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

type CreateEventBody = {
  summary: string;
  description?: string;
  start: string; // ISO string
  end: string; // ISO string
  timeZone?: string;
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = session?.accessToken;

    if (!accessToken) {
      return NextResponse.json(
        { message: "Unauthorized: missing Google access token" },
        { status: 401 }
      );
    }

    const body = (await req.json()) as CreateEventBody;
    const { summary, description, start, end, timeZone } = body;

    if (!summary || !start || !end) {
      return NextResponse.json(
        { message: "Missing required fields: summary, start, end" },
        { status: 400 }
      );
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const event = {
      summary,
      description,
      start: {
        dateTime: start,
        timeZone: timeZone || "UTC",
      },
      end: {
        dateTime: end,
        timeZone: timeZone || "UTC",
      },
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });

    return NextResponse.json(response.data, { status: 201 });
  } catch (error: any) {
    console.error("CREATE CALENDAR EVENT ERROR:", error);
    return NextResponse.json(
      { message: "Failed to create event" },
      { status: 500 }
    );
  }
}
