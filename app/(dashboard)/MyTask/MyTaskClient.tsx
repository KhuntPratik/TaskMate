'use client';

import { useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import KanbanBoard, { Task } from './KanbanBoard';
import styles from './mytask.module.css';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Search } from 'lucide-react';


export interface ProjectSummary {
    projectid: number;
    projectname: string;
}

interface Props {
    tasks: Task[];
    projects: ProjectSummary[];
}

export default function MyTaskClient({ tasks, projects }: Props) {
    const [taskState, setTaskState] = useState<Task[]>(tasks);
    const [filter, setFilter] = useState<'All' | 'Pending' | 'Completed' | 'In Progress'>('All');
    const [projectFilter, setProjectFilter] = useState<number | 'All'>('All');
    const [viewMode, setViewMode] = useState<'list' | 'board'>('board');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTasks = taskState.filter(task => {
        // Status Filter
        const statusMatch = filter === 'All'
            ? true
            : filter === 'Pending'
                ? task.status === 'Pending'
                : filter === 'In Progress'
                    ? task.status === 'In Progress'
                    : task.status === 'Completed';

        // Project Filter
        const projectMatch = projectFilter === 'All' || task.projectId === projectFilter;

        // Search Filter
        const searchMatch = task.title.toLowerCase().includes(searchQuery.toLowerCase());

        return statusMatch && projectMatch && searchMatch;
    });

    const router = useRouter()

    const handleDelete = async (taskId: number) => {
        if (!confirm("Are you sure you want to delete this task?")) return;

        try {
            const res = await fetch(`/api/task/${taskId}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error("Failed to delete task");

            setTaskState(prev => prev.filter(t => t.id !== taskId));
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Failed to delete task");
        }
    };

    return (
        <ProtectedRoute>
            <div className={styles.container}>
                <main className={styles.main}>
                    <header className={styles.header}>
                        <h1 className={styles.title}>My Tasks</h1>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {/* Search Bar */}
                            <div className={styles.searchContainer}>
                                <Search size={18} className={styles.searchIcon} />
                                <input
                                    type="text"
                                    placeholder="Search tasks..."
                                    className={styles.searchInput}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Project Filter Dropdown */}
                            <select
                                className={styles.viewToggle}
                                style={{ padding: '0.5rem', outline: 'none', cursor: 'pointer', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'black', borderRadius: '8px' }}
                                value={projectFilter}
                                onChange={(e) => setProjectFilter(e.target.value === 'All' ? 'All' : Number(e.target.value))}
                            >
                                <option value="All" style={{ color: 'black' }}>All Projects</option>
                                {projects.map(p => (
                                    <option key={p.projectid} value={p.projectid} style={{ color: 'black' }}>{p.projectname}</option>
                                ))}
                            </select>

                            {/* View Toggle */}
                            <div className={styles.viewToggle}>
                                <button
                                    className={`${styles.viewBtn} ${viewMode === 'list' ? styles.activeViewBtn : ''}`}
                                    onClick={() => setViewMode('list')}
                                >
                                    List
                                </button>
                                <button
                                    className={`${styles.viewBtn} ${viewMode === 'board' ? styles.activeViewBtn : ''}`}
                                    onClick={() => setViewMode('board')}
                                >
                                    Board
                                </button>
                            </div>
                            <button className={styles.newTaskBtn} onClick={() => { router.push('/MyTask/AddTask') }}>+ NEW TASK</button>
                        </div>
                    </header>

                    {viewMode === 'board' ? (
                        <KanbanBoard tasks={filteredTasks} setTasks={setTaskState} />
                    ) : (
                        <>
                            {/* Filter Tabs */}
                        <div className={styles.filters}>
    <div
        className={`${styles.filterTab} ${filter === 'All' ? styles.filterActive : ''}`}
        onClick={() => setFilter('All')}
    >
        All Tasks
    </div>
    <div
        className={`${styles.filterTab} ${filter === 'Pending' ? styles.filterActive : ''}`}
        onClick={() => setFilter('Pending')}
    >
        Pending
    </div>
    <div
        className={`${styles.filterTab} ${filter === 'In Progress' ? styles.filterActive : ''}`}
        onClick={() => setFilter('In Progress')}
    >
        In Progress
    </div>
    <div
        className={`${styles.filterTab} ${filter === 'Completed' ? styles.filterActive : ''}`}
        onClick={() => setFilter('Completed')}
    >
        Completed
    </div>
</div>

                            {/* Task List */}
                            <table className={styles.taskTable}>
                                <thead>
                                    <tr>
                                        <th className={styles.tableHeader}>Task Name</th>
                                        <th className={styles.tableHeader}>Priority</th>
                                        <th className={styles.tableHeader}>Status</th>
                                        <th className={styles.tableHeader}>Due Date</th>
                                        <th className={styles.tableHeader}>Category</th>
                                        <th className={styles.tableHeader}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTasks.map(task => (
                                        <tr key={task.id} className={styles.tableRow}>
                                            <td className={`${styles.tableCell} ${task.status === 'Completed' ? styles.statusDone : styles.statusPending} ${styles.statusIndicator}`}>
                                                {task.title}
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
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '6px',
                                                    background: task.status === 'Completed' ? 'rgba(16, 185, 129, 0.2)' :
                                                        task.status === 'In Progress' ? 'rgba(99, 102, 241, 0.2)' :
                                                            'rgba(148, 163, 184, 0.2)',
                                                    color: task.status === 'Completed' ? '#34d399' :
                                                        task.status === 'In Progress' ? '#818cf8' :
                                                            '#cbd5e1',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    {task.status}
                                                </span>
                                            </td>
                                            <td className={styles.tableCell} style={{ opacity: 0.7 }}>{task.dueDate}</td>
                                            <td className={styles.tableCell} style={{ opacity: 0.7 }}>{task.category}</td>
                                            <td className={styles.tableCell}>
                                                <button
                                                    style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', opacity: 0.7, marginRight: '8px' }}
                                                    onClick={() => router.push(`/MyTask/${task.id}/edit`)}
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.7 }}
                                                    onClick={() => handleDelete(task.id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
                </main>
            </div>
        </ProtectedRoute>
    );
}
