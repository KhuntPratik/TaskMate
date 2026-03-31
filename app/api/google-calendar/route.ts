import { NextResponse } from "next/server";
import { google } from "googleapis";

type CreateCalendarBody = {
  accessToken: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD or ISO date
  startTime?: string; // "HH:mm" optional
  endTime?: string; // "HH:mm" optional
  timeZone?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateCalendarBody;
    const { accessToken, title, description, date, startTime, endTime, timeZone } =
      body;

    if (!accessToken || !title || !date) {
      return NextResponse.json(
        { message: "Missing required fields: accessToken, title, date" },
        { status: 400 }
      );
    }

    const tz = timeZone || "UTC";
    const startIso = startTime ? `${date}T${startTime}:00` : `${date}T09:00:00`;
    const endIso = endTime ? `${date}T${endTime}:00` : `${date}T10:00:00`;

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const event = {
      summary: title,
      description,
      start: { dateTime: startIso, timeZone: tz },
      end: { dateTime: endIso, timeZone: tz },
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });

    return NextResponse.json(response.data, { status: 201 });
  } catch (error: any) {
    console.error("GOOGLE CALENDAR ERROR:", error);
    return NextResponse.json(
      { message: "Failed to create calendar event" },
      { status: 500 }
    );
  }
}
