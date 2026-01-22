'use client';

import { useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
 import KanbanBoard, { Task } from './KanbanBoard';
import styles from './mytask.module.css';

interface Props {
    tasks: Task[];
}

export default function MyTaskClient({ tasks }: Props) {
    const [taskState, setTaskState] = useState<Task[]>(tasks);
    const [filter, setFilter] = useState<'All' | 'Pending' | 'Completed'>('All');
    const [viewMode, setViewMode] = useState<'list' | 'board'>('board');

    const filteredTasks = taskState.filter(task => {
        if (filter === 'All') return true;
        if (filter === 'Pending') return task.status !== 'Done';
        if (filter === 'Completed') return task.status === 'Done';
        return true;
    });

    return (
        <ProtectedRoute>
            <div className={styles.container}>
                <main className={styles.main}>
                    <header className={styles.header}>
                        <h1 className={styles.title}>My Tasks</h1>

                        <div style={{ display: 'flex', alignItems: 'center' }}>
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
                            <button className={styles.newTaskBtn}>+ NEW TASK</button>
                        </div>
                    </header>

                    {viewMode === 'board' ? (
                        <KanbanBoard tasks={taskState} setTasks={setTaskState} />
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
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTasks.map(task => (
                                        <tr key={task.id} className={styles.tableRow}>
                                            <td className={`${styles.tableCell} ${task.status === 'Done' ? styles.statusDone : styles.statusPending} ${styles.statusIndicator}`}>
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
                                                    background: task.status === 'Done' ? 'rgba(16, 185, 129, 0.2)' :
                                                        task.status === 'In Progress' ? 'rgba(99, 102, 241, 0.2)' :
                                                            'rgba(148, 163, 184, 0.2)',
                                                    color: task.status === 'Done' ? '#34d399' :
                                                        task.status === 'In Progress' ? '#818cf8' :
                                                            '#cbd5e1',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    {task.status}
                                                </span>
                                            </td>
                                            <td className={styles.tableCell} style={{ opacity: 0.7 }}>{task.dueDate}</td>
                                            <td className={styles.tableCell} style={{ opacity: 0.7 }}>{task.category}</td>
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
