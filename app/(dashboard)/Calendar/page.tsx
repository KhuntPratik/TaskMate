"use client";

import { useState, useEffect } from "react";
import styles from "./calender.module.css";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";
import { useSession } from "next-auth/react";
 
interface Event {
  id: number;
  date: string;
  title: string;
  status: "Pending" | "In Progress" | "Completed";
}

export default function CalendarPage() {
  const { user, isLoading } = useAuth();
  const { data: session } = useSession();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // ✅ BACKEND SYNC (NO DIRECT GOOGLE CALL)
  const syncToGoogleCalendar = async (tasks: Event[]) => {
    try {
      const res = await fetch("/api/google-sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tasks }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("❌ Sync Error:", data);
      } else {
        console.log("✅ Synced with Google Calendar");
      }
    } catch (err) {
      console.error("❌ Sync failed", err);
    }
  };

  // ✅ FETCH TASKS
  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/task", {
        headers: getAuthHeader(),
      });

      if (!res.ok) {
        setEvents([]);
        return;
      }

      const data = await res.json();

      if (!Array.isArray(data)) {
        setEvents([]);
        return;
      }

      const mapped: Event[] = data.map((task: any) => ({
        id: task.taskid,
        title: task.title,
        date: task.duedate
          ? new Date(task.duedate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        status:
          task.status === "Done" || task.status === "Completed"
            ? "Completed"
            : task.status === "In Progress"
            ? "In Progress"
            : "Pending",
      }));

      setEvents(mapped);

      // ✅ SINGLE SYNC CALL
      await syncToGoogleCalendar(mapped);
    } catch (error) {
      console.error("❌ Failed to fetch tasks", error);
    }
  };

  useEffect(() => {
    if (isLoading) return;

    if ((user || localStorage.getItem("token")) && session) {
      fetchTasks();
    }
  }, [user, isLoading, session]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const totalCount = events.length;
  const pendingCount = events.filter((e) => e.status === "Pending").length;
  const inProgressCount = events.filter(
    (e) => e.status === "In Progress"
  ).length;
  const completedCount = events.filter(
    (e) => e.status === "Completed"
  ).length;

  const formatDate = (y: number, m: number, d: number) => {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(
      2,
      "0"
    )}`;
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const getStatusClass = (s: string) => {
    if (s === "Completed") return styles.eventCompleted;
    if (s === "In Progress") return styles.eventInProgress;
    return styles.eventPending;
  };

  const renderDays = () => {
    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className={`${styles.dayCell} ${styles.otherMonth}`}
        />
      );
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = formatDate(year, month, d);
      const isToday =
        new Date().toDateString() ===
        new Date(year, month, d).toDateString();

      const daysEvents = events.filter((e) => e.date === dateStr);

      days.push(
        <div
          key={d}
          className={`${styles.dayCell} ${
            isToday ? styles.today : ""
          }`}
        >
          <div className={styles.dateNumber}>{d}</div>

          {daysEvents.map((e) => (
            <div
              key={e.id}
              className={`${styles.event} ${getStatusClass(e.status)}`}
            >
              {e.title}
            </div>
          ))}
        </div>
      );
    }

    return days;
  };

  return (
    <ProtectedRoute>
      <div className={styles.container}>
        <main className={styles.main}>
          <header className={styles.header}>
            <div>
              <h1 className={styles.title}>Calendar</h1>
              <p>View your tasks</p>
            </div>

            <div>
              <button onClick={goToToday}>Today</button>
              <button onClick={prevMonth}>{"<"}</button>
              <span>
                {currentDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <button onClick={nextMonth}>{">"}</button>
            </div>
          </header>

          <div className={styles.stats}>
            <div>Total: {totalCount}</div>
            <div>Pending: {pendingCount}</div>
            <div>In Progress: {inProgressCount}</div>
            <div>Completed: {completedCount}</div>
          </div>

          <div className={styles.calendarGrid}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day) => (
                <div key={day}>{day}</div>
              )
            )}
            {renderDays()}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}