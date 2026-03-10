"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Calendar, CheckCircle2, Circle, Clock } from 'lucide-react';
import Link from 'next/link';
import styles from './detail.module.css';
import { useAuth } from '../../../context/AuthContext';

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!params.id) return;

        const fetchProject = async () => {
            try {
                const token = user?.token || localStorage.getItem('token');
                const res = await fetch(`/api/project/${params.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!res.ok) throw new Error("Failed to fetch project");
                const data = await res.json();
                setProject(data);
            } catch (err) {
                console.error(err);
                setError("Could not load project details");
            } finally {
                setLoading(false);
            }
        };

        if (user || localStorage.getItem('token')) {
            fetchProject();
        }
    }, [params.id, user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="animate-spin text-indigo-500" size={40} />
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className={styles.container}>
                <div className={styles.errorText}>{error || "Project not found"}</div>
                <Link href="/Project" className={styles.backButton}>
                    <ArrowLeft size={16} /> Back to Projects
                </Link>
            </div>
        );
    }

    // Flatten tasks from tasklists
    const allTasks = project.tasklists?.flatMap((list: any) => list.tasks || []) || [];
    const completedTasks = allTasks.filter((t: any) => t.status === 'Completed').length;
    const pendingTasks = allTasks.filter((t: any) => t.status !== 'Completed').length;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <Link href="/Project" className={styles.backButton} style={{ alignSelf: 'flex-start', marginBottom: '1rem' }}>
                        <ArrowLeft size={16} /> Back
                    </Link>
                    <h1 className={styles.title}>{project.projectname}</h1>
                    <p className={styles.description}>{project.description || "No description provided."}</p>
                </div>
                <div className="flex gap-2">
                    {/* Add Edit/Delete buttons here if needed */}
                </div>
            </header>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Total Tasks</span>
                    <span className={styles.statValue}>{allTasks.length}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Completed</span>
                    <span className={`${styles.statValue} ${styles.statValueSuccess}`}>{completedTasks}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Pending</span>
                    <span className={`${styles.statValue} ${styles.statValueWarning}`}>{pendingTasks}</span>
                </div>
            </div>

            <section className={styles.tasksSection}>
                <h2 className={styles.tasksTitle}>Tasks</h2>

                {allTasks.length === 0 ? (
                    <div className={styles.emptyText}>No tasks created yet.</div>
                ) : (
                    <div className={styles.taskList}>
                        {allTasks.map((task: any) => (
                            <div key={task.taskid} className={styles.taskCard}>
                                <div className={styles.taskInfo}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <h3 className={styles.taskTitle}>{task.title}</h3>
                                        <span className={styles.idBadge}>#{task.taskid}</span>
                                    </div>
                                    <div className={styles.taskMeta}>
                                        <span className={`${styles.priority} ${styles[task.priority]}`}>{task.priority}</span>
                                        <span className={styles.status}>{task.status}</span>
                                        {task.duedate && (
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                {new Date(task.duedate).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    {task.status === 'Completed' ? (
                                        <CheckCircle2 className={styles.taskStatusDone} />
                                    ) : task.status === 'In Progress' ? (
                                        <Clock className={styles.taskStatusProgress} />
                                    ) : (
                                        <Circle className={styles.taskStatusPending} />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
