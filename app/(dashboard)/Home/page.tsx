'use client';
import { useState, useEffect } from 'react';
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
    Users,
    Loader2
} from 'lucide-react';
import Link from 'next/link';
import styles from './home.module.css';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';

export default function HomePage() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const stats = {
        totalProjects: projects.length,
        completedTasks: tasks.filter(t => t.status === 'Completed' || t.status === 'Done').length,
        pendingTasks: tasks.filter(t => t.status !== 'Completed' && t.status !== 'Done').length,
        productivity: tasks.length > 0
            ? Math.round((tasks.filter(t => t.status === 'Completed' || t.status === 'Done').length / tasks.length) * 100)
            : 0
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = user?.token || localStorage.getItem('token');
                const [tasksRes, projectsRes] = await Promise.all([
                    fetch("/api/task", { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch("/api/project", { headers: { 'Authorization': `Bearer ${token}` } })
                ]);

                const tasksData = await tasksRes.json();
                const projectsData = await projectsRes.json();

                if (Array.isArray(tasksData)) setTasks(tasksData);
                if (Array.isArray(projectsData)) setProjects(projectsData);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        if (user || localStorage.getItem('token')) {
            fetchData();
        }
    }, [user]);

    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });

    if (loading) {
        return (
            <ProtectedRoute>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <Loader2 className="animate-spin text-primary" size={40} />
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className={styles.container}>
                {/* Header */}
                <header className={`${styles.header} animate-slide-up`}>
                    <div className={styles.welcomeSection}>
                        <h1 className="gradient-text">Welcome back, {user?.name || 'User'}</h1>
                        <p className={styles.date}>{currentDate} • You have {stats.pendingTasks} pending tasks today</p>
                    </div>
                    <Link href="/Project/AddProject">
                        <button className={styles.actionButton}>
                            <Plus size={20} />
                            <span>Create Project</span>
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
                        </div>
                        <div>
                            <div className={styles.statValue}>{stats.totalProjects}</div>
                            <div className={styles.statLabel}>Total Projects</div>
                        </div>
                    </div>

                    <div className={`${styles.statCard} glass-panel`}>
                        <div className={styles.statTop}>
                            <div className={styles.statIconWrapper} style={{ color: '#34d399' }}>
                                <CheckCircle2 size={24} />
                            </div>
                        </div>
                        <div>
                            <div className={styles.statValue}>{stats.completedTasks}</div>
                            <div className={styles.statLabel}>Tasks Completed</div>
                        </div>
                    </div>

                    <div className={`${styles.statCard} glass-panel`}>
                        <div className={styles.statTop}>
                            <div className={styles.statIconWrapper} style={{ color: '#f472b6' }}>
                                <Clock size={24} />
                            </div>
                        </div>
                        <div>
                            <div className={styles.statValue}>{stats.pendingTasks}</div>
                            <div className={styles.statLabel}>Pending Tasks</div>
                        </div>
                    </div>

                    <div className={`${styles.statCard} glass-panel`}>
                        <div className={styles.statTop}>
                            <div className={styles.statIconWrapper} style={{ color: '#fbbf24' }}>
                                <TrendingUp size={24} />
                            </div>
                        </div>
                        <div>
                            <div className={styles.statValue}>{stats.productivity}%</div>
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
                            <Link href="/TaskList" className={styles.viewAll}>View All</Link>
                        </div>

                        <div className={styles.taskList}>
                            {tasks.length > 0 ? tasks.slice(0, 5).map((task) => (
                                <div key={task.taskid} className={styles.taskItem}>
                                    <div className={`${styles.checkbox} ${(task.status === 'Completed' || task.status === 'Done') ? styles.completed : ''}`}>
                                        {(task.status === 'Completed' || task.status === 'Done') && <CheckCircle2 size={16} color="white" />}
                                    </div>
                                    <div className={styles.taskContent}>
                                        <span className={styles.taskText} style={{ textDecoration: (task.status === 'Completed' || task.status === 'Done') ? 'line-through' : 'none', opacity: (task.status === 'Completed' || task.status === 'Done') ? 0.6 : 1 }}>{task.title}</span>
                                        <div className={styles.taskMeta}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Clock size={12} />
                                                {task.duedate ? new Date(task.duedate).toLocaleDateString() : 'No date'}
                                            </span>
                                            <span>•</span>
                                            <span style={{ color: '#818cf8' }}>{task.tasklists?.projects?.projectname || 'Default'}</span>
                                        </div>
                                    </div>
                                    <div className={styles.avatarGroup}>
                                        <div className={styles.avatar} style={{ background: '#4f46e5', color: 'white' }}>{task.assignedto || '?'}</div>
                                    </div>
                                    <Link href={`/MyTask/${task.taskid}/edit`} style={{ color: 'rgba(255,255,255,0.4)', padding: '4px' }}>
                                        <MoreVertical size={18} />
                                    </Link>
                                </div>
                            )) : (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                                    No tasks found
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Recent Projects */}
                    <section className="glass-panel" style={{ padding: '2rem' }}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.sectionTitle}>
                                <Users size={22} className="text-secondary" />
                                Recent Projects
                            </div>
                            <Link href="/Project" className={styles.viewAll}>View All</Link>
                        </div>

                        <div className={styles.scheduleList}>
                            {projects.length > 0 ? projects.slice(0, 5).map((project) => (
                                <Link href={`/Project/${project.projectid}`} key={project.projectid} className={styles.scheduleItem} style={{ textDecoration: 'none' }}>
                                    <div className={styles.timeBlock}>
                                        <span className={styles.time}>#{project.projectid}</span>
                                    </div>
                                    <div className={styles.eventDetails}>
                                        <h4>{project.projectname}</h4>
                                        <p>{project.description || 'No description'}</p>
                                    </div>
                                </Link>
                            )) : (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                                    No projects found
                                </div>
                            )}
                        </div>
                    </section>

                </div>
            </div>
        </ProtectedRoute>
    );
}
