'use client';
import { useState, useEffect } from 'react';
import styles from './calender.module.css';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';

interface Event {
    id: number;
    date: string; // YYYY-MM-DD
    title: string;
    status: 'Pending' | 'In Progress' | 'Completed';
}



export default function CalendarPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<Event[]>([]);
    const [taskLists, setTaskLists] = useState<any[]>([]);

    // Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<'Pending' | 'In Progress' | 'Completed'>('Pending');
    const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
    const [listId, setListId] = useState<number | ''>('');

    const getAuthHeader = () => {
        const token = user?.token || localStorage.getItem('token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    const fetchTasks = async () => {
        try {
            const res = await fetch("/api/task", {
                headers: getAuthHeader()
            });
            const data = await res.json();

            if (Array.isArray(data)) {
                const mappedEvents: Event[] = data.map((task: any) => ({
                    id: task.taskid,
                    title: task.title,
                    date: task.duedate ? new Date(task.duedate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    status: task.status === 'Done' || task.status === 'Completed' ? 'Completed' :
                        task.status === 'In Progress' ? 'In Progress' : 'Pending'
                }));
                setEvents(mappedEvents);
            }
        } catch (error) {
            console.error("Failed to fetch tasks for calendar", error);
        }
    };

    const fetchTaskLists = async () => {
        try {
            const res = await fetch("/api/tasklist", {
                headers: getAuthHeader()
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setTaskLists(data);
                if (data.length > 0) setListId(data[0].listid);
            }
        } catch (error) {
            console.error("Failed to fetch task lists", error);
        }
    };

    useEffect(() => {
        if (user || localStorage.getItem('token')) {
            fetchTasks();
            fetchTaskLists();
        }
    }, [user]);

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
        if (user?.roleid !== 1) return;
        setIsEditing(false);
        setEditingTaskId(null);
        setSelectedDate(dateStr);
        setTitle('');
        setDescription('');
        setStatus('Pending');
        setPriority('Medium');
        setIsModalOpen(true);
    };

    const handleEventClick = async (e: React.MouseEvent, eventId: number) => {
        e.stopPropagation();
        try {
            const res = await fetch(`/api/task/${eventId}`, {
                headers: getAuthHeader()
            });
            const task = await res.json();
            if (res.ok) {
                setIsEditing(true);
                setEditingTaskId(eventId);
                setTitle(task.title);
                setDescription(task.description || '');
                setStatus(task.status === 'Done' ? 'Completed' : task.status || 'Pending');
                setPriority(task.priority || 'Medium');
                setSelectedDate(task.duedate ? new Date(task.duedate).toISOString().split('T')[0] : '');
                setListId(task.listid || '');
                setIsModalOpen(true);
            }
        } catch (error) {
            console.error("Failed to fetch task details", error);
        }
    };

    const handleSave = async () => {
        if (!title.trim() || !selectedDate || !listId) {
            alert("Please fill in all required fields (Title, Date, and List)");
            return;
        }

        const taskData = {
            title,
            description,
            status: status === 'Completed' ? 'Done' : status,
            priority,
            duedate: selectedDate,
            listid: Number(listId),
            assignedto: user?.userid || 1 // Use authenticated user ID
        };

        try {
            const url = isEditing ? `/api/task/${editingTaskId}` : "/api/task";
            const method = isEditing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", ...getAuthHeader() },
                body: JSON.stringify(taskData)
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchTasks();
            } else {
                const err = await res.json();
                alert(`Error: ${err.message}`);
            }
        } catch (error) {
            console.error("Failed to save task", error);
        }
    };

    const handleDelete = async () => {
        if (!editingTaskId || !confirm("Are you sure you want to delete this task?")) return;

        try {
            const res = await fetch(`/api/task/${editingTaskId}`, {
                method: "DELETE",
                headers: getAuthHeader()
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchTasks();
            } else {
                alert("Failed to delete task");
            }
        } catch (error) {
            console.error("Failed to delete task", error);
        }
    };

    const getStatusClass = (status: string) => {
        if (status === 'Completed' || status === 'Done') return styles.eventCompleted;
        if (status === 'In Progress') return styles.eventInProgress;
        return styles.eventPending;
    };

    const renderDays = () => {
        const days = [];

        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className={`${styles.dayCell} ${styles.otherMonth}`}></div>);
        }

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
                        <div
                            key={e.id}
                            className={`${styles.event} ${getStatusClass(e.status)}`}
                            onClick={(clickEvt) => handleEventClick(clickEvt, e.id)}
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

                {isModalOpen && (
                    <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                            <h2 className={styles.modalTitle}>{isEditing ? 'Edit Task' : 'Add Task'}</h2>

                            <input
                                type="text"
                                placeholder="Task Title"
                                className={styles.modalInput}
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />

                            <textarea
                                placeholder="Description"
                                className={styles.modalInput}
                                style={{ minHeight: '100px', resize: 'vertical' }}
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <select
                                    className={styles.modalSelect}
                                    value={status}
                                    onChange={e => setStatus(e.target.value as any)}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>

                                <select
                                    className={styles.modalSelect}
                                    value={priority}
                                    onChange={e => setPriority(e.target.value as any)}
                                >
                                    <option value="Low">Low Priority</option>
                                    <option value="Medium">Medium Priority</option>
                                    <option value="High">High Priority</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <input
                                    type="date"
                                    className={styles.modalInput}
                                    value={selectedDate}
                                    onChange={e => setSelectedDate(e.target.value)}
                                />

                                <select
                                    className={styles.modalSelect}
                                    value={listId}
                                    onChange={e => setListId(Number(e.target.value))}
                                >
                                    <option value="" disabled>Select List</option>
                                    {taskLists.map(list => (
                                        <option key={list.listid} value={list.listid}>
                                            {list.listname}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.modalActions}>
                                {isEditing && (
                                    <button
                                        onClick={handleDelete}
                                        className={styles.secondaryBtn}
                                        style={{ borderColor: 'var(--danger)', color: 'var(--danger)', marginRight: 'auto' }}
                                    >
                                        Delete
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className={styles.secondaryBtn}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className={styles.primaryBtn}
                                >
                                    {isEditing ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}

