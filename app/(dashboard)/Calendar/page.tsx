'use client';
import { useState, useEffect } from 'react';
import styles from './calender.module.css';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute';

interface Event {
    id: number;
    date: string; // YYYY-MM-DD
    title: string;
    status: 'Pending' | 'In Progress' | 'Completed';
}



export default function CalendarPage() {
    const router = useRouter();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<Event[]>([]);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await fetch("/api/task");
                const data = await res.json();

                if (Array.isArray(data)) {
                    const mappedEvents: Event[] = data.map((task: any) => ({
                        id: task.taskid,
                        title: task.title,
                        date: task.duedate ? new Date(task.duedate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                        status: task.status === 'Done' ? 'Completed' :
                            task.status === 'In Progress' ? 'In Progress' : 'Pending'
                    }));
                    setEvents(mappedEvents);
                }
            } catch (error) {
                console.error("Failed to fetch tasks for calendar", error);
            }
        };

        fetchTasks();
    }, []);

    // Modal State
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskStatus, setNewTaskStatus] = useState<'Pending' | 'In Progress' | 'Completed'>('Pending');

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const formatDate = (y: number, m: number, d: number) => {
        return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    };

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const handleDayClick = (dateStr: string) => {
        setSelectedDate(dateStr);
        setNewTaskTitle('');
        setNewTaskStatus('Pending');
    };

    const saveEvent = () => {
        if (!newTaskTitle.trim() || !selectedDate) return;

        const newEvent: Event = {
            id: Date.now(),
            date: selectedDate,
            title: newTaskTitle,
            status: newTaskStatus
        };

        setEvents([...events, newEvent]);
        setSelectedDate(null); // Close modal
    };

    const getStatusClass = (status: string) => {
        if (status === 'Completed') return styles.eventCompleted;
        if (status === 'In Progress') return styles.eventInProgress;
        return styles.eventPending;
    };

    const renderDays = () => {
        const days = [];

        // Empty cells for previous month days
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className={`${styles.dayCell} ${styles.otherMonth}`}></div>);
        }

        // Days of current month
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = formatDate(year, month, d);
            const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();
            const daysEvents = events.filter(e => e.date === dateStr);

            days.push(
                <div
                    key={d}
                    className={`${styles.dayCell} ${isToday ? styles.today : ''}`}
                    onClick={() => handleDayClick(dateStr)}
                    style={{ cursor: 'pointer' }}
                >
                    <div className={styles.dateNumber}>{d}</div>
                    {daysEvents.map(e => (
                        <div key={e.id} className={`${styles.event} ${getStatusClass(e.status)}`}>
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
                        <h1 className={styles.title}>Calendar</h1>
                        <div className={styles.controls}>
                            <button onClick={prevMonth} className={styles.controlBtn}>‹</button>
                            <div className={styles.currentMonth}>
                                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </div>
                            <button onClick={nextMonth} className={styles.controlBtn}>›</button>
                        </div>
                    </header>

                        <div className={styles.calendarGrid}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className={styles.dayHeader}>{day}</div>
                        ))}
                        {renderDays()}
                    </div>
                </main>

            </div>
        </ProtectedRoute>
    );
}
