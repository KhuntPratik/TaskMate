import { prisma } from "../../../lib/prisma";
import MyTaskClient from "./MyTaskClient";
import { Task } from "./KanbanBoard";

export default async function MyTaskPage() {
    const prismaTask = await prisma.tasks.findMany();

    const tasks: Task[] = prismaTask.map((task) => ({
        id: task.taskid,
        title: task.title || "",
        category: "Work",
        dueDate: task.duedate
            ? new Date(task.duedate).toLocaleDateString()
            : "No due date",
        priority: (task.priority as "High" | "Medium" | "Low") || "Medium",
        status: (task.status as "To Do" | "In Progress" | "Done") || "To Do",
    }));

    return <MyTaskClient tasks={tasks} />;
}
