'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './taskList.module.css';
import ProtectedRoute from '../../components/ProtectedRoute';
import { ListChecks, Search, Filter, Calendar, FolderKanban, Edit, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Task {
    taskid: number;
    title: string;
    description: string | null;
    priority: 'Low' | 'Medium' | 'High';
    status: 'Pending' | 'In Progress' | 'Done' | 'Completed';
    duedate: string | null;
    tasklists?: {
        listname: string;
        projects?: {
            projectname: string;
        }
    }
}

export default function TaskListPage() {
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'All' | 'Pending' | 'In Progress' | 'Completed'>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedListName, setSelectedListName] = useState<string>('All Lists');

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await fetch("/api/task");
                const data = await res.json();
                if (Array.isArray(data)) {
                    setTasks(data);
                }
            } catch (error) {
                console.error("Failed to fetch tasks", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    const handleDelete = async (taskId: number) => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        try {
            const res = await fetch(`/api/task/${taskId}`, { method: 'DELETE' });
            if (res.ok) {
                setTasks(prev => prev.filter(t => t.taskid !== taskId));
            }
        } catch (error) {
            console.error("Failed to delete task", error);
        }
    };

    // Extract unique list names from tasks
    const uniqueListNames = Array.from(new Set(tasks.map(t => t.tasklists?.listname || 'Unassigned'))).sort();

    const filteredTasks = tasks.filter(task => {
        // Search Filter
        const searchMatch = task.title.toLowerCase().includes(searchQuery.toLowerCase());

        // Status Filter
        const statusMatch = filter === 'All'
            ? true
            : filter === 'Completed'
                ? (task.status === 'Completed' || task.status === 'Done')
                : task.status === filter;

        // List Name Filter
        const listMatch = selectedListName === 'All Lists'
            ? true
            : (task.tasklists?.listname || 'Unassigned') === selectedListName;

        return searchMatch && statusMatch && listMatch;
    });

    // Group tasks by list name
    const groupedTasks = filteredTasks.reduce((groups: { [key: string]: Task[] }, task) => {
        const listName = task.tasklists?.listname || 'Unassigned';
        if (!groups[listName]) groups[listName] = [];
        groups[listName].push(task);
        return groups;
    }, {});

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '4rem' }}>
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <ListChecks className="text-primary" size={32} />
                        <div>
                            <h1 className={styles.title}>Task List</h1>
                            <p className={styles.subtitle}>All your tasks organized by list and project</p>
                        </div>
                    </div>
                </header>

                <div className={styles.filters}>
                    <div style={{ display: 'flex', gap: '0.5rem', flex: 1, flexWrap: 'wrap' }}>
                        {(['All', 'Pending', 'In Progress', 'Completed'] as const).map(f => (
                            <button
                                key={f}
                                className={`${styles.filterTab} ${filter === f ? styles.filterActive : ''}`}
                                onClick={() => setFilter(f)}
                            >
                                {f}
                            </button>
                        ))}

                        {/* Dropdown for Task Lists */}
                        <div style={{ position: 'relative', marginLeft: '0.5rem' }}>
                            <select
                                className={styles.filterTab}
                                style={{
                                    paddingRight: '2rem',
                                    appearance: 'none',
                                    outline: 'none',
                                    cursor: 'pointer',
                                    background: selectedListName !== 'All Lists' ? 'var(--primary)' : 'var(--surface)',
                                    color: selectedListName !== 'All Lists' ? 'white' : 'var(--muted-foreground)',
                                    borderColor: selectedListName !== 'All Lists' ? 'var(--primary)' : 'var(--border-color)'
                                }}
                                value={selectedListName}
                                onChange={(e) => setSelectedListName(e.target.value)}
                            >
                                <option value="All Lists">All Lists</option>
                                {uniqueListNames.map(name => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                            <Filter size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.6 }} />
                        </div>
                    </div>

                    <div style={{ position: 'relative', minWidth: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
                        <input
                            type="text"
                            placeholder="Find a task..."
                            style={{
                                padding: '0.75rem 1rem 0.75rem 2.5rem',
                                background: 'var(--surface)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '12px',
                                color: 'var(--foreground)',
                                width: '100%',
                                outline: 'none'
                            }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>


                {Object.keys(groupedTasks).length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>No tasks found matching your criteria.</p>
                    </div>
                ) : (
                    Object.entries(groupedTasks).map(([listName, listTasks]) => (
                        <div key={listName} className={styles.listGroup}>
                            <div className={styles.listHeader}>
                                <FolderKanban size={20} className="text-primary" />
                                <h2 className={styles.listTitle}>{listName}</h2>
                                <span className={styles.taskCount}>{listTasks.length} {listTasks.length === 1 ? 'Task' : 'Tasks'}</span>
                            </div>

                            <table className={styles.taskTable}>
                                <thead>
                                    <tr>
                                        <th className={styles.tableHeader}>Task</th>
                                        <th className={styles.tableHeader}>Priority</th>
                                        <th className={styles.tableHeader}>Status</th>
                                        <th className={styles.tableHeader}>Due Date</th>
                                        <th className={styles.tableHeader}>Project</th>
                                        <th className={styles.tableHeader} style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listTasks.map(task => (
                                        <tr key={task.taskid} className={styles.tableRow}>
                                            <td className={styles.tableCell}>
                                                <div className={styles.taskTitle}>
                                                    <span>{task.title}</span>
                                                    <span className={styles.idBadge}>#{task.taskid}</span>
                                                </div>
                                            </td>
                                            <td className={styles.tableCell}>
                                                <span className={`${styles.badge} ${task.priority === 'High' ? styles.badgeHigh :
                                                    task.priority === 'Medium' ? styles.badgeMedium :
                                                        styles.badgeLow
                                                    }`}>
                                                    {task.priority}
                                                </span>
                                            </td>
                                            <td className={styles.tableCell}>
                                                <span className={`${styles.statusBadge} ${(task.status === 'Completed' || task.status === 'Done') ? styles.statusCompleted :
                                                    task.status === 'In Progress' ? styles.statusInProgress :
                                                        styles.statusPending
                                                    }`}>
                                                    {task.status === 'Done' ? 'Completed' : task.status}
                                                </span>
                                            </td>
                                            <td className={styles.tableCell}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
                                                    <Calendar size={14} />
                                                    {task.duedate ? new Date(task.duedate).toLocaleDateString() : 'No date'}
                                                </div>
                                            </td>
                                            <td className={styles.tableCell}>
                                                <div className={styles.projectTag}>
                                                    <FolderKanban size={14} />
                                                    {task.tasklists?.projects?.projectname || 'Default'}
                                                </div>
                                            </td>
                                            <td className={styles.tableCell}>
                                                <div className={styles.actions}>
                                                    <button
                                                        className={styles.actionBtn}
                                                        onClick={() => router.push(`/MyTask/${task.taskid}/edit`)}
                                                        title="Edit Task"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                                        onClick={() => handleDelete(task.taskid)}
                                                        title="Delete Task"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))
                )}
            </div>
        </ProtectedRoute>
    );
}
