'use client';
import { useState } from 'react';
import {
    LayoutDashboard,
    CheckCircle2,
    Clock,
    AlertCircle,
    Plus,
    Calendar as CalendarIcon,
    TrendingUp,
    MoreVertical,
    Briefcase,
    Users
} from 'lucide-react';
import Link from 'next/link';
import styles from './home.module.css';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function HomePage() {
    const [tasks] = useState([
        { id: 1, title: 'Finalize Home Page Design', time: '10:00 AM', priority: 'high', completed: false, project: 'TaskMate' },
        { id: 2, title: 'Client Feedback Review', time: '11:30 AM', priority: 'medium', completed: true, project: 'Marketing' },
        { id: 3, title: 'Design System Update', time: '2:00 PM', priority: 'high', completed: false, project: 'TaskMate' },
        { id: 4, title: 'Weekly Team Sync', time: '4:00 PM', priority: 'medium', completed: false, project: 'Internal' },
    ]);

    const [schedule] = useState([
        { id: 1, title: 'Product Standup', time: '09:00', meridiem: 'AM', duration: '30min' },
        { id: 2, title: 'Design Review', time: '02:00', meridiem: 'PM', duration: '1h' },
        { id: 3, title: 'Sprint Planning', time: '04:30', meridiem: 'PM', duration: '1.5h' },
    ]);

    const stats = {
        total: 24,
        completed: 18,
        pending: 6,
        trend: '+12%'
    };

    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });

    return (
        <ProtectedRoute>
            <div className={styles.container}>
                {/* Header */}
                <header className={`${styles.header} animate-slide-up`}>
                    <div className={styles.welcomeSection}>
                        <h1 className="gradient-text">Welcome back, Pratik</h1>
                        <p className={styles.date}>{currentDate} • You have {stats.pending} pending tasks today</p>
                    </div>
                    <Link href="/Home/AddTask">
                        <button className={styles.actionButton}>
                            <Plus size={20} />
                            <span>Create New</span>
                        </button>
                    </Link>
                </header>

                {/* Stats Grid */}
                <section className={`${styles.statsGrid} animate-slide-up stagger-1`}>
                    <div className={`${styles.statCard} glass-panel`}>
                        <div className={styles.statTop}>
                            <div className={styles.statIconWrapper} style={{ color: '#818cf8' }}>
                                <LayoutDashboard size={24} />
                            </div>
                            <span className={styles.trendBadge}>+8%</span>
                        </div>
                        <div>
                            <div className={styles.statValue}>{stats.total}</div>
                            <div className={styles.statLabel}>Total Projects</div>
                        </div>
                    </div>

                    <div className={`${styles.statCard} glass-panel`}>
                        <div className={styles.statTop}>
                            <div className={styles.statIconWrapper} style={{ color: '#34d399' }}>
                                <CheckCircle2 size={24} />
                            </div>
                            <span className={styles.trendBadge}>+12%</span>
                        </div>
                        <div>
                            <div className={styles.statValue}>{stats.completed}</div>
                            <div className={styles.statLabel}>Tasks Completed</div>
                        </div>
                    </div>

                    <div className={`${styles.statCard} glass-panel`}>
                        <div className={styles.statTop}>
                            <div className={styles.statIconWrapper} style={{ color: '#f472b6' }}>
                                <Clock size={24} />
                            </div>
                            <span className={styles.trendBadge} style={{ background: 'rgba(244, 114, 182, 0.1)', color: '#f472b6', borderColor: 'rgba(244, 114, 182, 0.2)' }}>-5%</span>
                        </div>
                        <div>
                            <div className={styles.statValue}>{stats.pending}</div>
                            <div className={styles.statLabel}>Hours Spent</div>
                        </div>
                    </div>

                    <div className={`${styles.statCard} glass-panel`}>
                        <div className={styles.statTop}>
                            <div className={styles.statIconWrapper} style={{ color: '#fbbf24' }}>
                                <TrendingUp size={24} />
                            </div>
                            <span className={styles.trendBadge} style={{ background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.2)' }}>On Track</span>
                        </div>
                        <div>
                            <div className={styles.statValue}>94%</div>
                            <div className={styles.statLabel}>Productivity</div>
                        </div>
                    </div>
                </section>

                {/* Main Content Grid */}
                <div className={`${styles.contentGrid} animate-slide-up stagger-2`}>

                    {/* Recent Tasks */}
                    <section className="glass-panel" style={{ margin: '10px' }}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.sectionTitle}>
                                <Briefcase size={22} className="text-primary" />
                                Recent Tasks
                            </div>
                            <span className={styles.viewAll}>View All</span>
                        </div>

                        <div className={styles.taskList}>
                            {tasks.map((task) => (
                                <div key={task.id} className={styles.taskItem}>
                                    <div className={`${styles.checkbox} ${task.completed ? styles.completed : ''}`}>
                                        {task.completed && <CheckCircle2 size={16} color="white" />}
                                    </div>
                                    <div className={styles.taskContent}>
                                        <span className={styles.taskText} style={{ textDecoration: task.completed ? 'line-through' : 'none', opacity: task.completed ? 0.6 : 1 }}>{task.title}</span>
                                        <div className={styles.taskMeta}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Clock size={12} />
                                                {task.time}
                                            </span>
                                            <span>•</span>
                                            <span style={{ color: '#818cf8' }}>{task.project}</span>
                                        </div>
                                    </div>
                                    <div className={styles.avatarGroup}>
                                        <div className={styles.avatar}>A</div>
                                        <div className={styles.avatar} style={{ background: '#4f46e5' }}>B</div>
                                    </div>
                                    <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '4px' }}>
                                        <MoreVertical size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Side Panel / Today's Schedule */}
                    <section className="glass-panel" style={{ padding: '2rem' }}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.sectionTitle}>
                                <CalendarIcon size={22} className="text-secondary" />
                                Today's Schedule
                            </div>
                        </div>

                        <div className={styles.scheduleList}>
                            {schedule.map((event) => (
                                <div key={event.id} className={styles.scheduleItem}>
                                    <div className={styles.timeBlock}>
                                        <span className={styles.time}>{event.time}</span>
                                        <span className={styles.meridiem}>{event.meridiem}</span>
                                    </div>
                                    <div className={styles.eventDetails}>
                                        <h4>{event.title}</h4>
                                        <p>{event.duration}</p>
                                    </div>
                                </div>
                            ))}

                            {/* Add Event Button Placeholder */}
                            <div style={{
                                marginTop: '1rem',
                                border: '1px dashed rgba(255,255,255,0.2)',
                                borderRadius: '12px',
                                padding: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'rgba(255,255,255,0.5)',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}>
                                + Add Event
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </ProtectedRoute>
    );
}
