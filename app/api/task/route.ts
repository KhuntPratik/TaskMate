import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const tasks = await prisma.tasks.findMany({
      select: {
        taskid: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        duedate: true,
      },
    });

    // Map Prisma data to Task interface format
    const mappedTasks = tasks.map((task) => ({
      id: task.taskid,
      title: task.title || "",
      category: "Work", // Default category - you can modify this based on your logic
      dueDate: task.duedate
        ? new Date(task.duedate).toLocaleDateString()
        : "No due date",
      priority: (task.priority as "High" | "Medium" | "Low") || "Medium",
      status: (task.status as "To Do" | "In Progress" | "Done") || "To Do",
    }));

    return NextResponse.json(mappedTasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}
