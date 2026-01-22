'use client';
import { useState } from 'react';
import styles from './calender.module.css';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute';

interface Event {
    id: number;
    date: string; // YYYY-MM-DD
    title: string;
    status: 'Pending' | 'In Progress' | 'Completed';
}

const DUMMY_EVENTS: Event[] = [
    { id: 1, date: '2026-01-06', title: 'Project Review', status: 'Completed' },
    { id: 2, date: '2026-01-10', title: 'Sprint Planning', status: 'In Progress' },
    { id: 3, date: '2026-01-15', title: 'Client Meeting', status: 'Pending' },
    { id: 4, date: '2026-01-22', title: 'Design Handoff', status: 'Pending' },
];

export default function CalendarPage() {
    const router = useRouter();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<Event[]>(DUMMY_EVENTS);

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
            {/* Sidebar REMOVED - handeled by Layout */}

            {/* Main Content */}
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

                {/* Calendar Grid */}
                <div className={styles.calendarGrid}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className={styles.dayHeader}>{day}</div>
                    ))}
                    {renderDays()}
                </div>
            </main>

            {/* Modal */}
            {selectedDate && (
                <div className={styles.modalOverlay} onClick={() => setSelectedDate(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h2 className={styles.modalTitle}>Add Event</h2>
                        <p style={{ margin: 0 }}>Date: <strong>{selectedDate}</strong></p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Title</label>
                            <input
                                type="text"
                                className={styles.modalInput}
                                placeholder="Event Title..."
                                value={newTaskTitle}
                                onChange={e => setNewTaskTitle(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Status</label>
                            <select
                                className={styles.modalSelect}
                                value={newTaskStatus}
                                onChange={(e) => setNewTaskStatus(e.target.value as any)}
                            >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>

                        <div className={styles.modalActions}>
                            <button className={styles.secondaryBtn} onClick={() => setSelectedDate(null)}>Cancel</button>
                            <button className={styles.primaryBtn} onClick={saveEvent}>Save Event</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </ProtectedRoute>
    );
}
