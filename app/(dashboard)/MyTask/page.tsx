'use client';
import MyTaskClient from "./MyTaskClient";
import { Task } from "./KanbanBoard";
import { useState, useEffect } from 'react';

export default function MyTaskPage() {
    const [loading, setLoading] = useState(true);
    const [taskData, setTaskData] = useState<any[]>([]);
    const [projectData, setProjectData] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tasksRes, projectsRes] = await Promise.all([
                    fetch("/api/task"),
                    fetch("/api/project")
                ]);

                const tasks = await tasksRes.json();
                const projects = await projectsRes.json();

                if (Array.isArray(tasks)) setTaskData(tasks);
                if (Array.isArray(projects)) setProjectData(projects);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [])

    const tasks: Task[] = taskData.map((task) => ({
        id: task.taskid,
        title: task.title || "",
        category: task.tasklists?.projects?.projectname || "Work",
        projectId: task.tasklists?.projects?.projectid,
        projectName: task.tasklists?.projects?.projectname,
        dueDate: task.duedate
            ? new Date(task.duedate).toLocaleDateString()
            : "No due date",
        priority: (task.priority as "High" | "Medium" | "Low") || "Medium",
        status: (task.status === "To Do" ? "Pending" : (task.status === "Completed" ? "Completed" : task.status as "Pending" | "In Progress" | "Completed")) || "Pending",
    }));

    if (loading) {
        return <div className="p-8 text-white">Loading tasks...</div>;
    }

    return <MyTaskClient tasks={tasks} projects={projectData} />;
}
